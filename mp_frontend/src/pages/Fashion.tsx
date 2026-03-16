import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Sparkles, ShoppingBag, Percent } from 'lucide-react';
import HybridPaginatedProductsList from '@/components/HybridPaginatedProductsList';
import OptimizedImage from '@/components/OptimizedImage';

const fashionCollections = [
  { name: 'Summer Dresses', image: '/assets/summerdress.jpg' },
  { name: 'Streetwear', image: '/assets/streetwear.jpg' },
  { name: 'Formal Suits', image: '/assets/formal suits.jpg' },
  { name: 'Activewear', image: '/assets/active wear.jpg' },
];

const featuredFashion = [
  { name: 'Floral Maxi Dress', image: '/assets/floral maxi.jpg', price: '$89' },
  { name: 'Bomber Jacket', image: '/assets/bombar jacket.jpg', price: '$129' },
  { name: 'Classic Blazer', image: '/assets/classic blazer.jpg', price: '$159' },
  { name: 'High-Waist Jeans', image: '/assets/high jean.jpg', price: '$79' },
];

const fashionDeals = [
  { name: 'Leather Boots', image: '/assets/leather boots.jpg', oldPrice: '$199', newPrice: '$129', discount: '35%' },
  { name: 'Silk Scarf', image: '/assets/scarf.png', oldPrice: '$49', newPrice: '$29', discount: '41%' },
  { name: 'Denim Jacket', image: '/assets/denim jacket.png', oldPrice: '$149', newPrice: '$99', discount: '33%' },
  { name: 'Designer Handbag', image: '/assets/hand bag.jpg', oldPrice: '$299', newPrice: '$199', discount: '34%' },
];

export default function FashionContent() {
  return (
    <>
    <Navbar/>
    <div className="pt-20">
      {/* Hero with Fashion Collections */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-pink-200 via-rose-100 to-fuchsia-200 text-gray-800 py-24 px-4 rounded-3xl shadow-2xl mx-4 md:mx-20 overflow-hidden"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-10 text-center">
          Trending Fashion Collections
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {fashionCollections.map((collection) => (
            <motion.a
              key={collection.name}
              href={`/category/fashion/${collection.name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ rotate: -3, scale: 1.05 }}
              className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
            >
              <OptimizedImage
                src={collection.image}
                alt={collection.name}
                className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                maxWidth={500}
                maxHeight={300}
                quality={0.65}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              <h3 className="absolute bottom-4 left-4 text-lg font-bold text-white z-10 drop-shadow-md">
                {collection.name}
              </h3>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Slot for Men and Women */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.a
            href="/category/men"
            whileHover={{ scale: 1.03 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
          >
            <OptimizedImage
              src="/assets/men fashion.jpg"
              alt="Men's Fashion"
              className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              maxWidth={700}
              maxHeight={450}
              quality={0.65}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h2 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
                Men's Fashion
              </h2>
            </div>
          </motion.a>
          <motion.a
            href="/category/women"
            whileHover={{ scale: 1.03 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
          >
            <OptimizedImage
              src="/assets/women fashion.jpg"
              alt="Women's Fashion"
              className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
              maxWidth={700}
              maxHeight={450}
              quality={0.65}
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h2 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
                Women's Fashion
              </h2>
            </div>
          </motion.a>
        </div>
      </motion.section>

      {/* Featured Fashion */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Featured Fashion Picks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {featuredFashion.map((item) => (
            <motion.a
              key={item.name}
              href={`/product/${item.name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ rotate: 2, scale: 1.05 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition overflow-hidden"
            >
              <OptimizedImage src={item.image} alt={item.name} className="w-full h-52 object-cover" maxWidth={400} maxHeight={280} quality={0.65} />
              <div className="p-5">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{item.name}</h4>
                <p className="text-pink-600 font-bold text-base mt-1">{item.price}</p>
              </div>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Fashion Deals */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Hot Fashion Deals</h2>
          <motion.a
            href="#fashion-deals"
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center gap-2 text-pink-600 hover:underline"
          >
            <Percent className="w-4 h-4" />
            View All
          </motion.a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {fashionDeals.map((deal) => (
            <motion.a
              key={deal.name}
              href={`/product/${deal.name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ rotate: -2, scale: 1.05 }}
              className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-xl hover:shadow-2xl transition overflow-hidden"
            >
              <OptimizedImage src={deal.image} alt={deal.name} className="w-full h-52 object-cover" maxWidth={400} maxHeight={280} quality={0.65} />
              <div className="p-5">
                <h4 className="font-bold text-gray-800 dark:text-gray-200 text-lg">{deal.name}</h4>
                <div className="flex items-center gap-3 text-sm mt-1">
                  <span className="line-through text-gray-500">{deal.oldPrice}</span>
                  <span className="text-pink-600 font-bold">{deal.newPrice}</span>
                </div>
              </div>
              <span className="absolute top-3 right-3 bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
                {deal.discount} OFF
              </span>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Personalized Fashion */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-28 px-4 max-w-5xl mx-auto text-center"
      >
        <Sparkles className="mx-auto w-10 h-10 text-pink-600 mb-5" />
        <h2 className="text-2xl md:text-3xl font-bold mb-5">Personalized Fashion Picks</h2>
        <p className="max-w-2xl mx-auto mb-10 text-gray-600 dark:text-gray-300">
          Let our AI style assistant recommend outfits tailored to your taste. Discover your unique look today!
        </p>
        <motion.a
          href="#personalized-fashion"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-7 py-4 bg-pink-600 text-white font-semibold rounded-full shadow hover:opacity-90 transition"
        >
          <ShoppingBag className="w-5 h-5" />
          Get Styled
        </motion.a>
      </motion.section>

      {/* Fashion in this Category */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Fashion in this Category</h2>
        <HybridPaginatedProductsList categoryId={1} />
      </motion.section>
    </div>
    <Footer/>
    </>
  );
}
