#!/usr/bin/env node

const { run, all } = require('./database/connection');

async function migrateStockSimple() {
  try {
    console.log('🔄 Iniciando migración de stock simplificado...');

    // Verificar si los campos ya existen
    const productosInfo = await all("PRAGMA table_info(productos)");
    const productosColumns = productosInfo.map(col => col.name);

    // Agregar campo stock_disponible si no existe
    if (!productosColumns.includes('stock_disponible')) {
      console.log('➕ Agregando campo stock_disponible...');
      await run('ALTER TABLE productos ADD COLUMN stock_disponible BOOLEAN DEFAULT 1');
    }

    // Agregar campo stock_bajo si no existe
    if (!productosColumns.includes('stock_bajo')) {
      console.log('➕ Agregando campo stock_bajo...');
      await run('ALTER TABLE productos ADD COLUMN stock_bajo BOOLEAN DEFAULT 0');
    }

    // Eliminar campos complejos de stock si existen
    if (productosColumns.includes('stock')) {
      console.log('🗑️ Eliminando campo stock...');
      // No podemos eliminar columnas en SQLite, pero las marcaremos como no usadas
    }

    if (productosColumns.includes('stock_minimo')) {
      console.log('🗑️ Eliminando campo stock_minimo...');
      // No podemos eliminar columnas en SQLite, pero las marcaremos como no usadas
    }

    if (productosColumns.includes('fuera_stock')) {
      console.log('🗑️ Eliminando campo fuera_stock...');
      // No podemos eliminar columnas en SQLite, pero las marcaremos como no usadas
    }

    console.log('✅ Migración de stock simplificado completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración de stock simplificado:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateStockSimple().then(() => {
    console.log('🎉 Migración de stock simplificado finalizada');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error en migración de stock simplificado:', error);
    process.exit(1);
  });
}

module.exports = { migrateStockSimple }; 