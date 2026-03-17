import os
import csv
from django.core.management.base import BaseCommand
from apps.products.models import Product, Brand
from apps.categories.models import Category
from django.core.files import File
from django.conf import settings
from django.utils.text import slugify

def parse_decimal(val, default=0.0):
    try:
        if val is None:
            return None
        val = str(val).replace('“', '').replace('”', '').replace('"', '').strip()
        return float(val) if val else None
    except Exception:
        return None

class Command(BaseCommand):
    def handle(self, *args, **kwargs):
        # Clear existing data
        self.stdout.write(self.style.WARNING("Clearing existing products, categories, and brands..."))
        Product.objects.all().delete()
        Category.objects.all().delete()
        Brand.objects.all().delete()
        self.stdout.write(self.style.SUCCESS("Database cleared."))

        media_dir = os.path.join(settings.MEDIA_ROOT) if hasattr(settings, 'MEDIA_ROOT') else 'media'
        csv_path = os.path.join(media_dir, 'master_metadata_combined.csv')
        
        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f"Master CSV file not found: {csv_path}"))
            return
            
        self.stdout.write(self.style.NOTICE(f"Processing {csv_path} with base images directory {media_dir}"))
        
        # Track SKUs to ensure strict uniqueness during this run
        processed_skus = set()

        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # SKU handling - Skip if empty or already processed in this run
                sku = str(row.get('Sku') or "").strip()
                if not sku:
                    continue
                if sku in processed_skus:
                    continue
                
                # Only handle price as decimal, use 0.0 for invalid price
                price = parse_decimal(row.get('Price'))
                if price is None:
                    price = 0.0
                
                # Category
                row_category = row.get('Category') or "Uncategorized"
                category, _ = Category.objects.get_or_create(name=row_category)
                
                # Brand
                brand_name = row.get('Brand') or "Unknown"
                brand, _ = Brand.objects.get_or_create(name=brand_name)
                
                # Image
                image_rel_path = row.get('image_filename')
                image_path = os.path.join(media_dir, image_rel_path) if image_rel_path else None
                image_filename_only = os.path.basename(image_rel_path) if image_rel_path else None
                
                # Name and slug
                name = (row.get('Name') or "Unnamed Product")[:200]
                base_slug = slugify(name)[:45]
                slug = base_slug
                i = 1
                while Product.objects.filter(slug=slug).exists():
                    suffix = f"-{i}"
                    slug = f"{base_slug[:45-len(suffix)]}{suffix}"
                    i += 1
                
                # Product fields
                defaults = {
                    'name': name,
                    'slug': slug,
                    'description': row.get('Description', ''),
                    'price': price,
                    'category': category,
                    'brand': brand,
                    'stock': row.get('Stock', 10),
                }
                
                # Create product
                try:
                    product = Product.objects.create(
                        sku=sku,
                        **defaults
                    )
                    processed_skus.add(sku)
                    
                    # Set image if file exists
                    if image_path and os.path.exists(image_path):
                        try:
                            with open(image_path, 'rb') as img_f:
                                product.image.save(image_filename_only, File(img_f), save=False)
                                product.save()
                        except Exception as e:
                           self.stdout.write(self.style.WARNING(f"Failed to save image for SKU {sku}: {e}"))
                    
                    self.stdout.write(self.style.SUCCESS(f"Imported: {product.name} (SKU: {sku})"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Failed to create product {name} (SKU: {sku}): {e}"))
                
        self.stdout.write(self.style.SUCCESS(f'Batch import completed! Imported {len(processed_skus)} unique products.')) 