import React, { createContext, useContext, useState } from 'react';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  customizations: string;
  subtotal: number;
}

interface OrderContextType {
  currentOrder: OrderItem[];
  addToOrder: (product: any, customizations?: string) => void;
  removeFromOrder: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  updateCustomizations: (itemId: string, customizations: string) => void;
  clearOrder: () => void;
  getOrderTotal: () => number;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);

  const addToOrder = (product: any, customizations: string = '') => {
    const existingItemIndex = currentOrder.findIndex(
      item => item.productId === product._id && item.customizations === customizations
    );

    if (existingItemIndex >= 0) {
      const updatedOrder = [...currentOrder];
      updatedOrder[existingItemIndex].quantity += 1;
      updatedOrder[existingItemIndex].subtotal = 
        updatedOrder[existingItemIndex].quantity * updatedOrder[existingItemIndex].price;
      setCurrentOrder(updatedOrder);
    } else {
      const newItem: OrderItem = {
        id: `${product._id}-${Date.now()}`,
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        customizations,
        subtotal: product.price
      };
      setCurrentOrder([...currentOrder, newItem]);
    }
  };

  const removeFromOrder = (itemId: string) => {
    setCurrentOrder(currentOrder.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(itemId);
      return;
    }

    setCurrentOrder(currentOrder.map(item => 
      item.id === itemId 
        ? { ...item, quantity, subtotal: item.price * quantity }
        : item
    ));
  };

  const updateCustomizations = (itemId: string, customizations: string) => {
    setCurrentOrder(currentOrder.map(item => 
      item.id === itemId 
        ? { ...item, customizations }
        : item
    ));
  };

  const clearOrder = () => {
    setCurrentOrder([]);
  };

  const getOrderTotal = () => {
    return currentOrder.reduce((total, item) => total + item.subtotal, 0);
  };

  return (
    <OrderContext.Provider value={{
      currentOrder,
      addToOrder,
      removeFromOrder,
      updateQuantity,
      updateCustomizations,
      clearOrder,
      getOrderTotal
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};