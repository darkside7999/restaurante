import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { useSocket } from '../context/SocketContext'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Calendar,
  RefreshCw,
  Filter,
  Trash2,
  Eye, EyeOff,
  TrendingDown, Users, Clock, Star, CheckCircle,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  BarChart as BarChartIcon
} from 'lucide-react'

function Estadisticas() {
  const [stats, setStats] = useState(null)
  const [periodo, setPeriodo] = useState('hoy')
  const [ventasDiarias, setVentasDiarias] = useState([])
  const [pedidos, setPedidos] = useState([])
  const [mostrarPedidos, setMostrarPedidos] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroPago, setFiltroPago] = useState('todos')
  const [filtroFecha, setFiltroFecha] = useState('')
  
  // Nuevas estadísticas
  const [ventasPorHora, setVentasPorHora] = useState([])
  const [ventasPorDiaSemana, setVentasPorDiaSemana] = useState([])
  const [ventasPorDiaMes, setVentasPorDiaMes] = useState([])

  const { loading, error, get, delete: del } = useApi()
  const { on, off } = useSocket()

  useEffect(() => {
    cargarEstadisticas()
    cargarVentasDiarias()
    cargarPedidos()
    cargarNuevasEstadisticas()

    // Listen for real-time updates
    on('pedido_actualizado', () => {
      console.log('🔄 Estadísticas actualizadas por cambio de pedido')
      cargarEstadisticas()
      cargarPedidos()
      cargarNuevasEstadisticas()
    })

    on('pedido_eliminado', () => {
      console.log('🗑️ Estadísticas actualizadas por eliminación de pedido')
      cargarEstadisticas()
      cargarVentasDiarias()
      cargarPedidos()
      cargarNuevasEstadisticas()
    })

    on('estadisticas_actualizadas', () => {
      console.log('📊 Estadísticas actualizadas automáticamente')
      cargarEstadisticas()
      cargarVentasDiarias()
      cargarPedidos()
      cargarNuevasEstadisticas()
    })

    return () => {
      off('pedido_actualizado')
      off('pedido_eliminado')
      off('estadisticas_actualizadas')
    }
  }, [periodo, on, off])

  const cargarEstadisticas = async () => {
    try {
      const data = await get(`/stats?periodo=${periodo}`)
      if (data.success) {
        setStats(data.data)
      }
    } catch (err) {
      console.error('Error cargando estadísticas:', err)
    }
  }

  const cargarVentasDiarias = async () => {
    try {
      const data = await get('/stats/ventas-diarias')
      if (data.success) {
        setVentasDiarias(data.data.slice(0, 7))
      }
    } catch (err) {
      console.error('Error cargando ventas diarias:', err)
    }
  }

  const cargarPedidos = async () => {
    try {
      const data = await get('/pedidos')
      if (data.success) {
        setPedidos(data.data)
      }
    } catch (err) {
      console.error('Error cargando pedidos:', err)
    }
  }

  const cargarNuevasEstadisticas = async () => {
    try {
      const [horaData, semanaData, mesData] = await Promise.all([
        get('/stats/ventas-por-hora'),
        get('/stats/ventas-por-dia-semana'),
        get('/stats/ventas-por-dia-mes')
      ])

      if (horaData.success) setVentasPorHora(horaData.data)
      if (semanaData.success) setVentasPorDiaSemana(semanaData.data)
      if (mesData.success) setVentasPorDiaMes(mesData.data)
    } catch (err) {
      console.error('Error cargando nuevas estadísticas:', err)
    }
  }

  const eliminarPedido = async (pedidoId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
      return
    }
    try {
      const data = await del(`/pedidos/${pedidoId}`)
      if (data.success) {
        await cargarEstadisticas()
        await cargarPedidos()
        await cargarNuevasEstadisticas()
      }
    } catch (err) {
      alert('Error eliminando pedido: ' + err.message)
    }
  }

  const formatearMoneda = (valor) => {
    if (!valor || isNaN(valor)) return '$0.00'
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(valor)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatearHora = (hora) => {
    return `${hora}:00`
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'en_preparacion': return 'bg-blue-100 text-blue-800'
      case 'listo': return 'bg-green-100 text-green-800'
      case 'entregado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente': return <Clock className="h-4 w-4" />
      case 'en_preparacion': return <RefreshCw className="h-4 w-4" />
      case 'listo': return <CheckCircle className="h-4 w-4" />
      case 'entregado': return <Star className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Filtered orders logic
  const pedidosFiltrados = pedidos.filter(pedido => {
    if (filtroEstado !== 'todos' && pedido.estado !== filtroEstado) return false
    if (filtroPago !== 'todos' && pedido.forma_pago !== filtroPago) return false
    if (filtroFecha && !pedido.created_at.includes(filtroFecha)) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
        <div className="flex items-center space-x-4">
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="hoy">Hoy</option>
            <option value="ayer">Ayer</option>
            <option value="semana">Esta Semana</option>
            <option value="mes">Este Mes</option>
          </select>
        </div>
      </div>

      {stats && (
        <>
          {/* Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.general.total_pedidos}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Ventas Totales</p>
                  <p className="text-2xl font-bold text-gray-900">{formatearMoneda(stats.general.ventas_totales)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Promedio por Pedido</p>
                  <p className="text-2xl font-bold text-gray-900">{formatearMoneda(stats.general.promedio_por_pedido)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Entregados</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.general.pedidos_entregados}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Nuevas Estadísticas por Tiempo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ventas por Hora */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Ventas por Hora (Hoy)</h3>
              </div>
              <div className="space-y-3">
                {ventasPorHora.length > 0 ? (
                  ventasPorHora.map((venta, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{formatearHora(venta.hora)}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{venta.cantidad_pedidos} pedidos</p>
                        <p className="text-xs text-gray-500">{formatearMoneda(venta.total_ventas)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">No hay ventas hoy</p>
                )}
              </div>
            </div>

            {/* Ventas por Día de la Semana */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <CalendarIcon className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Ventas por Día (Semana)</h3>
              </div>
              <div className="space-y-3">
                {ventasPorDiaSemana.length > 0 ? (
                  ventasPorDiaSemana.map((venta, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{formatearFecha(venta.fecha)}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{venta.cantidad_pedidos} pedidos</p>
                        <p className="text-xs text-gray-500">{formatearMoneda(venta.total_ventas)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">No hay ventas esta semana</p>
                )}
              </div>
            </div>

            {/* Ventas por Día del Mes */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center mb-4">
                <BarChartIcon className="h-5 w-5 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Ventas por Día (Mes)</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {ventasPorDiaMes.length > 0 ? (
                  ventasPorDiaMes.map((venta, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{formatearFecha(venta.fecha)}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{venta.cantidad_pedidos} pedidos</p>
                        <p className="text-xs text-gray-500">{formatearMoneda(venta.total_ventas)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">No hay ventas este mes</p>
                )}
              </div>
            </div>
          </div>

          {/* Ventas por Forma de Pago */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ventas por Forma de Pago</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.ventas_por_pago.map((venta, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-900 capitalize">{venta.forma_pago}</p>
                  <p className="text-2xl font-bold text-primary-600">{formatearMoneda(venta.total)}</p>
                  <p className="text-sm text-gray-500">{venta.cantidad} pedidos</p>
                </div>
              ))}
            </div>
          </div>

          {/* Productos Más Vendidos */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Más Vendidos</h3>
            <div className="space-y-3">
              {stats.productos_mas_vendidos.length > 0 ? (
                stats.productos_mas_vendidos.map((producto, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{producto.producto}</p>
                      <p className="text-sm text-gray-500">{producto.categoria}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{producto.cantidad_vendida} unidades</p>
                      <p className="text-sm text-gray-500">{formatearMoneda(producto.total_vendido)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500">No hay productos vendidos en este período</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Lista de Pedidos */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Historial de Pedidos</h3>
          <button
            onClick={() => setMostrarPedidos(!mostrarPedidos)}
            className="flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            {mostrarPedidos ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {mostrarPedidos ? 'Ocultar' : 'Mostrar'} Pedidos
          </button>
        </div>

        {mostrarPedidos && (
          <>
            {/* Filtros */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="todos">Todos los Estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_preparacion">En Preparación</option>
                <option value="listo">Listo</option>
                <option value="entregado">Entregado</option>
              </select>

              <select
                value={filtroPago}
                onChange={(e) => setFiltroPago(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="todos">Todos los Pagos</option>
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>

              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Tabla de Pedidos */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidosFiltrados.map((pedido) => (
                    <tr key={pedido.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{pedido.numero_pedido}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatearFecha(pedido.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatearMoneda(pedido.total_con_impuesto)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(pedido.estado)}`}>
                          {getEstadoIcon(pedido.estado)}
                          <span className="ml-1 capitalize">{pedido.estado}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                        {pedido.forma_pago}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => eliminarPedido(pedido.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Estadisticas 