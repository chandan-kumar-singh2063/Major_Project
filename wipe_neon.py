import os
import sys
import django

path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'majorproject.settings')
django.setup()

from apps.products.models import Product, Brand
from apps.categories.models import Category

print("Deleting existing Neon products...")
Product.objects.all().delete()
print("Deleting existing Neon brands...")
Brand.objects.all().delete()
print("Deleting existing Neon categories...")
Category.objects.all().delete()
print("Neon database successfully wiped and ready for clean migration!")
