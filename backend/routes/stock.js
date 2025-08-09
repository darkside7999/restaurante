const express = require('express');
const router = express.Router();
const { get, all, run } = require('../database/connection');

// Obtener productos con stock bajo
router.get('/bajo', async (req, res) => {
  try {
    const productos = await all(`
      SELECT p.*, c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND p.stock_bajo = 1
      ORDER BY p.nombre ASC
    `);

    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos con stock bajo:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos con stock bajo'
    });
  }
});

// Obtener productos sin stock
router.get('/sin-stock', async (req, res) => {
  try {
    const productos = await all(`
      SELECT p.*, c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = 1 AND p.stock_disponible = 0
      ORDER BY p.nombre ASC
    `);

    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error obteniendo productos sin stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo productos sin stock'
    });
  }
});

// Actualizar estado de stock de un producto
router.put('/:id', async (req, res) => {
  try {
    const { stock_disponible, stock_bajo } = req.body;
    const productoId = req.params.id;

    // Validar datos
    if (stock_disponible === undefined || stock_bajo === undefined) {
      return res.status(400).json({
        success: false,
        error: 'stock_disponible y stock_bajo son requeridos'
      });
    }

    // Actualizar producto
    await run(`
      UPDATE productos 
      SET stock_disponible = ?, 
          stock_bajo = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [stock_disponible ? 1 : 0, stock_bajo ? 1 : 0, productoId]);

    // Obtener producto actualizado
    const producto = await get(`
      SELECT p.*, c.nombre as categoria_nombre
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [productoId]);

    // Emitir evento WebSocket si hay cambios importantes
    if (global.io) {
      global.io.emit('stock_actualizado', producto);
      
      // Si el producto no está disponible o tiene stock bajo, emitir alerta
      if (!producto.stock_disponible || producto.stock_bajo) {
        global.io.emit('alerta_stock', {
          tipo: !producto.stock_disponible ? 'sin_stock' : 'stock_bajo',
          producto: producto
        });
      }
    }

    res.json({
      success: true,
      data: producto,
      message: 'Estado de stock actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando estado de stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando estado de stock'
    });
  }
});

// Obtener estadísticas de stock
router.get('/stats', async (req, res) => {
  try {
    const stats = await get(`
      SELECT 
        COUNT(*) as total_productos,
        COUNT(CASE WHEN stock_disponible = 0 THEN 1 END) as sin_stock,
        COUNT(CASE WHEN stock_bajo = 1 AND stock_disponible = 1 THEN 1 END) as stock_bajo,
        COUNT(CASE WHEN stock_disponible = 1 AND stock_bajo = 0 THEN 1 END) as stock_ok
      FROM productos 
      WHERE activo = 1
    `);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas de stock:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas de stock'
    });
  }
});

module.exports = router; 