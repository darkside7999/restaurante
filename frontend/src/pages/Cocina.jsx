import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { useSocket } from '../context/SocketContext'
import { CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react'
import { showAutoCloseAlert, showConfirmAlert } from '../utils/alertUtils'

function Cocina() {
  const [pedidosActivos, setPedidosActivos] = useState([])
  const [loading, setLoading] = useState(true)
  
  const { get, put, del } = useApi()
  const { on, off } = useSocket()

  useEffect(() => {
    cargarPedidosActivos()
    
    // Escuchar nuevos pedidos
    on('nuevo_pedido', (pedido) => {
      console.log('🆕 Nuevo pedido recibido:', pedido.numero_pedido)
      cargarPedidosActivos()
    })
    
    // Escuchar cambios de estado
    on('pedido_actualizado', () => {
      console.log('🔄 Pedido actualizado')
      cargarPedidosActivos()
    })
    
    // Escuchar eliminación de pedidos
    on('pedido_eliminado', (data) => {
      console.log('🗑️ Pedido eliminado:', data.id)
      cargarPedidosActivos()
    })
    
    return () => {
      off('nuevo_pedido')
      off('pedido_actualizado')
      off('pedido_eliminado')
    }
  }, [on, off])

  const cargarPedidosActivos = async () => {
    try {
      setLoading(true)
      const data = await get('/pedidos/activos')
      if (data.success) {
        setPedidosActivos(data.data)
      }
    } catch (err) {
      console.error('Error cargando pedidos activos:', err)
    } finally {
      setLoading(false)
    }
  }

  const cambiarEstado = async (pedidoId, nuevoEstado) => {
    try {
      const data = await put(`/pedidos/${pedidoId}/estado`, { estado: nuevoEstado })
      if (data.success) {
        const estadoText = nuevoEstado.replace('_', ' ')
        showAutoCloseAlert('success', `Pedido actualizado a: ${estadoText}`)
        console.log(`Pedido actualizado a ${nuevoEstado}`)
        cargarPedidosActivos()
      }
    } catch (err) {
      console.error('Error actualizando estado:', err)
      showAutoCloseAlert('error', 'Error actualizando estado del pedido')
    }
  }

  const eliminarPedido = async (pedidoId) => {
    const confirmed = await showConfirmAlert('¿Estás seguro de que quieres eliminar este pedido?')
    if (!confirmed) {
      return
    }

    try {
      const data = await del(`/pedidos/${pedidoId}`)
      
      if (data.success) {
        showAutoCloseAlert('success', 'Pedido eliminado exitosamente')
        console.log('Pedido eliminado')
      }
    } catch (err) {
      console.error('Error eliminando pedido:', err)
      showAutoCloseAlert('error', err.message || 'Error eliminando pedido')
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800'
      case 'en_preparacion':
        return 'bg-blue-100 text-blue-800'
      case 'listo':
        return 'bg-green-100 text-green-800'
      case 'entregado':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="h-4 w-4" />
      case 'en_preparacion':
        return <AlertCircle className="h-4 w-4" />
      case 'listo':
        return <CheckCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTiempoTranscurrido = (fechaCreacion) => {
    const ahora = new Date()
    const creacion = new Date(fechaCreacion)
    const diferencia = Math.floor((ahora - creacion) / 1000 / 60) // minutos
    
    if (diferencia < 1) return 'Recién creado'
    if (diferencia < 60) return `${diferencia} min`
    
    const horas = Math.floor(diferencia / 60)
    const minutos = diferencia % 60
    return `${horas}h ${minutos}min`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Cocina</h2>
        <button
          onClick={cargarPedidosActivos}
          className="btn btn-secondary"
        >
          Actualizar
        </button>
      </div>

      {pedidosActivos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg mb-2">No hay pedidos activos</div>
          <div className="text-gray-400 text-sm">Los nuevos pedidos aparecerán aquí automáticamente</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {pedidosActivos.map((pedido) => (
            <div key={pedido.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pedido #{pedido.numero_pedido}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(pedido.created_at).toLocaleTimeString()}
                  </p>
                  {pedido.mesa && (
                    <p className="text-sm text-blue-600 font-medium">
                      Mesa {pedido.mesa}
                    </p>
                  )}
                  {pedido.hora_recogida && (
                    <p className="text-sm text-orange-600 font-medium flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Recoger: {pedido.hora_recogida}
                    </p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getEstadoColor(pedido.estado)}`}>
                  {getEstadoIcon(pedido.estado)}
                  {pedido.estado.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                {pedido.items && pedido.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{item.cantidad}x</span>
                      <span className="ml-2">{item.producto_nombre}</span>
                      {item.observaciones && (
                        <p className="text-sm text-gray-500 ml-4">
                          {item.observaciones}
                        </p>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">
                      ${(item.precio_unitario * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Total:</span>
                  <span className="font-bold text-lg">${pedido.total_final || pedido.total_con_impuesto}</span>
                </div>
                
                {pedido.observaciones && (
                  <p className="text-sm text-gray-600 mb-3">
                    <strong>Observaciones:</strong> {pedido.observaciones}
                  </p>
                )}

                <div className="flex gap-2">
                  {pedido.estado === 'pendiente' && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'en_preparacion')}
                      className="btn btn-primary flex-1"
                    >
                      Iniciar Preparación
                    </button>
                  )}
                  
                  {pedido.estado === 'en_preparacion' && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'listo')}
                      className="btn btn-success flex-1"
                    >
                      Marcar Listo
                    </button>
                  )}
                  
                  {pedido.estado === 'listo' && (
                    <button
                      onClick={() => cambiarEstado(pedido.id, 'entregado')}
                      className="btn btn-secondary flex-1"
                    >
                      Entregado
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Cocina 