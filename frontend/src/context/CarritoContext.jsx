import { createContext, useContext, useReducer, useCallback } from 'react'

const CarritoContext = createContext()

const carritoReducer = (state, action) => {
  console.log('🔄 Carrito reducer:', action.type, action.payload)
  
  switch (action.type) {
    case 'AGREGAR_PRODUCTO':
      const productoExistente = state.items.find(item => item.id === action.payload.id)
      
      if (productoExistente) {
        console.log('📦 Producto existente, incrementando cantidad:', productoExistente.nombre)
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, cantidad: item.cantidad + 1 }
              : item
          )
        }
      } else {
        console.log('🆕 Producto nuevo, agregando al carrito:', action.payload.nombre)
        return {
          ...state,
          items: [...state.items, { ...action.payload, cantidad: 1 }]
        }
      }

    case 'REMOVER_PRODUCTO':
      console.log('🗑️ Removiendo producto del carrito:', action.payload)
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      }

    case 'ACTUALIZAR_CANTIDAD':
      console.log('📊 Actualizando cantidad:', action.payload)
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, cantidad: action.payload.cantidad }
            : item
        )
      }

    case 'LIMPIAR_CARRITO':
      console.log('🧹 Limpiando carrito')
      return {
        ...state,
        items: []
      }

    case 'AGREGAR_OBSERVACION':
      console.log('📝 Agregando observación:', action.payload)
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, observaciones: action.payload.observaciones }
            : item
        )
      }

    default:
      console.warn('⚠️ Acción desconocida en carrito:', action.type)
      return state
  }
}

export function CarritoProvider({ children }) {
  const [state, dispatch] = useReducer(carritoReducer, {
    items: []
  })

  const agregarProducto = useCallback((producto) => {
    console.log('🛒 Agregando producto al carrito:', producto)
    
    // Validar que el producto tiene los campos necesarios
    if (!producto || !producto.id || !producto.nombre || producto.precio === undefined) {
      console.error('❌ Producto inválido:', producto)
      return
    }
    
    dispatch({ type: 'AGREGAR_PRODUCTO', payload: producto })
    console.log('✅ Producto agregado, estado actual:', state.items.length + 1, 'items')
  }, [state.items.length])

  const removerProducto = useCallback((productoId) => {
    console.log('🗑️ Removiendo producto del carrito:', productoId)
    dispatch({ type: 'REMOVER_PRODUCTO', payload: productoId })
  }, [])

  const actualizarCantidad = useCallback((productoId, cantidad) => {
    console.log('📊 Actualizando cantidad:', productoId, cantidad)
    if (cantidad <= 0) {
      removerProducto(productoId)
    } else {
      dispatch({ type: 'ACTUALIZAR_CANTIDAD', payload: { id: productoId, cantidad } })
    }
  }, [removerProducto])

  const limpiarCarrito = useCallback(() => {
    console.log('🧹 Limpiando carrito')
    dispatch({ type: 'LIMPIAR_CARRITO' })
  }, [])

  const agregarObservacion = useCallback((productoId, observaciones) => {
    console.log('📝 Agregando observación:', productoId, observaciones)
    dispatch({ type: 'AGREGAR_OBSERVACION', payload: { id: productoId, observaciones } })
  }, [])

  const calcularTotal = useCallback(() => {
    const total = state.items.reduce((total, item) => total + (item.precio * item.cantidad), 0)
    console.log('💰 Calculando total:', total, 'de', state.items.length, 'items')
    return total
  }, [state.items])

  const calcularTotalConImpuesto = useCallback((impuesto = 0) => {
    const subtotal = calcularTotal()
    const totalConImpuesto = subtotal + (subtotal * impuesto / 100)
    console.log('💰 Total con impuesto:', totalConImpuesto, 'impuesto:', impuesto + '%')
    return totalConImpuesto
  }, [calcularTotal])

  const cantidadTotal = useCallback(() => {
    const cantidad = state.items.reduce((total, item) => total + item.cantidad, 0)
    console.log('📦 Cantidad total en carrito:', cantidad)
    return cantidad
  }, [state.items])

  const value = {
    items: state.items,
    agregarProducto,
    removerProducto,
    actualizarCantidad,
    limpiarCarrito,
    agregarObservacion,
    calcularTotal,
    calcularTotalConImpuesto,
    cantidadTotal
  }

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  )
}

export function useCarrito() {
  const context = useContext(CarritoContext)
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de un CarritoProvider')
  }
  return context
} 