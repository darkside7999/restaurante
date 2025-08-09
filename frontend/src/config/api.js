// Configuración de la API
const getApiBaseUrl = () => {
  // Si estamos en desarrollo, usar la IP de la red
  if (import.meta.env.DEV) {
    // Obtener la IP del host actual
    const hostname = window.location.hostname;
    
    // Si estamos accediendo desde localhost, usar localhost para la API
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000/api';
    }
    
    // Si estamos accediendo desde la red, usar la misma IP para la API
    return `http://${hostname}:3000/api`;
  }
  
  // En producción, usar la URL relativa
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Configuración de WebSocket
export const getWebSocketUrl = () => {
  if (import.meta.env.DEV) {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    
    return `http://${hostname}:3000`;
  }
  
  return window.location.origin;
};

console.log('🔧 Configuración API:', {
  API_BASE_URL,
  WebSocket_URL: getWebSocketUrl(),
  hostname: window.location.hostname,
  isDev: import.meta.env.DEV
}); 