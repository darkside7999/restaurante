const { db, all } = require('./database/connection');

async function testDatabaseStructure() {
  console.log('🔍 Verificando estructura de la base de datos...\n');

  try {
    // Verificar tabla categorias
    console.log('📋 Verificando tabla categorias...');
    const categoriasStructure = await all("PRAGMA table_info(categorias)");
    console.log('Columnas de categorias:', categoriasStructure.map(col => col.name));

    // Verificar tabla productos
    console.log('\n📋 Verificando tabla productos...');
    const productosStructure = await all("PRAGMA table_info(productos)");
    console.log('Columnas de productos:', productosStructure.map(col => col.name));

    // Verificar datos de categorias
    console.log('\n📊 Verificando datos de categorias...');
    const categorias = await all("SELECT * FROM categorias WHERE activo = 1");
    console.log(`Categorias activas: ${categorias.length}`);
    categorias.forEach(cat => {
      console.log(`  - ID: ${cat.id}, Nombre: ${cat.nombre}, Activo: ${cat.activo}`);
    });

    // Verificar datos de productos
    console.log('\n📊 Verificando datos de productos...');
    const productos = await all("SELECT * FROM productos WHERE activo = 1");
    console.log(`Productos activos: ${productos.length}`);
    productos.slice(0, 5).forEach(prod => {
      console.log(`  - ID: ${prod.id}, Nombre: ${prod.nombre}, Stock: ${prod.stock_disponible}, Bajo: ${prod.stock_bajo}`);
    });

    // Verificar foreign keys
    console.log('\n🔗 Verificando foreign keys...');
    const foreignKeys = await all("PRAGMA foreign_key_list(productos)");
    console.log('Foreign keys en productos:', foreignKeys);

    // Verificar índices
    console.log('\n📈 Verificando índices...');
    const indices = await all("PRAGMA index_list(productos)");
    console.log('Índices en productos:', indices);

    console.log('\n✅ Verificación completada');

  } catch (error) {
    console.error('❌ Error verificando estructura:', error);
  } finally {
    db.close();
  }
}

testDatabaseStructure(); 