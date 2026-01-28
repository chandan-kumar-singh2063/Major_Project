import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [transactionDetails, setTransactionDetails] = useState<any>(null);

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
    }, [searchParams]);

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
                            <p className="text-gray-600 dark:text-gray-400 mb-8">
                                {isSuccess 
                                    ? 'Thank you for your purchase. Your order has been confirmed.' 
                                    : 'There was an issue processing your payment.'}
                            </p>
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
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                                    <span className="font-mono text-sm dark:text-white">{transactionDetails.purchaseOrderId}</span>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition"
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={() => navigate('/profile')}
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