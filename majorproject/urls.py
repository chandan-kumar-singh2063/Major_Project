# majorproject/urls.py
from django.http import JsonResponse
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import views as auth_views
from apps.authentication.views import PasswordResetAPIView
from django.views.decorators.csrf import csrf_exempt
from apps.authentication.views import PasswordResetConfirmView
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from apps.authentication.views_social import CustomGoogleLogin


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter
def home(request):
    return JsonResponse({
        "status": "OK",
        "message": "Major Project API is running"
    })
urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    # API endpoints
    path('api/categories/', include('apps.categories.urls')),
    path('api/products/', include('apps.products.urls')),
    path('api/orders/', include('apps.orders.urls')),
    path('api/image-search/', include('apps.image_search.urls')),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/password_reset/', PasswordResetAPIView.as_view(), name='password_reset'),
    path('api/auth/password_reset/done/', auth_views.PasswordResetDoneView.as_view(), name='password_reset_done'),
    path('api/auth/reset/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('api/auth/reset/done/', auth_views.PasswordResetCompleteView.as_view(), name='password_reset_complete'),
    path('api/cart/', include('apps.cart.urls')),
    path('auth/', include('dj_rest_auth.urls')),
    path('auth/registration/', include('dj_rest_auth.registration.urls')),
    path('auth/', include('allauth.socialaccount.urls')),
    path('auth/google/', CustomGoogleLogin.as_view(), name='google_login'),
    path('api/payment/', include('apps.payment.urls')),

]

# Serve media and static files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    