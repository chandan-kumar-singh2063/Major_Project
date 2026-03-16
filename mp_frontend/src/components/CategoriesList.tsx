import { useEffect, useState } from 'react';
import { categoriesAPI } from '@/api/services';
import OptimizedImage from './OptimizedImage';

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
}

interface CategoriesListProps {
  onSelect?: (categoryId: number) => void;
}

const CategoriesList = ({ onSelect }: CategoriesListProps) => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    categoriesAPI.getAll().then((res: { data: Category[] }) => setCategories(res.data));
  }, []);

  return (
    <div className="my-6">
      <h2 className="text-2xl font-bold mb-4">Categories</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-lg cursor-pointer p-4 flex flex-col items-center transition hover:-translate-y-1 hover:bg-primary/10"
            onClick={() => onSelect && onSelect(cat.id)}
          >
            {cat.image && (
              <OptimizedImage src={cat.image} alt={cat.name} className="w-16 h-16 object-cover rounded-full mb-2" maxWidth={80} maxHeight={80} quality={0.7} />
            )}
            <span className="font-semibold text-center text-gray-800 dark:text-gray-100">{cat.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesList; 