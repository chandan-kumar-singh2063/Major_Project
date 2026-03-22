from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.db.models import Q, Avg, Count, F
from django.core.paginator import Paginator
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.views import View
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.exceptions import ValidationError
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.pagination import PageNumberPagination
import json
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Sum, Count, Q, F
from apps.orders.models import OrderItem

#for returning product details with the help of sku
from .models import Product
from .serializers import ProductSerializer


from .models import Product, Category, Brand, ProductImage, ProductAttribute, ProductReview, ProductView
from .serializers import (
    ProductSerializer, ProductDetailSerializer, BrandSerializer, 
    ProductImageSerializer, ProductAttributeSerializer, ProductReviewSerializer
)
from .permissions import IsSeller, IsSellerOrReadOnly

# ============================================================================
# PAGINATION CLASS
# ============================================================================

class ProductPagination(PageNumberPagination):
    """Custom pagination for products"""
    page_size = 12  # Number of products per page
    page_size_query_param = 'page_size'  # Allow client to override page size
    max_page_size = 50  # Maximum page size allowed
    page_query_param = 'page'  # URL parameter for page number

# ============================================================================
# PRODUCT VIEWS
# ============================================================================

class ProductListCreateView(generics.ListCreateAPIView):
    """List all products or create a new product with server-side pagination"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductSerializer
    permission_classes = [IsSellerOrReadOnly]
    pagination_class = ProductPagination
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
    
    def get_queryset(self):
        # Exclude products without ANY images (checked via main image field and related images)
        queryset = Product.objects.filter(is_active=True).distinct()
        
        # Filter by category
        category_id = self.request.query_params.get('category')
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        # Filter by brand
        brand_id = self.request.query_params.get('brand')
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by stock status
        stock_status = self.request.query_params.get('stock_status')
        if stock_status:
            queryset = queryset.filter(stock_status=stock_status)
        
        # Sorting
        sort_by = self.request.query_params.get('sort_by', '-created_at')
        if sort_by in ['price', '-price', 'name', '-name', 'created_at', '-created_at', 'rating_average', '-rating_average']:
            queryset = queryset.order_by(sort_by)
        
        return queryset.select_related('category', 'brand').prefetch_related('images')

class SellerProductListView(generics.ListAPIView):
    """View for sellers to see only their own products"""
    serializer_class = ProductSerializer
    permission_classes = [IsSeller]
    pagination_class = ProductPagination

    def get_queryset(self):
        return Product.objects.filter(seller=self.request.user).select_related('category', 'brand').prefetch_related('images')

class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a product"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Track product view
        if request.user.is_authenticated or request.META.get('REMOTE_ADDR'):
            ProductView.objects.get_or_create(
                product=instance,
                user=request.user if request.user.is_authenticated else None,
                ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1')
            )
            # Update view count
            Product.objects.filter(pk=instance.pk).update(view_count=F('view_count') + 1)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class ProductBySlugView(generics.RetrieveAPIView):
    """Get product by slug"""
    queryset = Product.objects.filter(is_active=True)
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Track product view
        if request.user.is_authenticated or request.META.get('REMOTE_ADDR'):
            ProductView.objects.get_or_create(
                product=instance,
                user=request.user if request.user.is_authenticated else None,
                ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1')
            )
            # Update view count
            instance.view_count = F('view_count') + 1
            instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class ProductSearchView(generics.ListAPIView):
    """Simple search products by name, description, category, brand, and SKU"""
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    
    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()
        if not query:
            return Product.objects.none()
        
        # Simple search across multiple fields
        search_condition = (
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(short_description__icontains=query) |
            Q(category__name__icontains=query) |
            Q(brand__name__icontains=query) |
            Q(sku__icontains=query)
        )
        
        # Apply search filter
        queryset = Product.objects.filter(
            is_active=True
        ).filter(search_condition).select_related('category', 'brand')
        
        # Enhanced ordering: First word matches first, then alphabetical
        # Use CASE WHEN to prioritize results where name starts with the query
        from django.db.models import Case, When, IntegerField
        
        queryset = queryset.annotate(
            search_priority=Case(
                # Exact match at the beginning gets highest priority (1)
                When(name__istartswith=query, then=1),
                # First word match gets second priority (2)
                When(name__iregex=r'^' + query.split()[0], then=2),
                # Contains match gets third priority (3)
                When(name__icontains=query, then=3),
                # Other field matches get lowest priority (4)
                default=4,
                output_field=IntegerField()
            )
        ).order_by('search_priority', 'name')
        
        return queryset

class ProductFilterView(generics.ListAPIView):
    """Advanced product filtering with server-side pagination"""
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

    def get_queryset(self):
        # Apply same image filter to ensure consistency across search/filter results
        queryset = Product.objects.filter(is_active=True).distinct()

        # Category filter (safe for IDs and names)
        category = self.request.query_params.get('category')
        if category:
            if category.isdigit():
                # Old behavior: category ID
                queryset = queryset.filter(category_id=int(category))
            else:
                # New behavior: category name (case-insensitive)
                queryset = queryset.filter(category__name__iexact=category)

        # Brand filter
        brand_id = self.request.query_params.get('brand')
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)

        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # Stock status filter
        stock_status = self.request.query_params.get('stock_status')
        if stock_status:
            queryset = queryset.filter(stock_status=stock_status)

        # Rating filter
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.filter(rating_average__gte=min_rating)

        # Search filter
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search) |
                Q(brand__name__icontains=search)
            )

        # Sorting
        sort_by = self.request.query_params.get('sort_by', '-created_at')
        if sort_by in ['price', '-price', 'name', '-name', 'created_at', '-created_at', 'rating_average', '-rating_average']:
            queryset = queryset.order_by(sort_by)

        return queryset.select_related('category', 'brand').prefetch_related('images')

class FeaturedProductsView(generics.ListAPIView):
    """Get featured products with server-side pagination"""
    queryset = Product.objects.filter(is_active=True, is_featured=True)
    serializer_class = ProductSerializer
    pagination_class = ProductPagination

class TrendingProductsView(generics.ListAPIView):
    """Get trending products with server-side pagination"""
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    
    def get_queryset(self):
        # Get trending products based on recent views and purchases
        recent_date = timezone.now() - timedelta(days=30)
        return Product.objects.filter(
            is_active=True,
            views__created_at__gte=recent_date
        ).annotate(
            view_count=Count('views')
        ).order_by('-view_count', '-created_at')

class OnSaleProductsView(generics.ListAPIView):
    """Get products on sale with server-side pagination"""
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    
    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            sale_price__isnull=False
        ).exclude(sale_price=0).order_by('-created_at')

# ============================================================================
# PRODUCT IMAGE VIEWS
# ============================================================================

class ProductImageListCreateView(generics.ListCreateAPIView):
    """List or create product images"""
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductImage.objects.filter(product_id=product_id)
    
    def perform_create(self, serializer):
        product_id = self.kwargs['product_id']
        product = get_object_or_404(Product, id=product_id)
        serializer.save(product=product)

class ProductImageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a product image"""
    queryset = ProductImage.objects.all()
    serializer_class = ProductImageSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class ProductPrimaryImageView(APIView):
    """Get or set primary image for a product"""
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get(self, request, product_id):
        primary_image = ProductImage.objects.filter(
            product_id=product_id, is_primary=True
        ).first()
        
        if primary_image:
            serializer = ProductImageSerializer(primary_image)
            return Response(serializer.data)
        return Response({'detail': 'No primary image found'}, status=404)
    
    def post(self, request, product_id):
        image_id = request.data.get('image_id')
        if not image_id:
            return Response({'detail': 'image_id is required'}, status=400)
        
        # Remove current primary image
        ProductImage.objects.filter(product_id=product_id).update(is_primary=False)
        
        # Set new primary image
        try:
            image = ProductImage.objects.get(id=image_id, product_id=product_id)
            image.is_primary = True
            image.save()
            serializer = ProductImageSerializer(image)
            return Response(serializer.data)
        except ProductImage.DoesNotExist:
            return Response({'detail': 'Image not found'}, status=404)

# ============================================================================
# PRODUCT ATTRIBUTE VIEWS
# ============================================================================

class ProductAttributeListCreateView(generics.ListCreateAPIView):
    """List or create product attributes"""
    serializer_class = ProductAttributeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductAttribute.objects.filter(product_id=product_id)
    
    def perform_create(self, serializer):
        product_id = self.kwargs['product_id']
        product = get_object_or_404(Product, id=product_id)
        serializer.save(product=product)

class ProductAttributeDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a product attribute"""
    queryset = ProductAttribute.objects.all()
    serializer_class = ProductAttributeSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

# ============================================================================
# PRODUCT REVIEW VIEWS
# ============================================================================

class ProductReviewListCreateView(generics.ListCreateAPIView):
    """List or create product reviews"""
    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductReview.objects.filter(product_id=product_id).select_related('user')
    
    def perform_create(self, serializer):
        product_id = self.kwargs['product_id']
        product = get_object_or_404(Product, id=product_id)
        serializer.save(product=product, user=self.request.user)
        
        # Update product rating average
        self.update_product_rating(product)
    
    def update_product_rating(self, product):
        """Update product rating average and count"""
        reviews = ProductReview.objects.filter(product=product)
        avg_rating = reviews.aggregate(avg=Avg('rating'))['avg'] or 0
        review_count = reviews.count()
        
        product.rating_average = round(avg_rating, 2)
        product.rating_count = review_count
        product.save(update_fields=['rating_average', 'rating_count'])

class ProductReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a product review"""
    queryset = ProductReview.objects.all()
    serializer_class = ProductReviewSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ProductReview.objects.filter(user=self.request.user)

class ProductReviewStatsView(APIView):
    """Get review statistics for a product"""
    
    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        reviews = ProductReview.objects.filter(product=product)
        
        # Rating distribution
        rating_distribution = {}
        for i in range(1, 6):
            rating_distribution[f'{i}_star'] = reviews.filter(rating=i).count()
        
        stats = {
            'total_reviews': reviews.count(),
            'average_rating': product.rating_average,
            'rating_distribution': rating_distribution,
            'verified_reviews': reviews.filter(is_verified_purchase=True).count()
        }
        
        return Response(stats)

# ============================================================================
# PRODUCT ANALYTICS VIEWS
# ============================================================================

class ProductViewCreateView(generics.CreateAPIView):
    """Track product view"""
    
    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        
        view, created = ProductView.objects.get_or_create(
            product=product,
            user=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get('REMOTE_ADDR', '127.0.0.1')
        )
        
        if created:
            # Update view count
            product.view_count = F('view_count') + 1
            product.save(update_fields=['view_count'])
        
        return Response({'status': 'view tracked'})

class ProductAnalyticsView(APIView):
    """Get product analytics"""
    
    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        
        # Get views for last 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_views = ProductView.objects.filter(
            product=product,
            created_at__gte=thirty_days_ago
        ).count()
        
        analytics = {
            'total_views': product.view_count,
            'recent_views': recent_views,
            'purchase_count': product.purchase_count,
            'rating_average': product.rating_average,
            'rating_count': product.rating_count,
            'stock_level': product.stock,
            'stock_status': product.stock_status,
            'is_trending': product.is_trending,
            'is_featured': product.is_featured
        }
        
        return Response(analytics)

class SellerStatsView(APIView):
    """View to get overall stats for a seller"""
    permission_classes = [IsSeller]

    def get(self, request):
        seller = request.user
        
        # Get products stats
        products = Product.objects.filter(seller=seller)
        total_products = products.count()
        live_products = products.filter(is_active=True).count()
        low_stock_products = products.filter(stock__lte=10).count()
        
        # Get sales stats
        # Only count earnings from non-cancelled orders
        order_items = OrderItem.objects.filter(
            product__seller=seller
        ).exclude(order__status='cancelled').annotate(item_revenue=F('quantity') * F('price'))
        
        total_sales = OrderItem.objects.filter(product__seller=seller).exclude(order__status='cancelled').aggregate(total=Sum('quantity'))['total'] or 0
        total_earnings = order_items.aggregate(total=Sum('item_revenue'))['total'] or 0
        
        return Response({
            'totalProducts': total_products,
            'liveProducts': live_products,
            'lowStock': low_stock_products,
            'totalEarnings': float(total_earnings),
            'totalSales': total_sales,
        })

# ============================================================================
# BRAND VIEWS
# ============================================================================

class BrandListCreateView(generics.ListCreateAPIView):
    """List all brands or create a new brand"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class BrandDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a brand"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

class BrandBySlugView(generics.RetrieveAPIView):
    """Get brand by slug"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = 'slug'

class BrandProductsView(generics.ListAPIView):
    """Get products by brand with server-side pagination"""
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    
    def get_queryset(self):
        brand_id = self.kwargs.get('brand_id')
        return Product.objects.filter(
            is_active=True,
            brand_id=brand_id
        ).select_related('category', 'brand').prefetch_related('images')

# ============================================================================
# BULK OPERATIONS
# ============================================================================

class ProductBulkUpdateView(APIView):
    """Bulk update products"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        product_ids = request.data.get('product_ids', [])
        update_data = request.data.get('update_data', {})
        
        if not product_ids:
            return Response({'detail': 'product_ids is required'}, status=400)
        
        # Update products
        updated_count = Product.objects.filter(id__in=product_ids).update(**update_data)
        
        return Response({
            'updated_count': updated_count,
            'message': f'{updated_count} products updated successfully'
        })

class ProductBulkDeleteView(APIView):
    """Bulk delete products"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        product_ids = request.data.get('product_ids', [])
        
        if not product_ids:
            return Response({'detail': 'product_ids is required'}, status=400)
        
        # Soft delete by setting is_active to False
        updated_count = Product.objects.filter(id__in=product_ids).update(is_active=False)
        
        return Response({
            'deleted_count': updated_count,
            'message': f'{updated_count} products deleted successfully'
        })

# ============================================================================
# STOCK MANAGEMENT VIEWS
# ============================================================================

class ProductStockView(APIView):
    """Manage product stock"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        return Response({
            'stock': product.stock,
            'stock_status': product.stock_status
        })
    
    def post(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        new_stock = request.data.get('stock')
        
        if new_stock is None:
            return Response({'detail': 'stock is required'}, status=400)
        
        try:
            new_stock = int(new_stock)
            if new_stock < 0:
                return Response({'detail': 'stock cannot be negative'}, status=400)
            
            product.stock = new_stock
            product.save()
            
            return Response({
                'stock': product.stock,
                'stock_status': product.stock_status,
                'message': 'Stock updated successfully'
            })
        except ValueError:
            return Response({'detail': 'Invalid stock value'}, status=400)

class LowStockProductsView(generics.ListAPIView):
    """Get products with low stock"""
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        threshold = self.request.query_params.get('threshold', 10)
        return Product.objects.filter(
            is_active=True,
            stock__lte=threshold,
            stock__gt=0
        ).select_related('category', 'brand')

class OutOfStockProductsView(generics.ListAPIView):
    """Get out of stock products"""
    serializer_class = ProductSerializer
    
    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            stock=0
        ).select_related('category', 'brand')
    



# ============================================================================
# BULK PRODUCT FETCH BY SKU (for FastAPI search results)
# ============================================================================


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import Product
from .serializers import ProductSerializer

@method_decorator(csrf_exempt, name='dispatch')
class ProductBySKUListView(APIView):
    def post(self, request, *args, **kwargs):
        skus = request.data.get("skus", [])

        # ✅ Convert to string and strip .0 if present
        cleaned_skus = [str(sku).replace(".0", "") for sku in skus]
        print("📦 Cleaned SKUs:", cleaned_skus)

        if not isinstance(cleaned_skus, list) or not cleaned_skus:
            return Response({"detail": "Invalid or empty SKU list."}, status=status.HTTP_400_BAD_REQUEST)

        products = Product.objects.filter(sku__in=cleaned_skus, is_active=True)
        print("✅ Matched products in DB:", list(products))

        serialized = ProductSerializer(products, many=True, context={"request": request})
        return Response(serialized.data, status=status.HTTP_200_OK)

