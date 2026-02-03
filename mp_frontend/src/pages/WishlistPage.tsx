import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wishlistAPI, cartAPI } from '@/api/services';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface WishlistItem {
    id: number;
    product: number;
    product_details: {
        id: number;
        name: string;
        price: number;
        image: string;
        description: string;
    };
    added_at: string;
}

const WishlistPage = () => {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchWishlist = async () => {
        try {
            const response = await wishlistAPI.get();
            setItems(response.data);
        } catch (err) {
            console.error('Failed to fetch wishlist:', err);
            setError('Failed to load wishlist items.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemove = async (productId: number) => {
        try {
            await wishlistAPI.remove(productId);
            setItems(items.filter(item => item.product !== productId));
        } catch (err) {
            console.error('Failed to remove from wishlist:', err);
            alert('Failed to remove item. Please try again.');
        }
    };

    const handleAddToCart = async (product: any) => {
        try {
            await cartAPI.add(product.id, 1);
            alert(`${product.name} added to cart!`);
        } catch (err) {
            console.error('Failed to add to cart:', err);
            alert('Failed to add item to cart.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black flex flex-col transition-colors duration-300">
            <Navbar />

            <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => navigate('/profile')}
                            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-2"
                        >
                            <ArrowLeft size={16} />
                            <span className="text-sm font-medium">Back to Profile</span>
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Heart className="text-red-500 fill-red-500" />
                            My Wishlist ({items.length})
                        </h1>
                    </div>
                </div>

                {error ? (
                    <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg text-center">
                        {error}
                    </div>
                ) : items.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Save items you love to your wishlist and they will show up here.
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg"
                        >
                            Explore Products
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden group border border-transparent hover:border-primary/20 transition-all duration-300"
                            >
                                <div
                                    className="relative aspect-square overflow-hidden cursor-pointer"
                                    onClick={() => navigate(`/product/${item.product}`)}
                                >
                                    <img
                                        src={item.product_details.image}
                                        alt={item.product_details.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3
                                            className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors cursor-pointer line-clamp-1"
                                            onClick={() => navigate(`/product/${item.product}`)}
                                        >
                                            {item.product_details.name}
                                        </h3>
                                        <p className="font-bold text-primary">Rs. {item.product_details.price}</p>
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 h-10">
                                        {item.product_details.description}
                                    </p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleAddToCart(item.product_details)}
                                            className="flex-1 bg-primary text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary/95 transition-all text-sm"
                                        >
                                            <ShoppingCart size={16} />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => handleRemove(item.product)}
                                            className="w-10 h-10 border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/50 flex items-center justify-center rounded-lg transition-colors"
                                            title="Remove from wishlist"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default WishlistPage;
