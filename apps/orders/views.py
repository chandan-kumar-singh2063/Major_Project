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
        
        # Extract fields safely
        transaction_id = data.get('transaction_id')
        buy_now_product_id = data.get('buy_now_product_id') or data.get('product_id')
        buy_now_product_sku = data.get('buy_now_product_sku')
        
        # Reliable quantity extraction
        quantity_raw = data.get('quantity')
        try:
            quantity = int(quantity_raw) if quantity_raw else 1
            if quantity <= 0: quantity = 1
        except (ValueError, TypeError):
            quantity = 1
        
        print(f"DEBUG: 📦 Order creation for {user.username} (Txn: {transaction_id})")

        # 1. Idempotency Check
        if transaction_id and str(transaction_id).strip():
            existing = Order.objects.filter(user=user, transaction_id=transaction_id).first()
            if existing:
                print(f"DEBUG: ♻️ Reusing existing order #{existing.id}")
                serializer.instance = existing
                return

        # 2. Handle "Buy Now" Flow (Single Product)
        if buy_now_product_id or buy_now_product_sku:
            product = None
            if buy_now_product_sku:
                product = Product.objects.filter(sku=buy_now_product_sku).first()
            
            if not product and buy_now_product_id:
                try:
                    product = Product.objects.get(id=buy_now_product_id)
                except (Product.DoesNotExist, ValueError, TypeError):
                    product = None
            
            if not product:
                print(f"DEBUG: ❌ Product not found (ID: {buy_now_product_id}, SKU: {buy_now_product_sku})")
                raise serializers.ValidationError({"error": "Product not found or unavailable."})
            
            # Create Order
            total_price = product.price * quantity
            order = serializer.save(
                user=user, 
                total_price=total_price, 
                status='ordered',
                transaction_id=transaction_id
            )
            
            # Create Order Item
            OrderItem.objects.create(
                order=order, 
                product=product, 
                quantity=quantity, 
                price=product.price
            )
            
            # Update Product Inventory/Stats
            if product.stock >= quantity:
                product.stock -= quantity
            else:
                product.stock = 0
            product.purchase_count += quantity
            product.save()
            
            print(f"DEBUG: ✅ Buy Now order #{order.id} saved for SKU {product.sku}")

        # 3. Handle Cart Checkout Flow
        else:
            cart = Cart.objects.filter(user=user).first()
            if not cart or not cart.items.exists():
                raise serializers.ValidationError({"error": "Your cart is empty."})
            
            order = serializer.save(user=user, status='ordered', transaction_id=transaction_id)
            total = Decimal('0.00')
            
            for item in cart.items.all():
                prod = item.product
                qty = item.quantity
                
                # Update Product Inventory/Stats
                if prod.stock >= qty:
                    prod.stock -= qty
                else:
                    prod.stock = 0
                prod.purchase_count += qty
                prod.save()

                OrderItem.objects.create(
                    order=order, 
                    product=prod, 
                    quantity=qty, 
                    price=prod.price
                )
                total += Decimal(str(prod.price)) * Decimal(str(qty))
            
            order.total_price = total
            order.save()
            
            # Clear the cart
            cart.items.all().delete()
            print(f"DEBUG: ✅ Cart order #{order.id} saved. Total: {total}")

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

    @action(detail=False, methods=['get'])
    def seller_orders(self, request):
        """Returns orders for products owned by the current seller"""
        from .serializers import OrderItemSerializer
        order_items = OrderItem.objects.filter(product__seller=request.user).order_by('-order__created_at')
        serializer = OrderItemSerializer(order_items, many=True)
        return Response(serializer.data)


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)