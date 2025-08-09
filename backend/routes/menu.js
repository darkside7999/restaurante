const express = require('express');
const router = express.Router();
const { all, get, run } = require('../database/connection');

// Obtener menú completo
router.get('/', async (req, res) => {
  try {
    const categorias = await all(`
      SELECT * FROM categorias 
      WHERE activo = 1 
      ORDER BY orden, nombre
    `);

    const productos = await all(`
      SELECT p.*, c.nombre as categoria_nombre 
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1
      ORDER BY c.orden, c.nombre, p.nombre
    `);

    // Agrupar productos por categoría
    const menu = categorias.map(categoria => ({
      ...categoria,
      productos: productos.filter(p => p.categoria_id === categoria.id)
    }));

    res.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error('Error obteniendo menú:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo menú'
    });
  }
});

// GET /api/menu/categorias - Obtener solo categorías
router.get('/categorias', async (req, res) => {
  try {
    const categorias = await all(`
      SELECT id, nombre, descripcion, orden 
      FROM categorias 
      WHERE activo = 1 
      ORDER BY orden, nombre
    `);

    res.json({
      success: true,
      data: categorias
    });

  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo categorías'
    });
  }
});

// GET /api/menu/productos - Obtener solo productos
router.get('/productos', async (req, res) => {
  try {
    const productos = await all(`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock_disponible, p.stock_bajo, p.imagen,
             c.id as categoria_id, c.nombre as categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND c.activo = 1
      ORDER BY c.orden, p.nombre
    `);

    res.json({
      success: true,
      data: productos
    });

  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos'
    });
  }
});

// POST /api/menu/categorias - Crear nueva categoría
router.post('/categorias', async (req, res) => {
  try {
    const { nombre, descripcion, orden } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre de la categoría es requerido'
      });
    }

    const result = await run(`
      INSERT INTO categorias (nombre, descripcion, orden)
      VALUES (?, ?, ?)
    `, [nombre, descripcion || '', orden || 0]);

    const nuevaCategoria = await get(`
      SELECT id, nombre, descripcion, orden 
      FROM categorias 
      WHERE id = ?
    `, [result.id]);

    // Emitir evento WebSocket para actualización automática
    if (global.io) {
      global.io.emit('menu_actualizado');
    }

    res.status(201).json({
      success: true,
      data: nuevaCategoria
    });

  } catch (error) {
    console.error('Error creando categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando la categoría'
    });
  }
});

// POST /api/menu/productos - Crear nuevo producto
router.post('/productos', async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoria_id, stock_disponible, stock_bajo, imagen } = req.body;

    if (!nombre || !precio || !categoria_id) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, precio y categoría son requeridos'
      });
    }

    // Verificar que la categoría existe
    const categoria = await get('SELECT id FROM categorias WHERE id = ? AND activo = 1', [categoria_id]);
    if (!categoria) {
      return res.status(400).json({
        success: false,
        error: 'La categoría especificada no existe o está inactiva'
      });
    }

    const result = await run(`
      INSERT INTO productos (nombre, descripcion, precio, categoria_id, stock_disponible, stock_bajo, imagen)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      nombre, 
      descripcion || '', 
      precio, 
      categoria_id, 
      stock_disponible !== undefined ? stock_disponible : 1,
      stock_bajo !== undefined ? stock_bajo : 0,
      imagen || null
    ]);

    const nuevoProducto = await get(`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock_disponible, p.stock_bajo, p.imagen,
             c.id as categoria_id, c.nombre as categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [result.id]);

    // Emitir evento WebSocket para actualización automática
    if (global.io) {
      global.io.emit('menu_actualizado');
    }

    res.status(201).json({
      success: true,
      data: nuevoProducto
    });

  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando el producto'
    });
  }
});

// PUT /api/menu/categorias/:id - Actualizar categoría
router.put('/categorias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, orden, activo } = req.body;

    // Verificar que la categoría existe
    const categoriaExistente = await get('SELECT id FROM categorias WHERE id = ?', [id]);
    if (!categoriaExistente) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }

    await run(`
      UPDATE categorias 
      SET nombre = ?, descripcion = ?, orden = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [nombre, descripcion, orden, activo !== undefined ? activo : 1, id]);

    const categoriaActualizada = await get(`
      SELECT id, nombre, descripcion, orden, activo
      FROM categorias 
      WHERE id = ?
    `, [id]);

    // Emitir evento WebSocket para actualización automática
    if (global.io) {
      global.io.emit('menu_actualizado');
    }

    res.json({
      success: true,
      data: categoriaActualizada
    });

  } catch (error) {
    console.error('Error actualizando categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando la categoría'
    });
  }
});

// PUT /api/menu/productos/:id - Actualizar producto
router.put('/productos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precio, categoria_id, stock_disponible, stock_bajo, imagen, activo } = req.body;

    // Verificar que el producto existe
    const productoExistente = await get('SELECT id FROM productos WHERE id = ?', [id]);
    if (!productoExistente) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }

    // Verificar que la categoría existe si se está cambiando
    if (categoria_id) {
      const categoria = await get('SELECT id FROM categorias WHERE id = ? AND activo = 1', [categoria_id]);
      if (!categoria) {
        return res.status(400).json({
          success: false,
          error: 'La categoría especificada no existe o está inactiva'
        });
      }
    }

    await run(`
      UPDATE productos 
      SET nombre = ?, descripcion = ?, precio = ?, categoria_id = ?, 
          stock_disponible = ?, stock_bajo = ?, imagen = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      nombre, 
      descripcion, 
      precio, 
      categoria_id, 
      stock_disponible !== undefined ? stock_disponible : 1,
      stock_bajo !== undefined ? stock_bajo : 0,
      imagen, 
      activo !== undefined ? activo : 1, 
      id
    ]);

    const productoActualizado = await get(`
      SELECT p.id, p.nombre, p.descripcion, p.precio, p.stock_disponible, p.stock_bajo, p.imagen, p.activo,
             c.id as categoria_id, c.nombre as categoria_nombre
      FROM productos p
      JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [id]);

    // Emitir evento WebSocket para actualización automática
    if (global.io) {
      global.io.emit('menu_actualizado');
    }

    res.json({
      success: true,
      data: productoActualizado
    });

  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando el producto'
    });
  }
});

// Eliminar categoría (marcar como inactiva)
router.delete('/categorias/:id', async (req, res) => {
  try {
    const categoriaId = req.params.id;
    
    // Verificar que la categoría existe
    const categoria = await get('SELECT * FROM categorias WHERE id = ?', [categoriaId]);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }
    
    // Marcar como inactiva
    await run('UPDATE categorias SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [categoriaId]);
    
    // Emitir evento WebSocket para actualización automática
    if (global.io) {
      global.io.emit('menu_actualizado');
    }
    
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando categoría:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando categoría'
    });
  }
});

// Eliminar producto (marcar como inactivo)
router.delete('/productos/:id', async (req, res) => {
  try {
    const productoId = req.params.id;
    
    // Verificar que el producto existe
    const producto = await get('SELECT * FROM productos WHERE id = ?', [productoId]);
    if (!producto) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado'
      });
    }
    
    // Marcar como inactivo
    await run('UPDATE productos SET activo = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [productoId]);
    
    // Emitir evento WebSocket para actualización automática
    if (global.io) {
      global.io.emit('menu_actualizado');
    }
    
    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando producto'
    });
  }
});

module.exports = router; 