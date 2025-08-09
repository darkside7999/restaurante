import React from 'react';
import { Coffee, Pizza, Sandwich, Utensils, Cake } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

const iconMap = {
  coffee: Coffee,
  pizza: Pizza,
  sandwich: Sandwich,
  utensils: Utensils,
  cake: Cake
};

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        onClick={() => onCategoryChange('')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          selectedCategory === ''
            ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
            : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
        } shadow-md`}
      >
        Todas las categorías
      </button>
      
      {categories.map(category => {
        const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Utensils;
        
        return (
          <button
            key={category._id}
            onClick={() => onCategoryChange(category._id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === category._id
                ? 'text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            } shadow-md`}
            style={{
              backgroundColor: selectedCategory === category._id ? category.color : undefined
            }}
          >
            <IconComponent className="w-4 h-4" />
            {category.name}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;