import { useState } from 'react'
import { useConfig } from '../context/ConfigContext'
import ConnectionTest from '../components/ConnectionTest'
import CarritoTest from '../components/CarritoTest'
import CarritoFlowTest from '../components/CarritoFlowTest'
import StockTest from '../components/StockTest'
import MenuTest from '../components/MenuTest'
import { Save, Building2, Clock, Phone, MapPin, Percent } from 'lucide-react'

function Configuracion() {
  const { config, loading, error, actualizarConfiguracion } = useConfig()
  const [formData, setFormData] = useState({
    nombre_restaurante: config.nombre_restaurante,
    impuesto: config.impuesto,
    horario_apertura: config.horario_apertura,
    horario_cierre: config.horario_cierre,
    telefono: config.telefono || '',
    direccion: config.direccion || ''
  })
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje(null)

    try {
      const resultado = await actualizarConfiguracion(formData)
      
      if (resultado.success) {
        setMensaje({ tipo: 'success', texto: resultado.message })
      } else {
        setMensaje({ tipo: 'error', texto: resultado.error })
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error guardando configuración' })
    } finally {
      setGuardando(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando configuración...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-600 mb-4">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Configuración del Restaurante</h2>
        <p className="text-gray-600">Configura la información básica de tu restaurante</p>
      </div>

      {mensaje && (
        <div className={`mb-6 p-4 rounded-lg ${
          mensaje.tipo === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="nombre_restaurante" className="label">
                Nombre del Restaurante *
              </label>
              <input
                type="text"
                id="nombre_restaurante"
                name="nombre_restaurante"
                value={formData.nombre_restaurante}
                onChange={handleInputChange}
                className="input"
                required
                placeholder="Ej: Mi Restaurante"
              />
            </div>

            <div>
              <label htmlFor="telefono" className="label">
                Teléfono
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Ej: +1 234 567 8900"
                />
              </div>
            </div>

            <div>
              <label htmlFor="direccion" className="label">
                Dirección
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  id="direccion"
                  name="direccion"
                  value={formData.direccion}
                  onChange={handleInputChange}
                  className="input pl-10"
                  placeholder="Ej: Calle Principal 123, Ciudad"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horarios */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Horarios de Atención</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="horario_apertura" className="label">
                Hora de Apertura
              </label>
              <input
                type="time"
                id="horario_apertura"
                name="horario_apertura"
                value={formData.horario_apertura}
                onChange={handleInputChange}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="horario_cierre" className="label">
                Hora de Cierre
              </label>
              <input
                type="time"
                id="horario_cierre"
                name="horario_cierre"
                value={formData.horario_cierre}
                onChange={handleInputChange}
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Impuestos */}
        <div className="card">
          <div className="flex items-center mb-4">
            <Percent className="h-5 w-5 text-primary-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Configuración Fiscal</h3>
          </div>
          
          <div>
            <label htmlFor="impuesto" className="label">
              Porcentaje de Impuesto (%)
            </label>
            <input
              type="number"
              id="impuesto"
              name="impuesto"
              value={formData.impuesto}
              onChange={handleInputChange}
              className="input"
              min="0"
              max="100"
              step="0.01"
              placeholder="Ej: 16.00"
            />
            <p className="text-sm text-gray-500 mt-1">
              Este impuesto se aplicará automáticamente a todos los pedidos
            </p>
          </div>
        </div>

        {/* Botón de guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="btn btn-primary"
          >
            <Save className="h-4 w-4 mr-2" />
            {guardando ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>

      {/* Información adicional */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Información Importante</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Los cambios se aplicarán inmediatamente a nuevos pedidos</li>
          <li>• El nombre del restaurante aparecerá en los recibos PDF</li>
          <li>• Los horarios se muestran para referencia del personal</li>
          <li>• El impuesto se calcula automáticamente en cada pedido</li>
        </ul>
      </div>

      {/* Prueba de conexión */}
      <div className="mt-8">
        <ConnectionTest />
      </div>

      {/* Prueba del carrito */}
      <div className="mt-8">
        <CarritoTest />
      </div>

      {/* Prueba del flujo del carrito */}
      <div className="mt-8">
        <CarritoFlowTest />
      </div>

      {/* Prueba del stock */}
      <div className="mt-8">
        <StockTest />
      </div>

      {/* Prueba del menú */}
      <div className="mt-8">
        <MenuTest />
      </div>
    </div>
  )
}

export default Configuracion 