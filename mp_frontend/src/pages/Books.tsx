import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen} from 'lucide-react';
import HybridPaginatedProductsList from '@/components/HybridPaginatedProductsList';
import OptimizedImage from '@/components/OptimizedImage';

const bookCategories = [
  { name: 'Fantasy', image: '/assets/fantasy book.jpg' },
  { name: 'Science Fiction', image: '/assets/science fiction.webp' },
  { name: 'Mystery', image: '/assets/mysterious books.webp' },
  { name: 'Romance', image: '/assets/romance book.avif' },
];

export default function BooksContent() {
  return (
    <>
    <Navbar/>
    <div className="pt-20">
      {/* Trending Book Categories */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative bg-gradient-to-r from-yellow-100 via-amber-100 to-orange-200 text-gray-800 py-24 px-4 rounded-3xl shadow-2xl mx-4 md:mx-20 overflow-hidden"
      >
        <h1 className="text-3xl md:text-5xl font-extrabold mb-10 text-center">
          Explore Book Categories
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {bookCategories.map((category) => (
            <motion.a
              key={category.name}
              href={`/category/books/${category.name.toLowerCase().replace(/ /g, '-')}`}
              whileHover={{ rotate: -3, scale: 1.05 }}
              className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
            >
              <OptimizedImage
                src={category.image}
                alt={category.name}
                className="w-full h-60 object-cover group-hover:scale-105 transition-transform duration-500"
                maxWidth={400}
                maxHeight={300}
                quality={0.65}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
              <h3 className="absolute bottom-4 left-4 text-lg font-bold text-white z-10 drop-shadow-md">
                {category.name}
              </h3>
            </motion.a>
          ))}
        </div>
      </motion.section>

      {/* Slot for Fiction and Non-Fiction */}
      {/* Multiple Book Categories Banner */}
<motion.section
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true }}
  className="mt-24 px-4 max-w-7xl mx-auto"
>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
    <motion.a
      href="/category/books/biography"
      whileHover={{ scale: 1.03 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group col-span-1 md:col-span-2"
    >
      <OptimizedImage
        src="/assets/biography.avif"
        alt="Biography"
        className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
        maxWidth={700}
        maxHeight={450}
        quality={0.65}
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h2 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
          Biography
        </h2>
      </div>
    </motion.a>
    <motion.a
      href="/category/books/self-help"
      whileHover={{ scale: 1.03 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
    >
      <OptimizedImage
        src="/assets/self help.webp"
        alt="Self-Help"
        className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
        maxWidth={500}
        maxHeight={450}
        quality={0.65}
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h2 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
          Self-Help
        </h2>
      </div>
    </motion.a>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
    <motion.a
      href="/category/books/history"
      whileHover={{ scale: 1.03 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
    >
      <OptimizedImage
        src="/assets/history book.jpg"
        alt="History"
        className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
        maxWidth={500}
        maxHeight={450}
        quality={0.65}
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h2 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
          History
        </h2>
      </div>
    </motion.a>
    <motion.a
      href="/category/books/philosophy"
      whileHover={{ scale: 1.03 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
    >
      <OptimizedImage
        src="/assets/philosophy book.jpg"
        alt="Philosophy"
        className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
        maxWidth={500}
        maxHeight={450}
        quality={0.65}
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h2 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
          Philosophy
        </h2>
      </div>
    </motion.a>
    <motion.a
      href="/category/books/children"
      whileHover={{ scale: 1.03 }}
      className="relative rounded-3xl overflow-hidden shadow-2xl cursor-pointer group"
    >
      <OptimizedImage
        src="/assets/children books.webp"
        alt="Children's Books"
        className="w-full h-96 object-cover group-hover:scale-105 transition-transform duration-500"
        maxWidth={500}
        maxHeight={450}
        quality={0.65}
      />
      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <h2 className="text-white text-4xl md:text-5xl font-extrabold drop-shadow-lg">
          Children's Books
        </h2>
      </div>
    </motion.a>
  </div>
</motion.section>


      {/* Render real products for the Books category */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-24 px-4 max-w-7xl mx-auto"
      >
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Books in this Category</h2>
        <HybridPaginatedProductsList categoryId={1} />
      </motion.section>

      {/* Personalized Recommendations */}
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="mt-28 px-4 max-w-5xl mx-auto text-center"
      >
        <Sparkles className="mx-auto w-10 h-10 text-yellow-700 mb-5" />
        <h2 className="text-2xl md:text-3xl font-bold mb-5">Personalized Book Picks</h2>
        <p className="max-w-2xl mx-auto mb-10 text-gray-600 dark:text-gray-300">
          Let our AI reading assistant recommend books tailored to your taste. Find your next favorite read!
        </p>
        <motion.a
          href="#personalized-books"
          whileHover={{ scale: 1.05 }}
          className="inline-flex items-center gap-2 px-7 py-4 bg-yellow-700 text-white font-semibold rounded-full shadow hover:opacity-90 transition"
        >
          <BookOpen className="w-5 h-5" />
          Get Recommendations
        </motion.a>
      </motion.section>
    </div>
    <Footer/>
    </>
  );
}
