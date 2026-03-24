// -----------------------
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Store, Menu, X, ShoppingCart, Sun, Moon, Camera, Search, Play, Pause, User,
  Upload, FlipVertical2, CheckCircle, XCircle
} from 'lucide-react';
import AuthModal from './AuthModal';
import CartModal from './CartModal';
import FeedbackModal from './FeedBackModal';
import SearchSuggestions from './SearchSuggestions';
import OptimizedImage from './OptimizedImage';
import { authAPI } from '@/api/services';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import axios from 'axios';
import api from '@/api/config';

const categories = ['Electronics', 'Fashion', 'Books', 'Home_Decor', 'Gadgets'];

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  sku: string;
  stock: number;
  category_name: string;
  similarity?: number;
}

export default function Navbar() {
  // Navigation and UI states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  const { cartCount, refreshCart } = useCart();

  // Search functionality states
  const [searchMode, setSearchMode] = useState<'text' | 'image'>('text');
  const [searchImage, setSearchImage] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Camera functionality states
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraMode, setCameraMode] = useState<'environment' | 'user'>('environment');
  const [imageCaptured, setImageCaptured] = useState(false);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);

  // User authentication state
  const [user, setUser] = useState<{ username: string, role?: string } | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera with selected mode
  const initCamera = async () => {
    try {
      stopCamera(); // Stop any existing stream
      const constraints = {
        video: {
          facingMode: cameraMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert(`Could not access camera: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  // Clean up camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  // Toggle between front and back camera
  const toggleCamera = () => {
    setCameraMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        const width = videoRef.current.videoWidth;
        const height = videoRef.current.videoHeight;

        canvasRef.current.width = width;
        canvasRef.current.height = height;
        context.drawImage(videoRef.current, 0, 0, width, height);

        canvasRef.current.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'capture.jpg', {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            setSearchImage(file);
            setImageCaptured(true);
            setCapturedImageUrl(URL.createObjectURL(blob));
          }
        }, 'image/jpeg', 0.9);
      }
    }
  };

  // Reset camera capture
  const resetCapture = () => {
    setImageCaptured(false);
    if (capturedImageUrl) {
      URL.revokeObjectURL(capturedImageUrl);
      setCapturedImageUrl(null);
    }
    initCamera();
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setSearchImage(e.target.files[0]);
      setShowImageOptions(false);
      setShowCameraModal(false);
    }
  };

  // Submit search
  const handleSearch = async () => {
    if (searchMode === 'image' && searchImage) {
      await handleImageSearch();
    } else if (searchMode === 'text' && searchQuery.trim()) {
      await handleTextSearch();
    } else {
      alert(`Please ${searchMode === 'image' ? 'upload or capture an image' : 'enter a search query'}`);
    }
  };

  // Handle image search
  const handleImageSearch = async () => {
    if (!searchImage) return;

    const formData = new FormData();
    formData.append("file", searchImage);

    setLoading(true);
    try {
      // Step 1: Get similar products from HuggingFace Space image search service
      const apiUrl = import.meta.env.VITE_SEARCH_API_URL || import.meta.env.VITE_MODEL_URL || "http://localhost:8001";

      let fastApiResponse;
      try {
        fastApiResponse = await axios.post(`${apiUrl}/search-image/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 90000, // 90s — HuggingFace free tier can take 30-60s to wake up
        });
      } catch (axiosErr: any) {
        if (axiosErr.code === 'ECONNABORTED' || axiosErr.message?.includes('timeout')) {
          alert("The image search service is starting up (it may have been sleeping). Please wait 30 seconds and try again.");
        } else {
          alert("Could not reach the image search service. Please try again later.");
        }
        return;
      }

      const matchedResults = fastApiResponse.data.results || [];
      const skuList = matchedResults.map((item: { sku: string }) => item.sku);

      if (skuList.length > 0) {
        // Step 2: Get full product details from main Django API
        const djangoResponse = await api.post("/products/by-skus/", { skus: skuList });
        const products: Product[] = djangoResponse.data;

        // Step 3: Merge with similarity scores
        const mergedResults = products.map(product => {
          const match = matchedResults.find((m: { sku: string }) => m.sku === String(product.sku));
          return { ...product, similarity: match?.similarity ?? null };
        });

        navigate("/search-results", {
          state: { results: mergedResults, searchType: "image" }
        });
      } else {
        alert("No similar products found. Try a clearer product photo.");
      }
    } catch (err) {
      console.error("Image search failed:", err);
      alert("Image search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle text search
  const handleTextSearch = async () => {
    if (!searchQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    try {
      // Show loading state
      setLoading(true);

      // Use the enhanced search API with pagination
      const response = await api.get(`/products/search/`, {
        params: {
          q: searchQuery.trim(),
          page: 1,
          page_size: 50 // Get more results for better search experience
        }
      });

      const searchResults = response.data.results || response.data;

      if (searchResults && searchResults.length > 0) {
        // Navigate to search results with enhanced data
        navigate("/search-results", {
          state: {
            results: searchResults,
            searchQuery: searchQuery.trim(),
            searchType: 'text',
            totalResults: response.data.count || searchResults.length
          }
        });
      } else {
        // Show no results message
        alert(`No products found for "${searchQuery.trim()}". Try different keywords.`);
      }
    } catch (err) {
      console.error("Text search failed:", err);
      alert("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    // Automatically trigger search
    setTimeout(() => {
      handleTextSearch();
    }, 100);
  };

  // Handle search input focus
  const handleSearchFocus = () => {
    if (searchMode === 'text' && searchQuery.trim()) {
      setShowSuggestions(true);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchMode === 'text' && value.trim()) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // User authentication effects
  useEffect(() => {
    const token = localStorage.getItem('access');
    if (token) {
      authAPI.getProfile()
        .then((res: any) => setUser(res.data))
        .catch(() => setUser(null));

      // Refresh cart when token is present or auth modal closes
      refreshCart();
    } else {
      setUser(null);
      // Also refresh cart to clear it if logged out
      refreshCart();
    }
  }, [isAuthOpen, refreshCart]);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
    window.location.reload();
  };

  // Camera effects
  useEffect(() => {
    if (showCameraModal) {
      initCamera();
    } else {
      stopCamera();
      setImageCaptured(false);
      if (capturedImageUrl) {
        URL.revokeObjectURL(capturedImageUrl);
        setCapturedImageUrl(null);
      }
    }
  }, [showCameraModal, cameraMode]);

  useEffect(() => {
    // Check for saved theme in localStorage OR system preference
    const savedTheme = localStorage.getItem('theme');
    const isDarkMode = savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }

    return () => {
      stopCamera();
      if (capturedImageUrl) {
        URL.revokeObjectURL(capturedImageUrl);
      }
    };
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    const newTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    localStorage.theme = newTheme;
    setIsDark(newTheme === 'dark');
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  // Listen for the custom event emitted by HomeContent (or any other component)
  useEffect(() => {
    const handleOpenImageSearch = () => {
      setSearchMode('image');
      setShowImageOptions(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    window.addEventListener('openImageSearch', handleOpenImageSearch);
    
    // Clean up event listener when Navbar unmounts
    return () => window.removeEventListener('openImageSearch', handleOpenImageSearch);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="sticky top-0 z-50 bg-white/30 dark:bg-black/30 backdrop-blur-lg shadow-md transition"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
          <Link to="/" className="flex items-center gap-2 text-3xl font-bold tracking-tight text-black dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            <Store size={32} />e-pasal
          </Link>

          {/* Search Bar */}
          <div className="flex items-center relative w-full max-w-lg">
            <div className={`w-full flex items-center rounded-full border ${searchMode === 'image' ? 'border-gray-300 dark:border-gray-600' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-900`}>
              <input
                type={searchMode === 'text' ? 'text' : 'file'}
                accept={searchMode === 'image' ? 'image/*' : undefined}
                placeholder={searchMode === 'text' ? 'Search products...' : ''}
                value={searchMode === 'text' ? searchQuery : undefined}
                onChange={(e) =>
                  searchMode === 'text'
                    ? handleSearchChange(e)
                    : handleFileUpload(e)
                }
                onFocus={handleSearchFocus}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
                ref={fileInputRef}
                className={`w-full py-2 px-4 bg-transparent text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition ${searchMode === 'image' ? 'hidden' : 'block'}`}
              />
              {searchMode === 'image' && searchImage ? (
                <div className="w-full py-2 px-4 flex items-center gap-2">
                  <CheckCircle className="text-green-500" size={18} />
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs">
                    {searchImage.name}
                  </span>
                </div>
              ) : searchMode === 'image' ? (
                <div className="w-full py-2 px-4 text-sm text-gray-400 dark:text-gray-500">
                  Click to upload or take photo
                </div>
              ) : null}
            </div>

            {/* Search Suggestions */}
            <SearchSuggestions
              query={searchQuery}
              isVisible={showSuggestions}
              onSelectSuggestion={handleSuggestionSelect}
              onClose={() => setShowSuggestions(false)}
            />

            <div className="absolute right-2 flex items-center gap-2">
              <motion.button
                onClick={() => {
                  setSearchMode('text');
                  setSearchImage(null);
                }}
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1 rounded-full text-sm transition ${searchMode === 'text' ? 'bg-gray-900 text-white shadow' : 'bg-gray-200 dark:bg-black text-gray-600 dark:text-white'}`}
              >
                Text
              </motion.button>
              <motion.button
                onClick={() => {
                  setSearchMode('image');
                  setShowImageOptions(true);
                }}
                whileHover={{ scale: 1.05 }}
                className={`px-3 py-1 rounded-full text-sm flex items-center transition ${searchMode === 'image' ? 'bg-gray-900 text-white shadow' : 'bg-gray-200 dark:bg-black text-gray-600 dark:text-gray-300'}`}
              >
                <Camera size={16} className="mr-1" />
                Image
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                className="p-2 bg-primary text-white rounded-full shadow hover:bg-primary/90 transition"
                onClick={handleSearch}
                disabled={(searchMode === 'image' && !searchImage) || (searchMode === 'text' && !searchQuery.trim()) || loading}
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={18} />
                )}
              </motion.button>
            </div>
          </div>

          {/* Right Navigation */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <div
              className="relative"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <motion.button whileHover={{ scale: 1.05, y: -2 }} className="hover:text-primary transition">
                Categories
              </motion.button>
              <AnimatePresence>
                {isCategoriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute flex flex-col mt-2 bg-white dark:bg-gray-900 shadow-xl rounded-xl p-2 min-w-[150px] z-50"
                  >
                    {categories.map((cat) => (
                      <motion.a
                        whileHover={{ scale: 1.05, x: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                        key={cat}
                        href={`/category/${cat.toLowerCase()}`}
                        className="px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {cat}
                      </motion.a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-sm font-medium hover:underline text-gray-700 dark:text-gray-300"
            >
              Feedback
            </button>

            <motion.button
              onClick={() => setIsCartOpen(true)}
              whileHover={{ scale: 1.05, y: -2 }}
              className="relative hover:text-primary transition cursor-pointer"
            >
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1.5">
                {cartCount || 0}
              </span>
            </motion.button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(v => !v)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition"
                >
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{user.username}</span>
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 bg-white dark:bg-gray-900 shadow-lg border dark:border-gray-700 rounded-xl py-2 z-50 min-w-[160px] overflow-hidden">
                    <Link to="/profile" className="block w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 font-semibold transition-colors">Profile</Link>
                    {user.role === 'seller' && (
                      <Link to="/seller-dashboard" className="block w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 font-semibold border-y dark:border-gray-700 transition-colors">Seller Dashboard</Link>
                    )}
                    <Link to="/orders" className="block w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 font-semibold transition-colors">My Orders</Link>
                    <button className="block w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-semibold border-t dark:border-gray-700 transition-colors" onClick={handleLogout}>Logout</button>
                  </div>

                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition flex items-center"
              >
                <User className="text-gray-700 dark:text-gray-300" size={20} />
              </button>
            )}

            <motion.button onClick={togglePlay} whileTap={{ scale: 1.2, rotate: 180 }} className="p-4 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition-all">
              <AnimatePresence initial={false} mode="wait">
                {isPlaying ? (
                  <motion.span key="pause" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <Pause className="text-red-500" size={22} />
                  </motion.span>
                ) : (
                  <motion.span key="play" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <Play className="text-green-500" size={22} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            <motion.button onClick={toggleTheme} whileTap={{ scale: 1.2, rotate: 180 }} className="p-4 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition">
              <AnimatePresence initial={false} mode="wait">
                {isDark ? (
                  <motion.span key="moon" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <Moon className="text-blue-400" size={22} />
                  </motion.span>
                ) : (
                  <motion.span key="sun" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                    <Sun className="text-yellow-500" size={22} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden ml-auto">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-800">
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="md:hidden px-4 pb-5 pt-2 bg-white dark:bg-black space-y-3"
            >
              {categories.map((cat) => (
                <Link
                  key={cat}
                  to={`/category/${cat.toLowerCase()}`}
                  className="block text-gray-800 dark:text-gray-200 hover:text-primary transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsFeedbackOpen(true);
                  setIsMenuOpen(false);
                }}
                className="block text-gray-800 dark:text-gray-200 hover:text-primary transition"
              >
                Feedback
              </button>
              <div className="flex items-center gap-4 pt-3">
                <motion.button onClick={togglePlay} whileTap={{ scale: 1.2 }} className="p-4 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition">
                  {isPlaying ? <Pause className="text-red-500" size={22} /> : <Play className="text-green-500" size={22} />}
                </motion.button>
                <motion.button onClick={toggleTheme} whileTap={{ scale: 1.2 }} className="p-4 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition">
                  {isDark ? <Moon className="text-blue-400" size={22} /> : <Sun className="text-yellow-500" size={22} />}
                </motion.button>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(v => !v)}
                      className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition"
                    >
                      <span className="font-semibold text-gray-700 dark:text-gray-200">{user.username}</span>
                    </button>
                    {showProfileMenu && (
                      <div className="absolute right-0 mt-2 bg-white dark:bg-gray-900 shadow-lg border dark:border-gray-700 rounded-xl py-2 z-50 min-w-[160px] overflow-hidden">
                        <Link
                          to="/profile"
                          className="block w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 font-semibold transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        {user.role === 'seller' && (
                          <Link
                            to="/seller-dashboard"
                            className="block w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 font-semibold border-y dark:border-gray-700 transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            Seller Dashboard
                          </Link>
                        )}
                        <Link
                          to="/orders"
                          className="block w-full text-left px-4 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 font-semibold transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          My Orders
                        </Link>
                        <button
                          className="block w-full text-left px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 font-semibold border-t dark:border-gray-700 transition-colors"
                          onClick={() => {
                            handleLogout();
                            setIsMenuOpen(false);
                          }}
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsAuthOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-primary/20 dark:hover:bg-primary/30 transition flex items-center"
                  >
                    <User className="text-gray-700 dark:text-gray-300" size={20} />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsCartOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="relative text-gray-800 dark:text-gray-100"
                >
                  <ShoppingCart size={22} />
                  <span className="absolute -top-2 -right-2 text-[10px] bg-red-500 text-white rounded-full px-1.5">
                    {cartCount || 0}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Options Modal */}
        <AnimatePresence>
          {showImageOptions && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={() => setShowImageOptions(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }} // Added y:20 to start slightly lower
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm mx-auto mt-10" // Added mt-10 for top margin
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  top: '20%', // Adjusted from default center positioning
                  left: '50%',
                  transform: 'translateX(-50%)',
                  maxHeight: '80vh', // Ensure it doesn't exceed viewport height
                  overflowY: 'auto' // Add scroll if content is too long
                }}
              >
                <h3 className="text-lg font-bold mb-4">Image Search Options</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowImageOptions(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <Upload size={18} />
                    Upload Image
                  </button>
                  <button
                    onClick={() => {
                      setShowCameraModal(true);
                      setShowImageOptions(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    <Camera size={18} />
                    Take Photo
                  </button>
                  {searchImage && (
                    <button
                      onClick={() => {
                        setSearchImage(null);
                        setShowImageOptions(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 dark:bg-red-900/30 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/50 transition text-red-600 dark:text-red-400"
                    >
                      <XCircle size={18} />
                      Remove Current Image
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setShowImageOptions(false)}
                  className="mt-4 w-full py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition"
                >
                  Cancel
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </motion.nav>

      {/* Camera Modal - Updated Version */}
      <AnimatePresence>
        {showCameraModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md mx-4 overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold">Take Product Photo</h3>
                <button
                  onClick={() => {
                    stopCamera();
                    setShowCameraModal(false);
                  }}
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Camera Preview */}
              <div className="relative aspect-[4/3] bg-black">
                {imageCaptured && capturedImageUrl ? (
                  <>
                    <OptimizedImage
                      src={capturedImageUrl}
                      alt="Captured product"
                      className="w-full h-full object-contain"
                      maxWidth={800}
                      maxHeight={600}
                      quality={0.8}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <CheckCircle className="text-green-400" size={48} />
                    </div>
                  </>
                ) : (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* Camera Controls */}
              <div className="p-4">
                <div className="flex justify-center gap-4">
                  {!imageCaptured ? (
                    <>
                      <button
                        onClick={toggleCamera}
                        className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                        title="Switch camera"
                      >
                        <FlipVertical2 size={20} />
                      </button>
                      <button
                        onClick={capturePhoto}
                        className="p-4 rounded-full bg-white border-4 border-white shadow-lg hover:scale-105 transition-transform"
                        title="Capture photo"
                      >
                        <div className="w-8 h-8 rounded-full bg-red-500"></div>
                      </button>
                      <div className="p-3 rounded-full opacity-0">
                        <FlipVertical2 size={20} />
                      </div>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={resetCapture}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center gap-2"
                      >
                        <XCircle size={18} />
                        Retake
                      </button>
                      <button
                        onClick={() => {
                          setShowCameraModal(false);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Use This Photo
                      </button>
                    </>
                  )}
                </div>

                <div className="mt-3 text-sm text-center text-gray-500 dark:text-gray-400">
                  {!imageCaptured ? (
                    <p>Position the product in the frame and capture</p>
                  ) : (
                    <p className="text-green-500 dark:text-green-400">Photo captured successfully!</p>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </>
  );
}