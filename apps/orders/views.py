from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, permissions, serializers, status

from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.cart.models import Cart, CartItem
from django.db import transaction
import datetime

# Create your views here.

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @transaction.atomic
    def perform_create(self, serializer):
        user = self.request.user
        print(f"📦 [{datetime.datetime.now()}] Creating order for user: {user.username}")
        print(f"📦 Request data: {self.request.data}")
        
        # Idempotency check
        transaction_id = self.request.data.get('transaction_id')
        if transaction_id and Order.objects.filter(user=user, transaction_id=transaction_id).exists():
            print(f"⚠️ Order with transaction_id {transaction_id} already exists. Skipping.")
            return 

        buy_now_product_id = self.request.data.get('buy_now_product_id')
        
        if buy_now_product_id:
            print(f"🔥 Buy Now Flow for product index: {buy_now_product_id}")
            from apps.products.models import Product
            product = get_object_or_404(Product, id=buy_now_product_id)
            order = serializer.save(user=user, total_price=product.price, status='ordered')
            # Update stock and purchase count
            if product.stock >= 1:
                product.stock -= 1
                product.purchase_count += 1
                product.save()
                print(f"   📉 Stock reduced for {product.name} ({product.stock} left)")

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=1,
                price=product.price
            )
            print(f"✅ Buy Now order #{order.id} created successfully")
        else:
            print(f"🛒 Cart Checkout Flow")
            cart = Cart.objects.filter(user=user).first()
            if not cart or not cart.items.exists():
                print(f"❌ Cart is empty for user {user.username}")
                raise serializers.ValidationError('Cart is empty.')
            
            # Initial save
            order = serializer.save(user=user, status='ordered')

            total = 0
            for item in cart.items.all():
                product = item.product
                quantity = item.quantity
                
                # Check and update stock
                if product.stock >= quantity:
                    product.stock -= quantity
                    product.purchase_count += quantity
                    product.save()
                    print(f"   📉 Stock reduced for {product.name} ({product.stock} left)")
                else:
                    print(f"   ⚠️ Low stock for {product.name}: {product.stock}")

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=quantity,
                    price=product.price
                )
                total += float(product.price) * quantity
                print(f"   ➕ Added {quantity}x {product.name}")
            
            order.total_price = total
            order.save()
            
            # Clear cart
            cart.items.all().delete()
            print(f"✅ Cart-to-Order #{order.id} created successfully for Rs. {total}. Cart cleared.")

    @action(detail=False, methods=['get'], url_path='my')
    def my_orders(self, request):
        orders = self.get_queryset().order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = self.get_object()
        if order.status not in ['ordered', 'pending']:
            return Response(
                {"error": f"Cannot cancel order with status '{order.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        order.status = 'cancelled'
        order.save()
        return Response({"status": "order cancelled"})


class OrderItemViewSet(viewsets.ModelViewSet):
    serializer_class = OrderItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return OrderItem.objects.filter(order__user=self.request.user)