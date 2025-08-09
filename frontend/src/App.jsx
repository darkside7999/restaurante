import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { ConfigProvider } from './context/ConfigContext'
import { CarritoProvider } from './context/CarritoContext'
import Layout from './components/Layout'
import Menu from './pages/Menu'
import Mesas from './pages/Mesas'
import Cocina from './pages/Cocina'
import Estadisticas from './pages/Estadisticas'
import Productos from './pages/Productos'
import Configuracion from './pages/Configuracion'

function App() {
  return (
    <Router>
      <SocketProvider>
        <ConfigProvider>
          <CarritoProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<Menu />} />
                <Route path="/mesas" element={<Mesas />} />
                <Route path="/cocina" element={<Cocina />} />
                <Route path="/estadisticas" element={<Estadisticas />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/configuracion" element={<Configuracion />} />
              </Routes>
            </Layout>
          </CarritoProvider>
        </ConfigProvider>
      </SocketProvider>
    </Router>
  )
}

export default App 