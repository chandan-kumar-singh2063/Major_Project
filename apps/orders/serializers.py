from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Order, OrderItem
from apps.products.models import Product
from apps.products.serializers import ProductSerializer

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)
    order_status = serializers.CharField(source='order.status', read_only=True)
    order_date = serializers.DateTimeField(source='order.created_at', read_only=True)
    customer_email = serializers.EmailField(source='order.user.email', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_id', 'quantity', 'price', 'order_status', 'order_date', 'customer_email']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='user', write_only=True, required=False)


    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_id', 'created_at', 'updated_at', 'status',
            'shipping_address', 'total_price', 'items', 'transaction_id'
        ]

        read_only_fields = ['created_at', 'updated_at', 'user', 'items', 'total_price']