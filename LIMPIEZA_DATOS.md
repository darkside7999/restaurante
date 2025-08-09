# 🧹 Limpieza de Datos del Sistema

## 📋 Resumen de la Limpieza Realizada

### ✅ **Datos Eliminados**
- **13 Pedidos** - Todos los pedidos de prueba eliminados
- **8 Mesas** - Todas las mesas de prueba eliminadas  
- **8 Productos** - Todos los productos de prueba eliminados
- **4 Categorías** - Todas las categorías de prueba eliminadas
- **28 Items de Pedidos** - Todos los items de pedidos eliminados

### 🌱 **Datos Básicos Creados**

#### **Categorías (3)**
1. **Bebidas** - Bebidas y refrescos
2. **Platos Principales** - Platos principales del menú
3. **Postres** - Postres y dulces

#### **Productos (3)**
1. **Coca Cola** - Refresco de cola 330ml - $2.50
2. **Hamburguesa Clásica** - Hamburguesa con carne, lechuga y tomate - $8.99
3. **Tarta de Chocolate** - Tarta de chocolate casera - $4.50

#### **Mesas (4)**
- Mesa 1 - Libre
- Mesa 2 - Libre
- Mesa 3 - Libre
- Mesa 4 - Libre

## 🛠️ Script de Limpieza

### **Ubicación**
```
backend/cleanup-all-data.js
```

### **Uso**
```bash
# Solo limpiar datos (sin crear datos básicos)
node cleanup-all-data.js --clean-only

# Limpiar y crear datos básicos de ejemplo
node cleanup-all-data.js --with-basic

# Mostrar ayuda
node cleanup-all-data.js --help
```

### **Funcionalidades**

#### **1. Limpieza Completa**
- Elimina todos los pedidos
- Elimina todos los items de pedidos
- Elimina todas las mesas
- Elimina todos los productos
- Elimina todas las categorías
- Reinicia contadores de auto-incremento

#### **2. Creación de Datos Básicos**
- Crea categorías básicas
- Crea productos de ejemplo
- Crea mesas básicas
- Configura stock disponible

#### **3. Verificación**
- Muestra estadísticas antes y después
- Confirma que la limpieza fue exitosa
- Valida la creación de datos básicos

## 📊 Proceso de Limpieza

### **Orden de Eliminación**
1. **Items de Pedidos** (primero por foreign keys)
2. **Pedidos**
3. **Mesas**
4. **Productos**
5. **Categorías**
6. **Contadores** (sqlite_sequence)

### **Verificaciones**
- ✅ Conteo de registros antes de la limpieza
- ✅ Conteo de registros después de la limpieza
- ✅ Confirmación de eliminación exitosa
- ✅ Validación de datos básicos creados

## 🎯 Beneficios de la Limpieza

### **Para el Desarrollo**
- **Base de datos limpia** para pruebas
- **Datos consistentes** y predecibles
- **Eliminación de datos corruptos** o inconsistentes
- **Reinicio de contadores** para IDs limpios

### **Para el Testing**
- **Estado conocido** de la base de datos
- **Datos de prueba controlados**
- **Fácil reproducción** de escenarios
- **Eliminación de interferencias**

### **Para la Producción**
- **Preparación** para despliegue
- **Eliminación de datos de desarrollo**
- **Configuración limpia** del sistema
- **Datos básicos funcionales**

## 🔄 Reutilización del Script

### **Para Limpiezas Futuras**
```bash
# Limpiar completamente
cd backend
node cleanup-all-data.js --with-basic
```

### **Para Solo Limpiar**
```bash
# Sin crear datos básicos
node cleanup-all-data.js --clean-only
```

### **Para Verificar Estado**
```bash
# El script muestra estadísticas automáticamente
node cleanup-all-data.js --with-basic
```

## 📝 Notas Importantes

### **Antes de Ejecutar**
- ⚠️ **Hacer backup** si hay datos importantes
- ⚠️ **Detener el servidor** si está corriendo
- ⚠️ **Verificar** que no hay usuarios activos

### **Después de Ejecutar**
- ✅ **Reiniciar el servidor** para aplicar cambios
- ✅ **Verificar** que los datos básicos están disponibles
- ✅ **Probar** funcionalidades básicas

### **Datos Preservados**
- ✅ **Configuración del sistema** (tabla `configuracion`)
- ✅ **Estructura de la base de datos**
- ✅ **Índices y constraints**

## 🎉 Resultado Final

### **Estado de la Base de Datos**
- 🗑️ **Completamente limpia** de datos de prueba
- 🌱 **Datos básicos funcionales** creados
- 🔄 **Contadores reiniciados**
- ✅ **Lista para uso** en desarrollo o producción

### **Datos Disponibles**
- 📋 **3 categorías** básicas
- 🍽️ **3 productos** de ejemplo
- 🪑 **4 mesas** libres
- 💰 **Precios realistas**
- 📦 **Stock disponible**

## 🚀 Próximos Pasos

### **Para Desarrollo**
1. **Agregar más productos** según necesidades
2. **Configurar categorías** específicas
3. **Ajustar precios** y descripciones
4. **Probar funcionalidades** con datos limpios

### **Para Producción**
1. **Configurar datos reales** del restaurante
2. **Ajustar configuración** del sistema
3. **Probar flujos completos** de pedidos
4. **Verificar integridad** de datos

## 📞 Soporte

### **En Caso de Problemas**
1. **Verificar logs** del script
2. **Revisar permisos** de la base de datos
3. **Confirmar estructura** de tablas
4. **Restaurar backup** si es necesario

### **Para Personalización**
- **Modificar `createBasicData()`** para datos específicos
- **Ajustar categorías** según el tipo de restaurante
- **Cambiar productos** por los del menú real
- **Configurar mesas** según la capacidad

---

**¡La base de datos está ahora completamente limpia y lista para usar!** 🎯 