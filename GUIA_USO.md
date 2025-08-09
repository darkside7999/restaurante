# 📖 Guía de Uso - Restaurante App

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd restaurante

# Instalación automática
node setup.js

# O instalación manual
npm run install:all
cd backend && npm run init-db
```

### 2. Ejecutar la aplicación

```bash
# Desarrollo (frontend + backend)
npm run dev

# Solo backend
npm run dev:backend

# Solo frontend
npm run dev:frontend
```

### 3. Acceder a la aplicación

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **Recibos PDF**: http://localhost:3000/recibos

---

## 🍽️ Funcionalidades Principales

### 📋 Menú

- **Vista de productos**: Organizados por categorías
- **Carrito de compras**: Agregar/remover productos
- **Cálculo automático**: Subtotal, impuestos, total
- **Comanda**: Forma de pago, cambio, observaciones
- **Generación de pedidos**: Con PDF automático

### 👨‍🍳 Cocina

- **Pedidos en tiempo real**: WebSocket para actualizaciones
- **Estados de pedidos**: Pendiente → En preparación → Listo → Entregado
- **Gestión de pedidos**: Marcar como listo, eliminar
- **Información detallada**: Items, observaciones, totales

### 📊 Estadísticas

- **Métricas principales**: Total pedidos, ventas, promedio
- **Análisis por período**: Hoy, ayer, semana, mes
- **Ventas por forma de pago**: Efectivo, tarjeta, transferencia
- **Productos más vendidos**: Ranking y cantidades
- **Ventas por hora**: Gráfico de actividad diaria
- **Historial de ventas**: Últimos 7 días

### 🛍️ Gestión de Productos

- **Categorías**: Crear, editar, eliminar
- **Productos**: Agregar, modificar, desactivar
- **Stock**: Control de inventario (opcional)
- **Precios**: Gestión de costos

### ⚙️ Configuración

- **Información del restaurante**: Nombre, teléfono, dirección
- **Horarios**: Apertura y cierre
- **Impuestos**: Porcentaje automático
- **Configuración general**: Datos del negocio

---

## 🔧 Configuración Inicial

### 1. Configurar el Restaurante

1. Ve a **Configuración**
2. Completa la información básica:
   - Nombre del restaurante
   - Teléfono y dirección
   - Horarios de atención
   - Porcentaje de impuesto

### 2. Crear Categorías

1. Ve a **Productos**
2. Haz clic en "Nueva Categoría"
3. Agrega categorías como:
   - Bebidas
   - Platos Principales
   - Postres
   - Entradas

### 3. Agregar Productos

1. En **Productos**, haz clic en "Nuevo Producto"
2. Completa la información:
   - Nombre y descripción
   - Precio
   - Categoría
   - Stock (opcional)

---

## 📱 Uso Diario

### Tomar Pedidos

1. **Menú**: Selecciona productos del carrito
2. **Carrito**: Revisa items y cantidades
3. **Comanda**: Configura forma de pago y cambio
4. **Confirmar**: Genera pedido y PDF automáticamente

### Gestión en Cocina

1. **Vista Cocina**: Los pedidos aparecen automáticamente
2. **Estados**: Cambia el estado según el progreso
3. **Marcar listo**: Cuando el pedido esté terminado
4. **Entregado**: Confirmar entrega al cliente

### Revisar Estadísticas

1. **Estadísticas**: Ve a la sección correspondiente
2. **Períodos**: Selecciona el rango de tiempo
3. **Métricas**: Analiza ventas y rendimiento
4. **Exportar**: Los datos se pueden revisar en tiempo real

---

## 🔌 API Endpoints

### Menú

- `GET /api/menu` - Obtener menú completo
- `GET /api/menu/categorias` - Solo categorías
- `GET /api/menu/productos` - Solo productos

### Pedidos

- `GET /api/pedidos` - Listar pedidos
- `GET /api/pedidos/activos` - Pedidos pendientes
- `POST /api/pedidos` - Crear pedido
- `PUT /api/pedidos/:id/estado` - Actualizar estado
- `DELETE /api/pedidos/:id` - Eliminar pedido

### Configuración

- `GET /api/config` - Obtener configuración
- `PUT /api/config` - Actualizar configuración

### Estadísticas

- `GET /api/stats` - Estadísticas generales
- `GET /api/stats/ventas-diarias` - Ventas por día
- `GET /api/stats/productos` - Estadísticas de productos
- `GET /api/stats/categorias` - Estadísticas por categoría

---

## 📄 Recibos PDF

### Características

- **Generación automática**: Al crear cada pedido
- **Organización por fecha**: Año/Mes/Día
- **Información completa**: Productos, totales, impuestos
- **Personalizable**: Nombre del restaurante, datos de contacto

### Ubicación

```
backend/recibos/
├── 2024/
│   ├── 01/
│   │   ├── 15/
│   │   │   ├── pedido-20240115-001.pdf
│   │   │   └── pedido-20240115-002.pdf
│   │   └── 16/
│   └── 02/
```

### Acceso Web

- URL: `http://localhost:3000/recibos/año/mes/día/pedido-XXX.pdf`
- Ejemplo: `http://localhost:3000/recibos/2024/01/15/pedido-20240115-001.pdf`

---

## 🌐 Red Local

### Configuración

- **Servidor**: Configurado para red local (LAN)
- **Puertos**: Frontend (5173), Backend (3000)
- **WebSocket**: Comunicación en tiempo real
- **Múltiples clientes**: Todos conectados al mismo servidor

### Uso en Red

1. **Servidor principal**: Ejecuta la aplicación
2. **Clientes**: Acceden desde navegadores
3. **Sincronización**: Todos ven los mismos datos
4. **Cocina**: Recibe pedidos en tiempo real

---

## 🛠️ Mantenimiento

### Base de Datos

- **Ubicación**: `backend/database/restaurante.db`
- **Backup**: Copia regular del archivo .db
- **Restauración**: Reemplazar el archivo .db

### Logs

- **Servidor**: Consola del terminal
- **Errores**: Se muestran en tiempo real
- **WebSocket**: Estado de conexiones

### Actualizaciones

- **Código**: Git pull para actualizar
- **Dependencias**: `npm install` en cada carpeta
- **Base de datos**: Se mantiene automáticamente

---

## ❓ Solución de Problemas

### Error de Conexión

- Verificar que el backend esté ejecutándose
- Revisar puertos 3000 y 5173
- Comprobar firewall/antivirus

### Base de Datos

- Ejecutar `npm run init-db` en backend
- Verificar permisos de escritura
- Revisar espacio en disco

### WebSocket

- Verificar conexión a internet
- Revisar configuración de proxy
- Comprobar firewall

### PDFs

- Verificar permisos de escritura en `backend/recibos/`
- Comprobar espacio en disco
- Revisar configuración de PDFKit

---

## 📞 Soporte

### Información del Sistema

- **Versión**: 1.0.0
- **Node.js**: Requerido 16+
- **Base de datos**: SQLite
- **Frontend**: React + Vite
- **Backend**: Express + Socket.io

### Recursos

- **Documentación**: README.md
- **Código fuente**: Repositorio Git
- **Issues**: Sistema de tickets del proyecto

---

## 🎯 Mejores Prácticas

### Uso Diario

1. **Configurar horarios** antes de abrir
2. **Revisar productos** y precios regularmente
3. **Monitorear estadísticas** semanalmente
4. **Hacer backup** de la base de datos

### Mantenimiento

1. **Actualizar dependencias** mensualmente
2. **Revisar logs** de errores
3. **Limpiar archivos** PDF antiguos
4. **Optimizar base de datos** si es necesario

### Seguridad

1. **Usar solo en red local**
2. **No exponer a internet**
3. **Mantener actualizado**
4. **Backup regular de datos**
