# 🌐 Acceso en Red - Restaurante App

## 📱 Acceso desde Otros Dispositivos

La aplicación ahora está configurada para funcionar tanto en localhost como en la red local, permitiendo que múltiples dispositivos se conecten simultáneamente.

### 🏠 URLs de Acceso

#### Local (mismo dispositivo)
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **API**: http://localhost:3000/api

#### Red Local (otros dispositivos)
- **Frontend**: http://192.168.1.12:5173
- **Backend**: http://192.168.1.12:3000
- **API**: http://192.168.1.12:3000/api

### 🔧 Configuración Automática

La aplicación detecta automáticamente si estás accediendo desde:
- **localhost**: Usa las URLs locales
- **Red local**: Usa la IP de la red automáticamente

### 📋 Casos de Uso

#### 1. Servidor Principal (PC/Computadora)
```bash
# Ejecutar en el servidor
npm run dev
```

#### 2. Clientes (Tablets, Celulares, Otros PCs)
- Abrir navegador web
- Ir a: `http://192.168.1.12:5173`
- La aplicación se conectará automáticamente al backend

### 🌍 Escenarios de Uso

#### Restaurante con Múltiples Puntos de Venta
- **PC Principal**: Vista de cocina y estadísticas
- **Tablets**: Tomar pedidos en diferentes mesas
- **Celulares**: Ver pedidos y estado en cocina
- **Impresora**: Recibos PDF automáticos

#### Eventos o Catering
- **Laptop principal**: Control central
- **Dispositivos móviles**: Tomar pedidos en diferentes áreas
- **Sincronización en tiempo real**: Todos ven los mismos datos

### 🔒 Seguridad

#### Recomendaciones
1. **Usar solo en red local**: No exponer a internet
2. **Firewall**: Configurar para permitir puertos 3000 y 5173
3. **Red privada**: Usar red WiFi/LAN privada
4. **Actualizaciones**: Mantener el sistema actualizado

#### Puertos Utilizados
- **3000**: Backend (API + WebSocket)
- **5173**: Frontend (React + Vite)

### 🛠️ Solución de Problemas

#### No se puede conectar desde otros dispositivos
1. **Verificar red**: Asegurar que estén en la misma red WiFi/LAN
2. **Firewall**: Verificar que los puertos 3000 y 5173 estén abiertos
3. **IP correcta**: Usar la IP mostrada por `npm run network-info`
4. **Servicios activos**: Verificar que backend y frontend estén ejecutándose

#### Error de conexión WebSocket
1. **Verificar puerto 3000**: El backend debe estar ejecutándose
2. **CORS**: Ya configurado para permitir todas las conexiones
3. **Red**: Verificar conectividad de red

#### Lento o sin respuesta
1. **Ancho de banda**: Verificar la velocidad de la red
2. **Dispositivos**: No sobrecargar con demasiados clientes
3. **Recursos**: Verificar uso de CPU y memoria del servidor

### 📊 Monitoreo

#### Verificar estado de servicios
```bash
# Información de red
npm run network-info

# Estado del backend
curl http://192.168.1.12:3000/api/health

# Estado del frontend
curl http://192.168.1.12:5173
```

#### Logs del servidor
- **Backend**: Consola donde se ejecuta `npm run dev`
- **Frontend**: Consola del navegador (F12)
- **WebSocket**: Conexiones en tiempo real

### 🚀 Optimización

#### Para mejor rendimiento
1. **Red cableada**: Usar Ethernet en lugar de WiFi cuando sea posible
2. **Ancho de banda**: Asegurar red de al menos 10 Mbps
3. **Dispositivos**: Usar navegadores modernos (Chrome, Firefox, Safari)
4. **Caché**: Los navegadores cachean automáticamente los recursos

#### Configuración de red
1. **DHCP**: Configurar IPs estáticas para el servidor
2. **DNS**: Usar IP directa en lugar de nombres de dominio
3. **QoS**: Priorizar tráfico de la aplicación en el router

### 📱 Dispositivos Soportados

#### Navegadores
- ✅ Chrome (Android, Windows, macOS, Linux)
- ✅ Firefox (Android, Windows, macOS, Linux)
- ✅ Safari (iOS, macOS)
- ✅ Edge (Windows, Android)
- ✅ Samsung Internet (Android)

#### Sistemas Operativos
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux (Ubuntu, Debian, etc.)
- ✅ Android 8+
- ✅ iOS 12+

### 🔄 Actualizaciones

#### Mantener actualizado
1. **Código**: `git pull` para actualizar
2. **Dependencias**: `npm run install:all`
3. **Reiniciar**: `npm run dev` para aplicar cambios

#### Backup
- **Base de datos**: `backend/database/restaurante.db`
- **Configuración**: `backend/data/config.json`
- **Recibos**: `backend/recibos/`

### 📞 Soporte

#### Información útil para reportar problemas
- Sistema operativo del servidor
- Navegador y versión del cliente
- Mensajes de error específicos
- Configuración de red
- Número de dispositivos conectados

#### Comandos de diagnóstico
```bash
# Información completa de red
npm run network-info

# Estado de servicios
curl http://192.168.1.12:3000/api/health
curl http://192.168.1.12:5173

# Logs del servidor
# (ver consola donde se ejecuta npm run dev)
``` 