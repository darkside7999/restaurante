# Hora de Recogida y Alerts Mejorados

## 🎯 Nuevas Funcionalidades Implementadas

### 1. Hora de Recogida en Pedidos
- **Campo opcional**: Hora estimada para recoger el pedido
- **Formato**: Input de tipo "time" (HH:MM)
- **Disponible en**: Menú principal y sistema de mesas
- **Almacenamiento**: Base de datos SQLite

### 2. Alerts Automáticos Configurables
- **Tiempo configurable**: 3 segundos por defecto (ajustable)
- **Sin confirmaciones**: Los alerts se cierran automáticamente
- **Tipos visuales**: Success, Error, Warning, Info
- **Posición**: Esquina superior derecha

## 📱 Implementación en Frontend

### Menú Principal (/menu)
```javascript
// Campo de hora de recogida
const [horaRecogida, setHoraRecogida] = useState('')

// En el formulario de comanda
<input
  type="time"
  value={horaRecogida}
  onChange={(e) => setHoraRecogida(e.target.value)}
  className="input"
/>
```

### Sistema de Mesas (/mesas)
```javascript
// Campo de hora de recogida en modal de pagar
<input
  type="time"
  value={horaRecogida}
  onChange={(e) => setHoraRecogida(e.target.value)}
  className="input"
/>
```

## 🗄️ Cambios en Base de Datos

### Nueva Columna en Tabla `pedidos`
```sql
ALTER TABLE pedidos ADD COLUMN hora_recogida TEXT;
```

### Estructura Actualizada
```sql
CREATE TABLE pedidos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_pedido TEXT UNIQUE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  impuesto DECIMAL(10,2) DEFAULT 0.00,
  total_con_impuesto DECIMAL(10,2) NOT NULL,
  forma_pago TEXT NOT NULL,
  cambio DECIMAL(10,2) DEFAULT 0.00,
  estado TEXT DEFAULT 'pendiente',
  mesa INTEGER,
  observaciones TEXT,
  hora_recogida TEXT,  -- ← NUEVA COLUMNA
  pdf_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Configuración de Alerts

### Archivo de Configuración
```json
{
  "ui": {
    "alertDuration": 3000,
    "autoCloseAlerts": true
  }
}
```

### Utilidades de Alert
```javascript
// frontend/src/utils/alertUtils.js
export const showAutoCloseAlert = (type, message, duration = null)
export const showConfirmAlert = (message) => Promise<boolean>
```

## 📊 Flujos de Trabajo

### 1. Pedido desde Menú Principal
```
1. Usuario agrega productos al carrito
2. Hace clic en "Ver Comanda"
3. Completa formulario (incluyendo hora de recogida opcional)
4. Hace clic en "Confirmar Pedido"
5. ✅ Alert automático: "Pedido #XXX creado exitosamente"
6. Alert desaparece en 3 segundos
```

### 2. Pedido desde Sistema de Mesas
```
1. Usuario abre mesa
2. Agrega productos (alerts automáticos de confirmación)
3. Hace clic en "Pagar"
4. Completa modal (incluyendo hora de recogida opcional)
5. Hace clic en "Confirmar Pago"
6. ✅ Alert automático con detalles del pago
7. Alert desaparece en 3 segundos
```

## 🎨 Tipos de Alerts

### Success (Verde)
- **Uso**: Confirmaciones exitosas
- **Ejemplos**: 
  - "Pedido #123 creado exitosamente"
  - "Mesa 5 pagada exitosamente"
  - "Producto agregado a Mesa 3"

### Error (Rojo)
- **Uso**: Errores y problemas
- **Ejemplos**:
  - "Error procesando pedido"
  - "No se pudo conectar al servidor"

### Warning (Amarillo)
- **Uso**: Advertencias
- **Ejemplos**:
  - "El producto no está disponible"
  - "El carrito está vacío"

### Info (Azul)
- **Uso**: Información general
- **Ejemplos**:
  - "Sincronizando datos..."
  - "Cargando menú..."

## 🔄 Migración de Base de Datos

### Script de Migración
```javascript
// backend/migrate-hora-recogida.js
const { run, get, all } = require('./database/connection');

async function migrateHoraRecogida() {
  // Verificar si la columna existe
  const columns = await all('PRAGMA table_info(pedidos)');
  const horaRecogidaExists = columns.some(col => col.name === 'hora_recogida');

  if (!horaRecogidaExists) {
    await run('ALTER TABLE pedidos ADD COLUMN hora_recogida TEXT');
  }
}
```

### Ejecución
```bash
cd backend
node migrate-hora-recogida.js
```

## 🚀 Beneficios de las Mejoras

### Para el Usuario
- **Más rápido**: No necesita hacer clic en "OK"
- **Más información**: Hora de recogida para mejor organización
- **Mejor UX**: Alerts elegantes y automáticos
- **Menos interrupciones**: Flujo de trabajo más fluido

### Para el Negocio
- **Mejor organización**: Hora de recogida ayuda a planificar
- **Menos errores**: Confirmaciones automáticas
- **Más eficiente**: Menos tiempo en confirmaciones manuales
- **Mejor experiencia**: Interfaz más profesional

### Para el Desarrollo
- **Configurable**: Tiempo de alerts ajustable
- **Reutilizable**: Utilidades de alert disponibles en toda la app
- **Mantenible**: Código centralizado y bien documentado
- **Escalable**: Fácil agregar nuevos tipos de alerts

## 📋 Casos de Uso

### Restaurante con Delivery
- **Pedido por teléfono**: Cliente especifica hora de recogida
- **Pedido en persona**: Hora inmediata o programada
- **Pedidos grandes**: Hora específica para preparación

### Restaurante sin Delivery
- **Pedidos para llevar**: Hora de recogida para preparación
- **Pedidos especiales**: Tiempo extra para preparación
- **Eventos**: Pedidos programados con hora específica

## 🔮 Próximas Mejoras

### Funcionalidades Planificadas
- **Configuración de tiempo**: Panel para ajustar duración de alerts
- **Sonidos**: Notificaciones auditivas opcionales
- **Historial**: Lista de pedidos con hora de recogida
- **Filtros**: Buscar pedidos por hora de recogida
- **Notificaciones**: Alertas cuando se acerca la hora de recogida

### Optimizaciones Técnicas
- **Caché de configuración**: Cargar configuración una vez
- **Queue de alerts**: Evitar superposición de alerts
- **Debouncing**: Evitar múltiples alerts similares
- **Analytics**: Métricas de uso de hora de recogida

## 📞 Soporte

### Para Reportar Problemas
1. Verificar que la migración se ejecutó correctamente
2. Confirmar que los campos de hora aparecen en los formularios
3. Probar que los alerts se cierran automáticamente
4. Verificar que la hora se guarda en la base de datos

### Para Configurar Tiempo de Alerts
1. Editar `backend/data/config.json`
2. Cambiar `alertDuration` en la sección `ui`
3. Reiniciar el servidor backend
4. Probar que los alerts usan el nuevo tiempo

## 🎉 Resultado Final

**El sistema ahora incluye:**
- ⏰ **Hora de recogida** en todos los pedidos
- ⚡ **Alerts automáticos** sin confirmaciones manuales
- ⚙️ **Tiempo configurable** para los alerts
- 🎨 **Interfaz mejorada** más profesional
- 📊 **Mejor organización** de pedidos
- 🔧 **Código mantenible** y escalable 