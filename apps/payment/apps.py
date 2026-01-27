# apps/payment/apps.py
from django.apps import AppConfig

class PaymentConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.payment'  # This must match the full path