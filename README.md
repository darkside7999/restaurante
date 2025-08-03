# 🍽️ Sistema de Gestión para Restaurantes

Una aplicación web completa para la gestión de restaurantes construida con **Node.js/Express** en el backend y **React/Vite/TailwindCSS** en el frontend.

## ✨ Características Principales

### 🧾 Gestión de Menú
- **Productos organizados por categorías**: Pizzas, Hamburguesas, Bebidas, Entrantes, Postres
- **CRUD completo**: Crear, editar, desactivar y eliminar productos
- **Información detallada**: Nombre, precio, descripción y categoría para cada producto

### 🛒 Sistema de Comandas
- **Carrito de compras interactivo** con productos del menú
- **Notas personalizadas** por producto (ingredientes extra, preferencias)
- **Métodos de pago**: Tarjeta y Efectivo
- **Recibos automáticos**: Generación de PDF y vista previa de 3 segundos
- **Almacenamiento persistente** en archivos JSON organizados por fecha

### 👨‍🍳 Vista de Cocina
- **Dashboard en tiempo real** para gestionar pedidos
- **Estados de pedidos**: Pendiente → Listo → Servido → Cancelado
- **Actualización automática** cada 30 segundos
- **Filtros por estado** y vista de estadísticas del día
- **Interfaz intuitiva** con colores diferenciados por estado

### 📊 Panel de Ventas y Análisis
- **Estadísticas detalladas**: Ingresos totales, número de pedidos, ticket promedio
- **Gráficos interactivos** con Recharts:
  - Ingresos por hora/día
  - Número de pedidos por período
  - Distribución de ventas por producto
- **Filtros temporales**: Hoy, Última semana, Último mes
- **Exportación de datos** a CSV
- **Ranking de productos** más vendidos

### 🌐 Funcionalidad Offline
- **Almacenamiento local** con localStorage del navegador
- **Sincronización automática** cuando se recupera la conexión
- **Indicador de estado** online/offline en tiempo real
- **Funcionamiento completo** sin conexión a internet

### 🌙 Modo Oscuro
- **Tema oscuro/claro** con toggle manual
- **Persistencia** de preferencias en localStorage
- **Transiciones suaves** entre temas
- **Compatibilidad total** en todos los componentes

## 🛠️ Tecnologías Utilizadas

### Backend
- **Node.js** con ES Modules
- **Express.js** para el servidor web
- **Puppeteer** para generación de PDFs
- **fs-extra** para manejo de archivos
- **CORS** para comunicación frontend-backend
- **UUID** para IDs únicos

### Frontend
- **React 19** con hooks modernos
- **Vite** como bundler ultrarrápido
- **TailwindCSS** para estilos modernos
- **React Router** para navegación SPA
- **Recharts** para gráficos interactivos
- **Lucide React** para iconos SVG
- **Axios** para peticiones HTTP
- **date-fns** para manejo de fechas
- **react-hot-toast** para notificaciones

## 📦 Instalación y Configuración

### Prerrequisitos
- **Node.js** 18+ 
- **npm** o **yarn**

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd restaurante
```

### 2. Instalar dependencias del frontend
```bash
npm install
```

### 3. Instalar dependencias del backend
```bash
cd backend
npm install
cd ..
```

### 4. Inicializar estructura de directorios
El backend creará automáticamente los directorios necesarios:
- `backend/data/` - Datos de productos y pedidos
- `backend/data/orders/` - Archivos JSON de pedidos por día
- `backend/receipts/YYYY/MM/DD/` - PDFs de recibos organizados por fecha

## 🚀 Ejecución

### Desarrollo (Recommended)
Ejecuta ambos servidores simultáneamente:

```bash
# Terminal 1: Backend (Puerto 3001)
cd backend
npm run dev

# Terminal 2: Frontend (Puerto 5173)
npm run dev
```

### Producción
```bash
# Backend
cd backend
npm start

# Frontend (build y serve)
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
restaurante/
├── src/                          # Frontend React
│   ├── components/
│   │   └── Layout.jsx           # Layout principal con navegación
│   ├── contexts/
│   │   └── ThemeContext.jsx     # Contexto para modo oscuro
│   ├── hooks/
│   │   └── useOffline.js        # Hook para funcionalidad offline
│   ├── pages/
│   │   ├── Menu.jsx             # Página principal del menú
│   │   ├── Kitchen.jsx          # Vista de cocina
│   │   ├── Sales.jsx            # Panel de ventas
│   │   └── Products.jsx         # Gestión de productos
│   ├── services/
│   │   └── api.js               # Cliente API con Axios
│   └── main.jsx                 # Punto de entrada
├── backend/                      # Backend Node.js
│   ├── data/
│   │   ├── products.js          # Datos de productos iniciales
│   │   └── orders/              # Pedidos por día (JSON)
│   ├── receipts/                # PDFs organizados por fecha
│   ├── server.js                # Servidor Express principal
│   └── package.json             # Dependencias del backend
├── public/                       # Archivos estáticos
├── tailwind.config.js           # Configuración de TailwindCSS
├── vite.config.js               # Configuración de Vite
└── package.json                 # Dependencias del frontend
```

## 📱 Uso de la Aplicación

### Para Tomar Pedidos
1. Accede a la página principal (**Menú**)
2. Selecciona productos por categoría
3. Añade productos al carrito con notas opcionales
4. Procede al pago (Tarjeta/Efectivo)
5. El recibo se genera automáticamente

### Para la Cocina
1. Ve a **Cocina** para ver pedidos pendientes
2. Marca pedidos como "Listo" cuando estén preparados
3. Marca como "Servido" cuando se entreguen
4. Usa filtros para organizar la vista

### Para Gestión
1. **Productos**: CRUD completo de productos y categorías
2. **Ventas**: Análisis detallado con gráficos y exportación
3. Todos los datos se almacenan localmente en archivos

## 🗃️ Almacenamiento de Datos

### Productos
- Archivo: `backend/data/products.js`
- Estructura: Categorías e items con precios y descripciones

### Pedidos
- Archivos: `backend/data/orders/pedidos-YYYY-MM-DD.json`
- Un archivo por día con todos los pedidos

### Recibos PDF
- Carpetas: `backend/receipts/YYYY/MM/DD/`
- Archivo por pedido: `recibo-{orderId}.pdf`

### Datos Offline
- localStorage del navegador para funcionamiento sin conexión
- Sincronización automática al recuperar conexión

## 🔧 Personalización

### Añadir Nuevas Categorías
Edita `backend/data/products.js` y añade categorías al array `categories`.

### Modificar Colores/Temas
Personaliza `tailwind.config.js` para cambiar la paleta de colores.

### Añadir Métodos de Pago
Modifica `src/pages/Menu.jsx` en la función `processPayment`.

## 🌐 Compatibilidad

- ✅ **Navegadores modernos** (Chrome, Firefox, Safari, Edge)
- ✅ **Dispositivos móviles** (responsive design)
- ✅ **Tabletas** (interfaz optimizada)
- ✅ **Modo offline** (localStorage + sincronización)
- ✅ **Impresión** de recibos (PDF)

## 🚀 Características Avanzadas

### PWA Ready
La aplicación está preparada para ser una Progressive Web App:
- Funciona offline
- Responsive design
- Interfaz nativa en móviles

### Escalabilidad
- Fácil migración a base de datos (MongoDB, PostgreSQL)
- API REST preparada para múltiples clientes
- Arquitectura modular y mantenible

### Seguridad
- Validación de datos en frontend y backend
- Sanitización de inputs
- CORS configurado correctamente

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

---

**¡Disfruta gestionando tu restaurante! 🍽️**
