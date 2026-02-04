import { useState, useEffect } from 'react';
import { X, Upload, Package, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

interface Category {
    id: number;
    name: string;
}

interface AddProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AddProductModal = ({ isOpen, onClose, onSuccess }: AddProductModalProps) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        description: '',
        short_description: '',
        price: '',
        original_price: '',
        category: '',
        stock: '',
        sku: '',
    });

    useEffect(() => {
        if (isOpen) {
            axios.get('http://localhost:8000/api/categories/')
                .then(res => setCategories(res.data))
                .catch(err => console.error('Failed to fetch categories:', err));
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const formData = new FormData();
            Object.entries(form).forEach(([key, value]) => {
                formData.append(key, value);
            });

            if (imageFile) {
                formData.append('image', imageFile);
            }

            await axios.post('http://localhost:8000/api/products/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('access')}`
                }
            });

            onSuccess();
            onClose();
            // Reset form
            setForm({
                name: '',
                description: '',
                short_description: '',
                price: '',
                original_price: '',
                category: '',
                stock: '',
                sku: '',
            });
            setImageFile(null);
            setImagePreview(null);
        } catch (err: any) {
            console.error('Error adding product:', err.response?.data);
            const data = err.response?.data;
            if (data) {
                const firstError = Object.values(data)[0];
                setError(Array.isArray(firstError) ? firstError[0] : 'Failed to add product');
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 text-gray-800">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col relative"
            >
                <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
                    <h2 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <Package className="text-primary" /> List New Product
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors dark:text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="overflow-y-auto p-8 flex-1 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
                            <AlertCircle size={20} />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Product Name *</label>
                                <input
                                    required
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="e.g. Premium Wireless Headphones"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 dark:text-gray-300">SKU (Unique Identifier) *</label>
                                <input
                                    required
                                    name="sku"
                                    value={form.sku}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary outline-none transition-all"
                                    placeholder="e.g. WH-1000XM4-BLK"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Category *</label>
                                    <select
                                        required
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Stock Count *</label>
                                    <input
                                        required
                                        type="number"
                                        name="stock"
                                        value={form.stock}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Selling Price *</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            required
                                            type="number"
                                            name="price"
                                            value={form.price}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Original Price</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                        <input
                                            type="number"
                                            name="original_price"
                                            value={form.original_price}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-4 py-2.5 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Product Image</label>
                                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all">
                                    {imagePreview ? (
                                        <div className="h-48 w-full relative">
                                            <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="h-48 w-full flex flex-col items-center justify-center cursor-pointer p-4 group">
                                            <Upload className="text-gray-400 group-hover:text-primary transition-colors mb-2" size={32} />
                                            <span className="text-sm font-medium text-gray-500 group-hover:text-primary">Click to upload image</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Short Description</label>
                                <input
                                    name="short_description"
                                    value={form.short_description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="Brief highlight..."
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold mb-1 dark:text-gray-300">Full Description *</label>
                        <textarea
                            required
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-4 py-2.5 rounded-xl border dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                            placeholder="Tell customers about your product..."
                        />
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl flex items-start gap-3">
                        <CheckCircle className="text-green-500 mt-1 flex-shrink-0" size={18} />
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            Once listed, your product will be immediately visible to all buyers. Ensure your pricing and stock levels are accurate to maintain a good seller rating.
                        </p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-6 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all border dark:border-gray-600"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={loading}
                            type="submit"
                            className="flex-[2] py-3 px-6 rounded-xl font-bold bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:grayscale"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Listing Item...</span>
                                </div>
                            ) : 'List Product Now'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddProductModal;
