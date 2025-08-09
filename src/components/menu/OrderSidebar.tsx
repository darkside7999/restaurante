import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, CreditCard, Banknote } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface OrderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const OrderSidebar: React.FC<OrderSidebarProps> = ({ isOpen, onClose }) => {
  const {
    currentOrder,
    updateQuantity,
    removeFromOrder,
    clearOrder,
    getOrderTotal
  } = useOrder();
  
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (currentOrder.length === 0) {
      toast.error('La comanda está vacía');
      return;
    }

    setIsProcessing(true);
    
    try {
      const orderData = {
        items: currentOrder.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          customizations: item.customizations
        })),
        paymentMethod,
        tableNumber,
        customerName,
        notes
      };

      const response = await api.post('/orders', orderData);
      
      // Mostrar recibo durante 3 segundos
      toast.success('¡Pago procesado correctamente!', { duration: 3000 });
      
      // Limpiar formulario
      clearOrder();
      setTableNumber('');
      setCustomerName('');
      setNotes('');
      onClose();
      
    } catch (error) {
      toast.error('Error procesando el pago');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl transform transition-transform">
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Comanda Actual
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 max-h-[calc(100vh-200px)]">
          {currentOrder.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No hay productos en la comanda
            </p>
          ) : (
            <div className="space-y-4">
              {currentOrder.map(item => (
                <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeFromOrder(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {item.customizations && (
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                      {item.customizations}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center hover:bg-gray-300 dark:hover:bg-gray-500"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      €{item.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {currentOrder.length > 0 && (
          <div className="border-t dark:border-gray-700 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nº Mesa"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Cliente"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <textarea
              placeholder="Notas adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={2}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  paymentMethod === 'cash'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Banknote className="w-4 h-4" />
                Efectivo
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 p-2 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
                  paymentMethod === 'card'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                Tarjeta
              </button>
            </div>

            <div className="border-t dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total: €{getOrderTotal().toFixed(2)}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearOrder}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Limpiar
                </button>
                <button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
                >
                  {isProcessing ? 'Procesando...' : 'Pagar'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSidebar;