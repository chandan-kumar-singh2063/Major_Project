import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ordersAPI } from '@/api/services';
import { Package, Clock, CheckCircle, XCircle, ChevronRight, MapPin, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OptimizedImage from '@/components/OptimizedImage';

const statusColors: { [key: string]: string } = {
    ordered: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
        case 'ordered': return <Package size={16} />;
        case 'delivered': return <CheckCircle size={16} />;
        case 'cancelled': return <XCircle size={16} />;
        case 'pending':
        case 'processing': return <Clock size={16} />;
        default: return <Package size={16} />;
    }
};

interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        image_url: string;
        price: number;
        sku?: string;
        primary_image?: any;
        image?: string;
    };
    quantity: number;
    price: number;
}


interface Order {
    id: number;
    created_at: string;
    status: string;
    total_price: string | number;
    items: OrderItem[];
    shipping_address: string;
}

const OrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getMyOrders();
            setOrders(response.data);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
            setError('Failed to load orders. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancel = async (orderId: number) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return;

        try {
            await ordersAPI.cancelOrder(orderId);
            fetchOrders();
        } catch (err) {
            console.error('Failed to cancel order:', err);
            alert('Failed to cancel order. It may have already been processed.');
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black transition-colors duration-300">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 py-12">
                <header className="mb-8">
                    <button
                        onClick={() => navigate('/profile')}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-4"
                    >
                        <ArrowLeft size={16} />
                        <span className="text-sm font-medium">Back to Profile</span>
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
                    <p className="text-gray-600 dark:text-gray-400">Track and manage your recent purchases</p>
                </header>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-500">Loading your orders...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 rounded-xl text-center">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                        >
                            Retry
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white dark:bg-gray-900 p-12 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-800">
                        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-8">You haven't placed any orders yet. Start shopping to see your orders here!</p>
                        <a
                            href="/"
                            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition shadow-lg shadow-primary/25"
                        >
                            Go Shopping
                            <ChevronRight size={18} />
                        </a>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order #{order.id}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <Clock size={14} />
                                                {new Date(order.created_at).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <div className="flex flex-wrap items-center gap-3">
                                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status.toLowerCase()] || 'bg-gray-100 text-gray-800'}`}>
                                                    <StatusIcon status={order.status.toLowerCase()} />
                                                    <span className="capitalize">{order.status}</span>
                                                </div>
                                                {['ordered', 'pending'].includes(order.status.toLowerCase()) && (
                                                    <button
                                                        onClick={() => handleCancel(order.id)}
                                                        className="text-xs font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:underline px-2 py-1"
                                                    >
                                                        Cancel Order
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xl font-bold text-primary">Rs. {order.total_price}</p>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-50 dark:border-gray-800 pt-6">
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wider">Items</h4>
                                        <div className="space-y-4">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex gap-4">
                                                    <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                                        <OptimizedImage
                                                            src={item.product?.image_url || item.product?.primary_image?.image || item.product?.image || 'https://via.placeholder.com/64'}
                                                            alt={item.product?.name}
                                                            className="w-full h-full object-cover"
                                                            maxWidth={100}
                                                            maxHeight={100}
                                                            quality={0.6}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="font-medium text-gray-900 dark:text-white uppercase">{item.product?.name}</h5>
                                                            {item.product?.sku && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded font-mono">
                                                                    SKU: {item.product.sku}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 mt-1 uppercase">Qty: {item.quantity} × Rs. {item.price}</p>
                                                    </div>

                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900 dark:text-white">Rs. {item.quantity * Number(item.price)}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-50 dark:border-gray-800 mt-6 pt-6 flex items-start gap-3 text-gray-600 dark:text-gray-400">
                                        <MapPin size={18} className="flex-shrink-0 mt-0.5 text-gray-400" />
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Address</p>
                                            <p className="text-sm mt-0.5">{order.shipping_address}</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default OrdersPage;
