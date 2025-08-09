const { run, get, all } = require('./database/connection');

async function migrateMesas() {
  try {
    console.log('🗄️ Iniciando migración de mesas...');

    // Verificar si la tabla mesas ya existe
    const tableExists = await get(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='mesas'
    `);

    if (!tableExists) {
      console.log('📋 Creando tabla mesas...');
      
      // Crear tabla de mesas
      await run(`
        CREATE TABLE mesas (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          numero INTEGER UNIQUE NOT NULL,
          estado TEXT DEFAULT 'libre',
          pedido_id INTEGER,
          cliente_nombre TEXT,
          cliente_telefono TEXT,
          hora_apertura DATETIME,
          hora_cierre DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE SET NULL
        )
      `);
      
      console.log('✅ Tabla mesas creada exitosamente');
    } else {
      console.log('ℹ️ Tabla mesas ya existe');
    }

    // Verificar si la columna mesa existe en la tabla pedidos
    const columnExists = await all(`
      PRAGMA table_info(pedidos)
    `);
    
    const hasMesaColumn = columnExists.some(col => col.name === 'mesa');
    
    if (!hasMesaColumn) {
      console.log('📋 Agregando columna mesa a tabla pedidos...');
      
      // Agregar columna mesa a la tabla pedidos
      await run(`
        ALTER TABLE pedidos 
        ADD COLUMN mesa INTEGER
      `);
      
      console.log('✅ Columna mesa agregada a tabla pedidos');
    } else {
      console.log('ℹ️ Columna mesa ya existe en tabla pedidos');
    }

    // Crear algunas mesas de ejemplo
    console.log('📋 Creando mesas de ejemplo...');
    
    const mesasEjemplo = [1, 2, 3, 4, 5, 6, 7, 8];
    
    for (const numero of mesasEjemplo) {
      const mesaExists = await get('SELECT id FROM mesas WHERE numero = ?', [numero]);
      
      if (!mesaExists) {
        await run(`
          INSERT INTO mesas (numero, estado, created_at, updated_at)
          VALUES (?, 'libre', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [numero]);
        console.log(`✅ Mesa ${numero} creada`);
      } else {
        console.log(`ℹ️ Mesa ${numero} ya existe`);
      }
    }

    // Verificar la estructura final
    console.log('\n📊 Verificando estructura de la base de datos...');
    
    const mesas = await all('SELECT * FROM mesas ORDER BY numero');
    console.log(`✅ ${mesas.length} mesas encontradas:`);
    
    mesas.forEach(mesa => {
      console.log(`  - Mesa ${mesa.numero}: ${mesa.estado}`);
    });

    // Verificar estructura de pedidos
    const pedidosInfo = await all('PRAGMA table_info(pedidos)');
    const hasMesa = pedidosInfo.some(col => col.name === 'mesa');
    console.log(`✅ Tabla pedidos ${hasMesa ? 'tiene' : 'NO tiene'} columna mesa`);

    console.log('\n🎉 Migración de mesas completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar migración si se llama directamente
if (require.main === module) {
  migrateMesas()
    .then(() => {
      console.log('✅ Migración completada');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateMesas }; 