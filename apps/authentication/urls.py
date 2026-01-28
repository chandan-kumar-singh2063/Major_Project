from django.urls import path
from django.views.decorators.csrf import csrf_exempt


from apps.authentication.views_social import CustomGoogleLogin
from .views import UserRegistrationView, UserProfileView, PasswordChangeView, PasswordResetAPIView, PasswordResetConfirmView ,CustomGoogleLogin

urlpatterns = [
    path('register/', UserRegistrationView.as_view(), name='user-register'),
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    path('password/change/', PasswordChangeView.as_view(), name='password-change'),
    path('password/reset/', PasswordResetAPIView.as_view(), name='password-reset-request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password-reset-confirm'),
    path('google/', csrf_exempt(CustomGoogleLogin.as_view()), name='google-login'),
]