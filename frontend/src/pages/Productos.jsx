import { useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { useSocket } from '../context/SocketContext'
import { Plus, Edit, Trash2, Package, Tag, AlertTriangle, XCircle } from 'lucide-react'

function Productos() {
  const [categorias, setCategorias] = useState([])
  const [productos, setProductos] = useState([])
  const [mostrarFormCategoria, setMostrarFormCategoria] = useState(false)
  const [mostrarFormProducto, setMostrarFormProducto] = useState(false)
  const [editandoCategoria, setEditandoCategoria] = useState(null)
  const [editandoProducto, setEditandoProducto] = useState(null)
  const [editandoStock, setEditandoStock] = useState(null)
  
  // Estados para formularios
  const [nuevaCategoria, setNuevaCategoria] = useState({ nombre: '', descripcion: '' })
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
    stock_disponible: true,
    stock_bajo: false
  })
  
  // Estados para alertas de stock
  const [productosStockBajo, setProductosStockBajo] = useState([])
  const [productosSinStock, setProductosSinStock] = useState([])
  const [mostrarAlertas, setMostrarAlertas] = useState(false)
  
  // Formulario categoría
  const [formCategoria, setFormCategoria] = useState({
    nombre: '',
    descripcion: '',
    orden: 0
  })
  
  // Formulario producto
  const [formProducto, setFormProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    categoria_id: '',
    stock_disponible: true,
    stock_bajo: false,
    imagen: ''
  })

  const { loading, error, get, post, put, delete: del } = useApi()
  const { on, off } = useSocket()

  useEffect(() => {
    cargarDatos()
    
    // Escuchar actualizaciones del menú
    on('menu_actualizado', () => {
      console.log('🔄 Productos actualizados automáticamente')
      cargarDatos()
    })
    
    // Escuchar alertas de stock
    on('alerta_stock', (data) => {
      console.log('⚠️ Alerta de stock:', data)
      alert(`${data.producto.nombre}: ${data.tipo === 'sin_stock' ? 'Sin stock' : 'Stock bajo'}`)
      cargarDatos()
    })
    
    return () => {
      off('menu_actualizado')
      off('alerta_stock')
    }
  }, [on, off])

  const cargarDatos = async () => {
    try {
      const [categoriasData, productosData, stockBajoData, sinStockData] = await Promise.all([
        get('/menu/categorias'),
        get('/menu/productos'),
        get('/stock/bajo'),
        get('/stock/sin-stock')
      ])

      if (categoriasData.success) setCategorias(categoriasData.data)
      if (productosData.success) setProductos(productosData.data)
      if (stockBajoData.success) setProductosStockBajo(stockBajoData.data)
      if (sinStockData.success) setProductosSinStock(sinStockData.data)
    } catch (err) {
      console.error('Error cargando datos:', err)
    }
  }

  const actualizarStock = async (productoId, stockDisponible, stockBajo) => {
    try {
      console.log('🔄 Actualizando stock:', { productoId, stockDisponible, stockBajo })
      
      const data = await put(`/stock/${productoId}`, {
        stock_disponible: stockDisponible,
        stock_bajo: stockBajo
      })

      if (data.success) {
        console.log('✅ Estado de stock actualizado exitosamente')
        alert('Stock actualizado correctamente')
        setEditandoStock(null)
        await cargarDatos()
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('❌ Error actualizando stock:', err)
      alert('Error actualizando stock: ' + err.message)
    }
  }

  const getStockStatus = (producto) => {
    if (!producto.stock_disponible) {
      return { status: 'sin_stock', icon: <XCircle className="h-4 w-4 text-red-500" />, text: 'Sin stock' }
    } else if (producto.stock_bajo) {
      return { status: 'bajo', icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />, text: 'Stock bajo' }
    } else {
      return { status: 'ok', icon: <Package className="h-4 w-4 text-green-500" />, text: 'Disponible' }
    }
  }

  // Funciones para categorías
  const handleSubmitCategoria = async (e) => {
    e.preventDefault()
    
    try {
      console.log('🔄 Guardando categoría:', formCategoria)
      
      let data
      if (editandoCategoria) {
        data = await put(`/menu/categorias/${editandoCategoria.id}`, formCategoria)
      } else {
        data = await post('/menu/categorias', formCategoria)
      }
      
      if (data.success) {
        console.log('✅ Categoría guardada exitosamente')
        alert(editandoCategoria ? 'Categoría actualizada correctamente' : 'Categoría creada correctamente')
        await cargarDatos()
        setMostrarFormCategoria(false)
        setEditandoCategoria(null)
        setFormCategoria({ nombre: '', descripcion: '', orden: 0 })
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('❌ Error guardando categoría:', err)
      alert('Error guardando categoría: ' + err.message)
    }
  }

  const editarCategoria = (categoria) => {
    console.log('✏️ Editando categoría:', categoria)
    setEditandoCategoria(categoria)
    setFormCategoria({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      orden: categoria.orden || 0
    })
    setMostrarFormCategoria(true)
  }

  const eliminarCategoria = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return
    }

    try {
      console.log('🗑️ Eliminando categoría:', id)
      
      const data = await del(`/menu/categorias/${id}`)
      
      if (data.success) {
        console.log('✅ Categoría eliminada exitosamente')
        alert('Categoría eliminada correctamente')
        await cargarDatos()
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('❌ Error eliminando categoría:', err)
      alert('Error eliminando categoría: ' + err.message)
    }
  }

  // Funciones para productos
  const handleSubmitProducto = async (e) => {
    e.preventDefault()
    
    try {
      const productoData = {
        nombre: formProducto.nombre,
        descripcion: formProducto.descripcion,
        precio: parseFloat(formProducto.precio),
        categoria_id: formProducto.categoria_id,
        stock_disponible: formProducto.stock_disponible,
        stock_bajo: formProducto.stock_bajo
      }
      
      console.log('🔄 Guardando producto:', productoData)
      
      if (editandoProducto) {
        const data = await put(`/menu/productos/${editandoProducto.id}`, productoData)
        if (data.success) {
          console.log('✅ Producto actualizado exitosamente')
          alert('Producto actualizado correctamente')
          setMostrarFormProducto(false)
          setEditandoProducto(null)
          setFormProducto({
            nombre: '',
            descripcion: '',
            precio: '',
            categoria_id: '',
            stock_disponible: true,
            stock_bajo: false,
            imagen: ''
          })
          await cargarDatos()
        } else {
          throw new Error(data.error || 'Error desconocido')
        }
      } else {
        const data = await post('/menu/productos', productoData)
        if (data.success) {
          console.log('✅ Producto creado exitosamente')
          alert('Producto creado correctamente')
          setMostrarFormProducto(false)
          setFormProducto({
            nombre: '',
            descripcion: '',
            precio: '',
            categoria_id: '',
            stock_disponible: true,
            stock_bajo: false,
            imagen: ''
          })
          await cargarDatos()
        } else {
          throw new Error(data.error || 'Error desconocido')
        }
      }
    } catch (err) {
      console.error('❌ Error guardando producto:', err)
      alert('Error guardando producto: ' + err.message)
    }
  }

  const editarProducto = (producto) => {
    console.log('✏️ Editando producto:', producto)
    setEditandoProducto(producto)
    setFormProducto({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      precio: producto.precio.toString(),
      categoria_id: producto.categoria_id.toString(),
      stock_disponible: producto.stock_disponible,
      stock_bajo: producto.stock_bajo,
      imagen: producto.imagen || ''
    })
    setMostrarFormProducto(true)
  }

  const eliminarProducto = async (id) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return
    }

    try {
      console.log('🗑️ Eliminando producto:', id)
      
      const data = await del(`/menu/productos/${id}`)
      
      if (data.success) {
        console.log('✅ Producto eliminado exitosamente')
        alert('Producto eliminado correctamente')
        await cargarDatos()
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('❌ Error eliminando producto:', err)
      alert('Error eliminando producto: ' + err.message)
    }
  }

  const getCategoriaNombre = (categoriaId) => {
    const categoria = categorias.find(c => c.id === categoriaId)
    return categoria ? categoria.nombre : 'Sin categoría'
  }

  const totalAlertas = productosStockBajo.length + productosSinStock.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando productos...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button 
          onClick={cargarDatos}
          className="btn btn-primary"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Productos y Categorías</h2>
        <div className="flex gap-2">
          {/* Botón de alertas de stock */}
          {totalAlertas > 0 && (
            <button
              onClick={() => setMostrarAlertas(!mostrarAlertas)}
              className="btn btn-warning flex items-center gap-2"
            >
              <AlertTriangle className="h-4 w-4" />
              Alertas ({totalAlertas})
            </button>
          )}
          <button
            onClick={() => setMostrarFormCategoria(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Categoría
          </button>
          <button
            onClick={() => setMostrarFormProducto(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Sección de alertas de stock */}
      {mostrarAlertas && totalAlertas > 0 && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Alertas de Stock
          </h3>
          
          {/* Productos fuera de stock */}
          {productosSinStock.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Fuera de Stock ({productosSinStock.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {productosSinStock.map(producto => (
                  <div key={producto.id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="font-medium text-red-900">{producto.nombre}</div>
                    <div className="text-sm text-red-700">{producto.categoria_nombre}</div>
                    <div className="text-xs text-red-600">Stock: 0</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Productos con stock bajo */}
          {productosStockBajo.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-700 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Stock Bajo ({productosStockBajo.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {productosStockBajo.map(producto => (
                  <div key={producto.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="font-medium text-yellow-900">{producto.nombre}</div>
                    <div className="text-sm text-yellow-700">{producto.categoria_nombre}</div>
                    <div className="text-xs text-yellow-600">
                      Stock: {producto.stock} (Mín: {producto.stock_minimo})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categorías */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map((categoria) => (
            <div key={categoria.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{categoria.nombre}</h3>
                  {categoria.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{categoria.descripcion}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">Orden: {categoria.orden}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => editarCategoria(categoria)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => eliminarCategoria(categoria.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {productos.map((producto) => {
            const stockStatus = getStockStatus(producto)
            return (
              <div key={producto.id} className={`card ${stockStatus.status === 'sin_stock' ? 'border-red-300 bg-red-50' : stockStatus.status === 'bajo' ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{producto.nombre}</h3>
                    <p className="text-sm text-gray-600">{producto.descripcion}</p>
                    <p className="text-lg font-bold text-primary-600">${producto.precio}</p>
                    <p className="text-sm text-gray-500">{getCategoriaNombre(producto.categoria_id)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {stockStatus.icon}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      stockStatus.status === 'sin_stock' ? 'bg-red-100 text-red-800' :
                      stockStatus.status === 'bajo' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {stockStatus.text}
                    </span>
                  </div>
                </div>
                
                  {/* Información de stock */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`font-medium ${
                        stockStatus.status === 'sin_stock' ? 'text-red-600' :
                        stockStatus.status === 'bajo' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {stockStatus.text}
                      </span>
                    </div>
                  </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditandoStock(producto)}
                    className="btn btn-sm btn-outline flex-1"
                  >
                    Editar Stock
                  </button>
                  <button
                    onClick={() => setEditandoProducto(producto)}
                    className="btn btn-sm btn-primary"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto.id)}
                    className="btn btn-sm btn-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal Categoría */}
      {mostrarFormCategoria && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editandoCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
            </h3>
            
            <form onSubmit={handleSubmitCategoria} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  value={formCategoria.nombre}
                  onChange={(e) => setFormCategoria({...formCategoria, nombre: e.target.value})}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label">Descripción</label>
                <textarea
                  value={formCategoria.descripcion}
                  onChange={(e) => setFormCategoria({...formCategoria, descripcion: e.target.value})}
                  className="input"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="label">Orden</label>
                <input
                  type="number"
                  value={formCategoria.orden}
                  onChange={(e) => setFormCategoria({...formCategoria, orden: parseInt(e.target.value)})}
                  className="input"
                  min="0"
                />
              </div>
              
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1">
                  {editandoCategoria ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormCategoria(false)
                    setEditandoCategoria(null)
                    setFormCategoria({ nombre: '', descripcion: '', orden: 0 })
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Producto */}
      {mostrarFormProducto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editandoProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            
            <form onSubmit={handleSubmitProducto} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input
                  type="text"
                  value={formProducto.nombre}
                  onChange={(e) => setFormProducto({...formProducto, nombre: e.target.value})}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label">Descripción</label>
                <textarea
                  value={formProducto.descripcion}
                  onChange={(e) => setFormProducto({...formProducto, descripcion: e.target.value})}
                  className="input"
                  rows="3"
                />
              </div>
              
              <div>
                <label className="label">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={formProducto.precio}
                  onChange={(e) => setFormProducto({...formProducto, precio: e.target.value})}
                  className="input"
                  required
                />
              </div>
              
              <div>
                <label className="label">Categoría</label>
                <select
                  value={formProducto.categoria_id}
                  onChange={(e) => setFormProducto({...formProducto, categoria_id: e.target.value})}
                  className="input"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="stock_disponible_form"
                    checked={formProducto.stock_disponible}
                    onChange={(e) => setFormProducto({...formProducto, stock_disponible: e.target.checked})}
                    className="h-4 w-4 text-primary-600 rounded border-gray-300"
                  />
                  <label htmlFor="stock_disponible_form" className="text-sm font-medium text-gray-700">
                    Producto disponible para pedidos
                  </label>
                </div>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="stock_bajo_form"
                    checked={formProducto.stock_bajo}
                    onChange={(e) => setFormProducto({...formProducto, stock_bajo: e.target.checked})}
                    className="h-4 w-4 text-yellow-600 rounded border-gray-300"
                  />
                  <label htmlFor="stock_bajo_form" className="text-sm font-medium text-gray-700">
                    Alerta de stock bajo
                  </label>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button type="submit" className="btn btn-primary flex-1">
                  {editandoProducto ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormProducto(false)
                    setEditandoProducto(null)
                    setFormProducto({
                      nombre: '',
                      descripcion: '',
                      precio: '',
                      categoria_id: '',
                      stock_disponible: true,
                      stock_bajo: false,
                      imagen: ''
                    })
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar stock */}
      {editandoStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Editar Estado de Stock: {editandoStock.nombre}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="stock_disponible"
                  checked={editandoStock.stock_disponible}
                  onChange={(e) => setEditandoStock({
                    ...editandoStock,
                    stock_disponible: e.target.checked
                  })}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300"
                />
                <label htmlFor="stock_disponible" className="text-sm font-medium text-gray-700">
                  Producto disponible para pedidos
                </label>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="stock_bajo"
                  checked={editandoStock.stock_bajo}
                  onChange={(e) => setEditandoStock({
                    ...editandoStock,
                    stock_bajo: e.target.checked
                  })}
                  className="h-4 w-4 text-yellow-600 rounded border-gray-300"
                />
                <label htmlFor="stock_bajo" className="text-sm font-medium text-gray-700">
                  Alerta de stock bajo
                </label>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> Si desmarcas "Producto disponible", no aparecerá en el menú para pedidos.
                </p>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => actualizarStock(editandoStock.id, editandoStock.stock_disponible, editandoStock.stock_bajo)}
                className="btn btn-primary flex-1"
              >
                Guardar
              </button>
              <button
                onClick={() => setEditandoStock(null)}
                className="btn btn-outline flex-1"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Productos 