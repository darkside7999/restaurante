import { useState, useCallback } from 'react'
import { API_BASE_URL } from '../config/api'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const request = useCallback(async (endpoint, options = {}, retries = 3) => {
    const url = `${API_BASE_URL}${endpoint}`
    
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        setLoading(true)
        setError(null)
        
        // Crear un AbortController para manejar timeouts
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout
        
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          signal: controller.signal,
          ...options
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        if (data.success === false) {
          throw new Error(data.error || 'Error en la respuesta del servidor')
        }

        return data
      } catch (err) {
        console.error(`Intento ${attempt}/${retries} falló:`, err)
        
        // Si es un error de timeout o red, intentar de nuevo
        if (err.name === 'AbortError') {
          console.warn('Timeout en la petición, reintentando...')
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          console.warn('Error de red, reintentando...')
        }
        
        if (attempt === retries) {
          setError(err.message)
          throw err
        }
        
        // Esperar antes del siguiente intento (backoff exponencial)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      } finally {
        setLoading(false)
      }
    }
  }, [])

  const get = useCallback((endpoint) => {
    return request(endpoint, { method: 'GET' })
  }, [request])

  const post = useCallback((endpoint, data) => {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }, [request])

  const put = useCallback((endpoint, data) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }, [request])

  const del = useCallback((endpoint) => {
    return request(endpoint, { method: 'DELETE' })
  }, [request])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    loading,
    error,
    clearError,
    request,
    get,
    post,
    put,
    delete: del
  }
} 