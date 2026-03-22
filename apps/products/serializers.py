from rest_framework import serializers
from .models import Product, Brand, ProductImage, ProductAttribute, ProductReview

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'created_at']
        read_only_fields = ['created_at']

class ProductAttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductAttribute
        fields = ['id', 'name', 'value']

class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'logo', 'description', 'is_active', 'created_at']
        read_only_fields = ['slug', 'created_at']

class ProductReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = ProductReview
        fields = [
            'id', 'user', 'user_id', 'rating', 'review_text', 
            'is_verified_purchase', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']

class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    seller_name = serializers.CharField(source='seller.username', read_only=True)
    primary_image = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()
    sales_count = serializers.SerializerMethodField()
    earnings = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description',
            'price', 'original_price', 'image', 'discount_percentage', 'discount_amount',
            'category', 'category_name', 'brand', 'brand_name', 'seller', 'seller_name',
            'stock', 'stock_status', 'sku',
            'is_active', 'is_featured', 'is_trending', 'is_on_sale',
            'view_count', 'rating_average', 'rating_count',
            'primary_image', 'created_at', 'updated_at',
            'sales_count', 'earnings'
        ]
        read_only_fields = [
            'slug', 'discount_percentage', 'discount_amount', 'is_on_sale',
            'view_count', 'rating_average', 'rating_count', 'stock_status',
            'created_at', 'updated_at'
        ]

    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return ProductImageSerializer(primary_image).data
        return None

    def get_discount_amount(self, obj):
        try:
            # Make sure this always returns a resolved float
            if obj.original_price and obj.price:
                return float(obj.original_price - obj.price)
        except:
            pass
        return 0.0

    def get_is_on_sale(self, obj):
        try:
            if obj.original_price and obj.price:
                return obj.price < obj.original_price
            return False
        except:
            return False

    def get_sales_count(self, obj):
        from apps.orders.models import OrderItem
        from django.db.models import Sum
        return OrderItem.objects.filter(
            product=obj
        ).exclude(order__status='cancelled').aggregate(total=Sum('quantity'))['total'] or 0

    def get_earnings(self, obj):
        from apps.orders.models import OrderItem
        from django.db.models import Sum, F
        total = OrderItem.objects.filter(
            product=obj
        ).exclude(order__status='cancelled').aggregate(
            total=Sum(F('quantity') * F('price'))
        )['total'] or 0
        return float(total)

class ProductDetailSerializer(ProductSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    attributes = ProductAttributeSerializer(many=True, read_only=True)
    reviews = ProductReviewSerializer(many=True, read_only=True)

    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['images', 'attributes', 'reviews']