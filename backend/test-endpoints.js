const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testEndpoints() {
  console.log('🧪 Probando endpoints del backend...\n');

  try {
    // Test 1: Obtener menú
    console.log('1️⃣ Probando GET /menu...');
    const menuResponse = await axios.get(`${BASE_URL}/menu`);
    console.log('✅ Menú obtenido:', menuResponse.data.success);
    console.log(`   Categorías: ${menuResponse.data.data.length}`);
    console.log(`   Total productos: ${menuResponse.data.data.reduce((sum, cat) => sum + cat.productos.length, 0)}`);

    // Test 2: Obtener categorías
    console.log('\n2️⃣ Probando GET /menu/categorias...');
    const categoriasResponse = await axios.get(`${BASE_URL}/menu/categorias`);
    console.log('✅ Categorías obtenidas:', categoriasResponse.data.success);
    console.log(`   Total categorías: ${categoriasResponse.data.data.length}`);

    // Test 3: Obtener productos
    console.log('\n3️⃣ Probando GET /menu/productos...');
    const productosResponse = await axios.get(`${BASE_URL}/menu/productos`);
    console.log('✅ Productos obtenidos:', productosResponse.data.success);
    console.log(`   Total productos: ${productosResponse.data.data.length}`);

    // Test 4: Crear categoría de prueba
    console.log('\n4️⃣ Probando POST /menu/categorias...');
    const testCategoria = {
      nombre: 'Categoría de Prueba',
      descripcion: 'Categoría para testing',
      orden: 999
    };
    
    const categoriaResponse = await axios.post(`${BASE_URL}/menu/categorias`, testCategoria);
    console.log('✅ Categoría creada:', categoriaResponse.data.success);
    const categoriaId = categoriaResponse.data.data.id;
    console.log(`   ID de categoría: ${categoriaId}`);

    // Test 5: Crear producto de prueba
    console.log('\n5️⃣ Probando POST /menu/productos...');
    const testProducto = {
      nombre: 'Producto de Prueba',
      descripcion: 'Producto para testing',
      precio: 10.50,
      categoria_id: categoriaId,
      stock_disponible: 1,
      stock_bajo: 0
    };
    
    const productoResponse = await axios.post(`${BASE_URL}/menu/productos`, testProducto);
    console.log('✅ Producto creado:', productoResponse.data.success);
    const productoId = productoResponse.data.data.id;
    console.log(`   ID de producto: ${productoId}`);

    // Test 6: Actualizar producto
    console.log('\n6️⃣ Probando PUT /menu/productos/:id...');
    const updateProducto = {
      nombre: 'Producto de Prueba Actualizado',
      descripcion: 'Producto actualizado para testing',
      precio: 15.75,
      categoria_id: categoriaId,
      stock_disponible: 0,
      stock_bajo: 1
    };
    
    const updateResponse = await axios.put(`${BASE_URL}/menu/productos/${productoId}`, updateProducto);
    console.log('✅ Producto actualizado:', updateResponse.data.success);

    // Test 7: Actualizar stock
    console.log('\n7️⃣ Probando PUT /stock/:id...');
    const stockUpdate = {
      stock_disponible: 1,
      stock_bajo: 0
    };
    
    const stockResponse = await axios.put(`${BASE_URL}/stock/${productoId}`, stockUpdate);
    console.log('✅ Stock actualizado:', stockResponse.data.success);

    // Test 8: Limpiar datos de prueba
    console.log('\n8️⃣ Limpiando datos de prueba...');
    await axios.delete(`${BASE_URL}/menu/productos/${productoId}`);
    await axios.delete(`${BASE_URL}/menu/categorias/${categoriaId}`);
    console.log('✅ Datos de prueba eliminados');

    console.log('\n🎉 Todas las pruebas completadas exitosamente!');

  } catch (error) {
    console.error('❌ Error en las pruebas:', error.message);
    
    if (error.response) {
      console.error('📋 Respuesta del servidor:', error.response.data);
      console.error('📋 Status:', error.response.status);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Error: No se puede conectar al servidor. Verifica que esté corriendo en puerto 3000.');
    }
  }
}

testEndpoints(); 