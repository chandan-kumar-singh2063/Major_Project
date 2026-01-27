from rest_framework import serializers
from .models import Cart, CartItem
from apps.products.models import Product

class CartItemSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_price = serializers.DecimalField(source='product.price', max_digits=10, decimal_places=2, read_only=True)
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_name', 'product_price', 'product_image', 'quantity']

    def get_product_image(self, obj):
        if obj.product.image:
            return self.context['request'].build_absolute_uri(obj.product.image.url)
        # Try to get the first product image if main image is not available
        first_image = obj.product.images.filter(is_primary=True).first()
        if first_image: 
            return self.context['request'].build_absolute_uri(first_image.image.url)
        # Return the first available image
        first_image = obj.product.images.first()
        if first_image:
            return self.context['request'].build_absolute_uri(first_image.image.url)
        return None

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'session_key', 'items', 'created_at', 'updated_at']
