import { useEffect, useState } from 'react';
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

interface PaginatedProductsListProps {
  categoryId?: number;
  itemsPerPage?: number;
}

const PaginatedProductsList = ({ categoryId, itemsPerPage = 12 }: PaginatedProductsListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Initialize current page from URL params
  useEffect(() => {
    const pageParam = searchParams.get('page');
    const page = pageParam ? parseInt(pageParam) : 1;
    setCurrentPage(page);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let response;
        if (categoryId) {
          response = await productsAPI.getByCategory(categoryId);
        } else {
          response = await productsAPI.getAll();
        }
        
        const allProducts = response.data;
        const totalItems = allProducts.length;
        setTotalProducts(totalItems);
        const pages = Math.ceil(totalItems / itemsPerPage);
        setTotalPages(pages);
        
        // Calculate start and end indices for current page
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentProducts = allProducts.slice(startIndex, endIndex);
        
        setProducts(currentProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, currentPage, itemsPerPage]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="my-6">
      {/* Products Count */}
      <div className="mb-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {products.length} of {totalProducts} products
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
        </div>
      )}
    </div>
  );
};

export default PaginatedProductsList; 