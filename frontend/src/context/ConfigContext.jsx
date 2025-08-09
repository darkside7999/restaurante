import { createContext, useContext, useState, useEffect } from 'react'
import { useApi } from '../hooks/useApi'

const ConfigContext = createContext()

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState({
    nombre_restaurante: 'Mi Restaurante',
    impuesto: 0,
    horario_apertura: '08:00',
    horario_cierre: '22:00',
    telefono: '',
    direccion: ''
  })
  const [initialized, setInitialized] = useState(false)
  const { loading, error, get, put } = useApi()

  // Cargar configuración al iniciar
  useEffect(() => {
    cargarConfiguracion()
  }, [])

  const cargarConfiguracion = async () => {
    try {
      const data = await get('/config')
      if (data.success && data.data) {
        setConfig(data.data)
      }
    } catch (err) {
      console.error('Error cargando configuración:', err)
      // Si falla, usar configuración por defecto
    } finally {
      setInitialized(true)
    }
  }

  const actualizarConfiguracion = async (nuevaConfig) => {
    try {
      const data = await put('/config', nuevaConfig)
      
      if (data.success) {
        setConfig(data.data)
        return { success: true, message: data.message }
      } else {
        throw new Error(data.error || 'Error actualizando configuración')
      }
    } catch (err) {
      console.error('Error actualizando configuración:', err)
      return { success: false, error: err.message }
    }
  }

  const value = {
    config,
    loading: loading || !initialized,
    error,
    cargarConfiguracion,
    actualizarConfiguracion
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig debe ser usado dentro de un ConfigProvider')
  }
  return context
} 