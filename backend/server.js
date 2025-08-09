const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

// Importar rutas
const menuRoutes = require('./routes/menu');
const pedidosRoutes = require('./routes/pedidos');
const configRoutes = require('./routes/config');
const statsRoutes = require('./routes/stats');
const mesasRoutes = require('./routes/mesas');

// Importar base de datos
const db = require('./database/connection');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Crear directorios necesarios
const dirs = [
  './recibos',
  './data'
];

dirs.forEach(dir => {
  fs.ensureDirSync(dir);
});

// Rutas API
app.use('/api/menu', menuRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/config', configRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/stock', require('./routes/stock'));
app.use('/api/mesas', mesasRoutes);

// Ruta para servir recibos PDF
app.use('/recibos', express.static(path.join(__dirname, 'recibos')));

// Socket.io para comunicación en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Hacer io disponible globalmente
global.io = io;

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor de restaurante funcionando',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: err.message 
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0'; // Escuchar en todas las interfaces

// Función para obtener la IP de la red
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Ignorar interfaces no IPv4 y localhost
      if (interface.family === 'IPv4' && !interface.internal) {
        return interface.address;
      }
    }
  }
  return 'localhost';
}

const networkIP = getNetworkIP();

server.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌐 Servidor disponible en red: http://${networkIP}:${PORT}`);
  console.log(`📊 API disponible en http://${networkIP}:${PORT}/api`);
  console.log(`🔌 WebSocket activo en puerto ${PORT}`);
  console.log(`📱 Para acceder desde otros dispositivos en la red:`);
  console.log(`   Frontend: http://${networkIP}:5173`);
  console.log(`   Backend:  http://${networkIP}:${PORT}`);
});

module.exports = { app, server, io }; 