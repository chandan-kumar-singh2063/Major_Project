from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from rest_framework import serializers


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer to allow login with email instead of username.
    """
    username_field = 'email'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Replace username field with email field
        self.fields['email'] = serializers.EmailField(required=True)
        self.fields.pop('username', None)
    
    def validate(self, attrs):
        # Get email from request
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Find user by email
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError('No account found with this email address.')
        
        # Check if password is correct
        if not user.check_password(password):
            raise serializers.ValidationError('Invalid email or password.')
        
        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled.')
        
        # Generate tokens
        refresh = self.get_token(user)
        
        data = {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': getattr(user.profile, 'role', 'buyer') if hasattr(user, 'profile') else 'buyer',
            }
        }
        
        return data


class EmailTokenObtainPairView(TokenObtainPairView):
    """
    Custom token view that uses email instead of username for authentication.
    """
    serializer_class = EmailTokenObtainPairSerializer
