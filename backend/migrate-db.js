#!/usr/bin/env node

const { run, get, all } = require('./database/connection');

async function migrateDatabase() {
  try {
    console.log('🔄 Iniciando migración de base de datos...');

    // Verificar si los campos ya existen
    const tableInfo = await all("PRAGMA table_info(pedidos)");
    const columnNames = tableInfo.map(col => col.name);

    // Agregar campo descuento si no existe
    if (!columnNames.includes('descuento')) {
      console.log('➕ Agregando campo descuento...');
      await run('ALTER TABLE pedidos ADD COLUMN descuento DECIMAL(10,2) DEFAULT 0.00');
    }

    // Agregar campo total_final si no existe
    if (!columnNames.includes('total_final')) {
      console.log('➕ Agregando campo total_final...');
      await run('ALTER TABLE pedidos ADD COLUMN total_final DECIMAL(10,2) DEFAULT 0.00');
    }

    // Agregar campo mesa si no existe
    if (!columnNames.includes('mesa')) {
      console.log('➕ Agregando campo mesa...');
      await run('ALTER TABLE pedidos ADD COLUMN mesa INTEGER');
    }

    // Agregar campo stock_minimo a productos si no existe
    const productosInfo = await all("PRAGMA table_info(productos)");
    const productosColumns = productosInfo.map(col => col.name);

    if (!productosColumns.includes('stock_minimo')) {
      console.log('➕ Agregando campo stock_minimo a productos...');
      await run('ALTER TABLE productos ADD COLUMN stock_minimo INTEGER DEFAULT 5');
    }

    // Crear tabla de tareas si no existe
    console.log('📋 Verificando tabla de tareas...');
    await run(`
      CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        tipo TEXT NOT NULL,
        frecuencia TEXT DEFAULT 'diaria',
        ultima_ejecucion DATETIME,
        proxima_ejecucion DATETIME,
        activa BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de reportes diarios si no existe
    console.log('📊 Verificando tabla de reportes diarios...');
    await run(`
      CREATE TABLE IF NOT EXISTS reportes_diarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha DATE UNIQUE NOT NULL,
        total_pedidos INTEGER DEFAULT 0,
        total_ventas DECIMAL(10,2) DEFAULT 0.00,
        total_descuentos DECIMAL(10,2) DEFAULT 0.00,
        pedidos_entregados INTEGER DEFAULT 0,
        pedidos_cancelados INTEGER DEFAULT 0,
        productos_vendidos INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de backups si no existe
    console.log('💾 Verificando tabla de backups...');
    await run(`
      CREATE TABLE IF NOT EXISTS backups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_archivo TEXT NOT NULL,
        ruta TEXT NOT NULL,
        tamaño_bytes INTEGER,
        tipo TEXT DEFAULT 'automatico',
        estado TEXT DEFAULT 'completado',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insertar tareas por defecto
    console.log('📝 Insertando tareas por defecto...');
    await run(`
      INSERT OR IGNORE INTO tareas (titulo, descripcion, tipo, frecuencia)
      VALUES 
        ('Revisar stock', 'Verificar productos con stock bajo', 'stock', 'diaria'),
        ('Limpieza general', 'Limpieza de cocina y áreas comunes', 'limpieza', 'diaria'),
        ('Backup de datos', 'Respaldo automático de la base de datos', 'backup', 'diaria'),
        ('Revisar inventario', 'Conteo de productos en almacén', 'inventario', 'semanal')
    `);

    // Actualizar total_final en pedidos existentes
    console.log('🔄 Actualizando total_final en pedidos existentes...');
    await run(`
      UPDATE pedidos 
      SET total_final = total_con_impuesto - COALESCE(descuento, 0)
      WHERE total_final = 0 OR total_final IS NULL
    `);

    console.log('✅ Migración completada exitosamente');

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateDatabase().then(() => {
    console.log('🎉 Migración finalizada');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Error en migración:', error);
    process.exit(1);
  });
}

module.exports = { migrateDatabase }; 