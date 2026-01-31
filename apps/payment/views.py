# backend/payments/views.py
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
        
        khalti_secret_key = os.environ.get('KHALTI_SECRET_KEY')
        
        if not khalti_secret_key:
            print("❌ KHALTI_SECRET_KEY environment variable is missing")
            return Response(
                {"error": "KHALTI_SECRET_KEY is not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        data = request.data
        print("📥 Request body:", data)
        
        if not data.get('name') or not data.get('amount'):
            print("❌ Missing required fields")
            return Response(
                {"error": "Missing required fields: name or amount"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print("🌐 Calling Khalti API...")
        
        # Get return_url and website_url from request
        # Default to web app URLs (mobile SDK handles callbacks internally)
        web_url = os.environ.get('VITE_SITE_URL', 'http://localhost:5173')
        return_url = data.get('return_url') or f"{web_url}/payment-success"
        website_url = data.get('website_url') or web_url
        
        print(f"🔗 Return URL: {return_url}")
        print(f"🌐 Website URL: {website_url}")
        
        purchase_order_id = f"order-{int(datetime.now().timestamp() * 1000)}"
        
        payload = {
            "return_url": return_url,
            "website_url": website_url,
            "amount": data.get('amount'),
            "purchase_order_id": purchase_order_id,
            "purchase_order_name": data.get('purchase_order_name', 'Product Purchase'),
            "customer_info": {
                "name": data.get('name'),
                "email": data.get('email', 'guest@example.com'),
                "phone": data.get('phone', '9800000000')
            }
        }
        
        print(f"📡 Sending to Khalti: {payload}")
        
        khalti_response = requests.post(
            "https://dev.khalti.com/api/v2/epayment/initiate/",
            headers={
                "Authorization": f"key {khalti_secret_key}",
                "Content-Type": "application/json"
            },
            json=payload
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
        
        # Add purchase_order_id for tracking
        khalti_data['purchase_order_id'] = purchase_order_id
        
        print("✅ Payment initiation successful")
        return Response(khalti_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        print("❌ Server Error:", str(e))
        import traceback
        traceback.print_exc()
        return Response(
            {"error": f"Server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )



@api_view(['POST'])
def verify_khalti_payment(request):
    """Optional: Verify payment status with Khalti"""
    try:
        khalti_secret_key = os.environ.get('KHALTI_SECRET_KEY')
        pidx = request.data.get('pidx')
        
        if not pidx:
            return Response(
                {"error": "pidx is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        khalti_response = requests.post(
            "https://dev.khalti.com/api/v2/epayment/lookup/",
            headers={
                "Authorization": f"key {khalti_secret_key}",
                "Content-Type": "application/json"
            },
            json={"pidx": pidx}
        )
        
        if not khalti_response.ok:
            return Response(
                {"error": "Failed to verify payment"},
                status=khalti_response.status_code
            )
        
        payment_data = khalti_response.json()
        print(f"✅ Payment verification: {payment_data}")
        return Response(payment_data, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response(
            {"error": f"Server error: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


from django.http import HttpResponse

@api_view(['GET'])
def payment_success(request):
    """
    Payment success callback endpoint for Khalti.
    This is loaded in the Khalti SDK WebView after payment completion.
    The SDK detects successful page load and triggers onPaymentResult callback.
    """
    pidx = request.GET.get('pidx', 'N/A')
    status_param = request.GET.get('status', 'N/A')
    transaction_id = request.GET.get('transaction_id', 'N/A')
    
    print(f"✅ Payment Success Callback - PIDX: {pidx}, Status: {status_param}, TxnID: {transaction_id}")
    
    # Return a simple HTML page that the SDK can load
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Payment Successful</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .container {
                text-align: center;
                padding: 2rem;
            }
            .checkmark {
                font-size: 4rem;
                margin-bottom: 1rem;
                animation: scaleIn 0.5s ease-out;
            }
            @keyframes scaleIn {
                from { transform: scale(0); }
                to { transform: scale(1); }
            }
            h1 {
                font-size: 2rem;
                margin-bottom: 0.5rem;
            }
            p {
                font-size: 1rem;
                opacity: 0.9;
            }
            .close-button {
                margin-top: 2rem;
                padding: 1rem 2rem;
                font-size: 1rem;
                font-weight: bold;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                border: 2px solid white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s;
            }
            .close-button:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.05);
            }
            .countdown {
                font-size: 0.875rem;
                margin-top: 1rem;
                opacity: 0.8;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="checkmark">✓</div>
            <h1>Payment Successful!</h1>
            <p>Your payment has been processed successfully.</p>
            <button class="close-button" onclick="closeWindow()">Return to App</button>
            <p class="countdown" id="auto-close-msg"></p>
        </div>
        <script>
            function closeWindow() {
                // Try to close the window/WebView
                if (window.close) {
                    window.close();
                }
                // Also try history.back as fallback
                setTimeout(() => {
                    if (window.history.length > 1) {
                        window.history.back();
                    }
                }, 100);
            }
            
            // Auto-close after 3 seconds
            let count = 3;
            const msgEl = document.getElementById('auto-close-msg');
            
            const countdown = setInterval(() => {
                msgEl.textContent = `Auto-closing in ${count} seconds...`;
                count--;
                
                if (count < 0) {
                    clearInterval(countdown);
                    closeWindow();
                }
            }, 1000);
        </script>
    </body>
    </html>
    """
    
    return HttpResponse(html_content, content_type='text/html') 