import os
import csv
import time
import cloudinary
import cloudinary.uploader
import dj_database_url
from django.core.management.base import BaseCommand
from django.conf import settings
from apps.products.models import Product, Category
from django.utils.text import slugify
from decimal import Decimal
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

class Command(BaseCommand):
    help = 'Wipes products and reseeds the database from combined_csv_for_image_search.csv'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, help='Limit number of products to process', default=0)
        parser.add_argument('--mode', type=str, help='local or production', default='production')
        parser.add_argument('--clear', action='store_true', help='Clear existing products first (default: False)', default=False)

    def handle(self, *args, **options):
        cloudinary.config(
            cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
            api_key=os.getenv('CLOUDINARY_API_KEY'),
            api_secret=os.getenv('CLOUDINARY_API_SECRET'),
            secure=True
        )

        mode = options['mode']
        if mode == 'production':
            prod_db = os.getenv('PROD_DATABASE_URL')
            if not prod_db:
                self.stdout.write(self.style.ERROR('PROD_DATABASE_URL not found in environment!'))
                return
            self.stdout.write(self.style.NOTICE(f'Using Production Database (Neon)'))
            parsed = dj_database_url.parse(prod_db, conn_max_age=600)
            parsed['TIME_ZONE'] = settings.TIME_ZONE
            settings.DATABASES['default'] = parsed

        if options.get('clear', False):
            self.stdout.write(self.style.WARNING("Clearing all existing products and categories from the database..."))
            Product.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("Products and categories cleared."))

        csv_path = os.path.join(settings.BASE_DIR, 'media', 'model_train', 'fine_tuned', 'combined_csv_for_image_search.csv')
        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f'CSV not found at {csv_path}'))
            return

        limit = options['limit']

        with open(csv_path, mode='r', encoding='utf-8') as file:
            reader = list(csv.DictReader(file))
        
        if limit:
            reader = reader[:limit]

        self.stdout.write(self.style.NOTICE(f"Total rows to process: {len(reader)}"))

        # Pre-process unique categories to avoid concurrency issues during get_or_create
        unique_categories = set()
        for row in reader:
            cat_name = str(row.get('Category', 'General')).strip()
            if not cat_name or cat_name.lower() == 'nan': cat_name = 'General'
            unique_categories.add(cat_name[:100])
        
        category_map = {}
        for cat_name in unique_categories:
            # Case-insensitive get_or_create to avoid duplicate slug issues
            name_to_use = cat_name.replace('_', ' ').replace('-', ' ').title()
            cat, created = Category.objects.get_or_create(
                name__iexact=name_to_use,
                defaults={'name': name_to_use}
            )
            category_map[cat_name] = cat

        existing_skus = set(Product.objects.values_list('sku', flat=True))

        def upload_to_cloudinary(row):
            name = row.get('Name', '')
            sku = row.get('Sku', '')
            resolved_img = row.get('resolved_image_path', '')
            
            if not name or not sku or str(name).lower() == 'nan' or str(sku).lower() == 'nan' or not resolved_img: 
                return None
            
            if str(sku) in existing_skus: 
                return None

            local_img_path = os.path.join(settings.BASE_DIR, resolved_img)
            if not os.path.exists(local_img_path):
                return None

            cat_name = str(row.get('Category', 'General')).strip()
            if not cat_name or cat_name.lower() == 'nan': cat_name = 'General'
            cat_name = cat_name[:100]

            for attempt in range(3):
                try:
                    upload_result = cloudinary.uploader.upload(
                        local_img_path,
                        folder=f'products/{cat_name}',
                        public_id=str(sku),
                        overwrite=True,
                        timeout=60
                    )
                    cloudinary_url = upload_result.get('secure_url')
                    return (row, cloudinary_url)
                except Exception as e:
                    if attempt == 2:
                        return e
                    time.sleep(min(2 ** attempt, 5)) # Exponential backoff of 1, 2, 4 seconds

        self.stdout.write(self.style.NOTICE("Starting concurrent Cloudinary uploads..."))
        
        products_to_create = []
        successful_uploads = 0
        
        with ThreadPoolExecutor(max_workers=25) as executor:
            future_to_row = {executor.submit(upload_to_cloudinary, row): row for row in reader}
            for future in as_completed(future_to_row):
                result = future.result()
                if not result:
                    continue
                if isinstance(result, Exception):
                    self.stdout.write(self.style.ERROR(f'Error uploading: {result}'))
                    continue

                row, cloudinary_url = result
                
                name = row.get('Name', '')
                sku = str(row.get('Sku', ''))[:50]
                
                price_str = str(row.get('Price', '0')).replace(',', '').strip()
                if not price_str or price_str.lower() == 'nan': price_str = '0'
                try:
                    price = Decimal(price_str)
                except:
                    price = Decimal('0')

                description = str(row.get('Description', '')).replace('nan', '')
                short_desc = description[:500] if description else "NA"
                
                cat_name = str(row.get('Category', 'General')).strip()
                if not cat_name or cat_name.lower() == 'nan': cat_name = 'General'
                cat_name = cat_name[:100]

                base_slug = slugify(name)[:200]
                slug = f"{base_slug}-{slugify(sku)}"[:255]

                product = Product(
                    sku=sku,
                    name=str(name)[:255],
                    slug=slug,
                    price=price,
                    description=description,
                    short_description=short_desc,
                    category=category_map[cat_name],
                    image=cloudinary_url,
                    stock=100,
                    stock_status='in_stock',
                    is_active=True,
                )
                products_to_create.append(product)
                successful_uploads += 1
                
                if len(products_to_create) >= 100:
                    Product.objects.bulk_create(products_to_create, ignore_conflicts=True)
                    self.stdout.write(self.style.SUCCESS(f'Inserted batch of {len(products_to_create)} into DB (Total Seeded: {successful_uploads})...'))
                    products_to_create.clear()

        if products_to_create:
            Product.objects.bulk_create(products_to_create, ignore_conflicts=True)
            self.stdout.write(self.style.SUCCESS(f'Inserted final batch of {len(products_to_create)} into DB...'))

        self.stdout.write(self.style.SUCCESS(f'Finished! Total products successfully seeded: {successful_uploads}'))
