# Instrucciones para Probar las Mejoras del Carrito y Stock

## 🔧 Cambios Realizados

1. **Eliminado ToastProvider** - Removido temporalmente para eliminar posibles conflictos
2. **Simplificado CarritoContext** - Eliminadas validaciones complejas que podrían causar problemas
3. **Simplificado handleAgregarProducto** - Función más directa sin validaciones complejas
4. **Mejorado manejo de errores en Productos** - Mejor logging y manejo de errores para stock
5. **Agregados componentes de prueba** - Para diagnosticar problemas específicos

## 🧪 Pasos para Probar

### 1. Reiniciar la Aplicación

```bash
# Detener el servidor frontend (Ctrl+C)
# Reiniciar
cd frontend
npm run dev
```

### 2. Ir a Configuración

- Navega a **Configuración** en el menú lateral
- Verás tres nuevas secciones: "Prueba de Conexión", "Prueba del Carrito" y "Prueba de Stock"

### 3. Probar Conexión

- Haz clic en **"Probar Conexión"**
- Verifica que muestra "✅ Conectado" para API y Socket
- Si hay errores, anota los mensajes

### 4. Probar Carrito

- Haz clic en **"Agregar 1 Producto de Prueba"**
- Verifica que aparece en la lista de items
- Haz clic en **"Agregar 3 Productos de Prueba"**
- Verifica que se agregan correctamente

### 5. Probar Stock

- Haz clic en **"Probar Actualización de Stock"**
- Verifica que cambia el estado del primer producto
- Revisa que muestra el estado original y actualizado

### 6. Probar Menú Principal

- Ve al **Menú** principal
- Intenta agregar un producto real del menú
- Verifica que se agrega al carrito sin congelar la página

### 7. Probar Edición de Stock

- Ve a **Productos**
- Haz clic en **"Editar Stock"** en cualquier producto
- Cambia el estado y haz clic en **"Guardar"**
- Verifica que se actualiza correctamente

## 🔍 Diagnóstico

### Si el carrito de prueba funciona pero el menú no:

- El problema está en los datos de los productos del menú
- Revisa la consola para ver qué datos se están enviando

### Si el carrito de prueba no funciona:

- El problema está en el contexto del carrito
- Revisa la consola para errores de JavaScript

### Si la prueba de stock falla:

- El problema está en la API de stock
- Verifica que el endpoint `/stock/:id` funcione correctamente
- Revisa los logs del backend

### Si la conexión falla:

- El problema está en la comunicación con el servidor
- Verifica que el backend esté corriendo en puerto 3000

## 📋 Verificar Consola

Abre las herramientas de desarrollador (F12) y revisa:

1. **Console** - Busca errores en rojo
2. **Network** - Verifica que las peticiones API funcionen
3. **Logs** - Busca mensajes con emojis:
   - 🧪 Pruebas
   - 🛒 Carrito
   - 📦 Stock
   - ✅ Éxitos
   - ❌ Errores

## 🚨 Posibles Errores

### Error: "Cannot read property 'success' of undefined"

- El servidor backend no está respondiendo
- Verifica que esté corriendo en puerto 3000

### Error: "useToast must be used within a ToastProvider"

- Alguno de los componentes aún usa useToast
- Revisa que todos los cambios se hayan aplicado

### Error: "Cannot read property 'items' of undefined"

- El contexto del carrito no se está inicializando
- Verifica que CarritoProvider esté envolviendo la aplicación

### Error: "PUT /stock/:id failed"

- Problema con la API de stock
- Verifica que el endpoint exista en el backend
- Revisa los logs del servidor

## 🔄 Restaurar ToastProvider (Opcional)

Si todo funciona sin ToastProvider, puedes restaurarlo:

1. Descomenta en `App.jsx`:

```javascript
import { ToastProvider } from "./context/ToastContext";

// Y envuelve con:
<ToastProvider>{/* resto de providers */}</ToastProvider>;
```

2. Restaura las referencias a useToast en los componentes

## 📞 Reportar Resultados

Si el problema persiste, proporciona:

1. **Screenshot** de la consola con errores
2. **Resultado** de las pruebas de conexión, carrito y stock
3. **Descripción** exacta de cuándo se congela la página
4. **Navegador** y versión que estás usando
