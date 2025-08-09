#!/usr/bin/env node

const { run, all } = require('./database/connection');

async function migrateStock() {
  try {
    console.log('🔄 Iniciando migración de stock...');

    // Verificar si los campos ya existen
    const productosInfo = await all("PRAGMA table_info(productos)");
    const productosColumns = productosInfo.map(col => col.name);

    // Agregar campo stock si no existe
    if (!productosColumns.includes('stock')) {
      console.log('➕ Agregando campo stock...');
      await run('ALTER TABLE productos ADD COLUMN stock INTEGER DEFAULT 0');
    }

    // Agregar campo stock_minimo si no existe
    if (!productosColumns.includes('stock_minimo')) {
      console.log('➕ Agregando campo stock_minimo...');
      await run('ALTER TABLE productos ADD COLUMN stock_minimo INTEGER DEFAULT 5');
    }

    // Agregar campo fuera_stock si no existe
    if (!productosColumns.includes('fuera_stock')) {
      console.log('➕ Agregando campo fuera_stock...');
      await run('ALTER TABLE productos ADD COLUMN fuera_stock BOOLEAN DEFAULT 0');
    }

    // Actualizar stock existente con valores por defecto
    console.log('🔄 Actualizando stock existente...');
    await run(`
      UPDATE productos 
      SET stock = COALESCE(stock, 10), 
          stock_minimo = COALESCE(stock_minimo, 5),
          fuera_stock = CASE WHEN COALESCE(stock, 0) <= 0 THEN 1 ELSE 0 END
      WHERE stock IS NULL OR stock_minimo IS NULL
    `);

    console.log('✅ Migración de stock completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración de stock:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateStock().then(() => {
    console.log('🎉 Migración de stock finalizada');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error en migración de stock:', error);
    process.exit(1);
  });
}

module.exports = { migrateStock }; 