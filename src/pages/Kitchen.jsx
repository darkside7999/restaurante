import { useState, useEffect } from 'react';
import { Clock, CheckCircle, Edit, XCircle, RefreshCw } from 'lucide-react';
import { ordersAPI } from '../services/api';
import { useOffline } from '../hooks/useOffline';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, ready, served, cancelled, all
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { isOnline, getOrders, saveOrders } = useOffline();

  useEffect(() => {
    loadOrders();
    
    if (autoRefresh) {
      const interval = setInterval(loadOrders, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadOrders = async () => {
    try {
      if (isOnline) {
        const response = await ordersAPI.getToday();
        setOrders(response.data);
        saveOrders(response.data);
      } else {
        const offlineOrders = getOrders();
        setOrders(offlineOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      const offlineOrders = getOrders();
      setOrders(offlineOrders);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const updates = { status: newStatus };
      
      if (isOnline) {
        await ordersAPI.update(orderId, updates);
      }
      
      const updatedOrders = orders.map(order =>
        order.id === orderId
          ? { ...order, ...updates, updatedAt: new Date().toISOString() }
          : order
      );
      
      setOrders(updatedOrders);
      if (isOnline) saveOrders(updatedOrders);
      
      const statusMessages = {
        pending: 'Pedido marcado como pendiente',
        ready: 'Pedido marcado como listo',
        served: 'Pedido marcado como servido',
        cancelled: 'Pedido cancelado'
      };
      
      toast.success(statusMessages[newStatus]);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Error actualizando estado del pedido');
    }
  };

  const getFilteredOrders = () => {
    if (filter === 'all') return orders;
    return orders.filter(order => order.status === filter);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      ready: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      served: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="h-4 w-4" />,
      ready: <CheckCircle className="h-4 w-4" />,
      served: <CheckCircle className="h-4 w-4" />,
      cancelled: <XCircle className="h-4 w-4" />
    };
    return icons[status] || <Clock className="h-4 w-4" />;
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      ready: 'Listo',
      served: 'Servido',
      cancelled: 'Cancelado'
    };
    return texts[status] || status;
  };

  const getOrderTime = (order) => {
    const createdAt = new Date(order.createdAt);
    const now = new Date();
    const diffMinutes = Math.floor((now - createdAt) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    
    const hours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  };

  const filteredOrders = getFilteredOrders();
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const readyCount = orders.filter(o => o.status === 'ready').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Vista de Cocina
        </h1>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Auto-refresh:</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-md transition-colors ${
                autoRefresh
                  ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <button
            onClick={loadOrders}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pendientes</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{readyCount}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Listos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {orders.filter(o => o.status === 'served').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Servidos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-600">{orders.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total hoy</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'pending', label: 'Pendientes', count: pendingCount },
          { key: 'ready', label: 'Listos', count: readyCount },
          { key: 'served', label: 'Servidos', count: orders.filter(o => o.status === 'served').length },
          { key: 'cancelled', label: 'Cancelados', count: orders.filter(o => o.status === 'cancelled').length },
          { key: 'all', label: 'Todos', count: orders.length }
        ].map((filterOption) => (
          <button
            key={filterOption.key}
            onClick={() => setFilter(filterOption.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === filterOption.key
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {filterOption.label} ({filterOption.count})
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Clock className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No hay pedidos {filter !== 'all' ? getStatusText(filter).toLowerCase() : ''}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {filter === 'pending' 
              ? 'Los nuevos pedidos aparecerán aquí'
              : 'Cambia el filtro para ver otros pedidos'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className={`card border-l-4 ${
                order.status === 'pending' ? 'border-l-yellow-500' :
                order.status === 'ready' ? 'border-l-green-500' :
                order.status === 'served' ? 'border-l-blue-500' :
                'border-l-red-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Pedido #{order.id.slice(-6)}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {getOrderTime(order)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1">{getStatusText(order.status)}</span>
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {item.quantity}x {item.name}
                      </span>
                      {item.notes && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          📝 {item.notes}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Total: €{order.total.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {order.paymentMethod}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Listo
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  {order.status === 'ready' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Servido
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'pending')}
                        className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  
                  {(order.status === 'served' || order.status === 'cancelled') && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'pending')}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Reactivar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Kitchen;