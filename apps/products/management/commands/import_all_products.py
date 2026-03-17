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
    help = 'Batch import products from multiple CSV files in media/imports/, matching images from corresponding folders.'

    def handle(self, *args, **kwargs):
        media_dir = os.path.join(settings.MEDIA_ROOT) if hasattr(settings, 'MEDIA_ROOT') else 'media'
        csv_path = os.path.join(media_dir, 'master_metadata_combined.csv')
        
        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f"Master CSV file not found: {csv_path}"))
            return
            
        self.stdout.write(self.style.NOTICE(f"Processing {csv_path} with base images directory {media_dir}"))
        
        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Only handle price as decimal, skip row if price is invalid
                price = parse_decimal(row.get('Price'))
                if price is None:
                    self.stdout.write(self.style.WARNING(f"Skipping row with invalid price: {row.get('Price')} (SKU: {row.get('Sku')})"))
                    continue
                
                # Category
                row_category = row.get('Category')
                if not row_category:
                    self.stdout.write(self.style.WARNING(f"Skipping row with missing category (SKU: {row.get('Sku')})"))
                    continue
                    
                category, _ = Category.objects.get_or_create(name=row_category)
                
                # Brand
                brand, _ = Brand.objects.get_or_create(name=row.get('Brand', 'Unknown'))
                
                # Image
                image_rel_path = row.get('image_filename')
                image_path = os.path.join(media_dir, image_rel_path) if image_rel_path else None
                image_filename_only = os.path.basename(image_rel_path) if image_rel_path else None
                
                # Name and slug
                name = row.get('Name', '')[:200]
                base_slug = slugify(name)[:45]  # Leave room for uniqueness
                slug = base_slug
                i = 1
                while Product.objects.filter(slug=slug).exists():
                    suffix = f"-{i}"
                    slug = f"{base_slug[:45-len(suffix)]}{suffix}"
                    i += 1
                slug = slug[:50]  # Ensure max length
                
                # Product fields
                sku = row.get('Sku')
                defaults = {
                    'name': name,
                    'slug': slug,
                    'description': row.get('Description', ''),
                    'price': price,
                    'category': category,
                    'brand': brand,
                    'stock': row.get('Stock', 10),
                }
                
                # Create or update product
                product, created = Product.objects.update_or_create(
                    sku=sku,
                    defaults=defaults
                )
                
                # Set image if file exists
                if image_path and os.path.exists(image_path):
                    try:
                        with open(image_path, 'rb') as img_f:
                            product.image.save(image_filename_only, File(img_f), save=True)
                    except Exception as e:
                       self.stdout.write(self.style.WARNING(f"Failed to save image for SKU {sku}: {e}"))
                else:
                    self.stdout.write(self.style.WARNING(f"Image not found for SKU {sku}: {image_path}"))
                    
                self.stdout.write(self.style.SUCCESS(f"{'Created' if created else 'Updated'} product: {product.name} (Category: {category.name})"))
                
        self.stdout.write(self.style.SUCCESS('Batch import completed!')) 