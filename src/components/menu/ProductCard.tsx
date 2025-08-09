import React, { useState } from 'react';
import { Plus, Clock } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import CustomizationModal from './CustomizationModal';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: {
    name: string;
    color: string;
  };
  ingredients: string[];
  preparationTime: number;
}

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const { addToOrder } = useOrder();

  const handleAddToOrder = (customizations?: string) => {
    addToOrder(product, customizations);
    toast.success(`${product.name} añadido a la comanda`);
    setShowCustomization(false);
  };

  const handleQuickAdd = () => {
    addToOrder(product);
    toast.success(`${product.name} añadido a la comanda`);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden group">
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {product.name}
              </h3>
              <span 
                className="inline-block text-xs font-medium px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: product.category.color }}
              >
                {product.category.name}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                €{product.price.toFixed(2)}
              </p>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>

          {product.ingredients && product.ingredients.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ingredientes:</p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {product.ingredients.slice(0, 3).join(', ')}
                {product.ingredients.length > 3 && '...'}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {product.preparationTime} min
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomization(true)}
                className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Personalizar
              </button>
              <button
                onClick={handleQuickAdd}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors group-hover:scale-105 transform"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <CustomizationModal
        isOpen={showCustomization}
        onClose={() => setShowCustomization(false)}
        product={product}
        onConfirm={handleAddToOrder}
      />
    </>
  );
};

export default ProductCard;