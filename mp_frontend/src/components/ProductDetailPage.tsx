import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Share2, Star, Minus, Plus, Truck, Shield, RotateCcw, MessageCircle, CheckCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import OptimizedImage from './OptimizedImage';
import { productsAPI, wishlistAPI, authAPI } from '@/api/services';
import { useCart } from '@/contexts/CartContext';
import api from '@/api/config';




interface Product {
  id: number;
  name: string;
  price: string;
  original_price?: string | null;
  discount_percentage?: string;
  rating_average?: string;
  rating_count?: number;
  stock?: number;
  stock_status?: string;
  image?: string;
  image_url?: string;
  images?: any[];
  description?: string;
  category_name?: string;
  sku?: string;
  features?: string[];
  specifications?: Record<string, string>;
}

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Black');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (id) {
      const productId = parseInt(id);
      fetchProduct(productId);
      fetchWishlistStatus(productId);
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      const response = await authAPI.getProfile();
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };


  const fetchWishlistStatus = async (productId: number) => {
    try {
      const response = await wishlistAPI.get();
      const items = response.data;
      const found = items.some((item: any) => item.product === productId);
      setIsInWishlist(found);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };


  const fetchProduct = async (productId: number) => {
    try {
      setLoading(true);
      console.log('Fetching product with ID:', productId);
      const response = await productsAPI.getById(productId);
      console.log('Product data received:', response.data);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (change: number) => {
    setQuantity(Math.max(1, quantity + change));
  };

  const addToCart = async () => {
    if (!product) return;

    try {
      setCartLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      console.log('Adding product to cart:', {
        productId: product.id,
        quantity,
        size: shouldShowSizeOptions ? selectedSize : undefined,
        color: selectedColor
      });
      await addToCartContext(product.id, quantity);
      setSuccessMsg('Item added to cart successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (error: any) {
      console.error('Error adding to cart:', error);

      if (error.message === 'Authentication required' || error.response?.status === 401) {
        setErrorMsg('Please login to add items to cart');
      } else if (error.response?.status === 400) {
        setErrorMsg(error.response.data?.message || 'Invalid request. Please try again.');
      } else {
        setErrorMsg('Failed to add to cart. Please try again.');
      }
    } finally {
      setCartLoading(false);
    }
  };

  // const buyNow = async () => {
  //   if (!product) return;

  //   try {
  //     setCartLoading(true);
  //     setErrorMsg(null);
  //     setSuccessMsg(null);

  //     console.log('Buy now - adding product to cart:', { 
  //       productId: product.id, 
  //       quantity,
  //       size: shouldShowSizeOptions ? selectedSize : undefined,
  //       color: selectedColor
  //     });
  //     await addToCartContext(product.id, quantity);
  //     setSuccessMsg('Item added to cart! Redirecting to checkout...');

  //     // Navigate to cart after a short delay
  //     setTimeout(() => {
  //       navigate('/cart');
  //     }, 1000);
  //   } catch (error: any) {
  //     console.error('Error in buy now:', error);

  //     if (error.message === 'Authentication required' || error.response?.status === 401) {
  //       setErrorMsg('Please login to purchase items');
  //     } else if (error.response?.status === 400) {
  //       setErrorMsg(error.response.data?.message || 'Invalid request. Please try again.');
  //     } else {
  //       setErrorMsg('Failed to process purchase. Please try again.');
  //     }
  //   } finally {
  //     setCartLoading(false);
  //   }
  // };

  const PaymentInitiation = async () => {
    if (!product) return;

    try {
      setCartLoading(true);
      setErrorMsg(null);

      const response = await api.post("/payment/khalti/initiate/", {
        amount: Math.round(productPrice * 100), // Khalti expects amount in paisa
        name: product.name,
        email: "customer@example.com",
        shipping_address: profile?.address || "Remote (Paid via Khalti)",
        purchase_order_id: `BUY_NOW_${product.sku || product.id}_${Date.now()}`,
        purchase_order_name: product.name
      });

      const data = response.data;

      if (data.pidx && data.payment_url) {
        window.location.href = data.payment_url;
      } else {
        setErrorMsg('Failed to initiate payment. Please try again.');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      setErrorMsg('Failed to initiate payment. Please try again.');
    } finally {
      setCartLoading(false);
    }
  };



  const toggleWishlist = async () => {
    if (!product) return;

    try {
      if (isInWishlist) {
        await wishlistAPI.remove(product.id);
        setIsInWishlist(false);
        setSuccessMsg('Removed from wishlist');
      } else {
        await wishlistAPI.add(product.id);
        setIsInWishlist(true);
        setSuccessMsg('Added to wishlist!');
      }
      setTimeout(() => setSuccessMsg(null), 1500);
    } catch (error: any) {
      console.error('Error toggling wishlist:', error);
      if (error.response?.status === 401) {
        setErrorMsg('Please login to use wishlist');
        setTimeout(() => setErrorMsg(null), 3000);
      } else {
        setErrorMsg('Failed to update wishlist');
      }
    }
  };


  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: productName,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSuccessMsg('Link copied to clipboard!');
      setTimeout(() => setSuccessMsg(null), 1500);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Product not found</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              Go Home
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Generate images array handling potentially different API response structures
  let extractedImages: string[] = [];
  if (product.images && product.images.length > 0) {
    extractedImages = product.images.map((img: any) => typeof img === 'string' ? img : img.image).filter(Boolean);
  } else if (product.image_url) {
    extractedImages = [product.image_url];
  } else if (product.image) {
    extractedImages = [product.image];
  }
  
  const productImages = extractedImages.length > 0 
    ? extractedImages 
    : ['https://via.placeholder.com/500x500?text=No+Image'];

  // Add fallback values for missing data
  const productName = product.name || 'Product Name Not Available';
  const productPrice = parseFloat(product.price || '0') || 0;
  const productRating = parseFloat(product.rating_average || '0') || 0;
  const productReviews = product.rating_count || 0;
  const productStock = product.stock || 0;
  const productDescription = product.description || 'No description available for this product.';
  const productOriginalPrice = product.original_price ? parseFloat(product.original_price) : null;

  const discount = productOriginalPrice && productOriginalPrice > productPrice
    ? Math.round(((productOriginalPrice - productPrice) / productOriginalPrice) * 100)
    : 0;

  const sizes = ['S', 'M', 'L', 'XL', '2XL', '3XL'];
  const colors = ['Black', 'White', 'Gray', 'Blue'];

  // Check if this product should show size options (only for Fashion category)
  const shouldShowSizeOptions = product.category_name?.toLowerCase() === 'fashion';

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Success Message */}
        {successMsg && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <CheckCircle size={20} />
            {successMsg.includes('Please login') ? (
              <button
                onClick={() => {
                  setSuccessMsg(null);
                  // Open login modal - you can implement this
                  window.location.href = '/login';
                }}
                className="underline hover:no-underline"
              >
                {successMsg}
              </button>
            ) : (
              <span>{successMsg}</span>
            )}
          </div>
        )}

        {/* Error Message */}
        {errorMsg && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span>⚠️</span>
            {errorMsg.includes('Please login') ? (
              <div className="flex items-center gap-2">
                <span>{errorMsg}</span>
                <button
                  onClick={() => {
                    setErrorMsg(null);
                    window.location.href = '/login';
                  }}
                  className="bg-white text-red-500 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-100 transition-colors"
                >
                  Login Now
                </button>
              </div>
            ) : (
              <span>{errorMsg}</span>
            )}
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <button
              onClick={() => navigate('/')}
              className="hover:text-primary transition"
            >
              Home
            </button>
            <span className="mx-2">/</span>
            <button
              onClick={() => navigate(`/category/${product.category_name?.toLowerCase()}`)}
              className="hover:text-primary transition"
            >
              {product.category_name || 'Category'}
            </button>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{productName}</span>
          </div>
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              {/* Product Images */}
              <div className="p-8 bg-gray-50 dark:bg-gray-900">
                <div className="flex gap-4">
                  {/* Thumbnail Images */}
                  <div className="flex flex-col gap-3">
                    {productImages.map((image, index) => (
                      <div
                        key={index}
                        className={`w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedImage === index
                          ? 'border-primary ring-2 ring-primary/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        onClick={() => setSelectedImage(index)}
                      >
                        <OptimizedImage src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" maxWidth={150} maxHeight={150} quality={0.6} />
                      </div>
                    ))}
                  </div>

                  {/* Main Image */}
                  <div className="flex-1">
                    <div className="aspect-square rounded-xl overflow-hidden bg-white dark:bg-gray-800 group">
                      <OptimizedImage
                        src={productImages[selectedImage]}
                        alt={productName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        maxWidth={1000}
                        maxHeight={1000}
                        quality={0.8}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-8 space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{productName}</h1>

                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(productRating) ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600 dark:text-gray-400">({productReviews} reviews)</span>
                    </div>
                    <span className="text-green-600 dark:text-green-400 font-medium">10K+ Sold</span>
                  </div>

                  <div className="flex items-baseline space-x-4 mb-6">
                    <span className="text-4xl font-bold text-primary">₹{productPrice.toFixed(2)}</span>
                    {productOriginalPrice && productOriginalPrice > productPrice && (
                      <>
                        <span className="text-xl text-gray-500 line-through">₹{productOriginalPrice.toFixed(2)}</span>
                        <span className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
                          {discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Color</h3>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${selectedColor === color
                          ? 'border-primary bg-primary text-white dark:bg-white dark:text-black dark:border-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                          }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Size Selection */}
                {shouldShowSizeOptions && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Size</h3>
                      <button className="text-primary hover:underline text-sm">Size Guide</button>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${selectedSize === size
                            ? 'border-primary bg-primary text-white dark:bg-white dark:text-black dark:border-white'
                            : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                            }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity and Actions */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-700 dark:text-gray-300 font-medium">Quantity:</span>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-2 border-x border-gray-300 dark:border-gray-600 min-w-[60px] text-center">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        disabled={productStock ? quantity >= productStock : false}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={PaymentInitiation}

                      disabled={!productStock || productStock <= 0 || cartLoading}
                      className="cursor-pointer flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cartLoading ? 'Adding...' : 'Buy this Item'}
                    </button>
                    <button
                      onClick={addToCart}
                      disabled={!productStock || productStock <= 0 || cartLoading}
                      className="flex-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-8 py-4 rounded-lg font-semibold border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cartLoading ? 'Adding...' : 'Add to Cart'}
                    </button>
                  </div>

                  <div className="flex items-center space-x-6 pt-4">
                    <button
                      onClick={() => setSuccessMsg('Chat feature coming soon!')}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={toggleWishlist}
                      className={`flex items-center space-x-2 transition-colors ${isInWishlist ? 'text-red-500' : 'text-gray-600 dark:text-gray-400 hover:text-red-500'}`}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                      <span>{isInWishlist ? 'Wishlisted' : 'Wishlist'}</span>
                    </button>

                    <button
                      onClick={shareProduct}
                      className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Seller Information */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Barudak Disaster Mall</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Online
                        </span>
                        <span>Rating Store: 96%</span>
                        <span>Location Store: Tulungagung</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition">
                        Follow
                      </button>
                      <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition">
                        Visit Store
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    Chat Reply: 98%
                  </div>
                </div>

                {/* Service Info */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Truck className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Free Delivery</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Orders over ₹500</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Shield className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">1 Year Warranty</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Manufacturer warranty</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RotateCcw className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Easy Returns</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">7-day return policy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl mt-8 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-gray-600">
              <nav className="flex space-x-8 px-8">
                {['description', 'styling ideas', 'review', 'best seller'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                  >
                    {tab}
                  </button>
                ))}
                <div className="ml-auto flex items-center">
                  <button className="text-red-500 hover:text-red-600 text-sm">Report Product</button>
                </div>
              </nav>
            </div>

            <div className="p-8">
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {productDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Product Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Package Dimensions:</span>
                          <span className="text-gray-900 dark:text-white">27.3 x 24.8 x 4.9 cm; 180 g</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Specification:</span>
                          <span className="text-gray-900 dark:text-white">Moisture Wicking, Stretchy, SPF/UV Protection</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Date First Available:</span>
                          <span className="text-gray-900 dark:text-white">August 08, 2023</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Department:</span>
                          <span className="text-gray-900 dark:text-white">Mens</span>
                        </div>
                      </div>
                    </div>

                    {product.features && product.features.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Key Features</h4>
                        <div className="space-y-2">
                          {product.features.map((feature, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'styling ideas' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Styling Ideas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg mb-3"></div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Related Product {item}</h4>
                        <p className="text-primary font-bold">₹{(Math.random() * 500 + 100).toFixed(0)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Customer Reviews</h3>
                  <div className="space-y-6">
                    {productReviews > 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">Reviews feature coming soon!</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This product has {productReviews} reviews.</p>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-600 dark:text-gray-400">No reviews yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Be the first to review this product!</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'best seller' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Best Sellers</h3>
                  <div className="text-center py-8">
                    <p className="text-gray-600 dark:text-gray-400">Best sellers feature coming soon!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Related Products Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl mt-8 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">You might also like</h3>
              <button className="text-primary hover:underline">See more</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="aspect-square bg-gray-200 dark:bg-gray-600 rounded-lg mb-3"></div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Related Product {item}</h4>
                  <p className="text-primary font-bold">₹{(Math.random() * 500 + 100).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ProductDetailPage; 