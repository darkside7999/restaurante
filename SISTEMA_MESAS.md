# Sistema de Mesas - Gestión de Pedidos Pendientes

## 🎯 Descripción

El sistema de mesas permite gestionar pedidos que no han sido pagados aún, facilitando la administración de clientes que están comiendo en el restaurante. Desde aquí se pueden abrir mesas, agregar/eliminar productos, y procesar pagos cuando el cliente termine.

## 🏗️ Estructura de la Base de Datos

### Tabla `mesas`

```sql
CREATE TABLE mesas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero INTEGER UNIQUE NOT NULL,
  estado TEXT DEFAULT 'libre',
  pedido_id INTEGER,
  cliente_nombre TEXT,
  cliente_telefono TEXT,
  hora_apertura DATETIME,
  hora_cierre DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE SET NULL
)
```

### Modificación a `pedidos`

Se agregó la columna `mesa` para asociar pedidos con mesas específicas.

## 🔧 Funcionalidades

### 1. Gestión de Mesas

- **Abrir Mesa**: Crear un nuevo pedido pendiente para una mesa
- **Ver Estado**: Visualizar mesas libres y ocupadas
- **Información del Cliente**: Nombre y teléfono opcionales

### 2. Gestión de Productos

- **Agregar Productos**: Añadir productos al pedido de la mesa
- **Eliminar Productos**: Remover productos del pedido
- **Observaciones**: Agregar notas específicas por producto

### 3. Procesamiento de Pagos

- **Múltiples Formas de Pago**: Efectivo, tarjeta, transferencia
- **Cálculo de Cambio**: Automático basado en el pago recibido
- **Cierre de Mesa**: Liberar la mesa después del pago

### 4. Cancelación

- **Cancelar Mesa**: Cancelar pedido sin cobrar
- **Liberar Mesa**: Devolver la mesa al estado libre

## 🚀 Instalación y Configuración

### 1. Migrar Base de Datos

```bash
cd backend
node migrate-mesas.js
```

### 2. Reiniciar Servicios

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run dev
```

### 3. Verificar Instalación

1. Ir a **Mesas** en el menú de navegación
2. Verificar que aparecen las mesas de ejemplo (1-8)
3. Probar abrir una mesa

## 📱 Interfaz de Usuario

### Vista Principal de Mesas

- **Grid de Mesas**: Muestra todas las mesas con su estado
- **Indicadores Visuales**:
  - 🟢 **Verde**: Mesa libre
  - 🔴 **Rojo**: Mesa ocupada
- **Información Rápida**: Cliente, productos, total, hora

### Detalles de Mesa

- **Productos del Pedido**: Lista con cantidades y precios
- **Acciones Disponibles**:
  - ➕ Agregar Producto
  - 💳 Pagar
  - ❌ Cancelar

### Modales

- **Abrir Mesa**: Número, cliente, teléfono
- **Agregar Producto**: Selección, cantidad, observaciones
- **Pagar**: Forma de pago, monto recibido, cambio

## 🔌 API Endpoints

### GET `/api/mesas`

Obtiene todas las mesas con sus pedidos activos.

### GET `/api/mesas/:numero`

Obtiene una mesa específica con su pedido.

### POST `/api/mesas/:numero/abrir`

Abre una mesa y crea un pedido pendiente.

### POST `/api/mesas/:numero/agregar-producto`

Agrega un producto al pedido de la mesa.

### DELETE `/api/mesas/:numero/producto/:item_id`

Elimina un producto del pedido.

### POST `/api/mesas/:numero/cerrar`

Paga el pedido y libera la mesa.

### POST `/api/mesas/:numero/cancelar`

Cancela el pedido y libera la mesa.

## 🔄 Flujo de Trabajo

### 1. Abrir Mesa

```
Cliente llega → Abrir Mesa → Ingresar datos → Crear pedido pendiente
```

### 2. Agregar Productos

```
Seleccionar mesa → Agregar Producto → Elegir producto/cantidad → Confirmar
```

### 3. Gestionar Pedido

```
Ver productos → Modificar cantidades → Agregar observaciones → Eliminar productos
```

### 4. Procesar Pago

```
Cliente termina → Pagar Mesa → Elegir forma de pago → Calcular cambio → Cerrar mesa
```

## 🎨 Estados de Mesa

### Libre

- **Color**: Verde
- **Acciones**: Abrir mesa
- **Descripción**: Mesa disponible para nuevos clientes

### Ocupada

- **Color**: Rojo
- **Acciones**: Agregar productos, pagar, cancelar
- **Descripción**: Mesa con pedido activo

## 📊 Información Mostrada

### En Cada Mesa

- **Número de mesa**
- **Estado** (libre/ocupada)
- **Cliente** (nombre y teléfono)
- **Productos** (cantidad total)
- **Total** a pagar
- **Hora** de apertura

### En Detalles

- **Lista completa** de productos
- **Precios individuales** y subtotales
- **Observaciones** por producto
- **Total general**

## 🔔 Eventos WebSocket

### `mesas_actualizadas`

Se emite cuando:

- Se abre una mesa
- Se agrega/elimina un producto
- Se paga o cancela una mesa

### `pedido_actualizado`

Se emite cuando se modifica un pedido específico.

### `pedido_pagado`

Se emite cuando se completa un pago.

### `pedido_cancelado`

Se emite cuando se cancela un pedido.

## 🛠️ Funciones Principales

### Frontend (`Mesas.jsx`)

- `cargarMesas()`: Obtiene todas las mesas
- `abrirMesa()`: Crea nueva mesa con pedido
- `agregarProductoAMesa()`: Añade producto al pedido
- `removerProducto()`: Elimina producto del pedido
- `pagarMesa()`: Procesa el pago y cierra mesa
- `cancelarMesa()`: Cancela pedido y libera mesa

### Backend (`mesas.js`)

- Gestión completa de CRUD para mesas
- Validaciones de estado y permisos
- Cálculos automáticos de totales
- Emisión de eventos WebSocket

## 🔍 Casos de Uso

### Restaurante Físico

1. **Cliente llega** → Mesero abre mesa
2. **Toma pedido** → Agrega productos a la mesa
3. **Cliente pide más** → Agrega productos adicionales
4. **Cliente termina** → Procesa pago y cierra mesa

### Restaurante con Delivery

1. **Pedido por teléfono** → Abrir mesa virtual
2. **Agregar productos** → Según pedido del cliente
3. **Preparar pedido** → Ver productos en cocina
4. **Entregar y cobrar** → Procesar pago

## 🚨 Consideraciones

### Seguridad

- Validación de estados de mesa
- Verificación de permisos
- Prevención de operaciones duplicadas

### Rendimiento

- Actualizaciones en tiempo real
- Carga eficiente de datos
- Optimización de consultas

### Usabilidad

- Interfaz intuitiva
- Feedback visual inmediato
- Confirmaciones para acciones críticas

## 📈 Próximas Mejoras

### Funcionalidades Planificadas

- **Reservas**: Sistema de reservas por mesa
- **Turnos**: Gestión de turnos de meseros
- **Estadísticas**: Métricas por mesa
- **Impresión**: Tickets por mesa
- **Múltiples Pedidos**: Varios pedidos por mesa

### Mejoras Técnicas

- **Caché**: Optimización de consultas
- **Notificaciones**: Alertas push
- **Backup**: Respaldo automático
- **Logs**: Registro detallado de operaciones

## 🆘 Solución de Problemas

### Mesa No Se Abre

1. Verificar que el número no esté en uso
2. Revisar logs del backend
3. Confirmar que la base de datos esté actualizada

### Productos No Se Agregan

1. Verificar que la mesa esté ocupada
2. Confirmar que el producto esté disponible
3. Revisar permisos de usuario

### Pago No Se Procesa

1. Verificar que haya productos en la mesa
2. Confirmar que el monto sea válido
3. Revisar conexión con la base de datos

## 📞 Soporte

Para reportar problemas o solicitar mejoras:

1. Revisar logs del sistema
2. Documentar pasos para reproducir
3. Incluir información del entorno
4. Proporcionar capturas de pantalla si es necesario
