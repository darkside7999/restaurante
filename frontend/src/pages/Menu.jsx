import { useState, useEffect } from 'react'
import { useCarrito } from '../context/CarritoContext'
import { useConfig } from '../context/ConfigContext'
import { useApi } from '../hooks/useApi'
import { useSocket } from '../context/SocketContext'
import { Plus, Minus, ShoppingCart, Edit, Package, AlertTriangle, XCircle, Trash2, Table } from 'lucide-react'
import { showAutoCloseAlert, showConfirmAlert } from '../utils/alertUtils'

function Menu() {
  const [menu, setMenu] = useState([])
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null)
  const [formaPago, setFormaPago] = useState('efectivo')
  const [pagoRecibido, setPagoRecibido] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [mostrarComanda, setMostrarComanda] = useState(false)
  const [procesandoPedido, setProcesandoPedido] = useState(false)
  const [editandoObservacion, setEditandoObservacion] = useState(null)
  
  // Nuevos campos
  const [descuento, setDescuento] = useState('')
  const [mostrarTransferirMesa, setMostrarTransferirMesa] = useState(false)
  const [mesasDisponibles, setMesasDisponibles] = useState([])
  const [mesaSeleccionada, setMesaSeleccionada] = useState('')
  const [clienteNombre, setClienteNombre] = useState('')
  const [clienteTelefono, setClienteTelefono] = useState('')
  const [horaRecogida, setHoraRecogida] = useState('')
  const [transferring, setTransferring] = useState(false)

  const { 
    items, 
    agregarProducto, 
    removerProducto, 
    actualizarCantidad, 
    limpiarCarrito,
    agregarObservacion,
    calcularTotal, 
    calcularTotalConImpuesto 
  } = useCarrito()

  const { config } = useConfig()
  const { loading, error, get, post } = useApi()
  const { on, off } = useSocket()

  useEffect(() => {
    cargarMenu()
    
    // Escuchar actualizaciones del menú
    on('menu_actualizado', () => {
      console.log('🔄 Menú actualizado automáticamente')
      cargarMenu()
    })
    

    
    return () => {
      off('menu_actualizado')
    }
  }, [on, off])

  const cargarMenu = async () => {
    try {
      const data = await get('/menu')
      if (data.success) {
        setMenu(data.data)
        console.log('📋 Menú cargado:', data.data.length, 'categorías')
      }
    } catch (err) {
      console.error('Error cargando menú:', err)
    }
  }

  const cargarMesasDisponibles = async () => {
    try {
      const data = await get('/mesas')
      if (data.success) {
        const mesasLibres = data.data.filter(mesa => mesa.estado === 'libre')
        setMesasDisponibles(mesasLibres)
        console.log('📋 Mesas disponibles:', mesasLibres.length)
      }
    } catch (err) {
      console.error('Error cargando mesas:', err)
    }
  }

  const transferirAMesa = async () => {
    if (!mesaSeleccionada) {
      showAutoCloseAlert('error', 'Selecciona una mesa')
      return
    }

    if (items.length === 0) {
      showAutoCloseAlert('warning', 'El carrito está vacío')
      return
    }

    try {
      setTransferring(true)
      
      // Abrir la mesa
      const mesaData = await post(`/mesas/${mesaSeleccionada}/abrir`, {
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono
      })

      if (!mesaData.success) {
        throw new Error('Error abriendo mesa')
      }

      // Agregar cada producto del carrito a la mesa
      for (const item of items) {
        await post(`/mesas/${mesaSeleccionada}/agregar-producto`, {
          producto_id: item.id,
          cantidad: item.cantidad,
          observaciones: item.observaciones || ''
        })
      }

      showAutoCloseAlert('success', `✅ Carrito transferido exitosamente a Mesa ${mesaSeleccionada}`)
      limpiarCarrito()
      setMostrarTransferirMesa(false)
      setMesaSeleccionada('')
      setClienteNombre('')
      setClienteTelefono('')
      
    } catch (err) {
      console.error('Error transfiriendo a mesa:', err)
      showAutoCloseAlert('error', err.message || 'Error transfiriendo a mesa')
    } finally {
      setTransferring(false)
    }
  }

  const handleTransferirMesa = () => {
    if (items.length === 0) {
      showAutoCloseAlert('warning', 'El carrito está vacío')
      return
    }
    
    cargarMesasDisponibles()
    setMostrarTransferirMesa(true)
  }

  const handleAgregarProducto = (producto) => {
    console.log('🛒 Intentando agregar producto:', producto)
    
    // Verificar si el producto está disponible
    if (!producto.stock_disponible) {
      showAutoCloseAlert('warning', `${producto.nombre} no está disponible actualmente`)
      return
    }
    
    agregarProducto(producto)
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

  const handleRemoverProducto = (productoId) => {
    removerProducto(productoId)
  }

  const handleActualizarCantidad = (productoId, cantidad) => {
    actualizarCantidad(productoId, cantidad)
  }

  const handleObservacion = (productoId, observaciones) => {
    agregarObservacion(productoId, observaciones)
    setEditandoObservacion(null)
  }

  const calcularTotalConDescuento = (impuesto) => {
    const totalConImpuesto = calcularTotalConImpuesto(impuesto)
    const descuentoValor = parseFloat(descuento) || 0
    return Math.max(0, totalConImpuesto - descuentoValor)
  }

  const calcularCambio = () => {
    const total = calcularTotalConDescuento(config.impuesto)
    const recibido = parseFloat(pagoRecibido) || total
    return Math.max(0, recibido - total)
  }

  const procesarPedido = async () => {
    if (items.length === 0) {
      alert('El carrito está vacío')
      return
    }

    const total = calcularTotalConDescuento(config.impuesto)
    const recibido = parseFloat(pagoRecibido) || total

    if (recibido < total) {
      alert('El pago recibido debe ser mayor o igual al total')
      return
    }

    try {
      setProcesandoPedido(true)
      
      const pedidoData = {
        items: items.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          precio: item.precio,
          observaciones: item.observaciones || ''
        })),
        forma_pago: formaPago,
        cambio: calcularCambio(),
        observaciones: observaciones,
        descuento: parseFloat(descuento) || 0,
        mesa: null, // Eliminado el campo mesa
        hora_recogida: horaRecogida || null
      }

      console.log('📦 Procesando pedido:', pedidoData)

      const data = await post('/pedidos', pedidoData)
      
      if (data.success) {
        showAutoCloseAlert('success', `Pedido #${data.data.numero_pedido} creado exitosamente`)
        limpiarCarrito()
        setMostrarComanda(false)
        setPagoRecibido('')
        setObservaciones('')
        setFormaPago('efectivo')
        setDescuento('')
        setHoraRecogida('')
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error procesando pedido:', err)
      
      let mensajeError = 'Error procesando pedido'
      if (err.message.includes('SQLITE_CONSTRAINT')) {
        mensajeError = 'Error: Número de pedido duplicado. Intenta nuevamente.'
      } else if (err.message.includes('500')) {
        mensajeError = 'Error del servidor. El pedido se creó pero hubo un problema con el PDF. Revisa la cocina.'
      } else if (err.message) {
        mensajeError = err.message
      }
      
      showAutoCloseAlert('error', mensajeError)
      
      if (err.message.includes('500')) {
        limpiarCarrito()
        setMostrarComanda(false)
        setPagoRecibido('')
        setObservaciones('')
        setFormaPago('efectivo')
        setDescuento('')
        setHoraRecogida('')
      }
    } finally {
      setProcesandoPedido(false)
    }
  }

  const productosFiltrados = categoriaSeleccionada 
    ? menu.find(cat => cat.id === categoriaSeleccionada)?.productos || []
    : menu.flatMap(cat => cat.productos)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando menú...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={cargarMenu}
          className="btn btn-primary"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-6">
      {/* Menú de productos */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Menú</h2>
        
        {/* Filtro de categorías */}
        <div className="mb-6">
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
            {menu.map((categoria) => (
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
        
        <div className="space-y-6">
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
                      disabled={!producto.stock_disponible}
                      className={`w-full btn ${producto.stock_disponible ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {producto.stock_disponible ? 'Agregar' : 'No disponible'}
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            // Mostrar productos organizados por categorías
            menu.map((categoria) => (
              <div key={categoria.id} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {categoria.nombre}
                </h3>
                
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
                          disabled={!producto.stock_disponible}
                          className={`w-full btn ${producto.stock_disponible ? 'btn-primary' : 'btn-secondary opacity-50 cursor-not-allowed'}`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          {producto.stock_disponible ? 'Agregar' : 'No disponible'}
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

      {/* Carrito y comanda */}
      <div className="w-96">
        <div className="card sticky top-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Carrito</h3>
            {items.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={handleTransferirMesa}
                  disabled={transferring}
                  className="btn btn-secondary flex items-center"
                >
                  {transferring ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Transfiriendo...
                    </>
                  ) : (
                    <>
                      <Table className="h-4 w-4 mr-2" />
                      Transferir a Mesa
                    </>
                  )}
                </button>
                <button
                  onClick={() => setMostrarComanda(!mostrarComanda)}
                  className="btn btn-primary"
                >
                  {mostrarComanda ? 'Ocultar Comanda' : 'Ver Comanda'}
                </button>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>El carrito está vacío</p>
            </div>
          ) : (
            <>
              {/* Items del carrito */}
              <div className="space-y-3 mb-4">
                {items.map((item) => (
                  <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.nombre}</div>
                        <div className="text-sm text-gray-600">
                          ${item.precio.toFixed(2)} x {item.cantidad}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleActualizarCantidad(item.id, item.cantidad - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        
                        <span className="font-medium">{item.cantidad}</span>
                        
                        <button
                          onClick={() => handleActualizarCantidad(item.id, item.cantidad + 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        
                        <button
                          onClick={() => handleRemoverProducto(item.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Observaciones del producto */}
                    <div className="mt-2">
                      {editandoObservacion === item.id ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Observaciones..."
                            defaultValue={item.observaciones || ''}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleObservacion(item.id, e.target.value)
                              }
                            }}
                            className="flex-1 text-sm border border-gray-300 rounded px-2 py-1"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditandoObservacion(null)}
                            className="text-sm text-gray-500 hover:text-gray-700"
                          >
                            Cancelar
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {item.observaciones ? (
                              <div className="text-xs text-gray-600 italic">
                                {item.observaciones}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">
                                Sin observaciones
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => setEditandoObservacion(item.id)}
                            className="p-1 text-blue-500 hover:text-blue-700"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${calcularTotal().toFixed(2)}</span>
                </div>
                {config.impuesto > 0 && (
                  <div className="flex justify-between">
                    <span>Impuesto ({config.impuesto}%):</span>
                    <span>${(calcularTotal() * config.impuesto / 100).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>${calcularTotalConDescuento(config.impuesto).toFixed(2)}</span>
                </div>
              </div>

              {/* Comanda */}
              {mostrarComanda && (
                <div className="border-t pt-4 mt-4 space-y-4">
                  {/* Forma de pago */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Forma de pago</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormaPago('efectivo')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                          formaPago === 'efectivo'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
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
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
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
                            : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-25'
                        }`}
                      >
                        📱 Transferencia
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="label">Descuento (dejar vacío si no hay):</label>
                    <input
                      type="number"
                      value={descuento}
                      onChange={(e) => setDescuento(e.target.value)}
                      className="input"
                      placeholder="0.00"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa el monto del descuento a aplicar.
                    </p>
                  </div>

                  <div>
                    <label className="label">Hora de Recogida (opcional):</label>
                    <input
                      type="time"
                      value={horaRecogida}
                      onChange={(e) => setHoraRecogida(e.target.value)}
                      className="input"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Hora estimada para recoger el pedido.
                    </p>
                  </div>

                  <div>
                    <label className="label">Pago recibido (dejar vacío si es exacto):</label>
                    <input
                      type="number"
                      value={pagoRecibido}
                      onChange={(e) => setPagoRecibido(e.target.value)}
                      className="input"
                      placeholder="0.00"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Si dejas vacío, se asume que el cliente pagó exacto
                    </p>
                  </div>

                  {pagoRecibido && (
                    <div className="flex justify-between font-semibold">
                      <span>Cambio:</span>
                      <span>${calcularCambio().toFixed(2)}</span>
                    </div>
                  )}

                  <div>
                    <label className="label">Observaciones del pedido:</label>
                    <textarea
                      value={observaciones}
                      onChange={(e) => setObservaciones(e.target.value)}
                      className="input"
                      rows="3"
                      placeholder="Observaciones generales del pedido..."
                    />
                  </div>

                  <button
                    onClick={procesarPedido}
                    disabled={procesandoPedido}
                    className="w-full btn btn-success"
                  >
                    {procesandoPedido ? 'Procesando...' : 'Confirmar Pedido'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Transferir a Mesa */}
      {mostrarTransferirMesa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transferir a Mesa</h3>
            
            <div className="space-y-4">
              <div>
                <label className="label">Seleccionar Mesa</label>
                <select
                  value={mesaSeleccionada}
                  onChange={(e) => setMesaSeleccionada(e.target.value)}
                  className="input"
                >
                  <option value="">Selecciona una mesa</option>
                  {mesasDisponibles.map((mesa) => (
                    <option key={mesa.numero} value={mesa.numero}>
                      Mesa {mesa.numero}
                    </option>
                  ))}
                </select>
                {mesasDisponibles.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    No hay mesas disponibles
                  </p>
                )}
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

              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Productos a transferir:</h4>
                <div className="space-y-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.nombre} x {item.cantidad}</span>
                      <span className="font-medium">${(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${calcularTotal().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setMostrarTransferirMesa(false)}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={transferirAMesa}
                disabled={loading || !mesaSeleccionada || mesasDisponibles.length === 0}
                className="btn btn-primary"
              >
                {loading ? 'Transfiriendo...' : 'Transferir a Mesa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu 