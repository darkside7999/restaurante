const express = require('express');
const { run, get, all } = require('../database/connection');
const router = express.Router();

// Obtener todas las mesas
router.get('/', async (req, res) => {
  try {
    const mesas = await all(`
      SELECT m.*, 
             p.numero_pedido,
             p.total_con_impuesto,
             p.estado as pedido_estado,
             p.created_at as pedido_created_at,
             COUNT(pi.id) as total_items
      FROM mesas m
      LEFT JOIN pedidos p ON m.pedido_id = p.id
      LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
      GROUP BY m.id
      ORDER BY m.numero
    `);

    // Obtener items para cada mesa con pedido activo
    for (const mesa of mesas) {
      if (mesa.pedido_id) {
        const items = await all(`
          SELECT pi.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
          FROM pedido_items pi
          JOIN productos p ON pi.producto_id = p.id
          WHERE pi.pedido_id = ?
          ORDER BY p.nombre
        `, [mesa.pedido_id]);
        
        mesa.items = items;
      } else {
        mesa.items = [];
      }
    }

    res.json({
      success: true,
      data: mesas
    });
  } catch (error) {
    console.error('Error obteniendo mesas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo mesas'
    });
  }
});

// Obtener mesa específica
router.get('/:numero', async (req, res) => {
  try {
    const { numero } = req.params;
    
    const mesa = await get(`
      SELECT m.*, 
             p.numero_pedido,
             p.total_con_impuesto,
             p.estado as pedido_estado,
             p.created_at as pedido_created_at
      FROM mesas m
      LEFT JOIN pedidos p ON m.pedido_id = p.id
      WHERE m.numero = ?
    `, [numero]);

    if (!mesa) {
      return res.status(404).json({
        success: false,
        error: 'Mesa no encontrada'
      });
    }

    // Obtener items si hay pedido activo
    if (mesa.pedido_id) {
      const items = await all(`
        SELECT pi.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
        FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        WHERE pi.pedido_id = ?
        ORDER BY p.nombre
      `, [mesa.pedido_id]);
      
      mesa.items = items;
    } else {
      mesa.items = [];
    }

    res.json({
      success: true,
      data: mesa
    });
  } catch (error) {
    console.error('Error obteniendo mesa:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo mesa'
    });
  }
});

// Abrir mesa (crear pedido pendiente)
router.post('/:numero/abrir', async (req, res) => {
  try {
    const { numero } = req.params;
    const { cliente_nombre, cliente_telefono } = req.body;

    // Verificar que la mesa existe y está libre
    const mesa = await get('SELECT * FROM mesas WHERE numero = ?', [numero]);
    
    if (!mesa) {
      // Crear la mesa si no existe
      await run(`
        INSERT INTO mesas (numero, estado, cliente_nombre, cliente_telefono, hora_apertura)
        VALUES (?, 'ocupada', ?, ?, CURRENT_TIMESTAMP)
      `, [numero, cliente_nombre || '', cliente_telefono || '']);
    } else if (mesa.estado === 'ocupada') {
      return res.status(400).json({
        success: false,
        error: 'La mesa ya está ocupada'
      });
    } else {
      // Actualizar mesa existente
      await run(`
        UPDATE mesas 
        SET estado = 'ocupada', 
            cliente_nombre = ?, 
            cliente_telefono = ?, 
            hora_apertura = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE numero = ?
      `, [cliente_nombre || '', cliente_telefono || '', numero]);
    }

    // Crear pedido pendiente
    const numeroPedido = `M${numero}-${Date.now()}`;
    const result = await run(`
      INSERT INTO pedidos (numero_pedido, total, total_con_impuesto, forma_pago, estado, mesa)
      VALUES (?, 0.00, 0.00, 'pendiente', 'pendiente', ?)
    `, [numeroPedido, numero]);

    // Asociar pedido a la mesa
    await run(`
      UPDATE mesas 
      SET pedido_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE numero = ?
    `, [result.id, numero]);

    // Emitir evento WebSocket
    if (global.io) {
      global.io.emit('mesas_actualizadas');
    }

    res.json({
      success: true,
      data: {
        mesa_numero: numero,
        pedido_id: result.id,
        numero_pedido: numeroPedido
      }
    });
  } catch (error) {
    console.error('Error abriendo mesa:', error);
    res.status(500).json({
      success: false,
      error: 'Error abriendo mesa'
    });
  }
});

// Agregar producto a mesa
router.post('/:numero/agregar-producto', async (req, res) => {
  try {
    const { numero } = req.params;
    const { producto_id, cantidad, observaciones } = req.body;

    // Verificar que la mesa tiene un pedido activo
    const mesa = await get(`
      SELECT m.*, p.id as pedido_id, p.numero_pedido
      FROM mesas m
      JOIN pedidos p ON m.pedido_id = p.id
      WHERE m.numero = ? AND p.estado = 'pendiente'
    `, [numero]);

    if (!mesa) {
      return res.status(400).json({
        success: false,
        error: 'La mesa no tiene un pedido activo'
      });
    }

    // Obtener información del producto
    const producto = await get('SELECT * FROM productos WHERE id = ? AND activo = 1', [producto_id]);
    if (!producto) {
      return res.status(400).json({
        success: false,
        error: 'Producto no encontrado o inactivo'
      });
    }

    // Verificar si el producto ya está en el pedido
    const itemExistente = await get(`
      SELECT * FROM pedido_items 
      WHERE pedido_id = ? AND producto_id = ?
    `, [mesa.pedido_id, producto_id]);

    if (itemExistente) {
      // Actualizar cantidad
      const nuevaCantidad = itemExistente.cantidad + cantidad;
      const nuevoSubtotal = nuevaCantidad * producto.precio;
      
      await run(`
        UPDATE pedido_items 
        SET cantidad = ?, subtotal = ?, observaciones = ?
        WHERE id = ?
      `, [nuevaCantidad, nuevoSubtotal, observaciones || itemExistente.observaciones, itemExistente.id]);
    } else {
      // Agregar nuevo item
      const subtotal = cantidad * producto.precio;
      await run(`
        INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal, observaciones)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [mesa.pedido_id, producto_id, cantidad, producto.precio, subtotal, observaciones || '']);
    }

    // Recalcular total del pedido
    const items = await all(`
      SELECT SUM(subtotal) as total
      FROM pedido_items 
      WHERE pedido_id = ?
    `, [mesa.pedido_id]);

    const total = items[0].total || 0;
    await run(`
      UPDATE pedidos 
      SET total = ?, total_con_impuesto = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [total, total, mesa.pedido_id]);

    // Emitir eventos WebSocket
    if (global.io) {
      global.io.emit('mesas_actualizadas');
      global.io.emit('pedido_actualizado', { pedido_id: mesa.pedido_id });
    }

    res.json({
      success: true,
      data: {
        mesa_numero: numero,
        pedido_id: mesa.pedido_id,
        total: total
      }
    });
  } catch (error) {
    console.error('Error agregando producto a mesa:', error);
    res.status(500).json({
      success: false,
      error: 'Error agregando producto a mesa'
    });
  }
});

// Remover producto de mesa
router.delete('/:numero/producto/:item_id', async (req, res) => {
  try {
    const { numero, item_id } = req.params;
    
    console.log('🗑️ Backend: Intentando remover producto', {
      numero: numero,
      item_id: item_id,
      params: req.params
    });

    // Verificar que la mesa tiene un pedido activo
    const mesa = await get(`
      SELECT m.*, p.id as pedido_id
      FROM mesas m
      JOIN pedidos p ON m.pedido_id = p.id
      WHERE m.numero = ? AND p.estado = 'pendiente'
    `, [numero]);

    if (!mesa) {
      console.log('❌ Backend: Mesa no encontrada o sin pedido activo', { numero });
      return res.status(400).json({
        success: false,
        error: 'La mesa no tiene un pedido activo'
      });
    }
    
    console.log('✅ Backend: Mesa encontrada', { mesa });

    // Verificar que el item pertenece al pedido
    const item = await get(`
      SELECT * FROM pedido_items 
      WHERE id = ? AND pedido_id = ?
    `, [item_id, mesa.pedido_id]);

    if (!item) {
      console.log('❌ Backend: Item no encontrado', { item_id, pedido_id: mesa.pedido_id });
      return res.status(400).json({
        success: false,
        error: 'Item no encontrado'
      });
    }
    
    console.log('✅ Backend: Item encontrado', { item });

    // Eliminar item
    await run('DELETE FROM pedido_items WHERE id = ?', [item_id]);

    // Recalcular total del pedido
    const items = await all(`
      SELECT SUM(subtotal) as total
      FROM pedido_items 
      WHERE pedido_id = ?
    `, [mesa.pedido_id]);

    const total = items[0].total || 0;
    await run(`
      UPDATE pedidos 
      SET total = ?, total_con_impuesto = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [total, total, mesa.pedido_id]);

    // Emitir eventos WebSocket
    if (global.io) {
      global.io.emit('mesas_actualizadas');
      global.io.emit('pedido_actualizado', { pedido_id: mesa.pedido_id });
    }

    res.json({
      success: true,
      data: {
        mesa_numero: numero,
        pedido_id: mesa.pedido_id,
        total: total
      }
    });
  } catch (error) {
    console.error('Error removiendo producto de mesa:', error);
    res.status(500).json({
      success: false,
      error: 'Error removiendo producto de mesa'
    });
  }
});

// Cerrar mesa (pagar pedido)
router.post('/:numero/cerrar', async (req, res) => {
  try {
    const { numero } = req.params;
    const { forma_pago, pago_recibido, observaciones } = req.body;

    // Verificar que la mesa tiene un pedido activo
    const mesa = await get(`
      SELECT m.*, p.*
      FROM mesas m
      JOIN pedidos p ON m.pedido_id = p.id
      WHERE m.numero = ? AND p.estado = 'pendiente'
    `, [numero]);

    if (!mesa) {
      return res.status(400).json({
        success: false,
        error: 'La mesa no tiene un pedido activo'
      });
    }

    // Calcular cambio
    const cambio = (pago_recibido || mesa.total_con_impuesto) - mesa.total_con_impuesto;

    // Actualizar pedido como pagado
    await run(`
      UPDATE pedidos 
      SET estado = 'pagado',
          forma_pago = ?,
          cambio = ?,
          observaciones = ?,
          hora_recogida = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [forma_pago, cambio, observaciones, req.body.hora_recogida || null, mesa.pedido_id]);

    // Liberar mesa
    await run(`
      UPDATE mesas 
      SET estado = 'libre',
          pedido_id = NULL,
          hora_cierre = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE numero = ?
    `, [numero]);

    // Emitir eventos WebSocket
    if (global.io) {
      global.io.emit('mesas_actualizadas');
      global.io.emit('pedido_pagado', { pedido_id: mesa.pedido_id });
    }

    res.json({
      success: true,
      data: {
        mesa_numero: numero,
        pedido_id: mesa.pedido_id,
        total: mesa.total_con_impuesto,
        cambio: cambio
      }
    });
  } catch (error) {
    console.error('Error cerrando mesa:', error);
    res.status(500).json({
      success: false,
      error: 'Error cerrando mesa'
    });
  }
});

// Cancelar mesa (sin pagar)
router.post('/:numero/cancelar', async (req, res) => {
  try {
    const { numero } = req.params;
    
    console.log('🚫 Backend: Intentando cancelar mesa', {
      numero: numero,
      params: req.params
    });

    // Verificar que la mesa tiene un pedido activo
    const mesa = await get(`
      SELECT m.*, p.id as pedido_id
      FROM mesas m
      JOIN pedidos p ON m.pedido_id = p.id
      WHERE m.numero = ? AND p.estado = 'pendiente'
    `, [numero]);

    if (!mesa) {
      console.log('❌ Backend: Mesa no encontrada o sin pedido activo para cancelar', { numero });
      return res.status(400).json({
        success: false,
        error: 'La mesa no tiene un pedido activo'
      });
    }
    
    console.log('✅ Backend: Mesa encontrada para cancelar', { mesa });

    // Cancelar pedido
    console.log('🔄 Backend: Cancelando pedido', { pedido_id: mesa.pedido_id });
    await run(`
      UPDATE pedidos 
      SET estado = 'cancelado',
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [mesa.pedido_id]);

    // Liberar mesa
    console.log('🔄 Backend: Liberando mesa', { numero });
    await run(`
      UPDATE mesas 
      SET estado = 'libre',
          pedido_id = NULL,
          hora_cierre = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE numero = ?
    `, [numero]);

    // Emitir eventos WebSocket
    if (global.io) {
      global.io.emit('mesas_actualizadas');
      global.io.emit('pedido_cancelado', { pedido_id: mesa.pedido_id });
    }

    res.json({
      success: true,
      data: {
        mesa_numero: numero,
        pedido_id: mesa.pedido_id
      }
    });
  } catch (error) {
    console.error('Error cancelando mesa:', error);
    res.status(500).json({
      success: false,
      error: 'Error cancelando mesa'
    });
  }
});

module.exports = router; 