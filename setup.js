#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍽️ Configurando Restaurante App...\n');

// Verificar que Node.js esté instalado
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' });
  console.log(`✅ Node.js ${nodeVersion.trim()} detectado`);
} catch (error) {
  console.error('❌ Node.js no está instalado. Por favor instala Node.js primero.');
  process.exit(1);
}

// Verificar que npm esté instalado
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' });
  console.log(`✅ npm ${npmVersion.trim()} detectado`);
} catch (error) {
  console.error('❌ npm no está instalado. Por favor instala npm primero.');
  process.exit(1);
}

// Instalar dependencias del proyecto principal
console.log('\n📦 Instalando dependencias del proyecto principal...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias del proyecto principal instaladas');
} catch (error) {
  console.error('❌ Error instalando dependencias del proyecto principal');
  process.exit(1);
}

// Instalar dependencias del backend
console.log('\n🔧 Instalando dependencias del backend...');
try {
  execSync('cd backend && npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias del backend instaladas');
} catch (error) {
  console.error('❌ Error instalando dependencias del backend');
  process.exit(1);
}

// Instalar dependencias del frontend
console.log('\n🎨 Instalando dependencias del frontend...');
try {
  execSync('cd frontend && npm install', { stdio: 'inherit' });
  console.log('✅ Dependencias del frontend instaladas');
} catch (error) {
  console.error('❌ Error instalando dependencias del frontend');
  process.exit(1);
}

// Inicializar la base de datos
console.log('\n🗄️ Inicializando base de datos...');
try {
  execSync('cd backend && npm run init-db', { stdio: 'inherit' });
  console.log('✅ Base de datos inicializada');
} catch (error) {
  console.error('❌ Error inicializando la base de datos');
  process.exit(1);
}

console.log('\n🎉 ¡Configuración completada exitosamente!');
console.log('\n📋 Próximos pasos:');
console.log('1. Ejecuta "npm run dev" para iniciar la aplicación');
console.log('2. Abre http://localhost:5173 en tu navegador');
console.log('3. El backend estará disponible en http://localhost:3000');
console.log('\n🔧 Comandos útiles:');
console.log('- npm run dev: Inicia frontend y backend en desarrollo');
console.log('- npm run dev:backend: Solo inicia el backend');
console.log('- npm run dev:frontend: Solo inicia el frontend');
console.log('- npm run build: Construye el frontend para producción');
console.log('\n📚 Documentación:');
console.log('- Revisa el README.md para más información');
console.log('- Los recibos PDF se guardan en backend/recibos/');
console.log('- La base de datos está en backend/database/restaurante.db'); 