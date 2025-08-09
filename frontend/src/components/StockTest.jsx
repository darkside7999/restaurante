import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { Package, AlertTriangle, XCircle } from 'lucide-react'

function StockTest() {
  const { get, put } = useApi()
  const [testResults, setTestResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const testStockUpdate = async () => {
    try {
      setLoading(true)
      setTestResults(null)
      
      console.log('🧪 Iniciando prueba de actualización de stock...')
      
      // Primero obtener productos para tener un ID válido
      const productosData = await get('/menu/productos')
      
      if (!productosData.success || !productosData.data.length) {
        throw new Error('No hay productos disponibles para probar')
      }
      
      const testProduct = productosData.data[0]
      console.log('📦 Producto de prueba:', testProduct)
      
      // Probar actualización de stock
      const updateData = {
        stock_disponible: !testProduct.stock_disponible, // Cambiar al estado opuesto
        stock_bajo: !testProduct.stock_bajo
      }
      
      console.log('🔄 Intentando actualizar stock:', updateData)
      
      const updateResult = await put(`/stock/${testProduct.id}`, updateData)
      
      if (updateResult.success) {
        console.log('✅ Stock actualizado exitosamente')
        
        // Verificar que el cambio se aplicó
        const verifyData = await get('/menu/productos')
        const updatedProduct = verifyData.data.find(p => p.id === testProduct.id)
        
        setTestResults({
          success: true,
          original: {
            stock_disponible: testProduct.stock_disponible,
            stock_bajo: testProduct.stock_bajo
          },
          updated: {
            stock_disponible: updatedProduct.stock_disponible,
            stock_bajo: updatedProduct.stock_bajo
          },
          message: 'Stock actualizado correctamente'
        })
        
        alert('✅ Prueba de stock exitosa')
      } else {
        throw new Error(updateResult.error || 'Error desconocido en la actualización')
      }
      
    } catch (err) {
      console.error('❌ Error en prueba de stock:', err)
      setTestResults({
        success: false,
        error: err.message,
        message: 'Error en la prueba de stock'
      })
      alert('❌ Error en prueba de stock: ' + err.message)
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 Prueba de Stock</h3>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Esta prueba cambiará el estado de stock del primer producto disponible.
            Se recomienda hacer esta prueba en un producto de prueba.
          </p>
        </div>

        <button
          onClick={testStockUpdate}
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
              <Package className="h-4 w-4 mr-2" />
              Probar Actualización de Stock
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
            
            {testResults.success && (
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Estado Original:</strong>
                  <div className="flex items-center mt-1">
                    {getStockIcon(testResults.original.stock_disponible, testResults.original.stock_bajo)}
                    <span className="ml-2">
                      {getStockText(testResults.original.stock_disponible, testResults.original.stock_bajo)}
                    </span>
                  </div>
                </div>
                
                <div>
                  <strong>Estado Actualizado:</strong>
                  <div className="flex items-center mt-1">
                    {getStockIcon(testResults.updated.stock_disponible, testResults.updated.stock_bajo)}
                    <span className="ml-2">
                      {getStockText(testResults.updated.stock_disponible, testResults.updated.stock_bajo)}
                    </span>
                  </div>
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

        {/* Información de depuración */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
            Información de depuración
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono">
            <div><strong>Loading:</strong> {String(loading)}</div>
            <div><strong>Test Results:</strong> {testResults ? JSON.stringify(testResults, null, 2) : 'None'}</div>
            <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default StockTest 