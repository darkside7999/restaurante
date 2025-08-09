#!/usr/bin/env node

const http = require('http');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testPedido() {
  try {
    console.log('🧪 Iniciando prueba de pedido...');
    
    // Esperar a que el servidor esté listo
    console.log('⏳ Esperando que el servidor esté listo...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar que el servidor esté funcionando
    const healthData = await makeRequest('/api/health');
    console.log('✅ Servidor funcionando');
    
    // Obtener el menú
    const menuData = await makeRequest('/api/menu');
    if (!menuData.success) {
      throw new Error('Error obteniendo menú');
    }
    
    console.log('✅ Menú obtenido');
    
    // Tomar el primer producto disponible
    const productos = menuData.data.flatMap(cat => cat.productos);
    if (productos.length === 0) {
      throw new Error('No hay productos disponibles');
    }
    
    const producto = productos[0];
    console.log('📦 Producto seleccionado:', producto.nombre);
    
    // Crear un pedido de prueba
    const pedidoData = {
      items: [{
        id: producto.id,
        cantidad: 1,
        precio: producto.precio,
        observaciones: 'Prueba automática'
      }],
      forma_pago: 'efectivo',
      cambio: 0,
      observaciones: 'Pedido de prueba'
    };
    
    console.log('📋 Creando pedido...');
    const pedidoResult = await makeRequest('/api/pedidos', 'POST', pedidoData);
    
    if (pedidoResult.success) {
      console.log('✅ Pedido creado exitosamente!');
      console.log('📄 Número de pedido:', pedidoResult.data.numero_pedido);
      console.log('💰 Total:', pedidoResult.data.total_con_impuesto);
      console.log('📁 PDF:', pedidoResult.data.pdf_path);
    } else {
      console.error('❌ Error creando pedido:', pedidoResult.error);
    }
    
  } catch (error) {
    console.error('💥 Error en prueba:', error.message);
  }
}

// Ejecutar prueba
testPedido(); 