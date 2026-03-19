import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Sparkles, Smartphone, Zap } from 'lucide-react';
import HybridPaginatedProductsList from '@/components/HybridPaginatedProductsList';
import OptimizedImage from '@/components/OptimizedImage';

const gadgetCategories = [
  { name: 'Smartphones', image: '/assets/smartphone.png' },
  { name: 'Wearables', image: '/assets/wearables.jpg' },
  { name: 'Drones', image: '/assets/drones.png' },
  { name: 'Gaming Gear', image: '/assets/gaming gears.jpg' },
  { name: 'Smart Home', image: '/assets/smart home.png' },
];

const trendingGadgets = [
  { name: '4K Drone Pro', image: '/assets/4k drone pro.png', price: '$899' },
  { name: 'Wireless Earbuds X', image: '/assets/wireless earbuds x.jpg', price: '$129' },
  { name: 'Smartwatch Series 5', image: '/assets/smartwatch series 5.jpg', price: '$249' },
  { name: 'Mechanical Keyboard', image: '/assets/mechanical keyboard.jpg', price: '$199' },
];

const gadgetDeals = [
  { name: 'VR Headset', image: '/assets/VR.jpg', oldPrice: '$499', newPrice: '$349', discount: '30%' },
  { name: 'Portable Charger', image: '/assets/portable charger.jpg', oldPrice: '$79', newPrice: '$49', discount: '38%' },
  { name: 'Bluetooth Speaker Max', image: '/assets/bluetooth speaker.jpg', oldPrice: '$149', newPrice: '$99', discount: '34%' },
  { name: 'Fitness Tracker', image: '/assets/fitness tracker.png', oldPrice: '$129', newPrice: '$89', discount: '31%' },
];

export default function Gadgets() {
  return (
    <>
    <Navbar/>
    <div className="pt-20 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-indigo-600 via-purple-700 to-pink-600 text-white rounded-3xl shadow-xl mx-4 md:mx-20 py-24 px-6 text-center"
      >
        <Zap className="mx-auto mb-6 w-12 h-12 opacity-90" />
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
          Explore Cutting-Edge Gadgets & Tech
        </h1>
        <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 drop-shadow-md">
          Find the latest and greatest gadgets powered by innovation. From smart wearables to gaming gear, discover products that elevate your lifestyle.
        </p>
        <motion.a
          whileHover={{ scale: 1.07 }}
          href="#categories"
          className="inline-block bg-white text-indigo-700 font-semibold rounded-full px-8 py-3 shadow-lg hover:bg-indigo-100 transition"
        >
          Browse Gadgets
        </motion.a>
      </motion.section>

      {/* Gadget Categories */}
      <motion.section
        id="categories"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mt-24 max-w-7xl mx-auto px-6"
      >
        <h2 className="text-3xl font-bold mb-12 text-center text-gray-900 dark:text-white tracking-wide">
          Explore Gadget Categories
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {gadgetCategories.map((category) => (
            <motion.a
              key={category.name}
              href={`/category/gadgets/${category.name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ scale: 1.05, boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)' }}
              className="relative group rounded-xl overflow-hidden shadow-md bg-white dark:bg-gray-900 cursor-pointer border border-transparent hover:border-indigo-500 transition"
            >
              <OptimizedImage
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                maxWidth={400}
                maxHeight={250}
                quality={0.65}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-70 transition-opacity" />
              <h3 className="absolute bottom-4 left-4 text-xl font-semibold text-white drop-shadow-md z-10">
                {category.name}
              </h3>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Trending Gadgets */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-28 max-w-7xl mx-auto px-6"
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Trending Gadgets
          </h2>
          <motion.a
            href="#trending"
            whileHover={{ scale: 1.05 }}
            className="text-indigo-600 hover:underline font-semibold cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            View All
          </motion.a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {trendingGadgets.map((item) => (
            <motion.a
              key={item.name}
              href={`/product/${item.name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ scale: 1.04, y: -5 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition p-4 flex flex-col cursor-pointer"
            >
              <OptimizedImage
                src={item.image}
                alt={item.name}
                className="w-full h-48 object-contain rounded-lg mb-4"
                maxWidth={400}
                maxHeight={250}
                quality={0.65}
              />
              <h3 className="font-semibold text-gray-900 dark:text-gray-200 text-lg mb-2">{item.name}</h3>
              <p className="text-indigo-600 font-bold text-xl">{item.price}</p>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Latest Deals */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-28 max-w-7xl mx-auto px-6"
      >
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            Latest Deals
          </h2>
          <motion.a
            href="#deals"
            whileHover={{ scale: 1.05 }}
            className="text-indigo-600 hover:underline font-semibold cursor-pointer flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            See All Deals
          </motion.a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">
          {gadgetDeals.map((deal) => (
            <motion.a
              key={deal.name}
              href={`/product/${deal.name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition p-4 cursor-pointer overflow-hidden"
            >
              <OptimizedImage
                src={deal.image}
                alt={deal.name}
                className="w-full h-48 object-contain rounded-lg mb-4"
                maxWidth={400}
                maxHeight={250}
                quality={0.65}
              />
              <h3 className="font-semibold text-gray-900 dark:text-gray-200 text-lg">{deal.name}</h3>
              <div className="flex items-center gap-3 mt-2">
                <span className="line-through text-gray-400 dark:text-gray-500">{deal.oldPrice}</span>
                <span className="text-indigo-600 font-bold text-xl">{deal.newPrice}</span>
              </div>
              <span className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                {deal.discount} OFF
              </span>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* AI-powered Suggestions */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="mt-32 bg-indigo-700 rounded-3xl max-w-4xl mx-auto px-8 py-16 text-center text-white shadow-xl"
      >
        <Smartphone className="mx-auto w-14 h-14 mb-6 opacity-90" />
        <h2 className="text-4xl font-extrabold mb-4 tracking-wide">
          AI Gadget Guru
        </h2>
        <p className="max-w-xl mx-auto mb-8 text-lg leading-relaxed">
          Discover personalized gadget recommendations powered by AI tailored to your needs and preferences. Upgrade your tech game effortlessly.
        </p>
        <motion.a
          href="#ai-gadgets"
          whileHover={{ scale: 1.07 }}
          className="inline-block bg-white text-indigo-700 font-bold rounded-full px-10 py-4 shadow-lg hover:bg-indigo-100 transition"
        >
          Get Recommendations
        </motion.a>
      </motion.section>

      {/* Gadgets in this Category */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Gadgets in this Category</h2>
        <HybridPaginatedProductsList categoryId={9} />
      </motion.section>
    </div>
    <Footer/>
    </>
  );
}
