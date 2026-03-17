import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, Camera, Percent } from 'lucide-react';
import { useEffect, useState } from 'react';
import { categoriesAPI } from '@/api/services';
import OptimizedImage from './OptimizedImage';

// Removed hardcoded featuredCategories

const trendingProducts = [
  { name: 'Noise Cancelling Headphones', image: '/assets/noise cancelling headphone.jpg', price: '$199' },
  { name: 'Smart Watch', image: '/assets/smart watch.jpg', price: '$149' },
  { name: 'Modern Sofa', image: '/assets/modern sofa.jpg', price: '$899' },
  { name: 'Designer Dress', image: '/assets/designer dress.jpg', price: '$249' },
];

const salesProducts = [
  { name: 'Bluetooth Speaker', image: '/assets/bluetooth speaker.jpg', oldPrice: '$99', newPrice: '$59', discount: '40%' },
  { name: 'Winter Jacket', image: '/assets/winter jacket.jpg', oldPrice: '$179', newPrice: '$109', discount: '39%' },
  { name: 'LED Lamp', image: '/assets/lamp.jpg', oldPrice: '$49', newPrice: '$29', discount: '41%' },
  { name: 'Stylish Sneakers', image: '/assets/sneaker.jpg', oldPrice: '$129', newPrice: '$89', discount: '31%' },
];

export default function HomeContent() {
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    interface Category {
      id: number;
      name: string;
      image: string;
    }

    categoriesAPI.getAll().then((res: any) => setCategories(res.data as Category[]));
  }, []);

  return (
    <div className="pt-20">
      {/* Hero section */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-primary dark:text-white border-amber-50 text-white dark:bg-accent  text-center py-24 px-4 rounded-3xl shadow-2xl mx-4 md:mx-20"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
          Find Anything Using Just an Image
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8">
          Our AI-powered Visual Transformer technology helps you search and shop effortlessly. Snap it, upload it, and discover exactly what you’re looking for.
        </p>
        <motion.a
          whileHover={{ scale: 1.05 }}
          href="#image-search"
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary font-bold rounded-full shadow-lg dark:text-black hover:bg-gray-100 transition"
        >
          <Camera className="w-5 h-5" />
          Try Image Search
        </motion.a>
      </motion.section>

      {/* Featured categories (from backend) */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-20 px-4 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Shop by Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <motion.a
              key={cat.id}
              href={`/category/${cat.name.toLowerCase()}`}
              whileHover={{ scale: 1.05 }}
              className="group relative rounded-xl overflow-hidden shadow-lg"
            >
              {cat.image && (
                <OptimizedImage
                  src={cat.image}
                  alt={cat.name}
                  className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-300"
                  maxWidth={400}
                  maxHeight={300}
                  quality={0.7}
                />
              )}
              <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition" />
              <h3 className="absolute bottom-4 left-4 text-lg font-semibold text-white">
                {cat.name}
              </h3>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Trending products */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">Trending Products</h2>
          <motion.a
            href="#trending"
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <TrendingUp className="w-4 h-4" />
            View All
          </motion.a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trendingProducts.map((prod) => (
            <motion.a
              key={prod.name}
              href={`/product/${prod.name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <OptimizedImage
                src={prod.image}
                alt={prod.name}
                className="w-full aspect-square object-contain bg-gray-50 dark:bg-gray-800"
                maxWidth={400}
                maxHeight={400}
                quality={0.75}
              />
              <div className="p-3">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{prod.name}</h4>
                <p className="text-primary font-bold">{prod.price}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* 🔥 Sales Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-stone-800">Sales & Offers</h2>
          <motion.a
            href="#sales"
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 text-black hover:underline"
          >
            <Percent className="w-4 h-4" />
            View Deals
          </motion.a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {salesProducts.map((item) => (
            <motion.a
              key={item.name}
              href={`/product/${item.name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ scale: 1.05 }}
              className="relative bg-white dark:bg-gray-900 rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <OptimizedImage src={item.image} alt={item.name} className="w-full aspect-square object-cover" maxWidth={400} maxHeight={400} quality={0.75} />
              <div className="p-4">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">{item.name}</h4>
                <div className="flex items-center gap-2 text-sm">
                  <span className="line-through text-gray-500">{item.oldPrice}</span>
                  <span className="text-primary font-bold">{item.newPrice}</span>
                </div>
              </div>
              <span className="absolute top-2 right-2 bg-red-400 text-black text-xs font-bold px-2 py-1 rounded-full shadow">
                {item.discount} OFF
              </span>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* AI suggestions */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-5xl mx-auto text-center"
      >
        <Sparkles className="mx-auto w-10 h-10 text-primary mb-4" />
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Personalized AI Suggestions</h2>
        <p className="max-w-2xl mx-auto mb-8 text-gray-600 dark:text-gray-300">
          Our deep learning model learns your style and preferences to recommend the perfect items. The more you interact, the smarter it gets — giving you a personalized shopping journey.
        </p>
        <motion.a
          href="#suggestions"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full shadow hover:bg-primary/90 transition"
        >
          <Search className="w-5 h-5" />
          Explore Suggestions
        </motion.a>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="mt-32 bg-gradient-to-r from-black to-blue-400 text-white text-center py-20 rounded-3xl shadow-xl mx-4 md:mx-20"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to discover products visually?</h2>
        <p className="max-w-2xl mx-auto mb-8 text-lg">
          Upload an image, and let our AI find the exact match for you.
        </p>
        <motion.a
          href="#image-search"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-bold rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          <Camera className="w-5 h-5" />
          Start Image Search
        </motion.a>
      </motion.section>
    </div>
  );
}