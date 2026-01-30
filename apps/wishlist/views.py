from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Wishlist, WishlistItem
from .serializers import WishlistItemSerializer

class WishlistListView(generics.ListAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist.items.all()

class AddToWishlistView(generics.CreateAPIView):
    serializer_class = WishlistItemSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        product_id = request.data.get('product')
        if not product_id:
            return Response({"error": "Product ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        wishlist_item, created = WishlistItem.objects.get_or_create(
            wishlist=wishlist,
            product_id=product_id
        )
        
        if not created:
            return Response({"message": "Product already in wishlist"}, status=status.HTTP_200_OK)
            
        serializer = self.get_serializer(wishlist_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class RemoveFromWishlistView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, *args, **kwargs):
        product_id = self.kwargs.get('product_id')
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        try:
            item = WishlistItem.objects.get(wishlist=wishlist, product_id=product_id)
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except WishlistItem.DoesNotExist:
            return Response({"error": "Item not found in wishlist"}, status=status.HTTP_404_NOT_FOUND)
