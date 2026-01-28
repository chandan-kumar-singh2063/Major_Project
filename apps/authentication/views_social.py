# apps/authentication/views_social.py
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from apps.authentication.serializers import CustomSocialLoginSerializer

@authentication_classes([])
@permission_classes([AllowAny])
class CustomGoogleLogin(SocialLoginView):
    authentication_classes = []
    permission_classes = [AllowAny]
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    serializer_class = CustomSocialLoginSerializer
    callback_url = 'http://localhost:5173'