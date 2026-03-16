import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsAPI, cartAPI } from '@/api/services';
import Pagination from './ui/Pagination';
import OptimizedImage from './OptimizedImage';

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
}

interface PaginatedResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

interface HybridPaginatedProductsListProps {
  categoryId?: number;
  itemsPerPage?: number;
}

const HybridPaginatedProductsList = ({ categoryId, itemsPerPage = 12 }: HybridPaginatedProductsListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Cache for storing fetched pages
  const pageCache = useRef<Map<number, Product[]>>(new Map());
  const allProductsCache = useRef<Product[] | null>(null);
  const isUsingCache = useRef<boolean>(false);

  // Initialize current page from URL params
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;
    setCurrentPage(page);
  }, [searchParams]);

  // Fetch products with hybrid approach
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      
      try {
        // Check if we have all products cached (for smooth navigation)
        if (allProductsCache.current && allProductsCache.current.length > 0) {
          // Use client-side pagination from cache
          isUsingCache.current = true;
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const currentProducts = allProductsCache.current.slice(startIndex, endIndex);
          
          setProducts(currentProducts);
          setTotalProducts(allProductsCache.current.length);
          setTotalPages(Math.ceil(allProductsCache.current.length / itemsPerPage));
        } else {
          // Use server-side pagination
          isUsingCache.current = false;
          const response = await productsAPI.getByCategory(categoryId, {
            page: currentPage,
            page_size: itemsPerPage
          });
          
          const paginatedData: PaginatedResponse = response.data;
          setProducts(paginatedData.results);
          setTotalProducts(paginatedData.count);
          setTotalPages(Math.ceil(paginatedData.count / itemsPerPage));
          
          // Cache this page
          pageCache.current.set(currentPage, paginatedData.results);
          
          // If this is page 1, try to fetch all products in background for future use
          if (currentPage === 1 && paginatedData.count <= 100) { // Only cache if reasonable size
            fetchAllProductsInBackground();
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to client-side if server fails
        if (allProductsCache.current && allProductsCache.current.length > 0) {
          isUsingCache.current = true;
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const currentProducts = allProductsCache.current.slice(startIndex, endIndex);
          setProducts(currentProducts);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, currentPage, itemsPerPage]);

  // Background fetch of all products for caching
  const fetchAllProductsInBackground = async () => {
    try {
      const response = await productsAPI.getByCategory(categoryId);
      allProductsCache.current = response.data;
      console.log('Background cache populated with', response.data.length, 'products');
    } catch (error) {
      console.log('Background cache fetch failed, will continue with SSR');
    }
  };

  const handleAddToCart = async (productId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await cartAPI.add(productId, 1);
      setSuccessMsg('Added to cart!');
      setTimeout(() => setSuccessMsg(null), 1500);
    } catch {
      setSuccessMsg('Failed to add to cart');
      setTimeout(() => setSuccessMsg(null), 1500);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      
      // Update URL with page parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('page', page.toString());
      setSearchParams(newSearchParams);
      
      // Scroll to top of products section
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Clear cache when category changes
  useEffect(() => {
    pageCache.current.clear();
    allProductsCache.current = null;
    isUsingCache.current = false;
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="my-6">
      {/* Products Count with Cache Status */}
      <div className="mb-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {products.length} of {totalProducts} products
          {isUsingCache.current && (
            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
              (Cached for fast navigation)
            </span>
          )}
        </p>
      </div>

      {successMsg && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
          {successMsg}
        </div>
      )}
      
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        {products.map((prod) => (
          <Link
            key={prod.id}
            to={`/product/${prod.id}`}
            className="bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-lg p-4 flex flex-col items-center transition hover:-translate-y-1 hover:bg-primary/10 cursor-pointer"
          >
            {prod.image && (
              <OptimizedImage src={prod.image} alt={prod.name} className="w-36 h-36 object-cover rounded mb-2" maxWidth={200} maxHeight={200} quality={0.7} />
            )}
            <span className="font-semibold text-center text-gray-800 dark:text-gray-100 mb-1 line-clamp-2">
              {prod.name}
            </span>
            <span className="text-primary font-bold">₹{prod.price}</span>
            <button
              className="mt-2 px-3 py-1 bg-primary text-white rounded hover:bg-primary/80 transition-colors"
              onClick={(e) => handleAddToCart(prod.id, e)}
            >
              Add to Cart
            </button>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        maxVisiblePages={5}
      />

      {/* Page Info */}
      {totalPages > 1 && (
        <div className="text-center mt-4 text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages} • Showing {products.length} products
          {isUsingCache.current && (
            <span className="ml-2 text-xs text-green-600 dark:text-green-400">
              • Fast cached navigation
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default HybridPaginatedProductsList; 