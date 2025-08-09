import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { io } from 'socket.io-client'
import { getWebSocketUrl } from '../config/api'

const SocketContext = createContext()

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [reconnecting, setReconnecting] = useState(false)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const reconnectTimeout = useRef(null)

  const createSocket = useCallback(() => {
    try {
      console.log('🔌 Creando nueva conexión Socket.io...')
      
      const newSocket = io(getWebSocketUrl(), {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        maxReconnectionAttempts: maxReconnectAttempts,
        forceNew: true
      })

      // Eventos de conexión
      newSocket.on('connect', () => {
        console.log('✅ Conectado al servidor WebSocket')
        setConnected(true)
        setReconnecting(false)
        reconnectAttempts.current = 0
      })

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Desconectado del servidor WebSocket:', reason)
        setConnected(false)
        
        // Si la desconexión no fue intencional, intentar reconectar
        if (reason !== 'io client disconnect' && reconnectAttempts.current < maxReconnectAttempts) {
          setReconnecting(true)
          reconnectAttempts.current++
          
          // Limpiar timeout anterior si existe
          if (reconnectTimeout.current) {
            clearTimeout(reconnectTimeout.current)
          }
          
          // Intentar reconectar después de un delay
          reconnectTimeout.current = setTimeout(() => {
            console.log(`🔄 Intento de reconexión ${reconnectAttempts.current}/${maxReconnectAttempts}`)
            createSocket()
          }, Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000))
        }
      })

      newSocket.on('connect_error', (error) => {
        console.error('❌ Error de conexión WebSocket:', error)
        setConnected(false)
        setReconnecting(true)
      })

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`✅ Reconectado después de ${attemptNumber} intentos`)
        setConnected(true)
        setReconnecting(false)
        reconnectAttempts.current = 0
      })

      newSocket.on('reconnect_error', (error) => {
        console.error('❌ Error en reconexión:', error)
        setReconnecting(true)
      })

      newSocket.on('reconnect_failed', () => {
        console.error('❌ Falló la reconexión después de todos los intentos')
        setConnected(false)
        setReconnecting(false)
      })

      setSocket(newSocket)
      return newSocket
    } catch (error) {
      console.error('❌ Error creando socket:', error)
      setConnected(false)
      setReconnecting(false)
      return null
    }
  }, [])

  useEffect(() => {
    const newSocket = createSocket()

    // Limpiar al desmontar
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      
      if (newSocket) {
        console.log('🔌 Desconectando socket...')
        newSocket.disconnect()
      }
    }
  }, [createSocket])

  const emit = useCallback((event, data) => {
    try {
      if (socket && connected) {
        socket.emit(event, data)
      } else {
        console.warn('⚠️ Socket no disponible para emitir evento:', event)
      }
    } catch (error) {
      console.error('❌ Error emitiendo evento:', event, error)
    }
  }, [socket, connected])

  const on = useCallback((event, callback) => {
    try {
      if (socket) {
        socket.on(event, callback)
      } else {
        console.warn('⚠️ Socket no disponible para escuchar evento:', event)
      }
    } catch (error) {
      console.error('❌ Error agregando listener para evento:', event, error)
    }
  }, [socket])

  const off = useCallback((event, callback) => {
    try {
      if (socket) {
        socket.off(event, callback)
      }
    } catch (error) {
      console.error('❌ Error removiendo listener para evento:', event, error)
    }
  }, [socket])

  const disconnect = useCallback(() => {
    try {
      if (socket) {
        socket.disconnect()
      }
    } catch (error) {
      console.error('❌ Error desconectando socket:', error)
    }
  }, [socket])

  const connect = useCallback(() => {
    try {
      if (socket && !connected) {
        socket.connect()
      }
    } catch (error) {
      console.error('❌ Error conectando socket:', error)
    }
  }, [socket, connected])

  const value = {
    socket,
    connected,
    reconnecting,
    emit,
    on,
    off,
    disconnect,
    connect
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket debe ser usado dentro de un SocketProvider')
  }
  return context
} 