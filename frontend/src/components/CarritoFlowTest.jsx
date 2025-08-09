import { useState } from 'react'
import { useCarrito } from '../context/CarritoContext'
import { useApi } from '../hooks/useApi'
import { ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react'

function CarritoFlowTest() {
  const { items, agregarProducto, removerProducto, actualizarCantidad, limpiarCarrito, cantidadTotal } = useCarrito()
  const { get } = useApi()
  const [testProduct, setTestProduct] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState(null)

  const loadTestProduct = async () => {
    try {
      setLoading(true)
      console.log('🧪 Cargando producto de prueba...')
      
      const data = await get('/menu/productos')
      
      if (data.success && data.data.length > 0) {
        const producto = data.data[0]
        setTestProduct(producto)
        console.log('✅ Producto de prueba cargado:', producto)
        setTestResults({
          success: true,
          message: 'Producto de prueba cargado correctamente',
          producto: producto
        })
      } else {
        throw new Error('No hay productos disponibles para probar')
      }
    } catch (err) {
      console.error('❌ Error cargando producto de prueba:', err)
      setTestResults({
        success: false,
        error: err.message,
        message: 'Error cargando producto de prueba'
      })
    } finally {
      setLoading(false)
    }
  }

  const testAddProduct = () => {
    if (!testProduct) {
      alert('Primero carga un producto de prueba')
      return
    }

    console.log('🧪 Probando agregar producto al carrito...')
    agregarProducto(testProduct)
    
    setTestResults({
      success: true,
      message: 'Producto agregado al carrito',
      producto: testProduct
    })
  }

  const testUpdateQuantity = () => {
    if (items.length === 0) {
      alert('Primero agrega un producto al carrito')
      return
    }

    const firstItem = items[0]
    console.log('🧪 Probando actualizar cantidad...')
    actualizarCantidad(firstItem.id, firstItem.cantidad + 1)
    
    setTestResults({
      success: true,
      message: 'Cantidad actualizada',
      item: firstItem
    })
  }

  const testRemoveProduct = () => {
    if (items.length === 0) {
      alert('Primero agrega un producto al carrito')
      return
    }

    const firstItem = items[0]
    console.log('🧪 Probando remover producto...')
    removerProducto(firstItem.id)
    
    setTestResults({
      success: true,
      message: 'Producto removido del carrito',
      item: firstItem
    })
  }

  const testClearCart = () => {
    if (items.length === 0) {
      alert('El carrito ya está vacío')
      return
    }

    console.log('🧪 Probando limpiar carrito...')
    limpiarCarrito()
    
    setTestResults({
      success: true,
      message: 'Carrito limpiado',
      itemsCount: items.length
    })
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 Prueba de Flujo del Carrito</h3>
      
      <div className="space-y-4">
        {/* Cargar producto de prueba */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Paso 1: Cargar Producto de Prueba</h4>
          <button
            onClick={loadTestProduct}
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cargando...
              </>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Cargar Producto de Prueba
              </>
            )}
          </button>
          
          {testProduct && (
            <div className="mt-3 p-3 bg-white rounded border">
              <div className="font-medium">{testProduct.nombre}</div>
              <div className="text-sm text-gray-600">${testProduct.precio}</div>
              <div className="text-xs text-gray-500">
                Stock: {testProduct.stock_disponible ? 'Disponible' : 'No disponible'}
              </div>
            </div>
          )}
        </div>

        {/* Pruebas del carrito */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-medium text-green-900 mb-2">Paso 2: Pruebas del Carrito</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={testAddProduct}
              disabled={!testProduct}
              className="btn btn-success flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar al Carrito
            </button>
            
            <button
              onClick={testUpdateQuantity}
              disabled={items.length === 0}
              className="btn btn-secondary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Incrementar Cantidad
            </button>
            
            <button
              onClick={testRemoveProduct}
              disabled={items.length === 0}
              className="btn btn-danger flex items-center"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remover Producto
            </button>
            
            <button
              onClick={testClearCart}
              disabled={items.length === 0}
              className="btn btn-warning flex items-center"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Limpiar Carrito
            </button>
          </div>
        </div>

        {/* Estado actual del carrito */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Estado Actual del Carrito</h4>
          <div className="space-y-2">
            <div><strong>Total de items:</strong> {cantidadTotal()}</div>
            <div><strong>Productos únicos:</strong> {items.length}</div>
            
            {items.length > 0 && (
              <div className="mt-3">
                <div className="font-medium mb-2">Items en el carrito:</div>
                <div className="space-y-1">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-white rounded border">
                      <div>
                        <div className="font-medium">{item.nombre}</div>
                        <div className="text-gray-600">${item.precio} x {item.cantidad}</div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-medium">{item.cantidad}</span>
                        <button
                          onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resultados de prueba */}
        {testResults && (
          <div className={`p-4 rounded-lg border ${
            testResults.success 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <h4 className={`font-medium mb-2 ${
              testResults.success ? 'text-green-900' : 'text-red-900'
            }`}>
              {testResults.message}
            </h4>
            
            {testResults.error && (
              <div className="text-sm text-red-800">
                <strong>Error:</strong> {testResults.error}
              </div>
            )}
          </div>
        )}

        {/* Información de depuración */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
            Información de depuración
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono">
            <div><strong>Test Product:</strong> {testProduct ? JSON.stringify(testProduct, null, 2) : 'None'}</div>
            <div><strong>Cart Items:</strong> {JSON.stringify(items, null, 2)}</div>
            <div><strong>Items Count:</strong> {items.length}</div>
            <div><strong>Total Quantity:</strong> {cantidadTotal()}</div>
            <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default CarritoFlowTest 