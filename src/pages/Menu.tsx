import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import CategoryFilter from '../components/menu/CategoryFilter';
import ProductCard from '../components/menu/ProductCard';
import OrderSidebar from '../components/menu/OrderSidebar';
import { useOrder } from '../context/OrderContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  color: string;
  icon: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  ingredients: string[];
  preparationTime: number;
}

const Menu: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showOrderSidebar, setShowOrderSidebar] = useState(false);
  const { currentOrder, getOrderTotal } = useOrder();

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      toast.error('Error cargando categorías');
      console.error(error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products', {
        params: { active: true }
      });
      setProducts(response.data);
    } catch (error) {
      toast.error('Error cargando productos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = selectedCategory
    ? products.filter(product => product.category._id === selectedCategory)
    : products;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Menú del Restaurante
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Selecciona los productos para crear una nueva comanda
            </p>
          </div>
          
          {currentOrder.length > 0 && (
            <button
              onClick={() => setShowOrderSidebar(true)}
              className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              Ver Comanda
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                {currentOrder.length}
              </span>
            </button>
          )}
        </div>

        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredProducts.map(product => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No hay productos disponibles en esta categoría
            </p>
          </div>
        )}
      </div>

      <OrderSidebar 
        isOpen={showOrderSidebar}
        onClose={() => setShowOrderSidebar(false)}
      />
    </div>
  );
};

export default Menu;