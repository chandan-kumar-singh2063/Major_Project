import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Sparkles, Cpu } from 'lucide-react';
import HybridPaginatedProductsList from '@/components/HybridPaginatedProductsList';
import OptimizedImage from '@/components/OptimizedImage';

const electronicsSubcategories = [
  { name: 'Laptops', image: '/assets/computer.png' },
  { name: 'Cameras', image: '/assets/camera.jpg' },
  { name: 'Wearables', image: '/assets/earbuds.png' },
  { name: 'Smart Home', image: '/assets/smart home.jpg' },
  { name: 'Gaming', image: '/assets/gaming.jpg' },
];

export default function ElectronicsContent() {
  return (
    <>
    <Navbar/>
    <div className="pt-20">
      {/* Hero with Electronics Subcategories */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-gray-900 via-black to-gray-800 text-white py-24 px-4 rounded-3xl shadow-2xl mx-4 md:mx-20 overflow-hidden"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-8 text-center">
          Explore Electronics Categories
        </h1>
        <div className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-2 md:px-8">
          {electronicsSubcategories.map((sub) => (
            <motion.a
              key={sub.name}
              href={`/category/electronics/${sub.name.toLowerCase()}`}
              whileHover={{ scale: 1.1 }}
              className="relative min-w-[200px] h-48 rounded-2xl overflow-hidden shadow-lg cursor-pointer group flex-shrink-0"
            >
              <OptimizedImage
                src={sub.image}
                alt={sub.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                maxWidth={400}
                maxHeight={250}
                quality={0.65}
              />
              <div className="absolute inset-0 bg-black/  group-hover:bg-black/60 transition" />
              <h3 className="absolute bottom-4 left-4 text-lg font-semibold text-white z-10 drop-shadow-md">
                {sub.name}
              </h3>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Electronics in this Category */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Electronics in this Category</h2>
        <HybridPaginatedProductsList categoryId={3} itemsPerPage={12} />
      </motion.section>

      {/* AI Suggestions */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-28 px-4 max-w-5xl mx-auto text-center"
      >
        <Sparkles className="mx-auto w-10 h-10 text-primary mb-5" />
        <h2 className="text-2xl md:text-3xl font-bold mb-5">AI-Powered Recommendations</h2>
        <p className="max-w-2xl mx-auto mb-10 text-gray-600 dark:text-gray-300">
          Our AI suggests electronics based on your preferences. Experience a curated shopping journey designed just for you.
        </p>
        <motion.a
          href="#personalized"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-7 py-4 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-full shadow hover:opacity-90 transition"
        >
          <Cpu className="w-5 h-5" />
          Discover Now
        </motion.a>
      </motion.section>
    </div>
    <Footer/>
    </>
  );
}
