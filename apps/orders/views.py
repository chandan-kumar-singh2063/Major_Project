from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, serializers, status

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.cart.models import Cart, CartItem
from django.db import transaction
from django.utils import timezone
from decimal import Decimal
from apps.products.models import Product
from apps.cart.models import Cart, CartItem

# Create your views here.

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        data = self.request.data
        transaction_id = data.get('transaction_id')
        buy_now_product_id = data.get('buy_now_product_id')
        buy_now_product_sku = data.get('buy_now_product_sku')
        
        print(f"DEBUG: 📦 Order placement started for {user.username}")
        print(f"DEBUG: 📝 Request Data: {data}")
        
        # 1. Idempotency Check
        if transaction_id:
            existing = Order.objects.filter(user=user, transaction_id=transaction_id).first()
            if existing:
                print(f"DEBUG: ⚠️ Found existing order #{existing.id} for transaction {transaction_id}")
                serializer.instance = existing
                return

        # 2. Handle Buy Now Flow
        if buy_now_product_id or buy_now_product_sku:
            print(f"DEBUG: 🔥 Buy Now detected. ID: {buy_now_product_id}, SKU: {buy_now_product_sku}")
            try:
                if buy_now_product_sku:
                    product = Product.objects.get(sku=buy_now_product_sku)
                else:
                    product = Product.objects.get(id=buy_now_product_id)
            except Product.DoesNotExist:
                identifier = buy_now_product_sku or buy_now_product_id
                print(f"DEBUG: ❌ Product {identifier} not found in database!")
                raise serializers.ValidationError({"error": f"Product {identifier} not found"})
            
            order = serializer.save(user=user, total_price=product.price, status='ordered')
            
            if product.stock >= 1:
                product.stock -= 1
                product.purchase_count += 1
                product.save()
            
            OrderItem.objects.create(order=order, product=product, quantity=1, price=product.price)
            print(f"DEBUG: ✅ Buy Now order #{order.id} complete")
            
        # 3. Handle Cart Flow
        else:
            print("DEBUG: 🛒 Cart Checkout detected")
            cart = Cart.objects.filter(user=user).first()
            if not cart or not cart.items.exists():
                print(f"DEBUG: ❌ Cart empty for {user.username}")
                raise serializers.ValidationError({"error": "Your cart is empty."})
            
            order = serializer.save(user=user, status='ordered')
            total = Decimal('0.00')
            
            for item in cart.items.all():
                prod = item.product
                qty = item.quantity
                
                if prod.stock >= qty:
                    prod.stock -= qty
                else:
                    prod.stock = 0
                
                prod.purchase_count += qty
                prod.save()

                OrderItem.objects.create(order=order, product=prod, quantity=qty, price=prod.price)
                total += Decimal(str(prod.price)) * Decimal(str(qty))
            
            order.total_price = total
            order.save()
            
            cart.items.all().delete()
            print(f"DEBUG: ✅ Cart order #{order.id} complete. Total: {total}")

    @action(detail=False, methods=['get'], url_path='my')
    def my_orders(self, request):
        orders = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    @transaction.atomic
    def cancel(self, request, pk=None):
        order = self.get_object()
        
        # Prevent double cancellation or cancelling shipped/delivered orders
        if order.status == 'cancelled':
            return Response({"message": "Order is already cancelled."}, status=status.HTTP_200_OK)
            
        if order.status not in ['ordered', 'pending', 'processing']:
            return Response(
                {"error": f"Cannot cancel order with status '{order.status}'. Only new orders can be cancelled."},
                status=status.HTTP_400_BAD_REQUEST
            )

        print(f"DEBUG: ↩️ Restocking products for cancelled order #{order.id}")
        
        # Restock each item in the order
        for item in order.items.all():
            product = item.product
            product.stock += item.quantity
            
            # Reduce purchase count to keep stats clean
            if product.purchase_count >= item.quantity:
                product.purchase_count -= item.quantity
            else:
                product.purchase_count = 0
                
            product.save()
            print(f"DEBUG: 📈 Restocked {item.quantity} units of '{product.name}' (New stock: {product.stock})")

        order.status = 'cancelled'
        order.save()
        
        return Response({
            "status": "success",
            "message": "Order cancelled successfully and products have been restocked."
        })


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)