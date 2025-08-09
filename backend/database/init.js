const { run, get } = require('./connection');

async function initDatabase() {
  try {
    console.log('🗄️ Inicializando base de datos...');

    // Tabla de configuración del restaurante
    await run(`
      CREATE TABLE IF NOT EXISTS configuracion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre_restaurante TEXT NOT NULL DEFAULT 'Mi Restaurante',
        impuesto DECIMAL(5,2) DEFAULT 0.00,
        horario_apertura TEXT DEFAULT '08:00',
        horario_cierre TEXT DEFAULT '22:00',
        telefono TEXT,
        direccion TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de categorías
    await run(`
      CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL UNIQUE,
        descripcion TEXT,
        activo BOOLEAN DEFAULT 1,
        orden INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de productos
    await run(`
      CREATE TABLE IF NOT EXISTS productos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        precio DECIMAL(10,2) NOT NULL,
        categoria_id INTEGER NOT NULL,
        activo BOOLEAN DEFAULT 1,
        stock INTEGER DEFAULT -1,
        imagen TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categorias (id) ON DELETE CASCADE
      )
    `);

    // Tabla de pedidos
    await run(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        numero_pedido TEXT UNIQUE NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        impuesto DECIMAL(10,2) DEFAULT 0.00,
        total_con_impuesto DECIMAL(10,2) NOT NULL,
        forma_pago TEXT NOT NULL,
        cambio DECIMAL(10,2) DEFAULT 0.00,
        estado TEXT DEFAULT 'pendiente',
        mesa INTEGER,
        observaciones TEXT,
        hora_recogida TEXT,
        pdf_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabla de mesas
    await run(`
      CREATE TABLE IF NOT EXISTS mesas (
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

    // Tabla de items del pedido
    await run(`
      CREATE TABLE IF NOT EXISTS pedido_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pedido_id INTEGER NOT NULL,
        producto_id INTEGER NOT NULL,
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10,2) NOT NULL,
        subtotal DECIMAL(10,2) NOT NULL,
        observaciones TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pedido_id) REFERENCES pedidos (id) ON DELETE CASCADE,
        FOREIGN KEY (producto_id) REFERENCES productos (id) ON DELETE CASCADE
      )
    `);

    // Insertar configuración por defecto
    const configExists = await get('SELECT COUNT(*) as count FROM configuracion');
    if (!configExists || configExists.count === 0) {
      await run(`
        INSERT INTO configuracion (nombre_restaurante, impuesto, horario_apertura, horario_cierre)
        VALUES ('Mi Restaurante', 0.00, '08:00', '22:00')
      `);
      console.log('✅ Configuración por defecto insertada');
    }

    // Insertar categorías de ejemplo
    const categorias = [
      { nombre: 'Bebidas', descripcion: 'Bebidas y refrescos', orden: 1 },
      { nombre: 'Platos Principales', descripcion: 'Platos fuertes', orden: 2 },
      { nombre: 'Postres', descripcion: 'Dulces y postres', orden: 3 },
      { nombre: 'Entradas', descripcion: 'Aperitivos y entradas', orden: 4 }
    ];

    for (const categoria of categorias) {
      await run(`
        INSERT OR IGNORE INTO categorias (nombre, descripcion, orden)
        VALUES (?, ?, ?)
      `, [categoria.nombre, categoria.descripcion, categoria.orden]);
    }

    // Insertar productos de ejemplo
    const productos = [
      { nombre: 'Coca Cola', descripcion: 'Refresco de cola 350ml', precio: 2.50, categoria_id: 1 },
      { nombre: 'Agua Mineral', descripcion: 'Agua sin gas 500ml', precio: 1.50, categoria_id: 1 },
      { nombre: 'Hamburguesa Clásica', descripcion: 'Hamburguesa con carne, lechuga y tomate', precio: 8.50, categoria_id: 2 },
      { nombre: 'Pizza Margherita', descripcion: 'Pizza con tomate y mozzarella', precio: 12.00, categoria_id: 2 },
      { nombre: 'Tiramisú', descripcion: 'Postre italiano tradicional', precio: 5.00, categoria_id: 3 },
      { nombre: 'Papas Fritas', descripcion: 'Porción de papas fritas', precio: 3.50, categoria_id: 4 }
    ];

    for (const producto of productos) {
      await run(`
        INSERT OR IGNORE INTO productos (nombre, descripcion, precio, categoria_id)
        VALUES (?, ?, ?, ?)
      `, [producto.nombre, producto.descripcion, producto.precio, producto.categoria_id]);
    }

    console.log('✅ Base de datos inicializada correctamente');
    console.log('📋 Datos de ejemplo insertados');
    console.log('🍽️ Categorías: Bebidas, Platos Principales, Postres, Entradas');
    console.log('🍔 Productos: 6 productos de ejemplo agregados');

  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  initDatabase().then(() => {
    console.log('🎉 Inicialización completada');
    process.exit(0);
  });
}

module.exports = { initDatabase }; 