import { useState } from 'react'
import { useCarrito } from '../context/CarritoContext'

function CarritoTest() {
  const { items, agregarProducto, cantidadTotal } = useCarrito()
  const [testProduct] = useState({
    id: 999,
    nombre: 'Producto de Prueba',
    precio: 10.50,
    descripcion: 'Producto para probar el carrito'
  })

  const handleTestAdd = () => {
    console.log('🧪 Probando agregar producto de prueba...')
    try {
      agregarProducto(testProduct)
      console.log('✅ Producto de prueba agregado exitosamente')
    } catch (error) {
      console.error('❌ Error agregando producto de prueba:', error)
    }
  }

  const handleTestAddMultiple = () => {
    console.log('🧪 Probando agregar múltiples productos...')
    for (let i = 0; i < 3; i++) {
      try {
        agregarProducto({
          ...testProduct,
          id: 999 + i,
          nombre: `Producto de Prueba ${i + 1}`
        })
      } catch (error) {
        console.error(`❌ Error agregando producto ${i + 1}:`, error)
      }
    }
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">🧪 Prueba del Carrito</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleTestAdd}
            className="btn btn-primary"
          >
            Agregar 1 Producto de Prueba
          </button>
          
          <button
            onClick={handleTestAddMultiple}
            className="btn btn-secondary"
          >
            Agregar 3 Productos de Prueba
          </button>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Estado del Carrito:</h4>
          <div className="space-y-1 text-sm">
            <div><strong>Total de items:</strong> {cantidadTotal()}</div>
            <div><strong>Items en carrito:</strong> {items.length}</div>
            <div><strong>Items:</strong></div>
            <ul className="ml-4 space-y-1">
              {items.map((item, index) => (
                <li key={index} className="text-xs">
                  {item.nombre} - Cantidad: {item.cantidad} - Precio: ${item.precio}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
            Información de depuración
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono">
            <div><strong>Items:</strong> {JSON.stringify(items, null, 2)}</div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default CarritoTest 