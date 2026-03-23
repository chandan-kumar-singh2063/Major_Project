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
        # Product.image is a CharField containing the URL directly
        if obj.product.image:
            # If it's already a full http/https link (e.g. Cloudinary), return it directly
            if obj.product.image.startswith('http'):
                return obj.product.image
            return self.context['request'].build_absolute_uri(obj.product.image)
            
        # Try to get the first product image if main image is not available
        first_image = obj.product.images.filter(is_primary=True).first()
        if not first_image:
            first_image = obj.product.images.first()
            
        if first_image and first_image.image:
            if first_image.image.startswith('http'):
                return first_image.image
            return self.context['request'].build_absolute_uri(first_image.image)
            
        return None

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'user', 'session_key', 'items', 'created_at', 'updated_at']
