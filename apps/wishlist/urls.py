from django.urls import path
from . import views

urlpatterns = [
    path('', views.WishlistListView.as_view(), name='wishlist-list'),
    path('add/', views.AddToWishlistView.as_view(), name='wishlist-add'),
    path('remove/<int:product_id>/', views.RemoveFromWishlistView.as_view(), name='wishlist-remove'),
]
