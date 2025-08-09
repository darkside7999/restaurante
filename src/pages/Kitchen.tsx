import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, Edit3 } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Order {
  _id: string;
  orderNumber: string;
  items: Array<{
    product: {
      name: string;
    };
    quantity: number;
    customizations: string;
  }>;
  total: number;
  status: string;
  tableNumber: string;
  customerName: string;
  notes: string;
  createdAt: string;
}

const Kitchen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');

  useEffect(() => {
    loadOrders();
    // Recargar órdenes cada 30 segundos
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadOrders = async () => {
    try {
      const response = await api.get('/orders', {
        params: { status: filter === 'all' ? undefined : filter }
      });
      setOrders(response.data);
    } catch (error) {
      toast.error('Error cargando órdenes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success(`Orden ${status === 'ready' ? 'lista' : status === 'cancelled' ? 'cancelada' : 'actualizada'}`);
      loadOrders();
    } catch (error) {
      toast.error('Error actualizando orden');
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'preparing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'ready': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo';
      case 'completed': return 'Completado';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimeElapsed = (dateString: string) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const elapsed = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    return elapsed;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Panel de Cocina
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gestiona las órdenes activas del restaurante
            </p>
          </div>

          <div className="flex gap-2">
            {['all', 'pending', 'preparing', 'ready'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {status === 'all' ? 'Todas' : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map(order => {
              const elapsed = getTimeElapsed(order.createdAt);
              const isUrgent = elapsed > 30;
              
              return (
                <div 
                  key={order._id} 
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all ${
                    isUrgent ? 'ring-2 ring-red-500 ring-opacity-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        #{order.orderNumber}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {formatTime(order.createdAt)} ({elapsed} min)
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {(order.tableNumber || order.customerName) && (
                    <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
                      {order.tableNumber && <span>Mesa: {order.tableNumber}</span>}
                      {order.tableNumber && order.customerName && <span> • </span>}
                      {order.customerName && <span>Cliente: {order.customerName}</span>}
                    </div>
                  )}

                  <div className="space-y-2 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-medium text-gray-900 dark:text-white">
                              {item.quantity}x {item.product.name}
                            </span>
                            {item.customizations && (
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {item.customizations}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Notas:</strong> {order.notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'preparing')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-4 h-4" />
                        Preparar
                      </button>
                    )}
                    
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'ready')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Listo
                      </button>
                    )}

                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'completed')}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        Completar
                      </button>
                    )}

                    {(['pending', 'preparing'].includes(order.status)) && (
                      <button
                        onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {orders.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No hay órdenes {filter === 'all' ? '' : `con estado "${getStatusText(filter)}"`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Kitchen;