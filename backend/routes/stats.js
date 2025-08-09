const express = require('express');
const router = express.Router();
const { all, get } = require('../database/connection');
const dayjs = require('dayjs');

// GET /api/stats - Obtener estadísticas generales
router.get('/', async (req, res) => {
  try {
    const { periodo = 'hoy' } = req.query;
    
    let fechaInicio, fechaFin;
    const hoy = dayjs();

    switch (periodo) {
      case 'hoy':
        fechaInicio = hoy.startOf('day').format('YYYY-MM-DD');
        fechaFin = hoy.endOf('day').format('YYYY-MM-DD');
        break;
      case 'ayer':
        fechaInicio = hoy.subtract(1, 'day').startOf('day').format('YYYY-MM-DD');
        fechaFin = hoy.subtract(1, 'day').endOf('day').format('YYYY-MM-DD');
        break;
      case 'semana':
        fechaInicio = hoy.startOf('week').format('YYYY-MM-DD');
        fechaFin = hoy.endOf('week').format('YYYY-MM-DD');
        break;
      case 'mes':
        fechaInicio = hoy.startOf('month').format('YYYY-MM-DD');
        fechaFin = hoy.endOf('month').format('YYYY-MM-DD');
        break;
      default:
        fechaInicio = hoy.startOf('day').format('YYYY-MM-DD');
        fechaFin = hoy.endOf('day').format('YYYY-MM-DD');
    }

    console.log(`📊 Generando estadísticas para período: ${fechaInicio} a ${fechaFin}`);

    // Estadísticas generales
    const stats = await get(`
      SELECT 
        COUNT(*) as total_pedidos,
        COALESCE(SUM(total_con_impuesto), 0) as ventas_totales,
        COALESCE(AVG(total_con_impuesto), 0) as promedio_por_pedido,
        COALESCE(SUM(impuesto), 0) as total_impuestos,
        COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as pedidos_entregados,
        COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as pedidos_cancelados
      FROM pedidos 
      WHERE date(created_at) BETWEEN ? AND ?
        AND estado != 'cancelado'
    `, [fechaInicio, fechaFin]);

    // Ventas por forma de pago
    const ventasPorPago = await all(`
      SELECT 
        forma_pago,
        COUNT(*) as cantidad,
        COALESCE(SUM(total_con_impuesto), 0) as total
      FROM pedidos 
      WHERE date(created_at) BETWEEN ? AND ?
        AND estado != 'cancelado'
      GROUP BY forma_pago
      ORDER BY total DESC
    `, [fechaInicio, fechaFin]);

    // Productos más vendidos
    const productosMasVendidos = await all(`
      SELECT 
        COALESCE(p.nombre, 'Producto Eliminado') as producto,
        COALESCE(c.nombre, 'Categoría Eliminada') as categoria,
        SUM(pi.cantidad) as cantidad_vendida,
        COALESCE(SUM(pi.subtotal), 0) as total_vendido
      FROM pedido_items pi
      LEFT JOIN productos p ON pi.producto_id = p.id
      LEFT JOIN categorias c ON p.categoria_id = c.id
      JOIN pedidos ped ON pi.pedido_id = ped.id
      WHERE date(ped.created_at) BETWEEN ? AND ?
        AND ped.estado != 'cancelado'
      GROUP BY p.id, p.nombre, c.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 10
    `, [fechaInicio, fechaFin]);

    // Ventas por hora del día
    const ventasPorHora = await all(`
      SELECT 
        strftime('%H', created_at) as hora,
        COUNT(*) as cantidad_pedidos,
        COALESCE(SUM(total_con_impuesto), 0) as total_ventas
      FROM pedidos 
      WHERE date(created_at) BETWEEN ? AND ?
        AND estado != 'cancelado'
      GROUP BY strftime('%H', created_at)
      ORDER BY hora
    `, [fechaInicio, fechaFin]);

    res.json({
      success: true,
      data: {
        periodo: {
          inicio: fechaInicio,
          fin: fechaFin,
          tipo: periodo
        },
        general: {
          total_pedidos: stats.total_pedidos || 0,
          ventas_totales: parseFloat(stats.ventas_totales || 0).toFixed(2),
          promedio_por_pedido: parseFloat(stats.promedio_por_pedido || 0).toFixed(2),
          total_impuestos: parseFloat(stats.total_impuestos || 0).toFixed(2),
          pedidos_entregados: stats.pedidos_entregados || 0,
          pedidos_cancelados: stats.pedidos_cancelados || 0
        },
        ventas_por_pago: ventasPorPago.map(v => ({
          ...v,
          total: parseFloat(v.total || 0).toFixed(2)
        })),
        productos_mas_vendidos: productosMasVendidos.map(p => ({
          ...p,
          total_vendido: parseFloat(p.total_vendido || 0).toFixed(2)
        })),
        ventas_por_hora: ventasPorHora.map(v => ({
          ...v,
          total_ventas: parseFloat(v.total_ventas || 0).toFixed(2)
        }))
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo estadísticas'
    });
  }
});

// GET /api/stats/ventas-diarias - Ventas de los últimos 30 días
router.get('/ventas-diarias', async (req, res) => {
  try {
    const ventasDiarias = await all(`
      SELECT 
        date(created_at) as fecha,
        COUNT(*) as cantidad_pedidos,
        COALESCE(SUM(total_con_impuesto), 0) as total_ventas
      FROM pedidos 
      WHERE date(created_at) >= date('now', '-30 days')
        AND estado != 'cancelado'
      GROUP BY date(created_at)
      ORDER BY fecha DESC
      LIMIT 30
    `);

    res.json({
      success: true,
      data: ventasDiarias.map(v => ({
        ...v,
        total_ventas: parseFloat(v.total_ventas || 0).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Error obteniendo ventas diarias:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo ventas diarias'
    });
  }
});

// GET /api/stats/ventas-por-hora - Ventas por hora del día actual
router.get('/ventas-por-hora', async (req, res) => {
  try {
    const hoy = dayjs().format('YYYY-MM-DD');
    
    const ventasPorHora = await all(`
      SELECT 
        strftime('%H', created_at) as hora,
        COUNT(*) as cantidad_pedidos,
        COALESCE(SUM(total_con_impuesto), 0) as total_ventas
      FROM pedidos 
      WHERE date(created_at) = ?
        AND estado != 'cancelado'
      GROUP BY strftime('%H', created_at)
      ORDER BY hora
    `, [hoy]);

    res.json({
      success: true,
      data: ventasPorHora.map(v => ({
        ...v,
        total_ventas: parseFloat(v.total_ventas || 0).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Error obteniendo ventas por hora:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo ventas por hora'
    });
  }
});

// GET /api/stats/ventas-por-dia-semana - Ventas por día de la semana actual
router.get('/ventas-por-dia-semana', async (req, res) => {
  try {
    const inicioSemana = dayjs().startOf('week').format('YYYY-MM-DD');
    const finSemana = dayjs().endOf('week').format('YYYY-MM-DD');
    
    const ventasPorDia = await all(`
      SELECT 
        date(created_at) as fecha,
        strftime('%w', created_at) as dia_semana,
        COUNT(*) as cantidad_pedidos,
        COALESCE(SUM(total_con_impuesto), 0) as total_ventas
      FROM pedidos 
      WHERE date(created_at) BETWEEN ? AND ?
        AND estado != 'cancelado'
      GROUP BY date(created_at)
      ORDER BY fecha
    `, [inicioSemana, finSemana]);

    res.json({
      success: true,
      data: ventasPorDia.map(v => ({
        ...v,
        total_ventas: parseFloat(v.total_ventas || 0).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Error obteniendo ventas por día de la semana:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo ventas por día de la semana'
    });
  }
});

// GET /api/stats/ventas-por-dia-mes - Ventas por día del mes actual
router.get('/ventas-por-dia-mes', async (req, res) => {
  try {
    const inicioMes = dayjs().startOf('month').format('YYYY-MM-DD');
    const finMes = dayjs().endOf('month').format('YYYY-MM-DD');
    
    const ventasPorDia = await all(`
      SELECT 
        date(created_at) as fecha,
        strftime('%d', created_at) as dia_mes,
        COUNT(*) as cantidad_pedidos,
        COALESCE(SUM(total_con_impuesto), 0) as total_ventas
      FROM pedidos 
      WHERE date(created_at) BETWEEN ? AND ?
        AND estado != 'cancelado'
      GROUP BY date(created_at)
      ORDER BY fecha
    `, [inicioMes, finMes]);

    res.json({
      success: true,
      data: ventasPorDia.map(v => ({
        ...v,
        total_ventas: parseFloat(v.total_ventas || 0).toFixed(2)
      }))
    });
  } catch (error) {
    console.error('Error obteniendo ventas por día del mes:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo ventas por día del mes'
    });
  }
});

module.exports = router; 