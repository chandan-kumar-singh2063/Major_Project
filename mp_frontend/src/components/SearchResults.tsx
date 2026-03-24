import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { motion } from "framer-motion";
import {
  Tag,
  Layers,
  Barcode,
  Sparkles,
  ChevronRight,
  ShoppingCart,
  Star,
  Zap,
  Search,
  Camera,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import OptimizedImage from "./OptimizedImage";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate(); // Add this hook for navigation
  const results = location.state?.results || [];
  const searchQuery = location.state?.searchQuery || "";
  const searchType = location.state?.searchType || "text";
  const totalResults = location.state?.totalResults || results.length;
  const { addToCart } = useCart();

  
  // Sort products by similarity in descending order (for image search)
  const sortedResults = [...results].sort((a, b) => {
    if (searchType === "image") {
      const similarityA = typeof a.similarity === "number" ? a.similarity : 0;
      const similarityB = typeof b.similarity === "number" ? b.similarity : 0;
      return similarityB - similarityA;
    }
    return 0; 
  });

  
  const handleProductClick = (productId
    : any) => {
    if (productId) {
      navigate(`/product/${productId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] dark:bg-gradient-to-br dark:from-[#0a0a0a] dark:to-[#1e1e1e] transition-colors duration-500">
      <Navbar />

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-purple-100 rounded-full filter blur-[100px] opacity-40 dark:bg-purple-900 dark:opacity-10"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-blue-100 rounded-full filter blur-[100px] opacity-40 dark:bg-blue-900 dark:opacity-10"></div>
        </div>

        {/* Search Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            {searchType === "image" ? (
              <Camera className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            ) : (
              <Search className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            )}
            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 dark:from-purple-400 dark:via-pink-500 dark:to-red-500">
              {searchType === "image"
                ? "Visual Search Results"
                : "Search Results"}
            </h1>
          </div>

          {searchQuery && (
            <div className="mb-6">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                {searchType === "image"
                  ? "Similar products found for your image"
                  : `Search results for "${searchQuery}"`}
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  {totalResults} products found
                </span>
                <span className="flex items-center gap-1">
                  {searchType === "image" ? (
                    <>
                      <Camera className="w-4 h-4" />
                      Image Search
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Text Search
                    </>
                  )}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {sortedResults.length === 0 ? (
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/80 dark:bg-gray-900/50 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                {searchType === "image" ? (
                  <Camera className="w-8 h-8 text-gray-400" />
                ) : (
                  <Search className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                No products found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchType === "image"
                  ? "We couldn't find similar products for your image. Try uploading a different image or use text search."
                  : `No products match "${searchQuery}". Try different keywords or browse our categories.`}
              </p>
              <div className="flex gap-3 justify-center">
                <button className="px-6 py-2 rounded-full text-white font-medium hover:shadow-lg transition-all hover:scale-105 bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-400/30 dark:from-purple-600 dark:to-pink-600 dark:hover:shadow-purple-500/30">
                  Browse Categories
                </button>
                <button className="px-6 py-2 rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                  Try Different Search
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Window frame container */}
            <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl overflow-hidden p-1 transition-all duration-500 border border-gray-200/70 dark:bg-gray-900/50 dark:border-gray-800/50">
              {/* Grid background pattern */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cGF0aCBkPSJNMTAgMHYyME0wIDEwaDIwIiBzdHJva2U9IiNlZWVlZWUiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] opacity-20 dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDIwIDIwIj48cGF0aCBkPSJNMTAgMHYyME0wIDEwaDIwIiBzdHJva2U9IiMzMzMiIHN0cm9rZS13aWR0aD0iMC41Ii8+PC9zdmc+')] dark:opacity-10" />

              {/* Main content area with proper spacing */}
              <div className="relative min-h-[60vh] p-8">
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.15,
                      },
                    },
                  }}
                >
                  {sortedResults.map((product, idx) => {
                    const rawSimilarity = product?.similarity;
                    const similarityPercentage =
                      typeof rawSimilarity === "number"
                        ? (rawSimilarity * 100).toFixed(2)
                        : rawSimilarity && !isNaN(Number(rawSimilarity))
                        ? (parseFloat(rawSimilarity) * 100).toFixed(2)
                        : null;

                    return (
                      <motion.div
                        key={product.id || idx}
                        variants={{
                          hidden: { opacity: 0, y: 50 },
                          visible: {
                            opacity: 1,
                            y: 0,
                            transition: { type: "spring", stiffness: 100 },
                          },
                        }}
                        whileHover={{
                          y: -10,
                          boxShadow:
                            "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) dark:shadow-purple-500/20",
                        }}
                        className={`relative group ${
                          idx % 2 === 0 ? "lg:mt-0" : "lg:mt-12"
                        }`}
                      >
                        {/* Product card */}
                        <div
                          className={`h-full rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-pink-500/30 cursor-pointer ${getRandomGradient()} border border-gray-200/70 dark:border-gray-800/50`}
                          onClick={() => handleProductClick(product.id)}
                        >
                          <div className="relative h-60 overflow-hidden">
                            <OptimizedImage
                              src={
                                product.image_url ||
                                product.image ||
                                product.image_path ||
                                "/placeholder.png"
                              }
                              alt={product.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              maxWidth={500}
                              maxHeight={400}
                              quality={0.7}
                            />

                            {/* ✅ FIXED: Always show similarity on image search */}
                            {searchType === "image" && similarityPercentage && (
                              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/90 text-amber-600 dark:bg-black/70 dark:text-amber-300">
                                <Star size={12} fill="currentColor" />
                                {similarityPercentage}% Match
                              </div>
                            )}

                            {/* Text match indicator */}
                            {searchType === "text" && searchQuery && (
                              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-white/90 text-blue-600 dark:bg-black/70 dark:text-blue-300">
                                <Search size={12} />
                                Text Match
                              </div>
                            )}

                            {/* Add to cart and Buy now buttons */}
                            <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4 dark:from-black/70">
                              <div className="flex items-center gap-3 w-full">
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation(); // Prevent card click when button is clicked
                                    try {
                                      if (product?.id) {
                                        await addToCart(product.id, 1);
                                      } else {
                                        console.error("Product ID is missing");
                                      }
                                    } catch (error) {
                                      console.error(
                                        "Failed to add product to cart:",
                                        error
                                      );
                                    }
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all transform translate-y-2 group-hover:translate-y-0 bg-pink-500 hover:bg-pink-600 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                >
                                  <ShoppingCart size={16} />
                                  Add to Cart
                                </button>

                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent card click when button is clicked
                                    handleProductClick(product.id);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium hover:scale-105 transition-all transform translate-y-2 group-hover:translate-y-0 bg-pink-500 hover:bg-pink-600 text-white dark:bg-white dark:text-black dark:hover:bg-gray-200"
                                >
                                  <Zap size={16} />
                                  Buy Now
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Product info */}
                          <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                              <h2 className="text-lg font-bold truncate text-gray-900 dark:text-violet-600">
                                {product.name}
                              </h2>
                              <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white dark:from-purple-600/80 dark:to-pink-600/80">
                                Rs. {Number(product.price).toFixed(2)}
                              </span>
                            </div>

                            <p className="text-sm mb-4 line-clamp-2 text-gray-600 dark:text-gray-400">
                              {product.description ||
                                "No description available."}
                            </p>

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400">
                                <Tag size={12} />
                                <span>Stock: {product.stock ?? "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                <Barcode size={12} />
                                <span>{product.sku}</span>
                              </div>
                              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                                <Layers size={12} />
                                <span>{product.category_name || "N/A"}</span>
                              </div>
                              <div className="flex items-center gap-1 text-pink-600 dark:text-pink-400">
                                <Sparkles size={12} />
                                <span>
                                  {searchType === "image" &&
                                  similarityPercentage
                                    ? `Match: ${similarityPercentage}%`
                                    : "Text Search"}
                                </span>
                              </div>
                            </div>

                            <button 
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card click when button is clicked
                                handleProductClick(product.id);
                              }}
                              className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg transition-all border border-gray-300 hover:border-pink-500 group-hover:bg-gray-100 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white dark:bg-gray-800/50 dark:border-gray-700 dark:hover:bg-gray-800"
                            >
                              Quick View{" "}
                              <ChevronRight
                                size={14}
                                className="transition-transform group-hover:translate-x-1"
                              />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </div>
        )}
      </motion.section>

      <Footer />
    </div>
  );
}


function getRandomGradient() {
  const lightGradients = [
    "bg-gradient-to-br from-gray-50 to-gray-100",
    "bg-gradient-to-br from-blue-50 to-blue-100",
    "bg-gradient-to-br from-purple-50 to-purple-100",
    "bg-gradient-to-br from-pink-50 to-pink-100",
    "bg-gradient-to-br from-amber-50 to-amber-100",
  ];

  const darkGradients = [
    "bg-gradient-to-br from-gray-900/80 to-gray-800/80",
    "bg-gradient-to-br from-gray-900/80 to-blue-900/80",
    "bg-gradient-to-br from-gray-900/80 to-purple-900/80",
    "bg-gradient-to-br from-gray-900/80 to-pink-900/80",
    "bg-gradient-to-br from-gray-900/80 to-amber-900/80",
  ];

  return `${
    lightGradients[Math.floor(Math.random() * lightGradients.length)]
  } dark:${darkGradients[Math.floor(Math.random() * darkGradients.length)]}`;
}