import os
import sys
import django
import dj_database_url

path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(path)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'majorproject.settings')
django.setup()

from django.conf import settings
from apps.products.models import Product

prod_db = os.environ.get('PROD_DATABASE_URL')
if prod_db:
    parsed = dj_database_url.parse(prod_db, conn_max_age=600)
    settings.DATABASES['default'] = parsed

print("Connected to:", settings.DATABASES['default']['HOST'])
print("Total products in Neon:", Product.objects.count())
