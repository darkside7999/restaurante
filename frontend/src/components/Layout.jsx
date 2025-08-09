import { Link, useLocation } from 'react-router-dom'
import { useConfig } from '../context/ConfigContext'
import { useCarrito } from '../context/CarritoContext'
import { useSocket } from '../context/SocketContext'
import { 
  Home, 
  ChefHat, 
  BarChart3, 
  Package, 
  Settings,
  ShoppingCart,
  Wifi,
  WifiOff,
  Loader,
  Table
} from 'lucide-react'

function Layout({ children }) {
  const location = useLocation()
  const { config } = useConfig()
  const { cantidadTotal } = useCarrito()
  const { connected, reconnecting } = useSocket()

  const navigation = [
    { name: 'Menú', href: '/', icon: Home },
    { name: 'Mesas', href: '/mesas', icon: Table },
    { name: 'Cocina', href: '/cocina', icon: ChefHat },
    { name: 'Estadísticas', href: '/estadisticas', icon: BarChart3 },
    { name: 'Productos', href: '/productos', icon: Package },
    { name: 'Configuración', href: '/configuracion', icon: Settings },
  ]

  const getConnectionStatus = () => {
    if (reconnecting) {
      return {
        icon: Loader,
        color: 'text-yellow-500',
        text: 'Reconectando...',
        className: 'animate-spin'
      }
    }
    
    if (connected) {
      return {
        icon: Wifi,
        color: 'text-green-500',
        text: 'Conectado',
        className: ''
      }
    }
    
    return {
      icon: WifiOff,
      color: 'text-red-500',
      text: 'Desconectado',
      className: ''
    }
  }

  const connectionStatus = getConnectionStatus()
  const StatusIcon = connectionStatus.icon

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {config.nombre_restaurante}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Estado de conexión */}
              <div className="flex items-center space-x-2">
                <StatusIcon className={`h-4 w-4 ${connectionStatus.color} ${connectionStatus.className}`} />
                <span className={`text-sm font-medium ${connectionStatus.color}`}>
                  {connectionStatus.text}
                </span>
              </div>
              
              {/* Carrito badge */}
              {location.pathname === '/' && (
                <div className="relative">
                  <Link to="/" className="flex items-center p-2 text-gray-600 hover:text-gray-900">
                    <ShoppingCart className="h-6 w-6" />
                    {cantidadTotal() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cantidadTotal()}
                      </span>
                    )}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout 