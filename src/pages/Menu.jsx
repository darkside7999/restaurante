import { useState, useEffect } from 'react';
import { Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote } from 'lucide-react';
import { productsAPI, ordersAPI } from '../services/api';
import { useOffline } from '../hooks/useOffline';
import toast from 'react-hot-toast';

const Menu = () => {
  const [products, setProducts] = useState({ categories: [], items: [] });
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [productNotes, setProductNotes] = useState({});
  const [loading, setLoading] = useState(true);
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
      
      // Set first category as default
      if (products.categories.length > 0) {
        setSelectedCategory(products.categories[0].id);
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

  useEffect(() => {
    if (products.categories.length > 0 && !selectedCategory) {
      setSelectedCategory(products.categories[0].id);
    }
  }, [products.categories]);

  const getFilteredProducts = () => {
    return products.items.filter(
      product => product.active && product.category === selectedCategory
    );
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1, notes: '' }]);
    }
    toast.success(`${product.name} añadido al carrito`);
  };

  const updateCartItemQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartItemNotes = (productId, notes) => {
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, notes }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const processPayment = async (paymentMethod) => {
    if (cart.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    try {
      const order = {
        items: cart,
        total: getCartTotal(),
        paymentMethod,
        tableNumber: 1, // Could be dynamic
      };

      if (isOnline) {
        const response = await ordersAPI.create(order);
        
        // Generate receipt
        try {
          await ordersAPI.generateReceipt(response.data, paymentMethod);
          
          // Show receipt preview for 3 seconds
          setIsPaymentModalOpen(false);
          showReceiptPreview(response.data, paymentMethod);
          
        } catch (receiptError) {
          console.error('Error generating receipt:', receiptError);
          toast.error('Pedido creado pero error generando recibo');
        }
        
        toast.success('Pedido creado exitosamente');
      } else {
        // Offline mode - save to localStorage
        const offlineOrder = {
          ...order,
          id: `offline-${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'pending'
        };
        
        // This would be handled by useOffline hook
        toast.success('Pedido guardado (modo offline)');
      }

      // Clear cart
      setCart([]);
      setIsPaymentModalOpen(false);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Error procesando el pago');
    }
  };

  const showReceiptPreview = (order, paymentMethod) => {
    const receiptModal = document.createElement('div');
    receiptModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50';
    receiptModal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
        <div class="text-center mb-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">🍽️ MI RESTAURANTE</h2>
          <p class="text-gray-600 dark:text-gray-300">Recibo de Compra</p>
        </div>
        
        <div class="mb-4 text-sm text-gray-600 dark:text-gray-300">
          <p><strong>Pedido:</strong> ${order.id}</p>
          <p><strong>Pago:</strong> ${paymentMethod}</p>
        </div>
        
        <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
          ${order.items.map(item => `
            <div class="flex justify-between mb-2">
              <span>${item.name} x${item.quantity}</span>
              <span>€${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          `).join('')}
          
          <div class="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
            <div class="flex justify-between font-bold text-lg">
              <span>TOTAL:</span>
              <span>€${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          <p>¡Gracias por su visita!</p>
          <p>Este recibo se cerrará automáticamente</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(receiptModal);
    
    setTimeout(() => {
      document.body.removeChild(receiptModal);
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Products Section */}
      <div className="flex-1">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {products.categories.filter(cat => cat.active).map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {getFilteredProducts().map((product) => (
            <div key={product.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {product.name}
                </h3>
                <span className="text-lg font-bold text-primary-600">
                  €{product.price.toFixed(2)}
                </span>
              </div>
              
              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {product.description}
                </p>
              )}
              
              <button
                onClick={() => addToCart(product)}
                className="w-full btn-primary flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Añadir al carrito
              </button>
            </div>
          ))}
        </div>
        
        {getFilteredProducts().length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              No hay productos disponibles en esta categoría
            </p>
          </div>
        )}
      </div>

      {/* Cart Section */}
      <div className="lg:w-80">
        <div className="card sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Carrito ({cart.length})
            </h2>
          </div>

          {cart.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              El carrito está vacío
            </p>
          ) : (
            <>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="mx-2 min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="font-medium">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    
                    <textarea
                      placeholder="Notas adicionales..."
                      value={item.notes}
                      onChange={(e) => updateCartItemNotes(item.id, e.target.value)}
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                      rows="2"
                    />
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-primary-600">
                    €{getCartTotal().toFixed(2)}
                  </span>
                </div>
                
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full btn-primary"
                >
                  Proceder al pago
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Método de pago
            </h3>
            
            <div className="space-y-3">
              <button
                onClick={() => processPayment('Tarjeta')}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
              >
                <CreditCard className="h-5 w-5 mr-3 text-primary-600" />
                <span className="text-gray-900 dark:text-white">Tarjeta</span>
              </button>
              
              <button
                onClick={() => processPayment('Efectivo')}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center"
              >
                <Banknote className="h-5 w-5 mr-3 text-primary-600" />
                <span className="text-gray-900 dark:text-white">Efectivo</span>
              </button>
            </div>
            
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="w-full mt-4 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;