import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AddProductModal from '@/components/AddProductModal';
import { Package, Plus, Trash2, Edit, ShoppingBag, TrendingUp, AlertCircle, DollarSign, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
    category_name: string;
    image?: string;
    seller: number;
    sku: string;
}

interface SellerStats {
    totalProducts: number;
    lowStock: number;
    totalEarnings: number;
    totalSales: number;
}

const SellerDashboard = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState<SellerStats>({
        totalProducts: 0,
        lowStock: 0,
        totalEarnings: 0,
        totalSales: 0,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const authHeader = {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            };

            const [productsRes, statsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/products/my-products/', authHeader),
                axios.get('http://localhost:8000/api/products/stats/', authHeader)
            ]);

            setProducts(productsRes.data.results || productsRes.data);
            setStats(statsRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (productId: number) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            await axios.delete(`http://localhost:8000/api/products/${productId}/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('access')}` }
            });
            fetchData(); // Refresh data
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <motion.h1
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2"
                        >
                            <BarChart2 className="text-primary" /> Seller Command Center
                        </motion.h1>
                        <p className="mt-1 text-gray-500 dark:text-gray-400">Track your business growth and inventory performance</p>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all font-bold"
                    >
                        <Plus size={20} /> Add New Product
                    </motion.button>
                </header>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {[
                        { label: 'Total Sales', value: stats.totalSales, icon: ShoppingBag, color: 'blue' },
                        { label: 'Total Earnings', value: `₹${stats.totalEarnings.toLocaleString()}`, icon: DollarSign, color: 'green' },
                        { label: 'Live Products', value: stats.totalProducts, icon: Package, color: 'purple' },
                        { label: 'Low Stock', value: stats.lowStock, icon: AlertCircle, color: 'red' },
                    ].map((stat, i) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={stat.label}
                            className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-between"
                        >
                            <div>
                                <p className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black mt-1 dark:text-white">{stat.value}</p>
                            </div>
                            <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                <stat.icon size={28} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Product List Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                >
                    <div className="p-8 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-black dark:text-white flex items-center gap-2">
                            <Package size={20} className="text-primary" /> Active Catalog
                        </h2>
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-4 py-2 rounded-full">
                            Showing <span className="text-primary">{products.length}</span> Products
                        </div>
                    </div>

                    {loading ? (
                        <div className="p-32 flex flex-col items-center justify-center gap-4">
                            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-gray-400 font-medium">Loading your inventory...</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="p-32 text-center">
                            <div className="h-24 w-24 bg-gray-50 dark:bg-gray-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold dark:text-white mb-2">Inventory is Empty</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto mb-8">Ready to start selling? List your first product to reach thousands of buyers.</p>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-6 py-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary hover:text-white transition-all"
                            >
                                Create First Listing
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest">
                                    <tr>
                                        <th className="px-8 py-5">Product Details</th>
                                        <th className="px-8 py-5">Category</th>
                                        <th className="px-8 py-5">Price</th>
                                        <th className="px-8 py-5">Inventory</th>
                                        <th className="px-8 py-5 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {products.map((product) => (
                                        <tr key={product.id} className="group hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border-2 border-transparent group-hover:border-primary/20 transition-all">
                                                        {product.image ? (
                                                            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="h-full w-full flex items-center justify-center text-gray-300"><Package size={24} /></div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{product.name}</p>
                                                        <p className="text-xs font-mono text-gray-400 mt-1 uppercase tracking-tighter">SKU: {product.sku}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-[10px] font-black uppercase text-gray-500 dark:text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                                    {product.category_name}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="font-black text-gray-900 dark:text-gray-100">₹{parseFloat(product.price.toString()).toLocaleString()}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center justify-between w-32">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Stock</span>
                                                        <span className={`text-[10px] font-black ${product.stock < 10 ? 'text-red-500' : 'text-green-500'}`}>
                                                            {product.stock} left
                                                        </span>
                                                    </div>
                                                    <div className="w-32 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${product.stock < 10 ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                                                        title="Edit Listing"
                                                    >
                                                        <Edit size={18} />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDelete(product.id)}
                                                        className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 size={18} />
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </motion.div>
            </main>

            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
            />

            <Footer />
        </div>
    );
};

export default SellerDashboard;
