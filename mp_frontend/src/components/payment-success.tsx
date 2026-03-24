import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, ShoppingBag } from 'lucide-react';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [transactionDetails, setTransactionDetails] = useState<any>(null);
    const [orderCreating, setOrderCreating] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const [orderCreated, setOrderCreated] = useState(false);
    const orderAttempted = useRef(false);

    // Determine payment status
    // Khalti sends: status=Completed (success), status=User canceled / Canceled / Failed
    const status = searchParams.get('status') || '';
    const isSuccess = status === 'Completed';
    const isCancelled = ['user canceled', 'canceled', 'cancelled', 'user_canceled'].includes(status.toLowerCase());

    useEffect(() => {
        const details = {
            status: status,
            transactionId: searchParams.get('transaction_id') || searchParams.get('idx') || searchParams.get('pidx'),
            amount: searchParams.get('amount'),
            totalAmount: searchParams.get('total_amount'),
            purchaseOrderId: searchParams.get('purchase_order_id') || searchParams.get('purchaseOrderId'),
            purchaseOrderName: searchParams.get('purchase_order_name'),
            pidx: searchParams.get('pidx') || searchParams.get('idx'),
        };
        setTransactionDetails(details);

        // Only auto-create order on Completed status
        if (isSuccess && !orderAttempted.current) {
            orderAttempted.current = true;
            handleCreateOrder(details);
        }
    }, []);  // eslint-disable-line react-hooks/exhaustive-deps

    const handleCreateOrder = async (details: any) => {
        setOrderCreating(true);
        try {
            // Dynamically import so it doesn't error if user isn't logged in
            const { ordersAPI, authAPI } = await import('@/api/services');

            let shippingAddress = "Remote (Paid via Khalti)";
            try {
                const profileRes = await authAPI.getProfile();
                if (profileRes.data.address) {
                    shippingAddress = profileRes.data.address;
                }
            } catch {
                // Profile fetch failed (not logged in or expired token) — use default address
            }

            // Check if this was a "Buy Now" purchase
            let buyNowProductId = null;
            let buyNowProductSku = null;

            if (details.purchaseOrderId && String(details.purchaseOrderId).startsWith('BUY_NOW_')) {
                const parts = String(details.purchaseOrderId).split('_');
                const identifier = parts[2];
                if (!isNaN(Number(identifier))) {
                    buyNowProductId = parseInt(identifier);
                } else {
                    buyNowProductSku = identifier;
                }
            }

            await ordersAPI.createOrder({
                shipping_address: shippingAddress,
                transaction_id: details.transactionId,
                status: 'ordered',
                ...(buyNowProductId && { buy_now_product_id: buyNowProductId }),
                ...(buyNowProductSku && { buy_now_product_sku: buyNowProductSku })
            });

            setOrderCreated(true);
            console.log("✅ Order created successfully!");
        } catch (err) {
            console.error("❌ Failed to create order:", err);
            setOrderError("Payment was successful, but we couldn't record your order. Please contact support.");
        } finally {
            setOrderCreating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="max-w-lg w-full">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-10 text-center">

                    {/* Icon */}
                    {isSuccess ? (
                        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 animate-bounce" />
                    ) : isCancelled ? (
                        <XCircle className="w-24 h-24 text-orange-400 mx-auto mb-6" />
                    ) : (
                        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    )}

                    {/* Title */}
                    <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                        {isSuccess
                            ? '🎉 Payment Successful!'
                            : isCancelled
                            ? '⚠️ Payment Cancelled'
                            : '❌ Payment Failed'}
                    </h1>

                    {/* Message */}
                    <p className="text-gray-600 dark:text-gray-400 mb-6 text-base">
                        {isSuccess
                            ? 'Thank you! Your payment was processed successfully and your order is being prepared.'
                            : isCancelled
                            ? 'You cancelled the payment. No charges were made. You can try again anytime.'
                            : 'Something went wrong with your payment. No charges were made. Please try again.'}
                    </p>

                    {/* Order creation status — only show when successful */}
                    {isSuccess && (
                        <div className="mb-6">
                            {orderCreating && (
                                <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
                                    <Loader2 className="animate-spin" size={16} />
                                    <span>Finalizing your order...</span>
                                </div>
                            )}
                            {orderCreated && (
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                                    ✓ Order confirmed and saved!
                                </div>
                            )}
                            {orderError && (
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm">
                                    {orderError}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transaction Details */}
                    {isSuccess && transactionDetails && (
                        <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-6 text-left space-y-2">
                            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Transaction Details</h2>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500 dark:text-gray-400">Status</span>
                                <span className="font-medium text-green-600 dark:text-green-400">{transactionDetails.status}</span>
                            </div>
                            {transactionDetails.transactionId && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Transaction ID</span>
                                    <span className="font-mono text-xs text-gray-700 dark:text-gray-300 break-all ml-2">{transactionDetails.transactionId}</span>
                                </div>
                            )}
                            {transactionDetails.totalAmount && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Amount Paid</span>
                                    <span className="font-bold text-gray-900 dark:text-white">
                                        Rs. {(parseInt(transactionDetails.totalAmount) / 100).toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate('/')}
                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-all shadow-md"
                        >
                            <ShoppingBag size={18} />
                            Continue Shopping
                        </button>
                        {isSuccess && (
                            <button
                                onClick={() => navigate('/orders')}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                                View Orders
                            </button>
                        )}
                        {(isCancelled || !isSuccess) && (
                            <button
                                onClick={() => navigate(-1)}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                            >
                                Go Back
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}