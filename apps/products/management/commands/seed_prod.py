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

        total_processed = 0
        limit = options['limit']

        for dataset in datasets:
            if limit and total_processed >= limit:
                break

            csv_path = dataset['path']
            data_folder = dataset['folder']

            if not os.path.exists(csv_path):
                self.stdout.write(self.style.WARNING(f'CSV not found: {csv_path}'))
                continue

            with open(csv_path, mode='r', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    if limit and total_processed >= limit:
                        break

                    try:
                        name = row.get('Name')
                        price = row.get('Price', '0.0')
                        description = row.get('Description', '')
                        sku = row.get('Sku')
                        category_name = row.get('Category', 'General')
                        image_filename = row.get('image_filename')

                        if not name or not image_filename:
                            continue

                        # Create category
                        category, _ = Category.objects.get_or_create(name=category_name)

                        # Check local path
                        local_img_outer_folder = os.path.join(media_base, data_folder)
                        local_img_path = os.path.join(local_img_outer_folder, image_filename)

                        if not os.path.exists(local_img_path):
                            self.stdout.write(self.style.WARNING(f'Image missing: {local_img_path}'))
                            continue

                        # 4. Upload to Cloudinary
                        self.stdout.write(f'Uploading {image_filename} for {name}...')
                        upload_result = cloudinary.uploader.upload(
                            local_img_path,
                            folder=f'products/{category_name}',
                            public_id=f'{sku}_{int(time.time())}'
                        )
                        cloudinary_url = upload_result.get('secure_url')

                        # 5. Create Product
                        # We use update_or_create to avoid duplicates
                        Product.objects.update_or_create(
                            sku=sku,
                            defaults={
                                'name': name,
                                'price': Decimal(price),
                                'description': description,
                                'category': category,
                                'image': cloudinary_url,
                                'stock': 100,
                                # slug will be auto-generated in model.save()
                            }
                        )

                        total_processed += 1
                        self.stdout.write(self.style.SUCCESS(f'[{total_processed}] Successfully seeded: {name}'))

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f'Error seeding {name}: {str(e)}'))

        self.stdout.write(self.style.SUCCESS(f'Finished! Total products processed: {total_processed}'))
