#!/usr/bin/env node

const os = require('os');

function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Solo interfaces IPv4 que no sean internas
      if (interface.family === 'IPv4' && !interface.internal) {
        ips.push({
          name: name,
          address: interface.address,
          netmask: interface.netmask
        });
      }
    }
  }
  
  return ips;
}

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      if (interface.family === 'IPv4' && interface.internal) {
        return interface.address;
      }
    }
  }
  
  return '127.0.0.1';
}

console.log('🌐 Información de Red - Restaurante App');
console.log('=====================================\n');

const localIP = getLocalIP();
const networkIPs = getNetworkIP();

console.log(`🏠 Local (localhost):`);
console.log(`   Frontend: http://localhost:5173`);
console.log(`   Backend:  http://localhost:3000`);
console.log(`   API:      http://localhost:3000/api\n`);

if (networkIPs.length > 0) {
  console.log('🌍 Red Local:');
  networkIPs.forEach((ip, index) => {
    console.log(`   Interfaz: ${ip.name} (${ip.address})`);
    console.log(`   Frontend: http://${ip.address}:5173`);
    console.log(`   Backend:  http://${ip.address}:3000`);
    console.log(`   API:      http://${ip.address}:3000/api`);
    if (index < networkIPs.length - 1) console.log('');
  });
} else {
  console.log('❌ No se encontraron interfaces de red disponibles');
}

console.log('\n📱 Para acceder desde otros dispositivos:');
console.log('1. Asegúrate de que estén en la misma red WiFi/LAN');
console.log('2. Usa una de las URLs de "Red Local" mostradas arriba');
console.log('3. El firewall puede bloquear las conexiones - verifica la configuración');
console.log('4. En algunos routers, puede ser necesario configurar port forwarding');

console.log('\n🔧 Comandos útiles:');
console.log('   npm run dev          - Iniciar aplicación');
console.log('   npm run dev:backend  - Solo backend');
console.log('   npm run dev:frontend - Solo frontend');

console.log('\n📋 Estado de servicios:');
console.log('   Backend:  curl http://localhost:3000/api/health');
console.log('   Frontend: curl http://localhost:5173'); 