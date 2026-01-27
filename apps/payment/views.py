# backend/payments/views.py (or wherever you keep your views)
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import requests
import os
from datetime import datetime

@api_view(['POST'])
def initiate_khalti_payment(request):
    try:
        print("🚀 Payment initiation started...")
        
        # Get Khalti secret key from environment
        khalti_secret_key = os.environ.get('KHALTI_SECRET_KEY')
        
        if not khalti_secret_key:
            print("❌ KHALTI_SECRET_KEY environment variable is missing")
            return Response(
                {"error": "KHALTI_SECRET_KEY is not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        # Get request data
        data = request.data
        print("📥 Request body:", data)
        
        # Validate required fields
        if not data.get('name') or not data.get('amount'):
            print("❌ Missing required fields")
            return Response(
                {"error": "Missing required fields: name or amount"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print("🌐 Calling Khalti API...")
        
        # Prepare URLs
        return_url = data.get('return_url') or f"{os.environ.get('VITE_SITE_URL', 'http://localhost:5173')}/payment-success"
        website_url = data.get('website_url') or os.environ.get('VITE_SITE_URL', 'http://localhost:5173')
        
        # Call Khalti API
        khalti_response = requests.post(
            "https://dev.khalti.com/api/v2/epayment/initiate/",
            headers={
                "Authorization": f"key {khalti_secret_key}",
                "Content-Type": "application/json"
            },
            json={
                "return_url": return_url,
                "website_url": website_url,
                "amount": data.get('amount'),
                "purchase_order_id": f"order-{int(datetime.now().timestamp() * 1000)}",
                "purchase_order_name": "Product Purchase",
                "customer_info": {
                    "name": data.get('name'),
                    "email": data.get('email', 'guest@example.com'),
                    "phone": "9800000000"
                }
            }
        )
        
        print("📥 Khalti response status:", khalti_response.status_code)
        
        if not khalti_response.ok:
            error_text = khalti_response.text
            print("❌ Khalti API error:", error_text)
            return Response(
                {"error": f"Khalti API error: {khalti_response.status_code} - {error_text}"},
                status=khalti_response.status_code
            )
        
        khalti_data = khalti_response.json()
        print("📥 Khalti response data:", khalti_data)
        
        if not khalti_data.get('pidx'):
            print("❌ Payment initiation failed")
            return Response(
                {"error": "Failed to initiate payment - no pidx returned"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print("✅ Payment initiation successful")
        return Response(khalti_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("❌ Server Error:", str(e))
        return Response(
            {"error": f"Server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )