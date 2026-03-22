import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Sparkles, Home, Percent, Search } from 'lucide-react';
import HybridPaginatedProductsList from '@/components/HybridPaginatedProductsList';
import OptimizedImage from '@/components/OptimizedImage';

const homeDecorCategories = [
  { name: 'Modern Minimalist', image: '/assets/modern minimalist.png', path: 'modern-minimalist' },
  { name: 'Rustic Farmhouse', image: '/assets/roustic farmhouse.png', path: 'rustic-farmhouse' },
  { name: 'Bohemian Chic', image: '/assets/bohemian chic.png', path: 'bohemian-chic' },
  { name: 'Scandinavian', image: '/assets/scanidinavian.png', path: 'scandinavian' },
  { name: 'Industrial Loft', image: '/assets/industrial loft.jpg', path: 'industrial-loft' },
];

const featuredDecorProducts = [
  { name: 'Minimalist Wall Clock', image: '/assets/minimalistic wall clock.png', price: '$59' },
  { name: 'Rustic Wood Coffee Table', image: '/assets/coffee table.png', price: '$299' },
  { name: 'Boho Macramé Wall Hanging', image: '/assets/wall hanging.png', price: '$45' },
  { name: 'Scandi Floor Lamp', image: '/assets/floor lamp.jpg', price: '$120' },
];

const decorDeals = [
  { name: 'Industrial Pendant Light', image: '/assets/pendant light.png', oldPrice: '$150', newPrice: '$99', discount: '34%' },
  { name: 'Handmade Ceramic Vase', image: '/assets/ceramic vase.png', oldPrice: '$80', newPrice: '$55', discount: '31%' },
  { name: 'Vintage Rug', image: '/assets/vintage rug.png', oldPrice: '$220', newPrice: '$160', discount: '27%' },
  { name: 'Accent Chair', image: '/assets/assent chair.jpg', oldPrice: '$350', newPrice: '$275', discount: '21%' },
];

export default function HomeDecor() {
  return (
    <>
    <Navbar/>
    <div className="pt-20 bg-gray-50 dark:bg-gray-900 min-h-screen">

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-gradient-to-r from-gray-500 via-gray-400 to-violet-200 text-white text-center py-28 px-6 rounded-b-3xl shadow-xl mx-4 md:mx-20"
      >
        <Home className="mx-auto mb-6 w-14 h-14" />
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-wide leading-tight">
          Transform Your Space with Stunning Home Decor
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl font-light mb-8 opacity-90">
          Discover curated styles & timeless pieces to elevate your home’s vibe. Designed for smooth elegance and aesthetic bliss.
        </p>
        <motion.a
          href="#categories"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition"
        >
          <Search className="w-6 h-6" />
          Browse Categories
        </motion.a>
      </motion.section>

      {/* Categories Section - Overlapping Cards */}
      <motion.section
        id="categories"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mt-24 max-w-7xl mx-auto px-6 relative flex justify-center gap-12 flex-wrap"
      >
        {homeDecorCategories.map((cat, idx) => (
          <motion.a
            key={cat.name}
            href={`/category/home-decor/${cat.path}`}
            whileHover={{ y: -15, scale: 1.07, rotate: idx % 2 === 0 ? -2 : 2 }}
            className="relative w-72 h-64 rounded-3xl overflow-hidden shadow-2xl cursor-pointer group bg-white dark:bg-gray-800"
            style={{ zIndex: 10 - idx, marginTop: idx % 2 ? 24 : 0 }}
          >
            <OptimizedImage
              src={cat.image}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              maxWidth={400}
              maxHeight={300}
              quality={0.65}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <h3 className="absolute bottom-6 left-6 text-white text-xl font-bold drop-shadow-lg">
              {cat.name}
            </h3>
          </motion.a>
        ))}
      </motion.section>

      {/* Featured Products */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-28 max-w-7xl mx-auto px-6"
      >
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-gray-100 mb-10 text-center">
          Featured Home Decor Pieces
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {featuredDecorProducts.map(({ name, image, price }) => (
            <motion.a
              key={name}
              href={`/product/${name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition"
            >
              <OptimizedImage
                src={image}
                alt={name}
                className="w-full h-56 object-cover"
                maxWidth={400}
                maxHeight={280}
                quality={0.65}
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
                <p className="mt-2 text-indigo-600 font-bold text-xl">{price}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Seasonal Deals */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mt-32 max-w-7xl mx-auto px-6"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
            Seasonal Home Decor Deals
          </h2>
          <motion.a
            href="#deals"
            whileHover={{ scale: 1.05 }}
            className="text-indigo-600 font-semibold hover:underline flex items-center gap-2"
          >
            <Percent className="w-5 h-5" />
            View All Deals
          </motion.a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {decorDeals.map(({ name, image, oldPrice, newPrice, discount }) => (
            <motion.a
              key={name}
              href={`/product/${name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ scale: 1.06 }}
              className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden transition"
            >
              <OptimizedImage
                src={image}
                alt={name}
                className="w-full h-56 object-cover"
                maxWidth={400}
                maxHeight={280}
                quality={0.65}
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</h3>
                <div className="flex gap-4 items-center mt-2">
                  <span className="line-through text-gray-500 dark:text-gray-400">{oldPrice}</span>
                  <span className="text-indigo-600 font-bold text-xl">{newPrice}</span>
                </div>
              </div>
              <span className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full font-semibold shadow-lg text-sm">
                {discount} OFF
              </span>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Personalized AI Suggestions */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mt-36 max-w-4xl mx-auto px-6 text-center"
      >
        <Sparkles className="mx-auto mb-6 w-12 h-12 text-indigo-600" />
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
          Personalized Home Decor Suggestions
        </h2>
        <p className="mb-8 text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
          Let our AI design assistant help you discover decor pieces perfectly matched to your style and space.
        </p>
        <motion.a
          href="#ai-suggestions"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-3 px-10 py-4 bg-indigo-600 text-white font-semibold rounded-full shadow-lg hover:bg-indigo-700 transition"
        >
          Get Recommendations
        </motion.a>
      </motion.section>

      {/* Home Decor in this Category */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Home Decor in this Category</h2>
        <HybridPaginatedProductsList categoryId={4} />
      </motion.section>
    </div>
    <Footer/>
    </>
  );
}
