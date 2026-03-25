# serializers.py
from rest_framework import serializers
from .models import Category
from apps.products.models import Product


class CategorySerializer(serializers.ModelSerializer):

    product_count = serializers.SerializerMethodField()
    subcategories = serializers.SerializerMethodField()
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    image = serializers.SerializerMethodField()

    
    class Meta:
        model = Category
        fields = [
            'id', 
            'name', 
            'slug', 
            'description', 
            'image', 
            'parent',
            'parent_name',
            'is_active',
            'product_count',
            'subcategories',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()
    
    def get_image(self, obj):
        if not obj.image:
            return None
        image_str = str(obj.image)
        if image_str.startswith('http'):
            return image_str
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url
    
    def get_subcategories(self, obj):
        if obj.parent is None:  # Only show subcategories for main categories
            subcategories = Category.objects.filter(parent=obj, is_active=True)
            return CategorySerializer(subcategories, many=True, context=self.context).data
        return []


class ProductSerializer(serializers.ModelSerializer):
    """
    Serializer for Product model
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    is_in_stock = serializers.SerializerMethodField()
    discount_amount = serializers.SerializerMethodField()
    is_on_sale = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'short_description',
            'price',
            'original_price',
            'discount_percentage',
            'discount_amount',
            'is_on_sale',
            'category',
            'category_name',
            'brand',
            'brand_name',
            'stock',
            'stock_status',
            'sku',
            'is_active',
            'is_featured',
            'is_trending',
            'is_in_stock',
            'primary_image',
            'rating_average',
            'rating_count',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at', 'discount_percentage', 'stock_status']
    
    def get_is_in_stock(self, obj):
        return obj.stock > 0
    
    def get_discount_amount(self, obj):
        return obj.get_discount_amount()
    
    def get_is_on_sale(self, obj):
        return obj.is_on_sale()
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            image_str = str(primary_image.image)
            if image_str.startswith('http'):
                return image_str
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(primary_image.image.url)
            return primary_image.image.url
        return None


class CategoryWithProductsSerializer(serializers.ModelSerializer):
    """
    Category serializer with nested products
    """
    products = ProductSerializer(many=True, read_only=True)
    product_count = serializers.ReadOnlyField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id',
            'name',
            'slug',
            'description',
            'image',
            'is_active',
            'product_count',
            'products',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def get_image(self, obj):
        if not obj.image:
            return None
        image_str = str(obj.image)
        if image_str.startswith('http'):
            return image_str
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url