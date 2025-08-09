# Solución: Error al Cancelar Mesas

## 🐛 Problema Reportado

- **Error**: Error al intentar cancelar pedidos de mesas
- **Ubicación**: Página `/mesas` al hacer clic en el botón "Cancelar"
- **Síntoma**: La mesa no se cancela correctamente

## 🔍 Análisis del Problema

### Posibles Causas

1. **Mesa no seleccionada**: La mesa podría no estar correctamente seleccionada
2. **Pedido no en estado pendiente**: El pedido podría no estar en estado 'pendiente'
3. **Error en la comunicación**: Problema en la comunicación frontend-backend
4. **Error de base de datos**: Problema al actualizar los registros

### Logging Implementado

#### Frontend (`frontend/src/pages/Mesas.jsx`)

```javascript
// En la función cancelarMesa
console.log("🔄 Intentando cancelar mesa:", {
  mesa: mesaSeleccionada.numero,
  mesaSeleccionada: mesaSeleccionada,
});

console.log("📤 Enviando POST a:", url);
console.log("📥 Respuesta del servidor:", data);
console.log("✅ Mesa cancelada exitosamente");
```

#### Backend (`backend/routes/mesas.js`)

```javascript
// Al inicio de la ruta POST /cancelar
console.log("🚫 Backend: Intentando cancelar mesa", {
  numero: numero,
  params: req.params,
});

// Después de verificar mesa
console.log("✅ Backend: Mesa encontrada para cancelar", { mesa });

// Durante el proceso
console.log("🔄 Backend: Cancelando pedido", { pedido_id: mesa.pedido_id });
console.log("🔄 Backend: Liberando mesa", { numero });
```

## 🛠️ Soluciones Implementadas

### 1. ✅ Validación de Mesa Seleccionada

```javascript
if (!mesaSeleccionada) {
  console.error("❌ No hay mesa seleccionada para cancelar");
  showAutoCloseAlert("error", "No hay mesa seleccionada");
  return;
}
```

### 2. ✅ Estado de Carga Específico

```javascript
const [canceling, setCanceling] = useState(false);

// En la función
setCanceling(true); // en lugar de setLoading(true)
setCanceling(false); // en lugar de setLoading(false)
```

### 3. ✅ Botón con Estado Visual

```javascript
<button disabled={canceling}>
  {canceling ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Cancelando...
    </>
  ) : (
    <>
      <X className="h-4 w-4 mr-2" />
      Cancelar
    </>
  )}
</button>
```

### 4. ✅ Logging Detallado

- **Frontend**: Logs con emojis para fácil identificación
- **Backend**: Logs en cada paso del proceso
- **Errores**: Información detallada para debugging

### 5. ✅ Manejo Mejorado de Errores

```javascript
} else {
  throw new Error(data.error || 'Error desconocido al cancelar mesa')
}
```

## 🔧 Pasos para Debuggear

### 1. Verificar en el Navegador

1. Abrir consola del navegador (F12)
2. Ir a la página `/mesas`
3. Seleccionar una mesa ocupada
4. Hacer clic en el botón "Cancelar"
5. Buscar logs con emojis:
   - 🔄 Intentando cancelar mesa
   - 📤 Enviando POST a
   - 📥 Respuesta del servidor
   - ✅ Mesa cancelada exitosamente

### 2. Verificar en el Servidor

1. Revisar logs del servidor backend
2. Buscar logs con emojis:
   - 🚫 Backend: Intentando cancelar mesa
   - ✅ Backend: Mesa encontrada para cancelar
   - 🔄 Backend: Cancelando pedido
   - 🔄 Backend: Liberando mesa
   - ❌ Backend: Mesa no encontrada

### 3. Verificar Datos

1. **Estado de la mesa**: Verificar que la mesa está seleccionada
2. **Estado del pedido**: Verificar que el pedido está en estado 'pendiente'
3. **Datos de la mesa**: Verificar que `mesaSeleccionada.numero` existe

## 📊 Estructura de Datos Esperada

### Mesa Seleccionada

```javascript
{
  numero: 1,
  estado: "ocupada",
  pedido_id: 456,
  cliente_nombre: "Juan Pérez",
  cliente_telefono: "123456789",
  items: [...],
  total_con_impuesto: 25.20
}
```

### Respuesta del Servidor (Éxito)

```javascript
{
  success: true,
  data: {
    mesa_numero: 1,
    pedido_id: 456
  }
}
```

### Respuesta del Servidor (Error)

```javascript
{
  success: false,
  error: "La mesa no tiene un pedido activo"
}
```

## 🎯 Posibles Problemas y Soluciones

### Problema 1: Mesa No Seleccionada

**Síntoma**: Error "No hay mesa seleccionada"
**Solución**: Asegurar que `mesaSeleccionada` está correctamente establecida

### Problema 2: Pedido No en Estado Pendiente

**Síntoma**: Error "La mesa no tiene un pedido activo"
**Solución**: Verificar que el pedido está en estado 'pendiente'

### Problema 3: Error de Base de Datos

**Síntoma**: Error 500 del servidor
**Solución**: Verificar logs del servidor y estructura de la base de datos

### Problema 4: Error de Red

**Síntoma**: Error de conexión o timeout
**Solución**: Verificar conectividad y reiniciar servidor

## 🚀 Comandos para Testing

### Reiniciar Servidor

```bash
cd backend
pkill -f "node.*server.js"
sleep 2
node server.js
```

### Verificar Logs

```bash
# En el terminal del servidor
tail -f server.log  # si existe
# O simplemente ver los logs en la consola donde corre node server.js
```

## 📝 Checklist de Verificación

- [ ] Servidor backend corriendo
- [ ] Consola del navegador abierta (F12)
- [ ] Mesa ocupada seleccionada
- [ ] Logs de frontend aparecen al hacer clic en Cancelar
- [ ] Logs de backend aparecen en el servidor
- [ ] No hay errores de red en la consola
- [ ] La mesa tiene un pedido activo
- [ ] El pedido está en estado 'pendiente'

## 🎉 Resultado Esperado

Después de implementar las correcciones:

1. **Al hacer clic en Cancelar**:

   - ✅ Logs detallados aparecen en consola
   - ✅ Spinner de carga se muestra ("Cancelando...")
   - ✅ Confirmación se solicita
   - ✅ Mesa se cancela correctamente
   - ✅ Alert de éxito aparece
   - ✅ Vista se actualiza automáticamente
   - ✅ Mesa vuelve a estado "libre"

2. **En caso de error**:
   - ✅ Error específico se muestra
   - ✅ Logs detallados ayudan a identificar el problema
   - ✅ Usuario recibe feedback claro

## 🔮 Próximos Pasos

Si el problema persiste después de estas correcciones:

1. **Verificar base de datos**: Revisar estructura de `pedidos` y `mesas`
2. **Probar con datos simples**: Crear mesa y pedido de prueba
3. **Revisar WebSockets**: Verificar que las actualizaciones funcionan
4. **Implementar fallback**: Agregar reintentos automáticos

## 📞 Soporte

Para reportar problemas adicionales:

1. Incluir logs completos del navegador y servidor
2. Describir pasos exactos para reproducir el problema
3. Mencionar si el problema es intermitente o consistente
4. Incluir información del navegador y sistema operativo

## 🎯 Flujo de Cancelación

### Proceso Completo

```
1. Usuario selecciona mesa ocupada
2. Usuario hace clic en "Cancelar"
3. ✅ Confirmación se solicita
4. ✅ Spinner "Cancelando..." se muestra
5. ✅ POST /mesas/{numero}/cancelar se envía
6. ✅ Backend verifica mesa y pedido
7. ✅ Pedido se marca como 'cancelado'
8. ✅ Mesa se libera (estado = 'libre')
9. ✅ WebSocket emite actualizaciones
10. ✅ Alert de éxito aparece
11. ✅ Vista se actualiza automáticamente
```

### Estados de la Mesa

```
Antes: estado = 'ocupada', pedido_id = 123
Después: estado = 'libre', pedido_id = NULL
```

### Estados del Pedido

```
Antes: estado = 'pendiente'
Después: estado = 'cancelado'
```
