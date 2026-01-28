# backend/payments/urls.py (or your main urls.py)
from django.urls import path
from .views import initiate_khalti_payment

urlpatterns = [
    path('khalti/initiate/', initiate_khalti_payment, name='khalti-initiate'),
]