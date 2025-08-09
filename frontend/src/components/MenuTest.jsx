import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Package, AlertTriangle, XCircle, ShoppingCart } from 'lucide-react'

function MenuTest() {
  const { get } = useApi()
  const [menuData, setMenuData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [testResults, setTestResults] = useState(null)

  const testMenu = async () => {
    try {
      setLoading(true)
      setMenuData(null)
      setTestResults(null)
      
      console.log('🧪 Probando carga del menú...')
      
      const data = await get('/menu')
      
      if (data.success) {
        setMenuData(data.data)
        
        // Analizar los datos del menú
        const totalCategorias = data.data.length
        const totalProductos = data.data.reduce((sum, cat) => sum + cat.productos.length, 0)
        const productosDisponibles = data.data.reduce((sum, cat) => 
          sum + cat.productos.filter(p => p.stock_disponible).length, 0
        )
        const productosSinStock = data.data.reduce((sum, cat) => 
          sum + cat.productos.filter(p => !p.stock_disponible).length, 0
        )
        const productosStockBajo = data.data.reduce((sum, cat) => 
          sum + cat.productos.filter(p => p.stock_disponible && p.stock_bajo).length, 0
        )
        
        setTestResults({
          success: true,
          stats: {
            categorias: totalCategorias,
            productos: totalProductos,
            disponibles: productosDisponibles,
            sinStock: productosSinStock,
            stockBajo: productosStockBajo
          },
          message: 'Menú cargado correctamente'
        })
        
        console.log('✅ Menú cargado:', {
          categorias: totalCategorias,
          productos: totalProductos,
          disponibles: productosDisponibles,
          sinStock: productosSinStock,
          stockBajo: productosStockBajo
        })
        
        alert('✅ Prueba del menú exitosa')
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
      
    } catch (err) {
      console.error('❌ Error probando menú:', err)
      setTestResults({
        success: false,
        error: err.message,
        message: 'Error cargando menú'
      })
      alert('❌ Error probando menú: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const getStockIcon = (stockDisponible, stockBajo) => {
    if (!stockDisponible) {
      return <XCircle className="h-4 w-4 text-red-500" />
    } else if (stockBajo) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    } else {
      return <Package className="h-4 w-4 text-green-500" />
    }
  }

  const getStockText = (stockDisponible, stockBajo) => {
    if (!stockDisponible) {
      return 'Sin stock'
    } else if (stockBajo) {
      return 'Stock bajo'
    } else {
      return 'Disponible'
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 Prueba del Menú</h3>
      
      <div className="space-y-4">
        <button
          onClick={testMenu}
          disabled={loading}
          className="btn btn-primary flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Probando...
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Probar Carga del Menú
            </>
          )}
        </button>

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
            
            {testResults.success && testResults.stats && (
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Categorías:</strong> {testResults.stats.categorias}</div>
                  <div><strong>Total Productos:</strong> {testResults.stats.productos}</div>
                  <div><strong>Disponibles:</strong> {testResults.stats.disponibles}</div>
                  <div><strong>Sin Stock:</strong> {testResults.stats.sinStock}</div>
                  <div><strong>Stock Bajo:</strong> {testResults.stats.stockBajo}</div>
                </div>
              </div>
            )}
            
            {!testResults.success && (
              <div className="text-sm text-red-800">
                <strong>Error:</strong> {testResults.error}
              </div>
            )}
          </div>
        )}

        {/* Vista previa del menú */}
        {menuData && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-3">Vista Previa del Menú:</h4>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {menuData.map((categoria) => (
                <div key={categoria.id} className="p-3 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">
                    {categoria.nombre} ({categoria.productos.length} productos)
                  </h5>
                  <div className="space-y-1">
                    {categoria.productos.slice(0, 3).map((producto) => (
                      <div key={producto.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center">
                          {getStockIcon(producto.stock_disponible, producto.stock_bajo)}
                          <span className="ml-2">{producto.nombre}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs px-2 py-1 rounded ${
                            producto.stock_disponible 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {getStockText(producto.stock_disponible, producto.stock_bajo)}
                          </span>
                          <span className="font-medium">${producto.precio}</span>
                        </div>
                      </div>
                    ))}
                    {categoria.productos.length > 3 && (
                      <div className="text-xs text-gray-500 italic">
                        ... y {categoria.productos.length - 3} productos más
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de depuración */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
            Información de depuración
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono">
            <div><strong>Loading:</strong> {String(loading)}</div>
            <div><strong>Menu Data:</strong> {menuData ? JSON.stringify(menuData, null, 2) : 'None'}</div>
            <div><strong>Test Results:</strong> {testResults ? JSON.stringify(testResults, null, 2) : 'None'}</div>
            <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default MenuTest 