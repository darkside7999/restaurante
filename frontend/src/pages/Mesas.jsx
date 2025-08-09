import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { useSocket } from '../context/SocketContext'
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  User, 
  Phone, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  XCircle,
  AlertTriangle,
  Package,
  Trash2,
  CreditCard,
  X
} from 'lucide-react'
import { showAutoCloseAlert, showConfirmAlert } from '../utils/alertUtils'

function Mesas() {
  const [mesas, setMesas] = useState([])
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null)
  const [mostrarAbrirMesa, setMostrarAbrirMesa] = useState(false)
  const [mostrarAgregarProducto, setMostrarAgregarProducto] = useState(false)
  const [mostrarPagar, setMostrarPagar] = useState(false)
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)

  // Estados para abrir mesa
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [numeroMesa, setNumeroMesa] = useState('')

  // Estados para pagar
  const [formaPago, setFormaPago] = useState('efectivo')
  const [pagoRecibido, setPagoRecibido] = useState('')
  const [observacionesPago, setObservacionesPago] = useState('')
  const [horaRecogida, setHoraRecogida] = useState('')

  const { get, post, delete: del } = useApi()
  const { on, off } = useSocket()

  useEffect(() => {
    cargarMesas()
    cargarProductos()
    
    // Escuchar actualizaciones de mesas
    on('mesas_actualizadas', () => {
      console.log('🔄 Mesas actualizadas automáticamente')
      cargarMesas()
    })
    
    // Escuchar actualizaciones de pedidos específicos
    on('pedido_actualizado', (data) => {
      console.log('🔄 Pedido actualizado:', data.pedido_id)
      cargarMesas()
    })
    

    
    return () => {
      off('mesas_actualizadas')
      off('pedido_actualizado')
    }
  }, [on, off])

  const cargarMesas = async () => {
    try {
      setLoading(true)
      const data = await get('/mesas')
      if (data.success) {
        setMesas(data.data)
        console.log('📋 Mesas cargadas:', data.data.length)
        
        // Actualizar la mesa seleccionada si existe
        if (mesaSeleccionada) {
          const mesaActualizada = data.data.find(m => m.numero === mesaSeleccionada.numero)
          if (mesaActualizada) {
            setMesaSeleccionada(mesaActualizada)
            console.log('🔄 Mesa seleccionada actualizada')
          }
        }
      }
    } catch (err) {
      console.error('Error cargando mesas:', err)
    } finally {
      setLoading(false)
    }
  }

  const cargarProductos = async () => {
    try {
      const data = await get('/menu')
      if (data.success) {
        setProductos(data.data)
      }
    } catch (err) {
      console.error('Error cargando productos:', err)
    }
  }

  const abrirMesa = async () => {
    if (!numeroMesa) {
      showAutoCloseAlert('error', 'Ingresa el número de mesa')
      return
    }

    try {
      setLoading(true)
      const data = await post(`/mesas/${numeroMesa}/abrir`, {
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono
      })

      if (data.success) {
        showAutoCloseAlert('success', `Mesa ${numeroMesa} abierta exitosamente`)
        setMostrarAbrirMesa(false)
        setClienteNombre('')
        setClienteTelefono('')
        setNumeroMesa('')
        cargarMesas()
      }
    } catch (err) {
      console.error('Error abriendo mesa:', err)
      showAutoCloseAlert('error', err.message || 'Error abriendo mesa')
    } finally {
      setLoading(false)
    }
  }

  const agregarProductoAMesa = async (producto, cantidad = 1, observaciones = '') => {
    if (!mesaSeleccionada) {
      showAutoCloseAlert('error', 'Selecciona una mesa primero')
      return
    }

    if (!producto.stock_disponible) {
      showAutoCloseAlert('warning', `${producto.nombre} no está disponible actualmente`)
      return
    }

    try {
      setLoading(true)
      const data = await post(`/mesas/${mesaSeleccionada.numero}/agregar-producto`, {
        producto_id: producto.id,
        cantidad: cantidad,
        observaciones: observaciones
      })

      if (data.success) {
        console.log('✅ Producto agregado a mesa:', producto.nombre)
        // Actualizar inmediatamente la mesa seleccionada
        await cargarMesas()
        // Mostrar confirmación visual
        showAutoCloseAlert('success', `✅ ${producto.nombre} agregado a Mesa ${mesaSeleccionada.numero}`)
      }
    } catch (err) {
      console.error('Error agregando producto:', err)
      showAutoCloseAlert('error', err.message || 'Error agregando producto')
    } finally {
      setLoading(false)
    }
  }

  const handleAgregarProducto = async (producto) => {
    await agregarProductoAMesa(producto, 1, '')
  }

  const getStockStatus = (producto) => {
    if (!producto.stock_disponible) {
      return {
        icon: <XCircle className="h-4 w-4 text-red-500" />,
        text: 'No disponible',
        className: 'text-red-600',
        bgClassName: 'bg-red-50 border-red-200'
      }
    } else if (producto.stock_bajo) {
      return {
        icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
        text: 'Stock bajo',
        className: 'text-yellow-600',
        bgClassName: 'bg-yellow-50 border-yellow-200'
      }
    } else {
      return {
        icon: <Package className="h-4 w-4 text-green-500" />,
        text: 'Disponible',
        className: 'text-green-600',
        bgClassName: 'bg-green-50 border-green-200'
      }
    }
  }

  const productosFiltrados = categoriaSeleccionada 
    ? productos.find(cat => cat.id === categoriaSeleccionada)?.productos || []
    : productos.flatMap(cat => cat.productos)

  const removerProducto = async (itemId) => {
    if (!mesaSeleccionada) {
      console.error('❌ No hay mesa seleccionada para remover producto')
      showAutoCloseAlert('error', 'No hay mesa seleccionada')
      return
    }

    console.log('🔄 Intentando remover producto:', {
      mesa: mesaSeleccionada.numero,
      itemId: itemId,
      mesaSeleccionada: mesaSeleccionada
    })

    const confirmed = await showConfirmAlert('¿Estás seguro de que quieres remover este producto?')
    if (!confirmed) {
      return
    }

    try {
      setLoading(true)
      const url = `/mesas/${mesaSeleccionada.numero}/producto/${itemId}`
      console.log('📤 Enviando DELETE a:', url)
      
      const data = await del(url)
      console.log('📥 Respuesta del servidor:', data)

      if (data.success) {
        console.log('✅ Producto removido de mesa exitosamente')
        // Actualizar inmediatamente la mesa seleccionada
        await cargarMesas()
        // Mostrar confirmación visual
        showAutoCloseAlert('success', '✅ Producto removido exitosamente')
      } else {
        throw new Error(data.error || 'Error desconocido al remover producto')
      }
    } catch (err) {
      console.error('❌ Error removiendo producto:', err)
      console.error('❌ Detalles del error:', {
        message: err.message,
        status: err.status,
        response: err.response
      })
      showAutoCloseAlert('error', err.message || 'Error removiendo producto')
    } finally {
      setLoading(false)
    }
  }

  const pagarMesa = async () => {
    if (!mesaSeleccionada) {
      console.error('No hay mesa seleccionada')
      showAutoCloseAlert('error', 'No hay mesa seleccionada')
      return
    }

    console.log('🔄 Iniciando pago de mesa:', mesaSeleccionada.numero)
    console.log('📊 Datos de pago:', {
      mesa: mesaSeleccionada.numero,
      total: mesaSeleccionada.total_con_impuesto,
      forma_pago: formaPago,
      pago_recibido: pagoRecibido,
      observaciones: observacionesPago,
      hora_recogida: horaRecogida
    })

    const total = mesaSeleccionada.total_con_impuesto || 0
    const recibido = parseFloat(pagoRecibido) || total

    if (recibido < total) {
      showAutoCloseAlert('warning', 'El pago recibido debe ser mayor o igual al total')
      return
    }

    try {
      setLoading(true)
      const pagoData = {
        forma_pago: formaPago,
        pago_recibido: recibido,
        observaciones: observacionesPago,
        hora_recogida: horaRecogida || null
      }
      
      console.log('📤 Enviando datos de pago:', pagoData)
      
      const data = await post(`/mesas/${mesaSeleccionada.numero}/cerrar`, pagoData)

      console.log('📥 Respuesta del servidor:', data)

      if (data.success) {
        const cambio = recibido - total
        showAutoCloseAlert('success', `Mesa ${mesaSeleccionada.numero} pagada exitosamente\nTotal: $${total.toFixed(2)}\nRecibido: $${recibido.toFixed(2)}\nCambio: $${cambio.toFixed(2)}`)
        setMostrarPagar(false)
        setFormaPago('efectivo')
        setPagoRecibido('')
        setObservacionesPago('')
        setHoraRecogida('')
        setMesaSeleccionada(null)
        cargarMesas()
      } else {
        throw new Error(data.error || 'Error desconocido en el pago')
      }
    } catch (err) {
      console.error('❌ Error pagando mesa:', err)
      showAutoCloseAlert('error', err.message || 'Error pagando mesa')
    } finally {
      setLoading(false)
    }
  }

  const cancelarMesa = async () => {
    if (!mesaSeleccionada) {
      console.error('❌ No hay mesa seleccionada para cancelar')
      showAutoCloseAlert('error', 'No hay mesa seleccionada')
      return
    }

    console.log('🔄 Intentando cancelar mesa:', {
      mesa: mesaSeleccionada.numero,
      mesaSeleccionada: mesaSeleccionada
    })
    
    const confirmed = await showConfirmAlert('¿Estás seguro de que quieres cancelar esta mesa?')
    if (!confirmed) {
      return
    }

    try {
      setCanceling(true)
      const url = `/mesas/${mesaSeleccionada.numero}/cancelar`
      console.log('📤 Enviando POST a:', url)
      
      const data = await post(url)
      console.log('📥 Respuesta del servidor:', data)

      if (data.success) {
        console.log('✅ Mesa cancelada exitosamente')
        showAutoCloseAlert('success', `Mesa ${mesaSeleccionada.numero} cancelada exitosamente`)
        setMesaSeleccionada(null)
        cargarMesas()
      } else {
        throw new Error(data.error || 'Error desconocido al cancelar mesa')
      }
    } catch (err) {
      console.error('❌ Error cancelando mesa:', err)
      console.error('❌ Detalles del error:', {
        message: err.message,
        status: err.status,
        response: err.response
      })
      showAutoCloseAlert('error', err.message || 'Error cancelando mesa')
    } finally {
      setCanceling(false)
    }
  }

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'libre':
        return 'bg-green-100 text-green-800'
      case 'ocupada':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'libre':
        return <CheckCircle className="h-4 w-4" />
      case 'ocupada':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading && mesas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando mesas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Mesas</h2>
        <button
          onClick={() => setMostrarAbrirMesa(true)}
          className="btn btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Abrir Mesa
        </button>
      </div>

      {/* Grid de mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mesas.map((mesa) => (
          <div
            key={mesa.numero}
            onClick={() => setMesaSeleccionada(mesa)}
            className={`card cursor-pointer transition-all hover:shadow-lg ${
              mesaSeleccionada?.numero === mesa.numero ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary-600">Mesa {mesa.numero}</span>
              </div>
              <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(mesa.estado)}`}>
                {getEstadoIcon(mesa.estado)}
                <span className="ml-1">{mesa.estado === 'libre' ? 'Libre' : 'Ocupada'}</span>
              </div>
            </div>

            {mesa.estado === 'ocupada' && mesa.pedido_id && (
              <div className="space-y-2">
                {mesa.cliente_nombre && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    {mesa.cliente_nombre}
                  </div>
                )}
                {mesa.cliente_telefono && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-1" />
                    {mesa.cliente_telefono}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {mesa.total_items || 0} productos
                </div>
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <DollarSign className="h-4 w-4 mr-1" />
                  ${(mesa.total_con_impuesto || 0).toFixed(2)}
                </div>
                {mesa.hora_apertura && (
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(mesa.hora_apertura).toLocaleTimeString()}
                  </div>
                )}
              </div>
            )}

            {mesa.estado === 'libre' && (
              <div className="text-sm text-gray-500 italic">
                Mesa disponible
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Detalles de mesa seleccionada */}
      {mesaSeleccionada && mesaSeleccionada.estado === 'ocupada' && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Mesa {mesaSeleccionada.numero} - Detalles
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setMostrarAgregarProducto(!mostrarAgregarProducto)}
                className="btn btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                {mostrarAgregarProducto ? 'Ocultar Menú' : 'Agregar Productos'}
              </button>
              <button
                onClick={() => setMostrarPagar(true)}
                className="btn btn-success flex items-center"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pagar
              </button>
              <button
                onClick={cancelarMesa}
                disabled={canceling}
                className="btn btn-danger flex items-center"
              >
                {canceling ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Cancelando...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Menú de productos */}
          {mostrarAgregarProducto && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Agregar Productos</h4>
              
              {/* Filtro de categorías */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setCategoriaSeleccionada(null)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      categoriaSeleccionada === null
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Todas
                  </button>
                  {productos.map((categoria) => (
                    <button
                      key={categoria.id}
                      onClick={() => setCategoriaSeleccionada(categoria.id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        categoriaSeleccionada === categoria.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {categoria.nombre}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                {categoriaSeleccionada ? (
                  // Mostrar solo productos de la categoría seleccionada
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {productosFiltrados.map((producto) => {
                      const stockStatus = getStockStatus(producto)
                      return (
                        <div key={producto.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${stockStatus.bgClassName}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                              <div className="flex items-center mt-1">
                                {stockStatus.icon}
                                <span className={`text-xs font-medium ml-1 ${stockStatus.className}`}>
                                  {stockStatus.text}
                                </span>
                              </div>
                            </div>
                            <span className="text-lg font-semibold text-primary-600">
                              ${producto.precio.toFixed(2)}
                            </span>
                          </div>
                          
                          {producto.descripcion && (
                            <p className="text-sm text-gray-600 mb-3">{producto.descripcion}</p>
                          )}
                          
                          <button
                            onClick={() => handleAgregarProducto(producto)}
                            disabled={!producto.stock_disponible || loading}
                            className={`w-full btn ${producto.stock_disponible ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                          >
                            {loading ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Agregando...
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 mr-2" />
                                {producto.stock_disponible ? 'Agregar' : 'No disponible'}
                              </>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  // Mostrar productos organizados por categorías
                  productos.map((categoria) => (
                    <div key={categoria.id} className="card">
                      <h5 className="text-lg font-semibold text-gray-900 mb-4">
                        {categoria.nombre}
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categoria.productos.map((producto) => {
                          const stockStatus = getStockStatus(producto)
                          return (
                            <div key={producto.id} className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${stockStatus.bgClassName}`}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                                  <div className="flex items-center mt-1">
                                    {stockStatus.icon}
                                    <span className={`text-xs font-medium ml-1 ${stockStatus.className}`}>
                                      {stockStatus.text}
                                    </span>
                                  </div>
                                </div>
                                <span className="text-lg font-semibold text-primary-600">
                                  ${producto.precio.toFixed(2)}
                                </span>
                              </div>
                              
                              {producto.descripcion && (
                                <p className="text-sm text-gray-600 mb-3">{producto.descripcion}</p>
                              )}
                              
                              <button
                                onClick={() => handleAgregarProducto(producto)}
                                disabled={!producto.stock_disponible || loading}
                                className={`w-full btn ${producto.stock_disponible ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                              >
                                {loading ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Agregando...
                                  </>
                                ) : (
                                  <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {producto.stock_disponible ? 'Agregar' : 'No disponible'}
                                  </>
                                )}
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Items del pedido */}
          {mesaSeleccionada.items && mesaSeleccionada.items.length > 0 ? (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-gray-900">Productos en la Mesa</h4>
              {mesaSeleccionada.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.producto_nombre}</div>
                    <div className="text-sm text-gray-600">
                      ${item.precio_unitario.toFixed(2)} x {item.cantidad}
                    </div>
                    {item.observaciones && (
                      <div className="text-xs text-gray-500 italic">
                        {item.observaciones}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                    <button
                      onClick={() => {
                        console.log('🗑️ Intentando eliminar item:', item)
                        removerProducto(item.id)
                      }}
                      disabled={loading}
                      className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${(mesaSeleccionada.total_con_impuesto || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No hay productos en esta mesa</p>
            </div>
          )}
        </div>
      )}

      {/* Modal Abrir Mesa */}
      {mostrarAbrirMesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Abrir Mesa</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Número de Mesa</label>
                <input
                  type="number"
                  value={numeroMesa}
                  onChange={(e) => setNumeroMesa(e.target.value)}
                  className="input"
                  placeholder="Ej: 1"
                  min="1"
                />
              </div>
              
              <div>
                <label className="label">Nombre del Cliente (opcional)</label>
                <input
                  type="text"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  className="input"
                  placeholder="Nombre del cliente"
                />
              </div>
              
              <div>
                <label className="label">Teléfono (opcional)</label>
                <input
                  type="text"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  className="input"
                  placeholder="Teléfono del cliente"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setMostrarAbrirMesa(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={abrirMesa}
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Abriendo...' : 'Abrir Mesa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pagar */}
      {mostrarPagar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagar Mesa {mesaSeleccionada?.numero}</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  ${(mesaSeleccionada?.total_con_impuesto || 0).toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">Total a pagar</div>
              </div>
              
              <div>
                <label className="label">Forma de Pago</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormaPago('efectivo')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      formaPago === 'efectivo'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormaPago('tarjeta')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      formaPago === 'tarjeta'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    💳 Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormaPago('transferencia')}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                      formaPago === 'transferencia'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    📱 Transferencia
                  </button>
                </div>
              </div>
              
              <div>
                <label className="label">Pago Recibido</label>
                <input
                  type="number"
                  value={pagoRecibido}
                  onChange={(e) => setPagoRecibido(e.target.value)}
                  className="input"
                  placeholder="0.00"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Dejar vacío si es exacto
                </p>
              </div>
              
              <div>
                <label className="label">Hora de Recogida (opcional)</label>
                <input
                  type="time"
                  value={horaRecogida}
                  onChange={(e) => setHoraRecogida(e.target.value)}
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Hora estimada para recoger el pedido
                </p>
              </div>

              <div>
                <label className="label">Observaciones (opcional)</label>
                <textarea
                  value={observacionesPago}
                  onChange={(e) => setObservacionesPago(e.target.value)}
                  className="input"
                  rows="3"
                  placeholder="Observaciones del pago..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setMostrarPagar(false)
                  setFormaPago('efectivo')
                  setPagoRecibido('')
                  setObservacionesPago('')
                  setHoraRecogida('')
                }}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={pagarMesa}
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  'Confirmar Pago'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Mesas 