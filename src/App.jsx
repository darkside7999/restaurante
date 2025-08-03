import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Menu from './pages/Menu';
import Kitchen from './pages/Kitchen';
import Sales from './pages/Sales';
import Products from './pages/Products';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Layout>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/cocina" element={<Kitchen />} />
          <Route path="/ventas" element={<Sales />} />
          <Route path="/productos" element={<Products />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;
