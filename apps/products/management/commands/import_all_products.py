import os
import csv
from django.core.management.base import BaseCommand
from django.db import transaction, IntegrityError
from django.core.files import File
from django.conf import settings
from django.utils.text import slugify

from apps.products.models import Product, Brand
from apps.categories.models import Category


def parse_decimal(val, default=0.0):
    """Parse a decimal value from CSV, returning default if invalid."""
    try:
        if val is None:
            return default
        val = str(val).replace('\u201c', '').replace('\u201d', '').replace('"', '').strip()
        return float(val) if val else default
    except Exception:
        return default


def parse_int(val, default=0):
    """Parse an integer value from CSV, returning default if invalid."""
    try:
        if val is None:
            return default
        return int(str(val).strip()) if str(val).strip() else default
    except Exception:
        return default


def generate_unique_slug(name, existing_sku=None):
    """
    Generate a unique slug for a product name.
    Checks the DB for conflicts and appends a numeric suffix if needed.
    If existing_sku is provided, excludes that product from the uniqueness check
    (useful for updates where the product already owns its slug).
    """
    base_slug = slugify(name)[:45]
    slug = base_slug
    i = 1
    while True:
        qs = Product.objects.filter(slug=slug)
        if existing_sku:
            qs = qs.exclude(sku=existing_sku)
        if not qs.exists():
            break
        suffix = f"-{i}"
        slug = f"{base_slug[:45 - len(suffix)]}{suffix}"
        i += 1
    return slug


class Command(BaseCommand):
    help = "Import products from a master CSV file located in MEDIA_ROOT."

    def handle(self, *args, **kwargs):
        # Safely resolve MEDIA_ROOT; fall back to 'media' if unset or empty
        media_dir = getattr(settings, 'MEDIA_ROOT', '') or 'media'
        csv_path = os.path.join(media_dir, 'master_metadata_combined.csv')

        if not os.path.exists(csv_path):
            self.stdout.write(self.style.ERROR(f"Master CSV file not found: {csv_path}"))
            return

        self.stdout.write(
            self.style.NOTICE(f"Processing {csv_path} with base images directory: {media_dir}")
        )

        processed_skus = set()
        created_count = 0
        updated_count = 0
        error_count = 0

        # Pre-fetch or create the Gadgets category once
        gadgets_category, _ = Category.objects.get_or_create(name="Gadgets")

        with open(csv_path, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)

            for row in reader:
                sku = (row.get('Sku') or '').strip()

                # Skip rows with missing or already-processed SKUs
                if not sku or sku in processed_skus:
                    continue
                processed_skus.add(sku)

                # --- Price ---
                price = parse_decimal(row.get('Price'), default=0.0)

                # --- Stock ---
                stock = parse_int(row.get('Stock'), default=10)

                # --- Category ---
                row_category = (row.get('Category') or 'Uncategorized').strip()

                # Override: watches in Electronics/Fashion go to Gadgets
                name_raw = (row.get('Name') or '').strip()
                name_lower = name_raw.lower()
                if ('watch' in name_lower or 'smartwatch' in name_lower) \
                        and row_category in ('Electronics', 'Fashion'):
                    category = gadgets_category
                else:
                    category, _ = Category.objects.get_or_create(name=row_category)

                # --- Brand ---
                brand_name = (row.get('Brand') or 'Unknown').strip()
                brand, _ = Brand.objects.get_or_create(name=brand_name)

                # --- Name & Slug ---
                name = name_raw[:200] or f"{row_category} Product {sku[-4:] if len(sku) > 4 else sku}"
                slug = generate_unique_slug(name, existing_sku=sku)

                # --- Image paths ---
                image_rel_path = (row.get('image_filename') or '').strip()
                image_path = os.path.join(media_dir, image_rel_path) if image_rel_path else None
                image_filename_only = os.path.basename(image_rel_path) if image_rel_path else None

                # --- Description ---
                description = (row.get('Description') or '').strip()

                defaults = {
                    'name': name,
                    'slug': slug,
                    'description': description,
                    'price': price,
                    'category': category,
                    'brand': brand,
                    'stock': stock,
                }

                # --- Save product in its own transaction so one bad row doesn't abort the whole import ---
                try:
                    with transaction.atomic():
                        product, created = Product.objects.update_or_create(
                            sku=sku,
                            defaults=defaults,
                        )

                        # Only update image if no image is set yet and the file exists on disk
                        if image_path and os.path.exists(image_path) and not product.image:
                            try:
                                with open(image_path, 'rb') as img_f:
                                    product.image.save(image_filename_only, File(img_f), save=True)
                            except Exception as img_err:
                                self.stdout.write(
                                    self.style.WARNING(
                                        f"Could not save image for SKU {sku}: {img_err}"
                                    )
                                )

                    if created:
                        created_count += 1
                        self.stdout.write(self.style.SUCCESS(f"Created : {name} (SKU: {sku})"))
                    else:
                        updated_count += 1
                        self.stdout.write(self.style.SUCCESS(f"Updated : {name} (SKU: {sku})"))

                except IntegrityError as ie:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(f"Integrity error for SKU {sku} ({name}): {ie}")
                    )
                except Exception as e:
                    error_count += 1
                    self.stdout.write(
                        self.style.ERROR(f"Unexpected error for SKU {sku} ({name}): {e}")
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nBatch import completed — "
                f"Created: {created_count}, Updated: {updated_count}, Errors: {error_count}"
            )
        )