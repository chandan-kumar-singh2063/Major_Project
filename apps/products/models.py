from django.db import models
from django.contrib.auth.models import User
from django.utils.text import slugify
from PIL import Image
from .validators import validate_image_file_extension, validate_image_file_size
from apps.categories.models import Category  # <-- Import Category from categories
from decimal import Decimal
import os
import csv

def to_float(val):
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, Decimal):
        return float(val)
    return 0.0

# Removed local Category model

class Brand(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    logo = models.ImageField(upload_to='brands/', blank=True, null=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

class Product(models.Model):
    STOCK_STATUS_CHOICES = [
        ('in_stock', 'In Stock'),
        ('out_of_stock', 'Out of Stock'),
        ('limited_stock', 'Limited Stock'),
    ]

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    short_description = models.CharField(max_length=500, blank=True, null=True)
    image = models.CharField(max_length=500, blank=True, null=True)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    brand = models.ForeignKey(Brand, on_delete=models.CASCADE, related_name='products', null=True, blank=True)
    
   
    stock = models.IntegerField(default=0)
    stock_status = models.CharField(max_length=20, choices=STOCK_STATUS_CHOICES, default='in_stock')
    sku = models.CharField(max_length=50, unique=True)
    
   
    
  
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    is_trending = models.BooleanField(default=False)  # For trending products
    
   
    view_count = models.IntegerField(default=0)
    purchase_count = models.IntegerField(default=0)
    rating_average = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    rating_count = models.IntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_trending']),
            models.Index(fields=['price']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            # If slug already exists for a different product, append SKU to avoid collision
            qs = Product.objects.filter(slug=slug).exclude(pk=self.pk)
            if qs.exists() and self.sku:
                slug = f"{base_slug}-{slugify(self.sku)}"
            self.slug = slug
        
        # Calculate discount percentage
        orig = to_float(self.original_price)
        prc = to_float(self.price)
        if self.original_price and self.original_price > self.price:
            self.discount_percentage = ((orig - prc) / orig) * 100 if orig else 0
        
        # Update stock status based on stock quantity
        if self.stock <= 0:
            self.stock_status = 'out_of_stock'
        elif self.stock <= 10:  # You can adjust this threshold
            self.stock_status = 'limited_stock'
        else:
            self.stock_status = 'in_stock'
            
        super().save(*args, **kwargs)

    def get_discount_amount(self):
        try:
            if self.original_price and self.price:
                return float(self.original_price) - float(self.price)
            return 0.0
        except (TypeError, ValueError):
            return 0.0

    def is_on_sale(self):
        return self.original_price and self.original_price > self.price

class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images')
    image = models.CharField(max_length=500)
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField()
    
    # For AI image search feature
    feature_vector = models.JSONField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.product.name}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        
        # Resize image if too large
        if self.image:
            img_path = getattr(self.image, 'path', None)
            if img_path and os.path.exists(img_path):
                img = Image.open(img_path)
                if img.height > 800 or img.width > 800:
                    output_size = (800, 800)
                    img.thumbnail(output_size)
                    img.save(img_path)

class ProductAttribute(models.Model):
    """For product specifications like Color, Size, Weight etc."""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='attributes')
    name = models.CharField(max_length=100)  # Color, Size, Weight
    value = models.CharField(max_length=200)  # Red, Large, 1.5kg
    
    class Meta:
        unique_together = ('product', 'name')

    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"

class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    review_text = models.TextField(blank=True)
    is_verified_purchase = models.BooleanField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'user')

    def __str__(self):
        return f"Review for {self.product.name} by {str(self.user)}"

class ProductView(models.Model):
    """Track product views for analytics and trending calculation"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='product_views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user', 'ip_address')

    def __str__(self):
        return f"View for {self.product.name}"