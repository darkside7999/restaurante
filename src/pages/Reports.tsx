import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, ShoppingBag, Calendar } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface SalesData {
  period: string;
  totalSales: number;
  totalOrders: number;
  averageOrder: number;
  paymentMethods: {
    cash?: number;
    card?: number;
  };
}

interface TopProduct {
  _id: string;
  totalQuantity: number;
  totalRevenue: number;
  product: {
    name: string;
    price: number;
  };
}

const Reports: React.FC = () => {
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [dailySales, setDailySales] = useState<any[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [selectedPeriod]);

  const loadReports = async () => {
    try {
      setLoading(true);
      
      // Cargar datos de ventas
      const salesResponse = await api.get('/reports/sales', {
        params: { period: selectedPeriod }
      });
      setSalesData(salesResponse.data);

      // Cargar productos más vendidos
      const topProductsResponse = await api.get('/reports/top-products', {
        params: { period: selectedPeriod, limit: 5 }
      });
      setTopProducts(topProductsResponse.data);

      // Cargar ventas diarias
      const dailySalesResponse = await api.get('/reports/daily-sales', {
        params: { days: selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 7 }
      });
      setDailySales(dailySalesResponse.data);

    } catch (error) {
      toast.error('Error cargando reportes');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const periodLabels = {
    today: 'Hoy',
    week: 'Esta Semana',
    month: 'Este Mes'
  };

  const paymentMethodsData = salesData ? [
    { name: 'Efectivo', value: salesData.paymentMethods.cash || 0, color: '#10B981' },
    { name: 'Tarjeta', value: salesData.paymentMethods.card || 0, color: '#3B82F6' }
  ].filter(item => item.value > 0) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-4">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reportes y Estadísticas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Análisis de ventas y rendimiento del restaurante
            </p>
          </div>

          <div className="flex gap-2">
            {Object.entries(periodLabels).map(([period, label]) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ventas {periodLabels[selectedPeriod]}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{salesData?.totalSales.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 dark:bg-opacity-20 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Órdenes {periodLabels[selectedPeriod]}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {salesData?.totalOrders || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 rounded-full">
                <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Promedio por Orden
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{salesData?.averageOrder.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 dark:bg-opacity-20 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de ventas diarias */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ventas Diarias
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dailySales}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="_id.day" 
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis className="text-gray-600 dark:text-gray-400" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgb(31 41 55)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="totalSales" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de métodos de pago */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Métodos de Pago
            </h3>
            {paymentMethodsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={paymentMethodsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: €${value.toFixed(2)}`}
                  >
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`€${value.toFixed(2)}`, 'Ventas']}
                    contentStyle={{
                      backgroundColor: 'rgb(31 41 55)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-gray-500 dark:text-gray-400">
                No hay datos de ventas para mostrar
              </div>
            )}
          </div>
        </div>

        {/* Productos más vendidos */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
            Productos Más Vendidos ({periodLabels[selectedPeriod]})
          </h3>
          
          {topProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cantidad Vendida
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ingresos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {topProducts.map((item, index) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {item.product.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.totalQuantity} unidades
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        €{item.totalRevenue.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay datos de productos vendidos para mostrar
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;