const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');
const { get, all } = require('../database/connection');
const dayjs = require('dayjs');

async function generarPDF(pedidoId) {
  try {
    console.log('📄 Iniciando generación de PDF para pedido:', pedidoId);
    
    // Obtener datos del pedido
    const pedido = await get(`
      SELECT p.id, p.numero_pedido, p.total, p.impuesto, p.total_con_impuesto, 
             p.forma_pago, p.cambio, p.observaciones, p.created_at,
             c.nombre_restaurante, c.telefono, c.direccion
      FROM pedidos p
      LEFT JOIN configuracion c ON 1=1
      WHERE p.id = ?
    `, [pedidoId]);

    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    console.log('✅ Datos del pedido obtenidos');

    // Obtener items del pedido
    const items = await all(`
      SELECT pi.cantidad, pi.precio_unitario, pi.subtotal, pi.observaciones,
             p.nombre as producto_nombre
      FROM pedido_items pi
      JOIN productos p ON pi.producto_id = p.id
      WHERE pi.pedido_id = ?
      ORDER BY p.nombre
    `, [pedidoId]);

    console.log('✅ Items del pedido obtenidos:', items.length);

    // Crear directorio para la fecha
    const fecha = dayjs(pedido.created_at);
    const directorioRecibos = path.join(__dirname, '..', 'recibos', 
      fecha.format('YYYY'), fecha.format('MM'), fecha.format('DD'));
    
    await fs.ensureDir(directorioRecibos);
    console.log('✅ Directorio creado:', directorioRecibos);

    // Generar nombre del archivo
    const nombreArchivo = `pedido-${pedido.numero_pedido}.pdf`;
    const rutaCompleta = path.join(directorioRecibos, nombreArchivo);

    console.log('📄 Generando PDF en:', rutaCompleta);

    // Crear documento PDF
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Crear stream de escritura
    const stream = fs.createWriteStream(rutaCompleta);
    doc.pipe(stream);

    // Configurar fuentes
    doc.font('Helvetica');

    // Encabezado
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text(pedido.nombre_restaurante || 'Mi Restaurante', { align: 'center' });

    doc.moveDown(0.5);

    // Información del restaurante
    if (pedido.telefono || pedido.direccion) {
      doc.fontSize(10)
         .font('Helvetica')
         .text(pedido.telefono || '', { align: 'center' });
      
      if (pedido.direccion) {
        doc.text(pedido.direccion, { align: 'center' });
      }
      doc.moveDown(0.5);
    }

    // Línea separadora
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();

    doc.moveDown(1);

    // Información del pedido
    doc.fontSize(12)
       .font('Helvetica-Bold')
       .text(`RECIBO #${pedido.numero_pedido}`, { align: 'center' });

    doc.moveDown(0.5);

    doc.fontSize(10)
       .font('Helvetica')
       .text(`Fecha: ${fecha.format('DD/MM/YYYY')}`, { align: 'center' })
       .text(`Hora: ${fecha.format('HH:mm')}`, { align: 'center' });

    doc.moveDown(1);

    // Línea separadora
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();

    doc.moveDown(1);

    // Tabla de productos - Versión simplificada
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Cant.', 50)
       .text('Producto', 100)
       .text('P.Unit.', 350)
       .text('Total', 450);

    doc.moveDown(0.5);

    // Línea de tabla
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();

    doc.moveDown(0.5);

    // Items del pedido
    doc.fontSize(9)
       .font('Helvetica');

    for (const item of items) {
      doc.text(item.cantidad.toString(), 50)
         .text(item.producto_nombre, 100)
         .text(`$${item.precio_unitario.toFixed(2)}`, 350)
         .text(`$${item.subtotal.toFixed(2)}`, 450);

      // Observaciones del item
      if (item.observaciones) {
        doc.fontSize(8)
           .font('Helvetica-Oblique')
           .text(`   ${item.observaciones}`, 100);
      }

      doc.moveDown(0.5);
    }

    doc.moveDown(1);

    // Línea separadora
    doc.moveTo(50, doc.y)
       .lineTo(550, doc.y)
       .stroke();

    doc.moveDown(1);

    // Totales
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .text('Subtotal:', 400)
       .text(`$${pedido.total.toFixed(2)}`, 500);

    if (pedido.impuesto > 0) {
      doc.text('Impuesto:', 400)
         .text(`$${pedido.impuesto.toFixed(2)}`, 500);
    }

    doc.fontSize(12)
       .text('TOTAL:', 400)
       .text(`$${pedido.total_con_impuesto.toFixed(2)}`, 500);

    doc.moveDown(2);

    // Información de pago
    doc.fontSize(10)
       .font('Helvetica')
       .text(`Forma de pago: ${pedido.forma_pago}`);

    if (pedido.cambio > 0) {
      doc.text(`Cambio: $${pedido.cambio.toFixed(2)}`);
    }

    doc.moveDown(1);

    // Observaciones del pedido
    if (pedido.observaciones) {
      doc.fontSize(9)
         .font('Helvetica-Oblique')
         .text(`Observaciones: ${pedido.observaciones}`);
      doc.moveDown(1);
    }

    // Pie de página
    doc.fontSize(8)
       .font('Helvetica')
       .text('¡Gracias por su visita!', { align: 'center' })
       .text('Recibo generado automáticamente', { align: 'center' });

    console.log('✅ Contenido del PDF agregado');

    // Finalizar documento
    doc.end();

    console.log('✅ Documento finalizado');

    // Retornar promesa que se resuelve cuando el stream termina
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        const rutaRelativa = path.relative(path.join(__dirname, '..'), rutaCompleta);
        console.log('✅ PDF generado exitosamente:', rutaRelativa);
        console.log('📄 Tamaño del archivo:', fs.statSync(rutaCompleta).size, 'bytes');
        resolve(rutaRelativa);
      });
      
      stream.on('error', (error) => {
        console.error('❌ Error en stream de PDF:', error);
        reject(error);
      });
      
      // Timeout de seguridad
      setTimeout(() => {
        reject(new Error('Timeout generando PDF'));
      }, 10000);
    });

  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    throw error;
  }
}

module.exports = { generarPDF }; 