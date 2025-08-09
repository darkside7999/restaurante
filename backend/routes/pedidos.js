const express = require('express');
const { run, get, all } = require('../database/connection');
const { generarPDF } = require('../utils/pdfGenerator');
const dayjs = require('dayjs');

const router = express.Router();

// Obtener todos los pedidos
router.get('/', async (req, res) => {
  try {
    const { estado, fecha } = req.query;
    
    let query = `
      SELECT p.*, 
             COUNT(pi.id) as total_items
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
    `;
    
    const conditions = [];
    const params = [];
    
    if (estado) {
      conditions.push('p.estado = ?');
      params.push(estado);
    }
    
    if (fecha) {
      conditions.push('DATE(p.created_at) = ?');
      params.push(fecha);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' GROUP BY p.id ORDER BY p.created_at DESC';
    
    const pedidos = await all(query, params);
    
    // Obtener items para cada pedido
    for (const pedido of pedidos) {
      const items = await all(`
        SELECT pi.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
        FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        WHERE pi.pedido_id = ?
        ORDER BY p.nombre
      `, [pedido.id]);
      
      pedido.items = items;
    }
    
    res.json({
      success: true,
      data: pedidos
    });
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo pedidos'
    });
  }
});

// Obtener pedidos activos (para cocina)
router.get('/activos', async (req, res) => {
  try {
    const pedidos = await all(`
      SELECT p.*, 
             COUNT(pi.id) as total_items
      FROM pedidos p
      LEFT JOIN pedido_items pi ON p.id = pi.pedido_id
      WHERE p.estado IN ('pendiente', 'en_preparacion', 'listo')
      GROUP BY p.id
      ORDER BY p.created_at ASC
    `);
    
    // Obtener items para cada pedido
    for (const pedido of pedidos) {
      const items = await all(`
        SELECT pi.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
        FROM pedido_items pi
        JOIN productos p ON pi.producto_id = p.id
        WHERE pi.pedido_id = ?
        ORDER BY p.nombre
      `, [pedido.id]);
      
      pedido.items = items;
    }
    
    res.json({
      success: true,
      data: pedidos
    });
  } catch (error) {
    console.error('Error obteniendo pedidos activos:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo pedidos activos'
    });
  }
});

// Obtener un pedido específico
router.get('/:id', async (req, res) => {
  try {
    const pedido = await get('SELECT * FROM pedidos WHERE id = ?', [req.params.id]);
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }
    
    const items = await all(`
      SELECT pi.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
      FROM pedido_items pi
      JOIN productos p ON pi.producto_id = p.id
      WHERE pi.pedido_id = ?
      ORDER BY p.nombre
    `, [req.params.id]);
    
    pedido.items = items;
    
    res.json({
      success: true,
      data: pedido
    });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo pedido'
    });
  }
});

// Crear nuevo pedido
router.post('/', async (req, res) => {
  try {
    const { items, forma_pago, cambio, observaciones } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'El pedido debe tener al menos un item'
      });
    }
    
    // Calcular totales
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    const config = await get('SELECT impuesto FROM configuracion LIMIT 1');
    const impuesto = (total * config.impuesto) / 100;
    const totalConImpuesto = total + impuesto;
    
    // Aplicar descuento si existe
    const descuento = req.body.descuento || 0;
    const totalConDescuento = totalConImpuesto - descuento;
    
    console.log('💰 Cálculo de totales:', {
      subtotal: total,
      impuesto: impuesto,
      totalConImpuesto: totalConImpuesto,
      descuento: descuento,
      totalFinal: totalConDescuento
    });
    
    // Generar número de pedido único
    const fecha = dayjs().format('YYYYMMDD');
    
    // Obtener el último número de pedido del día
    const lastPedido = await get(`
      SELECT numero_pedido 
      FROM pedidos 
      WHERE numero_pedido LIKE ? 
      ORDER BY id DESC 
      LIMIT 1
    `, [`${fecha}-%`]);
    
    let numeroPedido;
    if (lastPedido) {
      // Extraer el número del último pedido y incrementarlo
      const lastNumero = parseInt(lastPedido.numero_pedido.split('-')[1]);
      const nextNumero = lastNumero + 1;
      numeroPedido = `${fecha}-${String(nextNumero).padStart(3, '0')}`;
    } else {
      // Primer pedido del día
      numeroPedido = `${fecha}-001`;
    }
    
    // Verificar que el número no exista (doble verificación)
    const existingPedido = await get('SELECT id FROM pedidos WHERE numero_pedido = ?', [numeroPedido]);
    if (existingPedido) {
      // Si existe, buscar el siguiente número disponible
      let nextNumero = parseInt(numeroPedido.split('-')[1]) + 1;
      let nextNumeroPedido = `${fecha}-${String(nextNumero).padStart(3, '0')}`;
      
      while (await get('SELECT id FROM pedidos WHERE numero_pedido = ?', [nextNumeroPedido])) {
        nextNumero++;
        nextNumeroPedido = `${fecha}-${String(nextNumero).padStart(3, '0')}`;
      }
      
      numeroPedido = nextNumeroPedido;
    }
    
    // Insertar pedido
    const result = await run(`
      INSERT INTO pedidos (numero_pedido, total, impuesto, total_con_impuesto, descuento, total_final, forma_pago, cambio, observaciones, mesa, hora_recogida)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [numeroPedido, total, impuesto, totalConImpuesto, descuento, totalConDescuento, forma_pago, cambio || 0, observaciones || '', req.body.mesa || null, req.body.hora_recogida || null]);
    
    const pedidoId = result.lastID;
    
    // Verificar que el pedido se insertó correctamente
    if (!pedidoId) {
      throw new Error('No se pudo obtener el ID del pedido insertado');
    }
    
    console.log('✅ Pedido insertado con ID:', pedidoId);
    
    // Insertar items
    for (const item of items) {
      console.log('📦 Insertando item:', item.nombre, 'para pedido:', pedidoId);
      await run(`
        INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario, subtotal, observaciones)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        pedidoId,
        item.id,
        item.cantidad,
        item.precio,
        item.precio * item.cantidad,
        item.observaciones || ''
      ]);
    }
    
    console.log('✅ Todos los items insertados correctamente');
    
    // Generar PDF
    let pdfPath = null;
    try {
      pdfPath = await generarPDF(pedidoId);
      console.log('✅ PDF generado exitosamente:', pdfPath);
    } catch (pdfError) {
      console.error('❌ Error generando PDF:', pdfError);
      // No fallar el pedido por error en PDF
      pdfPath = null;
    }
    
    // Actualizar pedido con ruta del PDF (solo si se generó correctamente)
    if (pdfPath) {
      try {
        await run('UPDATE pedidos SET pdf_path = ? WHERE id = ?', [pdfPath, pedidoId]);
      } catch (updateError) {
        console.error('❌ Error actualizando ruta del PDF:', updateError);
        // No fallar el pedido por error en actualización
      }
    }
    
    // Obtener pedido completo para emitir
    const pedidoCompleto = await get('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    const itemsCompletos = await all(`
      SELECT pi.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
      FROM pedido_items pi
      JOIN productos p ON pi.producto_id = p.id
      WHERE pi.pedido_id = ?
      ORDER BY p.nombre
    `, [pedidoId]);
    
    pedidoCompleto.items = itemsCompletos;
    
    // Emitir evento WebSocket
    if (global.io) {
      global.io.emit('nuevo_pedido', pedidoCompleto);
      global.io.emit('estadisticas_actualizadas');
    }
    
    res.json({
      success: true,
      data: {
        id: pedidoId,
        numero_pedido: numeroPedido,
        total: total,
        total_con_impuesto: totalConImpuesto,
        pdf_path: pdfPath
      },
      message: 'Pedido creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error creando pedido'
    });
  }
});

// Actualizar estado del pedido
router.put('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const pedidoId = req.params.id;
    
    const estadosValidos = ['pendiente', 'en_preparacion', 'listo', 'entregado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        error: 'Estado no válido'
      });
    }
    
    await run('UPDATE pedidos SET estado = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [estado, pedidoId]);
    
    // Obtener pedido actualizado
    const pedido = await get('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    const items = await all(`
      SELECT pi.*, p.nombre as producto_nombre, p.descripcion as producto_descripcion
      FROM pedido_items pi
      JOIN productos p ON pi.producto_id = p.id
      WHERE pi.pedido_id = ?
      ORDER BY p.nombre
    `, [pedidoId]);
    
    pedido.items = items;
    
    // Emitir evento WebSocket
    if (global.io) {
      global.io.emit('pedido_actualizado', pedido);
      global.io.emit('estadisticas_actualizadas');
    }
    
    res.json({
      success: true,
      data: pedido,
      message: 'Estado actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando estado'
    });
  }
});

// Eliminar pedido
router.delete('/:id', async (req, res) => {
  try {
    const pedidoId = req.params.id;
    
    // Verificar que el pedido existe
    const pedido = await get('SELECT * FROM pedidos WHERE id = ?', [pedidoId]);
    
    if (!pedido) {
      return res.status(404).json({
        success: false,
        error: 'Pedido no encontrado'
      });
    }
    
    console.log(`🗑️ Eliminando pedido ${pedido.numero_pedido} (estado: ${pedido.estado})`);
    
    // Eliminar items del pedido
    await run('DELETE FROM pedido_items WHERE pedido_id = ?', [pedidoId]);
    
    // Eliminar pedido
    await run('DELETE FROM pedidos WHERE id = ?', [pedidoId]);
    
    // Emitir eventos WebSocket para actualización automática
    if (global.io) {
      global.io.emit('pedido_eliminado', { id: pedidoId });
      global.io.emit('estadisticas_actualizadas');
      global.io.emit('menu_actualizado');
    }
    
    res.json({
      success: true,
      message: 'Pedido eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando pedido:', error);
    res.status(500).json({
      success: false,
      error: 'Error eliminando pedido'
    });
  }
});

module.exports = router;