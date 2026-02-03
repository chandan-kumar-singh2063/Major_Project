# apps/authentication/views.py
from django.shortcuts import render
from rest_framework import viewsets, generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer, CharField, EmailField, ValidationError
from rest_framework.views import APIView
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth.views import PasswordResetView
from django.core.mail import send_mail
from django.conf import settings
from dj_rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from allauth.socialaccount.models import SocialApp
import requests
from .models import Profile

# User Registration Serializer
class UserRegistrationSerializer(ModelSerializer):
    password = CharField(write_only=True)
    email = EmailField(required=True)
    username = CharField(required=True, max_length=150)  # Override to remove default validators

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

    def validate_username(self, value):
        # Allow any characters in username (including spaces)
        if not value or len(value.strip()) == 0:
            raise ValidationError('Username cannot be empty')
        if len(value) > 150:
            raise ValidationError('Username is too long (max 150 characters)')
        if User.objects.filter(username=value).exists():
            raise ValidationError('Username already exists')
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise ValidationError('Email already exists')
        return value


# User Registration View
class UserRegistrationView(generics.CreateAPIView):
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        print("=" * 50)
        print("📝 Registration request data:", request.data)
        print("=" * 50)
        
        recaptcha_token = request.data.get('recaptcha_token')
        
        if not recaptcha_token:
            print("❌ No reCAPTCHA token provided")
            return Response({'error': 'Missing reCAPTCHA token.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            if not hasattr(settings, 'RECAPTCHA_SECRET_KEY'):
                print("❌ RECAPTCHA_SECRET_KEY not configured in settings")
                return Response({'error': 'reCAPTCHA not configured on server.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            secret = settings.RECAPTCHA_SECRET_KEY
            print(f"🔍 Verifying reCAPTCHA with secret: {secret[:10]}...")
            
            recaptcha_response = requests.post(
                'https://www.google.com/recaptcha/api/siteverify',
                data={'secret': secret, 'response': recaptcha_token}
            )
            result = recaptcha_response.json()
            print("🔍 reCAPTCHA verification result:", result)
            
            if not result.get('success'):
                error_codes = result.get('error-codes', [])
                print(f"❌ reCAPTCHA failed with errors: {error_codes}")
                return Response({
                    'error': 'Invalid reCAPTCHA. Please try again.',
                    'details': error_codes
                }, status=status.HTTP_400_BAD_REQUEST)
            
            print("✅ reCAPTCHA verified successfully")
            
        except Exception as e:
            print(f"❌ reCAPTCHA exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({'error': f'reCAPTCHA verification failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Call parent create
        try:
            response = super().create(request, *args, **kwargs)
            print("✅ User created successfully")
            return response
        except Exception as e:
            print(f"❌ User creation failed: {str(e)}")
            import traceback
            traceback.print_exc()
            raise

# User Profile Serializer
class UserProfileSerializer(ModelSerializer):
    address = CharField(source='profile.address', allow_blank=True, required=False)
    phone_number = CharField(source='profile.phone_number', allow_blank=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'address', 'phone_number']

    def update(self, instance, validated_data):
        # Extract profile data nested by source='profile.address/phone_number'
        profile_data = validated_data.pop('profile', {})
        address = profile_data.get('address')
        phone_number = profile_data.get('phone_number')

        # Update User fields
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()

        # Update or create Profile fields
        profile, created = Profile.objects.get_or_create(user=instance)
        if address is not None:
            profile.address = address
        if phone_number is not None:
            profile.phone_number = phone_number
        profile.save()

        return instance



# User Profile View
class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



# Password Change View
class PasswordChangeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        if not user.check_password(old_password):
            return Response({'error': 'Old password is incorrect.'}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({'success': True})


# Password Reset API View
class PasswordResetAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
        except Exception:
            # For security, do not reveal if the email is not registered
            return Response({'success': 'If an account exists for this email, a reset link has been sent.'})
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"
        subject = "Password Reset Request"
        message = f"Hi {user.username},\n\nPlease click the link below to reset your password:\n{reset_link}\n\nIf you did not request this, you can ignore this email."
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
        return Response({'success': 'If an account exists for this email, a reset link has been sent.'})


# Password Reset Confirm View
class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        new_password = request.data.get('new_password')
        try:
            uid_int = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid_int)
        except (Exception, ValueError, TypeError):
            return Response({'error': 'Invalid user.'}, status=400)
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Invalid or expired token.'}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({'success': True})


# Custom Google Login View
@authentication_classes([])
@permission_classes([AllowAny])
class CustomGoogleLogin(SocialLoginView):
    authentication_classes = []
    permission_classes = [AllowAny]
    adapter_class = GoogleOAuth2Adapter
    client_class = OAuth2Client
    callback_url = 'http://localhost:5173'

    def post(self, request, *args, **kwargs):
        # DEBUG: Print what we received
        print("=" * 50)
        print("📥 Received request data:", request.data)
        # REMOVED: print("📥 Request body:", request.body)  # This causes the error!
        print("📥 Content-Type:", request.content_type)
        print("=" * 50)
        
        access_token = request.data.get('access_token', '')
        
        print(f"🔍 access_token extracted: '{access_token[:50] if access_token else 'NONE'}'...")
        print(f"🔍 access_token length: {len(access_token) if access_token else 0}")
        print(f"🔍 Dots in token: {access_token.count('.') if access_token else 0}")
        
        # Check if this is an id_token (JWT format has 2 dots)
        if access_token and access_token.count('.') == 2:
            print("✅ Detected JWT format (id_token)")
            try:
                # Get Google app from database
                app = SocialApp.objects.get(provider='google')
                print(f"✅ Found Google app with client_id: {app.client_id[:20]}...")
                
                # Verify the Google ID token
                idinfo = google_id_token.verify_oauth2_token(
                    access_token,
                    google_requests.Request(),
                    app.client_id
                )
                
                print("✅ Google ID Token verified:", idinfo)
                
                # Extract user info
                email = idinfo.get('email')
                if not email:
                    return Response(
                        {'error': 'Email not provided by Google'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Get or create user
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': email.split('@')[0],
                        'first_name': idinfo.get('given_name', ''),
                        'last_name': idinfo.get('family_name', ''),
                    }
                )
                
                print(f"✅ User {'created' if created else 'found'}: {user.email}")
                
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'username': user.username,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                    }
                }, status=status.HTTP_200_OK)
                
            except Exception as e:
                print(f"❌ Google login error: {str(e)}")
                import traceback
                traceback.print_exc()
                return Response(
                    {'error': f'Invalid token: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            print(f"❌ Not a JWT format or no token. Dots count: {access_token.count('.') if access_token else 0}")
        
        # Fallback to default OAuth flow
        print("⚠️ Falling back to default dj-rest-auth flow")
        return super().post(request, *args, **kwargs)