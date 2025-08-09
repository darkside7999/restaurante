import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  ingredients: string[];
}

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onConfirm: (customizations: string) => void;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  product,
  onConfirm
}) => {
  const [customizations, setCustomizations] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(customizations);
    setCustomizations('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Personalizar: {product.name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Precio: <span className="font-semibold">€{product.price.toFixed(2)}</span>
            </p>
            
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Ingredientes:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {product.ingredients.join(', ')}
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Personalizaciones (opcional)
            </label>
            <textarea
              value={customizations}
              onChange={(e) => setCustomizations(e.target.value)}
              placeholder="Ej: Sin cebolla, extra queso, salsa aparte..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Añadir a Comanda
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;