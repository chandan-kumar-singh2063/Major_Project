import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { ordersAPI } from '@/api/services';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [transactionDetails, setTransactionDetails] = useState<any>(null);
    const [orderCreating, setOrderCreating] = useState(false);
    const [orderError, setOrderError] = useState<string | null>(null);
    const orderCreated = useRef(false);

    useEffect(() => {
        const details = {
            status: searchParams.get('status'),
            transactionId: searchParams.get('transaction_id'),
            amount: searchParams.get('amount'),
            totalAmount: searchParams.get('total_amount'),
            purchaseOrderId: searchParams.get('purchase_order_id'),
            purchaseOrderName: searchParams.get('purchase_order_name'),
            pidx: searchParams.get('pidx'),
        };
        setTransactionDetails(details);

        // If payment is successful and we haven't created the order yet
        if (details.status === 'Completed' && !orderCreated.current) {
            handleCreateOrder(details);
        }
    }, [searchParams]);

    const handleCreateOrder = async (details: any) => {
        setOrderCreating(true);
        try {
            // Note: In typical flow, the shipping address might be passed from checkout state
            // or fetched from a stored session/localstorage. 
            // Here we use a placeholder or assume backend handles default if allowed.
            const shippingAddress = "Remote (Paid via Khalti)"; // Placeholder

            await ordersAPI.createOrder({
                shipping_address: shippingAddress,
                transaction_id: details.transactionId,
                status: 'ordered'
            });

            orderCreated.current = true;
            console.log("Order created successfully!");
        } catch (err) {
            console.error("Failed to create order:", err);
            setOrderError("Payment was successful, but we encountered an error creating your order record. Please contact support.");
        } finally {
            setOrderCreating(false);
        }
    };

    const isSuccess = transactionDetails?.status === 'Completed';

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                        <div className="text-center">
                            {isSuccess ? (
                                <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                            ) : (
                                <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                            )}
                            <h1 className="text-3xl font-bold mb-2 dark:text-white">
                                {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                {isSuccess
                                    ? 'Thank you for your purchase. Your order is being processed.'
                                    : 'There was an issue processing your payment.'}
                            </p>

                            {orderCreating && (
                                <div className="flex items-center justify-center gap-2 text-primary mb-4">
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Creating your order...</span>
                                </div>
                            )}

                            {orderError && (
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg mb-4 text-sm">
                                    {orderError}
                                </div>
                            )}

                            {isSuccess && !orderCreating && !orderError && (
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg mb-8 text-sm">
                                    Order confirmed and cart cleared!
                                </div>
                            )}
                        </div>

                        {transactionDetails && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                                <h2 className="text-xl font-semibold mb-4 dark:text-white">Transaction Details</h2>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                    <span className="font-semibold dark:text-white">{transactionDetails.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                                    <span className="font-mono text-sm dark:text-white">{transactionDetails.transactionId}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                                    <span className="font-semibold text-lg dark:text-white">
                                        Rs. {transactionDetails.totalAmount ? (parseInt(transactionDetails.totalAmount) / 100).toFixed(2) : '0.00'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition shadow-md"
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={() => navigate('/orders')}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                View Orders
                            </button>
                        </div>

                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}