from django.urls import path
from . import views
from .views import ProductBySKUListView

app_name = 'products'

urlpatterns = [

    #Product lookup by SKUs (for image search)
    path('by-skus/', ProductBySKUListView.as_view(), name='products-by-skus'),

    
    path('search/', views.ProductSearchView.as_view(), name='product-search'),
    
    # Product CRUD
    path('my-products/', views.SellerProductListView.as_view(), name='seller-product-list'),
    path('stats/', views.SellerStatsView.as_view(), name='seller-stats'),
    path('', views.ProductListCreateView.as_view(), name='product-list-create'),
    path('<int:pk>/', views.ProductDetailView.as_view(), name='product-detail'),
    path('<slug:slug>/', views.ProductBySlugView.as_view(), name='product-by-slug'),
    path('filter/', views.ProductFilterView.as_view(), name='product-filter'),
    path('featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    path('trending/', views.TrendingProductsView.as_view(), name='trending-products'),
    path('on-sale/', views.OnSaleProductsView.as_view(), name='on-sale-products'),

    # Product images
    path('<int:product_id>/images/', views.ProductImageListCreateView.as_view(), name='product-images'),
    path('images/<int:pk>/', views.ProductImageDetailView.as_view(), name='product-image-detail'),
    path('<int:product_id>/images/primary/', views.ProductPrimaryImageView.as_view(), name='product-primary-image'),

    # Product attributes
    path('<int:product_id>/attributes/', views.ProductAttributeListCreateView.as_view(), name='product-attributes'),
    path('attributes/<int:pk>/', views.ProductAttributeDetailView.as_view(), name='product-attribute-detail'),

    # Product reviews
    path('<int:product_id>/reviews/', views.ProductReviewListCreateView.as_view(), name='product-reviews'),
    path('reviews/<int:pk>/', views.ProductReviewDetailView.as_view(), name='product-review-detail'),
    path('<int:product_id>/reviews/stats/', views.ProductReviewStatsView.as_view(), name='product-review-stats'),

    # Product analytics
    path('<int:product_id>/view/', views.ProductViewCreateView.as_view(), name='product-view'),
    path('<int:product_id>/analytics/', views.ProductAnalyticsView.as_view(), name='product-analytics'),

    # Brand endpoints
    path('brands/', views.BrandListCreateView.as_view(), name='brand-list-create'),
    path('brands/<int:pk>/', views.BrandDetailView.as_view(), name='brand-detail'),
    path('brands/<slug:slug>/', views.BrandBySlugView.as_view(), name='brand-by-slug'),
    path('brands/<int:brand_id>/products/', views.BrandProductsView.as_view(), name='brand-products'),

    # Bulk operations
    path('bulk-update/', views.ProductBulkUpdateView.as_view(), name='product-bulk-update'),
    path('bulk-delete/', views.ProductBulkDeleteView.as_view(), name='product-bulk-delete'),

    # Stock management
    path('<int:product_id>/stock/', views.ProductStockView.as_view(), name='product-stock'),
    path('low-stock/', views.LowStockProductsView.as_view(), name='low-stock-products'),
    path('out-of-stock/', views.OutOfStockProductsView.as_view(), name='out-of-stock-products'),

]
