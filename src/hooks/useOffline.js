import { useState, useEffect } from 'react';

const STORAGE_KEYS = {
  products: 'restaurant-products',
  orders: 'restaurant-orders',
  pendingOrders: 'restaurant-pending-orders',
};

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Guardar datos en localStorage
  const saveToLocal = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Obtener datos de localStorage
  const getFromLocal = (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  };

  // Productos offline
  const saveProducts = (products) => saveToLocal(STORAGE_KEYS.products, products);
  const getProducts = () => getFromLocal(STORAGE_KEYS.products);

  // Pedidos offline
  const saveOrders = (orders) => saveToLocal(STORAGE_KEYS.orders, orders);
  const getOrders = () => getFromLocal(STORAGE_KEYS.orders) || [];

  // Pedidos pendientes de sincronizar
  const savePendingOrder = (order) => {
    const pending = getFromLocal(STORAGE_KEYS.pendingOrders) || [];
    pending.push(order);
    saveToLocal(STORAGE_KEYS.pendingOrders, pending);
  };

  const getPendingOrders = () => getFromLocal(STORAGE_KEYS.pendingOrders) || [];

  const clearPendingOrders = () => saveToLocal(STORAGE_KEYS.pendingOrders, []);

  return {
    isOnline,
    saveProducts,
    getProducts,
    saveOrders,
    getOrders,
    savePendingOrder,
    getPendingOrders,
    clearPendingOrders,
  };
};