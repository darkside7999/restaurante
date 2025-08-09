import { useState } from 'react'
import { useSocket } from '../context/SocketContext'
import { useApi } from '../hooks/useApi'
import { Wifi, WifiOff, RefreshCw, TestTube } from 'lucide-react'

function ConnectionTest() {
  const { connected, reconnecting, connect, disconnect } = useSocket()
  const { loading, error, get, clearError } = useApi()
  const [testResults, setTestResults] = useState(null)

  const testConnection = async () => {
    try {
      setTestResults(null)
      clearError()
      
      console.log('🧪 Iniciando prueba de conexión...')
      
      // Probar conexión a la API
      const menuData = await get('/menu')
      
      if (menuData.success) {
        setTestResults({
          api: '✅ Conectado',
          socket: connected ? '✅ Conectado' : '❌ Desconectado',
          reconnecting: reconnecting ? '🔄 Reconectando' : '✅ Estable'
        })
        
        alert('Prueba de conexión exitosa')
        console.log('✅ Prueba de conexión completada:', menuData.data.length, 'productos cargados')
      } else {
        throw new Error('Error en la respuesta de la API')
      }
    } catch (err) {
      console.error('❌ Error en prueba de conexión:', err)
      setTestResults({
        api: '❌ Error',
        socket: connected ? '✅ Conectado' : '❌ Desconectado',
        reconnecting: reconnecting ? '🔄 Reconectando' : '✅ Estable',
        error: err.message
      })
      alert('Error en la prueba de conexión: ' + err.message)
    }
  }

  const forceReconnect = () => {
    try {
      disconnect()
      setTimeout(() => {
        connect()
      }, 1000)
      alert('Reconexión forzada iniciada')
    } catch (err) {
      console.error('Error forzando reconexión:', err)
      alert('Error forzando reconexión')
    }
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <TestTube className="h-5 w-5 mr-2" />
          Prueba de Conexión
        </h3>
        
        <div className="flex items-center space-x-2">
          {connected ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-500" />
          )}
          
          {reconnecting && (
            <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Estado actual */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600">Estado Socket</div>
            <div className={`text-lg font-semibold ${connected ? 'text-green-600' : 'text-red-600'}`}>
              {connected ? 'Conectado' : 'Desconectado'}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600">Reconexión</div>
            <div className={`text-lg font-semibold ${reconnecting ? 'text-yellow-600' : 'text-green-600'}`}>
              {reconnecting ? 'En progreso' : 'Estable'}
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-600">API</div>
            <div className={`text-lg font-semibold ${loading ? 'text-yellow-600' : error ? 'text-red-600' : 'text-green-600'}`}>
              {loading ? 'Probando...' : error ? 'Error' : 'Disponible'}
            </div>
          </div>
        </div>

        {/* Resultados de prueba */}
        {testResults && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Resultados de la última prueba:</h4>
            <div className="space-y-1 text-sm">
              <div><strong>API:</strong> {testResults.api}</div>
              <div><strong>Socket:</strong> {testResults.socket}</div>
              <div><strong>Estado:</strong> {testResults.reconnecting}</div>
              {testResults.error && (
                <div className="text-red-600"><strong>Error:</strong> {testResults.error}</div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex space-x-3">
          <button
            onClick={testConnection}
            disabled={loading}
            className="btn btn-primary flex items-center"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <TestTube className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Probando...' : 'Probar Conexión'}
          </button>
          
          <button
            onClick={forceReconnect}
            disabled={reconnecting}
            className="btn btn-secondary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Forzar Reconexión
          </button>
        </div>

        {/* Información de depuración */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-900">
            Información de depuración
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs font-mono">
            <div><strong>Socket Connected:</strong> {String(connected)}</div>
            <div><strong>Reconnecting:</strong> {String(reconnecting)}</div>
            <div><strong>API Loading:</strong> {String(loading)}</div>
            <div><strong>API Error:</strong> {error || 'None'}</div>
            <div><strong>Timestamp:</strong> {new Date().toLocaleString()}</div>
          </div>
        </details>
      </div>
    </div>
  )
}

export default ConnectionTest 