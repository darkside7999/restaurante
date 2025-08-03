#!/bin/bash

echo "🍽️ Iniciando Sistema de Gestión para Restaurantes..."
echo ""

# Verificar si existe node_modules en frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del frontend..."
    npm install
    echo ""
fi

# Verificar si existe node_modules en backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
    echo ""
fi

# Función para manejar Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Deteniendo servidores..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
    echo "✅ Servidores detenidos."
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT

echo "🚀 Iniciando servidor backend (Puerto 3001)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo "🚀 Iniciando servidor frontend (Puerto 5173)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ Ambos servidores están ejecutándose:"
echo "   📱 Frontend: http://localhost:5173"
echo "   🔧 Backend:  http://localhost:3001"
echo ""
echo "Para detener los servidores, presiona Ctrl+C"

# Esperar a que termine cualquiera de los procesos
wait $BACKEND_PID $FRONTEND_PID