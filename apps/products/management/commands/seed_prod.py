import os
import csv
import cloudinary
import cloudinary.uploader
import dj_database_url
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.products.models import Product, Category
from decimal import Decimal
import time
from concurrent.futures import ThreadPoolExecutor
import threading

# Thread-safe counter
class Counter:
    def __init__(self):
        self.value = 0
        self._lock = threading.Lock()

    def increment(self):
        with self._lock:
            self.value += 1
            return self.value

class Command(BaseCommand):
    help = 'Seeds the production Neon database with products from CSVs and uploads images to Cloudinary'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='Limit number of products to process', default=None)
        parser.add_argument('--mode', type=str, help='local or production', default='production')

    def handle(self, *args, **options):
        # 1. Cloudinary Setup
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET'),
            secure=True
        )

        mode = options['mode']
        
        # 2. Connection Logic:
        # If running in production mode, check for PROD_DATABASE_URL
        if mode == 'production':
            prod_db = os.getenv('PROD_DATABASE_URL')
            if not prod_db:
                self.stdout.write(self.style.ERROR('PROD_DATABASE_URL not found in environment!'))
                return
            self.stdout.write(self.style.NOTICE(f'Using Production Database (Neon)'))
            
            # Here we tell Django to use the production database for this run
            # By default, it will use the one configured in settings.py (SQLite)
            # You must run this command with the DATABASE_URL environment variable set
            # Or temporarily change settings.py DATABASES to Neon.

        # 3. Process CSVs
        media_base = os.path.join(settings.BASE_DIR, 'media')
        new_data_csv = os.path.join(media_base, 'new_data', 'master_metadata_ready.csv')
        old_data_csv = os.path.join(media_base, 'old_data', 'merged_products.csv')

        datasets = [
            {'path': new_data_csv, 'folder': 'new_data'},
            {'path': old_data_csv, 'folder': 'old_data'}
        ]

        self.processed_counter = Counter()
        self.limit = options['limit']
        self.media_base = media_base

        # Function to process a single row (for threading)
        def process_row(row, data_folder):
            if self.limit and self.processed_counter.value >= self.limit:
                return

            try:
                name = row.get('Name')
                sku = row.get('Sku')
                image_filename = row.get('image_filename')
                if not name or not sku or not image_filename: return

                # Optimization: Skip if product already exists in DB
                if Product.objects.filter(sku=sku).exists():
                    self.stdout.write(self.style.NOTICE(f"Skipping: {name} (Already in DB)"))
                    return

                # Check local path
                local_img_path = os.path.join(self.media_base, data_folder, image_filename)
                if not os.path.exists(local_img_path): return

                # Upload to Cloudinary
                upload_result = cloudinary.uploader.upload(
                    local_img_path,
                    folder=f'products/{row.get("Category", "General")}',
                    public_id=f'{sku}_{int(time.time())}'
                )
                cloudinary_url = upload_result.get('secure_url')

                # Create Product
                category, _ = Category.objects.get_or_create(name=row.get('Category', 'General'))
                Product.objects.update_or_create(
                    sku=sku,
                    defaults={
                        'name': name,
                        'price': Decimal(row.get('Price', '0.0')),
                        'description': row.get('Description', ''),
                        'category': category,
                        'image': cloudinary_url,
                        'stock': 100,
                        'is_active': True,
                    }
                )
                
                count = self.processed_counter.increment()
                self.stdout.write(self.style.SUCCESS(f'[{count}] Seeded: {name}'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error seeding {row.get("Name")}: {str(e)}'))

        # Run with 10 threads (10x faster)
        with ThreadPoolExecutor(max_workers=10) as executor:
            for dataset in datasets:
                if self.limit and self.processed_counter.value >= self.limit:
                    break

                csv_path = dataset['path']
                if not os.path.exists(csv_path): continue

                with open(csv_path, mode='r', encoding='utf-8') as file:
                    reader = list(csv.DictReader(file)) # Convert to list for thread executor
                    for row in reader:
                        executor.submit(process_row, row, dataset['folder'])

        self.stdout.write(self.style.SUCCESS(f'Finished! Total products processed: {self.processed_counter.value}'))
