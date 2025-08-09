#!/usr/bin/env node

const { run, get, all } = require('./database/connection');

async function cleanupProducts() {
  try {
    console.log('🧹 Limpiando productos duplicados...');

    // Obtener todos los productos
    const productos = await all('SELECT id, nombre, categoria_id, precio, created_at FROM productos ORDER BY created_at');

    const seen = new Map(); // Map para trackear productos únicos
    const duplicates = [];

    // Encontrar duplicados basados en nombre y categoría
    for (const producto of productos) {
      const key = `${producto.nombre}-${producto.categoria_id}`;
      
      if (seen.has(key)) {
        duplicates.push(producto);
      } else {
        seen.set(key, producto);
      }
    }

    if (duplicates.length === 0) {
      console.log('✅ No se encontraron productos duplicados');
      return;
    }

    console.log(`🔍 Encontrados ${duplicates.length} productos duplicados:`);
    duplicates.forEach(p => console.log(`   - ${p.nombre} (ID: ${p.id})`));

    // Eliminar duplicados (mantener el más reciente)
    for (const duplicate of duplicates) {
      console.log(`🗑️ Eliminando producto duplicado: ${duplicate.nombre} (ID: ${duplicate.id})`);
      
      // Verificar si el producto está en algún pedido
      const pedidoItems = await all('SELECT COUNT(*) as count FROM pedido_items WHERE producto_id = ?', [duplicate.id]);
      
      if (pedidoItems[0].count > 0) {
        console.log(`⚠️  Producto ${duplicate.nombre} está en ${pedidoItems[0].count} pedidos, marcando como inactivo en lugar de eliminar`);
        await run('UPDATE productos SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [duplicate.id]);
      } else {
        await run('DELETE FROM productos WHERE id = ?', [duplicate.id]);
      }
    }

    console.log('✅ Limpieza de productos completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupProducts().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  });
}

module.exports = { cleanupProducts }; 