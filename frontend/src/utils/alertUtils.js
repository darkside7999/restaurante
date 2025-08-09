// Utilidades para manejar alerts de manera más elegante

// Función para obtener la configuración de tiempo de alert
const getAlertDuration = () => {
  // Por defecto 3 segundos, pero se puede configurar desde el backend
  return 3000
}

// Función para mostrar alert y cerrarlo automáticamente después de un tiempo
export const showAutoCloseAlert = (type = 'success', message, duration = null) => {
  // Usar la duración configurada si no se especifica una
  const alertDuration = duration || getAlertDuration()
  
  // Definir colores según el tipo
  const colors = {
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6'
  }
  
  const color = colors[type] || colors.success
  
  // Crear un div para el alert personalizado
  const alertDiv = document.createElement('div')
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${color};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 300px;
    word-wrap: break-word;
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
  `
  
  // Agregar estilos de animación
  const style = document.createElement('style')
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `
  document.head.appendChild(style)
  
  alertDiv.textContent = message
  document.body.appendChild(alertDiv)
  
  // Cerrar automáticamente después del tiempo especificado
  setTimeout(() => {
    alertDiv.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv)
      }
    }, 300)
  }, alertDuration)
  
  // Permitir cerrar manualmente al hacer clic
  alertDiv.addEventListener('click', () => {
    alertDiv.style.animation = 'slideOut 0.3s ease-in'
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv)
      }
    }, 300)
  })
  
  return alertDiv
}

// Función para mostrar alert de confirmación personalizado
export const showConfirmAlert = (message) => {
  return new Promise((resolve) => {
    // Crear overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `
    
    // Crear modal
    const modal = document.createElement('div')
    modal.style.cssText = `
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 400px;
      width: 90%;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `
    
    modal.innerHTML = `
      <div style="margin-bottom: 20px; font-size: 16px; color: #374151;">${message}</div>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button id="confirm-yes" style="
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">Sí</button>
        <button id="confirm-no" style="
          background: #6b7280;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        ">No</button>
      </div>
    `
    
    overlay.appendChild(modal)
    document.body.appendChild(overlay)
    
    // Event listeners
    const handleYes = () => {
      document.body.removeChild(overlay)
      resolve(true)
    }
    
    const handleNo = () => {
      document.body.removeChild(overlay)
      resolve(false)
    }
    
    const handleOverlay = (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay)
        resolve(false)
      }
    }
    
    modal.querySelector('#confirm-yes').addEventListener('click', handleYes)
    modal.querySelector('#confirm-no').addEventListener('click', handleNo)
    overlay.addEventListener('click', handleOverlay)
    
    // Cerrar con Escape
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay)
        document.removeEventListener('keydown', handleEscape)
        resolve(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
  })
} 