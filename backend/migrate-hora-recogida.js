const { run, get, all } = require('./database/connection');

async function migrateHoraRecogida() {
  try {
    console.log('🔄 Iniciando migración: Agregar hora_recogida a pedidos...');

    // Verificar si la columna hora_recogida existe
    const columns = await all('PRAGMA table_info(pedidos)');
    const horaRecogidaExists = columns.some(col => col.name === 'hora_recogida');

    if (!horaRecogidaExists) {
      console.log('📝 Agregando columna hora_recogida a tabla pedidos...');
      await run('ALTER TABLE pedidos ADD COLUMN hora_recogida TEXT');
      console.log('✅ Columna hora_recogida agregada exitosamente');
    } else {
      console.log('ℹ️ La columna hora_recogida ya existe');
    }

    // Verificar la estructura final
    const finalColumns = await all('PRAGMA table_info(pedidos)');
    console.log('📋 Estructura final de la tabla pedidos:');
    finalColumns.forEach(col => {
      console.log(`  - ${col.name}: ${col.type}`);
    });

    console.log('✅ Migración completada exitosamente');
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateHoraRecogida()
    .then(() => {
      console.log('🎉 Migración finalizada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateHoraRecogida }; 