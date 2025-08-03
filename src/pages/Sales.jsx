import { useState, useEffect } from 'react';
import { Calendar, Euro, ShoppingBag, TrendingUp, Download } from 'lucide-react';
import { statsAPI, ordersAPI } from '../services/api';
import { useOffline } from '../hooks/useOffline';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

const Sales = () => {
  const [dateRange, setDateRange] = useState('today');
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isOnline, getOrders } = useOffline();

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    loadSalesData();
  }, [dateRange]);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      
      const { startDate, endDate } = getDateRange();
      
      if (isOnline) {
        if (dateRange === 'today') {
          const todayStats = await statsAPI.getToday();
          setStats(todayStats.data);
          
          const todayOrders = await ordersAPI.getToday();
          setOrders(todayOrders.data);
        } else {
          const rangeStats = await statsAPI.getRange(startDate, endDate);
          setStats(rangeStats.data);
          
          // Load orders for the range
          let allOrders = [];
          let currentDate = new Date(startDate);
          const end = new Date(endDate);
          
          while (currentDate <= end) {
            try {
              const dateStr = format(currentDate, 'yyyy-MM-dd');
              const dayOrders = await ordersAPI.getByDate(dateStr);
              allOrders = allOrders.concat(dayOrders.data);
            } catch (error) {
              // Day might not have orders
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          setOrders(allOrders);
        }
      } else {
        // Offline mode - use local storage
        const offlineOrders = getOrders();
        setOrders(offlineOrders);
        
        // Calculate stats from local orders
        const completedOrders = offlineOrders.filter(o => o.status === 'served');
        const calculatedStats = {
          totalOrders: completedOrders.length,
          totalRevenue: completedOrders.reduce((sum, order) => sum + order.total, 0),
          averageOrder: completedOrders.length > 0 
            ? completedOrders.reduce((sum, order) => sum + order.total, 0) / completedOrders.length 
            : 0
        };
        setStats(calculatedStats);
      }
      
    } catch (error) {
      console.error('Error loading sales data:', error);
      toast.error('Error cargando datos de ventas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orders.length > 0) {
      generateChartData();
      generateProductStats();
    }
  }, [orders]);

  const getDateRange = () => {
    const today = new Date();
    switch (dateRange) {
      case 'today':
        return {
          startDate: format(today, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      case 'week':
        return {
          startDate: format(subDays(today, 7), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      case 'month':
        return {
          startDate: format(subDays(today, 30), 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
      default:
        return {
          startDate: format(today, 'yyyy-MM-dd'),
          endDate: format(today, 'yyyy-MM-dd')
        };
    }
  };

  const generateChartData = () => {
    const completedOrders = orders.filter(o => o.status === 'served');
    
    if (dateRange === 'today') {
      // Hourly data for today
      const hourlyData = {};
      
      completedOrders.forEach(order => {
        const hour = new Date(order.createdAt).getHours();
        const key = `${hour}:00`;
        
        if (!hourlyData[key]) {
          hourlyData[key] = { time: key, orders: 0, revenue: 0 };
        }
        
        hourlyData[key].orders += 1;
        hourlyData[key].revenue += order.total;
      });
      
      const sortedData = Object.values(hourlyData).sort((a, b) => 
        parseInt(a.time) - parseInt(b.time)
      );
      
      setChartData(sortedData);
    } else {
      // Daily data for week/month
      const dailyData = {};
      
      completedOrders.forEach(order => {
        const date = format(new Date(order.createdAt), 'yyyy-MM-dd');
        
        if (!dailyData[date]) {
          dailyData[date] = { 
            date, 
            orders: 0, 
            revenue: 0,
            displayDate: format(new Date(order.createdAt), 'dd/MM')
          };
        }
        
        dailyData[date].orders += 1;
        dailyData[date].revenue += order.total;
      });
      
      const sortedData = Object.values(dailyData).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      setChartData(sortedData);
    }
  };

  const generateProductStats = () => {
    const completedOrders = orders.filter(o => o.status === 'served');
    const productCounts = {};
    
    completedOrders.forEach(order => {
      order.items.forEach(item => {
        if (!productCounts[item.name]) {
          productCounts[item.name] = {
            name: item.name,
            quantity: 0,
            revenue: 0
          };
        }
        
        productCounts[item.name].quantity += item.quantity;
        productCounts[item.name].revenue += item.price * item.quantity;
      });
    });
    
    const sortedProducts = Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10 products
    
    setProductStats(sortedProducts);
  };

  const exportSalesData = () => {
    const completedOrders = orders.filter(o => o.status === 'served');
    
    const csvContent = [
      ['Fecha', 'ID Pedido', 'Productos', 'Total', 'Método de Pago'].join(','),
      ...completedOrders.map(order => [
        format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm'),
        order.id,
        order.items.map(item => `${item.quantity}x ${item.name}`).join('; '),
        `€${order.total.toFixed(2)}`,
        order.paymentMethod || 'N/A'
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `ventas-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Datos exportados exitosamente');
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Panel de Ventas
        </h1>
        
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Último mes</option>
          </select>
          
          <button
            onClick={exportSalesData}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Euro className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ingresos Totales
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{stats.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Pedidos
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalOrders || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ticket Promedio
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{stats.averageOrder?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Ingresos {dateRange === 'today' ? 'por Hora' : 'por Día'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={dateRange === 'today' ? 'time' : 'displayDate'}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'revenue' ? `€${value.toFixed(2)}` : value,
                  name === 'revenue' ? 'Ingresos' : 'Pedidos'
                ]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="Ingresos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Orders Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pedidos {dateRange === 'today' ? 'por Hora' : 'por Día'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={dateRange === 'today' ? 'time' : 'displayDate'}
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Productos Más Vendidos
          </h3>
          <div className="space-y-3">
            {productStats.slice(0, 5).map((product, index) => (
              <div key={product.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                    {index + 1}.
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                    {product.name}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {product.quantity} uds
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    €{product.revenue.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribución de Ventas
          </h3>
          {productStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={productStats.slice(0, 7)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantity"
                >
                  {productStats.slice(0, 7).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No hay datos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      {orders.length > 0 && (
        <div className="mt-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Pedidos Recientes
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{order.id.slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        €{order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'served' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : order.status === 'ready'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {order.status === 'served' ? 'Servido' :
                           order.status === 'ready' ? 'Listo' :
                           order.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;