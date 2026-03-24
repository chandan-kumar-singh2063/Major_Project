import os
import sys
import django
from dotenv import load_dotenv

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'majorproject.settings')
load_dotenv('.env.local')

# Force Django to use Neon by setting DATABASE_URL
os.environ['DATABASE_URL'] = os.environ.get('PROD_DATABASE_URL')

django.setup()

from apps.products.models import Product

count = Product.objects.count()
print(f"Products in Neon before deletion: {count}")

Product.objects.all().delete()

print(f"Products remaining in Neon: {Product.objects.count()}")
