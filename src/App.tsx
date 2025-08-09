import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Menu from './pages/Menu';
import Kitchen from './pages/Kitchen';
import Reports from './pages/Reports';
import Management from './pages/Management';
import { ThemeProvider } from './context/ThemeContext';
import { OrderProvider } from './context/OrderContext';

function App() {
  return (
    <ThemeProvider>
      <OrderProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <Navbar />
            <main className="pt-16">
              <Routes>
                <Route path="/" element={<Menu />} />
                <Route path="/kitchen" element={<Kitchen />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/management" element={<Management />} />
              </Routes>
            </main>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                className: 'dark:bg-gray-800 dark:text-white'
              }}
            />
          </div>
        </Router>
      </OrderProvider>
    </ThemeProvider>
  );
}

export default App;