#!/usr/bin/env node

const { run, get, all } = require('./database/connection');

async function cleanupDuplicates() {
  try {
    console.log('🧹 Limpiando pedidos duplicados...');
    
    // Obtener todos los pedidos
    const pedidos = await all('SELECT id, numero_pedido, created_at FROM pedidos ORDER BY created_at');
    
    const seen = new Set();
    const duplicates = [];
    
    // Encontrar duplicados
    for (const pedido of pedidos) {
      if (seen.has(pedido.numero_pedido)) {
        duplicates.push(pedido);
      } else {
        seen.add(pedido.numero_pedido);
      }
    }
    
    if (duplicates.length === 0) {
      console.log('✅ No se encontraron pedidos duplicados');
      return;
    }
    
    console.log(`🔍 Encontrados ${duplicates.length} pedidos duplicados:`);
    duplicates.forEach(p => console.log(`   - ${p.numero_pedido} (ID: ${p.id})`));
    
    // Eliminar duplicados (mantener el más reciente)
    for (const duplicate of duplicates) {
      console.log(`🗑️ Eliminando pedido duplicado: ${duplicate.numero_pedido}`);
      
      // Eliminar items del pedido
      await run('DELETE FROM pedido_items WHERE pedido_id = ?', [duplicate.id]);
      
      // Eliminar pedido
      await run('DELETE FROM pedidos WHERE id = ?', [duplicate.id]);
    }
    
    console.log('✅ Limpieza completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  cleanupDuplicates().then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  });
}

module.exports = { cleanupDuplicates }; 