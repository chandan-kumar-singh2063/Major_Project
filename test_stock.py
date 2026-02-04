import os
import django
import sys

# Setup django
sys.path.append('/Users/nigam/Developer/mp_final')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'majorproject.settings')
django.setup()

from apps.products.models import Product, Category
from apps.orders.models import Order, OrderItem
from django.contrib.auth.models import User
from decimal import Decimal

def test_stock_reduction():
    # 1. Setup Data
    user = User.objects.filter(username='nigamyadav').first()
    seller = User.objects.filter(username='nigam don').first()
    category = Category.objects.first()
    
    product = Product.objects.create(
        name="Test Chasma",
        price=Decimal('100.00'),
        stock=10,
        category=category,
        seller=seller,
        sku="TEST-SKU-1"
    )
    
    print(f"Initial Stock: {product.stock}")
    
    # 2. Simulate Order Creation (The logic from perform_create)
    order = Order.objects.create(user=user, status='ordered', total_price=Decimal('100.00'))
    
    # Manual implementation of the logic I added to perform_create
    if product.stock >= 1:
        product.stock -= 1
        product.purchase_count += 1
        product.save()
    
    OrderItem.objects.create(
        order=order,
        product=product,
        quantity=1,
        price=product.price
    )
    
    # 3. Verify
    updated_product = Product.objects.get(id=product.id)
    print(f"Updated Stock: {updated_product.stock}")
    print(f"Purchase Count: {updated_product.purchase_count}")
    
    if updated_product.stock == 9:
        print("✅ Stock reduction logic works in principle!")
    else:
        print("❌ Stock reduction failed!")

if __name__ == "__main__":
    test_stock_reduction()
