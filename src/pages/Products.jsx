import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Save, X, Package } from 'lucide-react';
import { productsAPI } from '../services/api';
import { useOffline } from '../hooks/useOffline';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState({ categories: [], items: [] });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    active: true
  });
  const { isOnline, getProducts, saveProducts } = useOffline();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      if (isOnline) {
        const response = await productsAPI.getAll();
        setProducts(response.data);
        saveProducts(response.data);
      } else {
        const offlineProducts = getProducts();
        if (offlineProducts) {
          setProducts(offlineProducts);
        }
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error cargando productos');
      
      // Try offline fallback
      const offlineProducts = getProducts();
      if (offlineProducts) {
        setProducts(offlineProducts);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.category) {
      toast.error('Por favor completa todos los campos obligatorios');
      return;
    }

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        // Update existing product
        if (isOnline) {
          await productsAPI.update(editingProduct.id, productData);
        }
        
        const updatedProducts = {
          ...products,
          items: products.items.map(item =>
            item.id === editingProduct.id
              ? { ...item, ...productData }
              : item
          )
        };
        setProducts(updatedProducts);
        if (isOnline) saveProducts(updatedProducts);
        
        toast.success('Producto actualizado exitosamente');
      } else {
        // Create new product
        let newProduct;
        if (isOnline) {
          const response = await productsAPI.create(productData);
          newProduct = response.data;
        } else {
          newProduct = {
            id: `offline-${Date.now()}`,
            ...productData
          };
        }
        
        const updatedProducts = {
          ...products,
          items: [...products.items, newProduct]
        };
        setProducts(updatedProducts);
        if (isOnline) saveProducts(updatedProducts);
        
        toast.success('Producto creado exitosamente');
      }

      closeModal();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error guardando producto');
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      if (isOnline) {
        await productsAPI.delete(productId);
      }
      
      const updatedProducts = {
        ...products,
        items: products.items.filter(item => item.id !== productId)
      };
      setProducts(updatedProducts);
      if (isOnline) saveProducts(updatedProducts);
      
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error eliminando producto');
    }
  };

  const toggleProductStatus = async (product) => {
    try {
      const updatedProduct = { ...product, active: !product.active };
      
      if (isOnline) {
        await productsAPI.update(product.id, updatedProduct);
      }
      
      const updatedProducts = {
        ...products,
        items: products.items.map(item =>
          item.id === product.id ? updatedProduct : item
        )
      };
      setProducts(updatedProducts);
      if (isOnline) saveProducts(updatedProducts);
      
      toast.success(
        `Producto ${updatedProduct.active ? 'activado' : 'desactivado'} exitosamente`
      );
    } catch (error) {
      console.error('Error updating product status:', error);
      toast.error('Error actualizando estado del producto');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        description: product.description || '',
        active: product.active
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        price: '',
        category: products.categories.length > 0 ? products.categories[0].id : '',
        description: '',
        active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category: '',
      description: '',
      active: true
    });
  };

  const getCategoryName = (categoryId) => {
    const category = products.categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  const getCategoryIcon = (categoryId) => {
    const category = products.categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '📦';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestión de Productos
        </h1>
        <button
          onClick={() => openModal()}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Producto
        </button>
      </div>

      {/* Products by Category */}
      {products.categories.map((category) => {
        const categoryProducts = products.items.filter(
          product => product.category === category.id
        );

        if (categoryProducts.length === 0) return null;

        return (
          <div key={category.id} className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="mr-2">{category.icon}</span>
              {category.name} ({categoryProducts.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className={`card ${
                    !product.active
                      ? 'opacity-60 border-gray-300 dark:border-gray-600'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {product.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => toggleProductStatus(product)}
                        className={`p-1 rounded-md ${
                          product.active
                            ? 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900'
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={product.active ? 'Desactivar' : 'Activar'}
                      >
                        {product.active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openModal(product)}
                        className="p-1 rounded-md text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-1 rounded-md text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-bold text-primary-600">
                      €{product.price.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getCategoryName(product.category)}
                    </span>
                  </div>
                  
                  {product.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {products.items.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Package className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay productos
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Empieza creando tu primer producto
          </p>
          <button
            onClick={() => openModal()}
            className="btn-primary"
          >
            Crear Producto
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Precio (€) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {products.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows="3"
                  placeholder="Descripción del producto..."
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Producto activo
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;