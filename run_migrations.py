import os
import sys

# Add site-packages to path
site_packages = '/Users/nigam/Developer/mp_final/env/lib/python3.12/site-packages'
if site_packages not in sys.path:
    sys.path.append(site_packages)

import django
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'majorproject.settings')
django.setup()

from apps.orders.models import Order
print("Current Order status choices:", Order._meta.get_field('status').choices)

from django.core.management import call_command
print("Attempting to makemigrations...")
try:
    call_command('makemigrations', 'orders')
    print("Attempting to migrate...")
    call_command('migrate', 'orders')
    print("Migration successful!")
except Exception as e:
    print(f"Migration failed: {e}")
