import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Manejar errores de conexión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.code === 'NETWORK_ERROR') {
      console.warn('API offline, usando modo offline');
    }
    return Promise.reject(error);
  }
);

// Productos
export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`),
};

// Pedidos
export const ordersAPI = {
  getToday: () => api.get('/orders/today'),
  getByDate: (date) => api.get(`/orders/${date}`),
  create: (order) => api.post('/orders', order),
  update: (id, updates) => api.put(`/orders/${id}`, updates),
  generateReceipt: (order, paymentMethod) => 
    api.post('/generate-receipt', { order, paymentMethod }),
};

// Estadísticas
export const statsAPI = {
  getToday: () => api.get('/stats/today'),
  getRange: (startDate, endDate) => 
    api.get(`/stats/range?startDate=${startDate}&endDate=${endDate}`),
};

export default api;