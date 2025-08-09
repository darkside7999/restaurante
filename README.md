# 🍽️ Restaurante App

Aplicación web local para gestión de restaurante con frontend y backend distribuidos.

## 🚀 Características

- **Menú dinámico** con productos y categorías
- **Sistema de pedidos** con carrito de compras
- **Vista de cocina** en tiempo real con WebSocket
- **Generación automática de recibos** en PDF
- **Estadísticas** de ventas por día/semana/mes
- **Configuración** del restaurante (nombre, impuestos, horarios)
- **Sin login** - funciona completamente en red local

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- SQLite (base de datos local)
- Socket.io (comunicación en tiempo real)
- PDFKit (generación de recibos)
- CORS, Body-parser, Day.js

### Frontend
- React + Vite
- TailwindCSS
- React Router
- Socket.io-client
- Context API

## 📦 Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd restaurante
```

2. **Instalar dependencias**
```bash
npm run install:all
```

3. **Ejecutar en desarrollo**
```bash
npm run dev
```

Esto iniciará:
- Backend en `http://localhost:3000`
- Frontend en `http://localhost:5173`

## 🏗️ Estructura del Proyecto

```
restaurante/
├── frontend/          # Aplicación React
├── backend/           # Servidor Node.js
├── package.json       # Configuración del monorepo
└── README.md
```

## 📋 Uso

1. **Configuración inicial**: Ve a Configuración y establece el nombre del restaurante, impuestos y horarios
2. **Agregar productos**: Ve a Productos para crear categorías y productos
3. **Tomar pedidos**: Usa el Menú para agregar productos al carrito y generar pedidos
4. **Cocina**: Los pedidos aparecen automáticamente en la vista de cocina
5. **Estadísticas**: Revisa las ventas en la sección de Estadísticas

## 🔧 Scripts Disponibles

- `npm run dev` - Ejecutar frontend y backend en desarrollo
- `npm run build` - Construir frontend para producción
- `npm run install:all` - Instalar todas las dependencias

## 📄 Recibos

Los recibos se generan automáticamente en formato PDF y se guardan en:
```
backend/recibos/año/mes/día/pedido-001.pdf
```

## 🌐 Red Local

La aplicación está diseñada para funcionar en red local (LAN). Todos los clientes se conectan al mismo servidor y reciben actualizaciones en tiempo real. 