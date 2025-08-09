const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// Configuración de la base de datos
const dbPath = path.join(__dirname, 'database', 'restaurante.db')
const db = new sqlite3.Database(dbPath)

console.log('🧹 Iniciando limpieza completa de datos...')
console.log('📁 Base de datos:', dbPath)

// Función para ejecutar consultas de forma asíncrona
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        console.error('❌ Error ejecutando query:', err)
        reject(err)
      } else {
        resolve(this)
      }
    })
  })
}

// Función para obtener datos
function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error('❌ Error obteniendo datos:', err)
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

async function cleanupAllData() {
  try {
    console.log('\n📊 Verificando datos existentes...')
    
    // Contar registros antes de la limpieza
    const pedidosCount = await getQuery('SELECT COUNT(*) as count FROM pedidos')
    const mesasCount = await getQuery('SELECT COUNT(*) as count FROM mesas')
    const productosCount = await getQuery('SELECT COUNT(*) as count FROM productos')
    const categoriasCount = await getQuery('SELECT COUNT(*) as count FROM categorias')
    const pedidoItemsCount = await getQuery('SELECT COUNT(*) as count FROM pedido_items')
    
    console.log('📈 Datos existentes:')
    console.log(`   - Pedidos: ${pedidosCount[0].count}`)
    console.log(`   - Mesas: ${mesasCount[0].count}`)
    console.log(`   - Productos: ${productosCount[0].count}`)
    console.log(`   - Categorías: ${categoriasCount[0].count}`)
    console.log(`   - Items de pedidos: ${pedidoItemsCount[0].count}`)
    
    console.log('\n🗑️ Iniciando limpieza...')
    
    // 1. Limpiar items de pedidos (primero por las foreign keys)
    console.log('   🗑️ Limpiando items de pedidos...')
    await runQuery('DELETE FROM pedido_items')
    console.log('   ✅ Items de pedidos eliminados')
    
    // 2. Limpiar pedidos
    console.log('   🗑️ Limpiando pedidos...')
    await runQuery('DELETE FROM pedidos')
    console.log('   ✅ Pedidos eliminados')
    
    // 3. Limpiar mesas
    console.log('   🗑️ Limpiando mesas...')
    await runQuery('DELETE FROM mesas')
    console.log('   ✅ Mesas eliminadas')
    
    // 4. Limpiar productos
    console.log('   🗑️ Limpiando productos...')
    await runQuery('DELETE FROM productos')
    console.log('   ✅ Productos eliminados')
    
    // 5. Limpiar categorías
    console.log('   🗑️ Limpiando categorías...')
    await runQuery('DELETE FROM categorias')
    console.log('   ✅ Categorías eliminadas')
    
    // 6. Reiniciar contadores de auto-incremento
    console.log('   🔄 Reiniciando contadores...')
    await runQuery('DELETE FROM sqlite_sequence')
    console.log('   ✅ Contadores reiniciados')
    
    console.log('\n📊 Verificando limpieza...')
    
    // Contar registros después de la limpieza
    const pedidosAfter = await getQuery('SELECT COUNT(*) as count FROM pedidos')
    const mesasAfter = await getQuery('SELECT COUNT(*) as count FROM mesas')
    const productosAfter = await getQuery('SELECT COUNT(*) as count FROM productos')
    const categoriasAfter = await getQuery('SELECT COUNT(*) as count FROM categorias')
    const pedidoItemsAfter = await getQuery('SELECT COUNT(*) as count FROM pedido_items')
    
    console.log('📉 Datos después de la limpieza:')
    console.log(`   - Pedidos: ${pedidosAfter[0].count}`)
    console.log(`   - Mesas: ${mesasAfter[0].count}`)
    console.log(`   - Productos: ${productosAfter[0].count}`)
    console.log(`   - Categorías: ${categoriasAfter[0].count}`)
    console.log(`   - Items de pedidos: ${pedidoItemsAfter[0].count}`)
    
    console.log('\n✅ Limpieza completada exitosamente!')
    console.log('🎯 Base de datos completamente limpia')
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error)
    process.exit(1)
  }
}

// Función para crear datos de ejemplo básicos (opcional)
async function createBasicData() {
  try {
    console.log('\n🌱 Creando datos básicos de ejemplo...')
    
    // Crear categorías básicas
    console.log('   📂 Creando categorías...')
    await runQuery(`
      INSERT INTO categorias (nombre, descripcion, activo) VALUES 
      ('Bebidas', 'Bebidas y refrescos', 1),
      ('Platos Principales', 'Platos principales del menú', 1),
      ('Postres', 'Postres y dulces', 1)
    `)
    
    // Crear productos básicos
    console.log('   🍽️ Creando productos...')
    await runQuery(`
      INSERT INTO productos (nombre, descripcion, precio, categoria_id, stock_disponible, stock_bajo, activo) VALUES 
      ('Coca Cola', 'Refresco de cola 330ml', 2.50, 1, 1, 0, 1),
      ('Hamburguesa Clásica', 'Hamburguesa con carne, lechuga y tomate', 8.99, 2, 1, 0, 1),
      ('Tarta de Chocolate', 'Tarta de chocolate casera', 4.50, 3, 1, 0, 1)
    `)
    
    // Crear mesas básicas
    console.log('   🪑 Creando mesas...')
    await runQuery(`
      INSERT INTO mesas (numero, estado) VALUES 
      (1, 'libre'),
      (2, 'libre'),
      (3, 'libre'),
      (4, 'libre')
    `)
    
    console.log('✅ Datos básicos creados exitosamente!')
    console.log('📋 Categorías: Bebidas, Platos Principales, Postres')
    console.log('🍽️ Productos: Coca Cola, Hamburguesa Clásica, Tarta de Chocolate')
    console.log('🪑 Mesas: 1, 2, 3, 4 (todas libres)')
    
  } catch (error) {
    console.error('❌ Error creando datos básicos:', error)
  }
}

// Función principal
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🧹 Script de Limpieza de Datos

Uso:
  node cleanup-all-data.js [opciones]

Opciones:
  --clean-only     Solo limpiar datos (sin crear datos básicos)
  --with-basic     Limpiar y crear datos básicos de ejemplo
  --help, -h       Mostrar esta ayuda

Ejemplos:
  node cleanup-all-data.js --clean-only
  node cleanup-all-data.js --with-basic
  node cleanup-all-data.js
    `)
    return
  }
  
  console.log('🚀 Iniciando proceso de limpieza...')
  
  // Limpiar todos los datos
  await cleanupAllData()
  
  // Si se especifica --with-basic, crear datos básicos
  if (args.includes('--with-basic')) {
    await createBasicData()
  }
  
  console.log('\n🎉 Proceso completado!')
  console.log('💡 Para crear datos básicos, ejecuta: node cleanup-all-data.js --with-basic')
  
  // Cerrar la base de datos al final
  db.close((err) => {
    if (err) {
      console.error('❌ Error cerrando base de datos:', err)
    } else {
      console.log('🔒 Base de datos cerrada')
    }
  })
}

// Ejecutar el script
main().catch(error => {
  console.error('❌ Error fatal:', error)
  process.exit(1)
}) 