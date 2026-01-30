# backend/payments/urls.py (or your main urls.py)
from django.urls import path
from .views import initiate_khalti_payment, verify_khalti_payment, payment_success

urlpatterns = [
    path('khalti/initiate/', initiate_khalti_payment, name='initiate_khalti_payment'),
    path('khalti/verify/', verify_khalti_payment, name='verify_khalti_payment'),
    path('success/', payment_success, name='payment_success'),
]