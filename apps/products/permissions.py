from rest_framework import permissions

class IsSeller(permissions.BasePermission):
    """
    Custom permission to only allow sellers to perform certain actions.
    """
    def has_permission(self, request, view):
        # Check if user is authenticated and has a seller role
        if not request.user or not request.user.is_authenticated:
            return False
        
        return hasattr(request.user, 'profile') and request.user.profile.role == 'seller'

class IsSellerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow sellers to create/edit, but anyone can view.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if not request.user or not request.user.is_authenticated:
            return False
            
        return hasattr(request.user, 'profile') and request.user.profile.role == 'seller'
