# apps/authentication/serializers.py
from dj_rest_auth.registration.serializers import SocialLoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import serializers

class CustomSocialLoginSerializer(SocialLoginSerializer):
    access_token = serializers.CharField(required=False, allow_blank=True)
    code = serializers.CharField(required=False, allow_blank=True)
    id_token = serializers.CharField(required=False, allow_blank=True)

    def get_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }

    def validate(self, attrs):
        # First call parent validate to set self.user
        result = super().validate(attrs)
        
        # Now access the user - check both possible attributes
        user = getattr(self, 'user', None)
        if not user and hasattr(self, 'sociallogin'):
            user = self.sociallogin.user
        
        if user:
            result.update(self.get_tokens(user))
        
        return result