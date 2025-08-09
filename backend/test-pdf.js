#!/usr/bin/env node

const PDFDocument = require('pdfkit');
const fs = require('fs-extra');
const path = require('path');

async function testPDF() {
  try {
    console.log('🧪 Iniciando prueba de PDF...');
    
    // Crear directorio de prueba
    const testDir = path.join(__dirname, 'recibos', 'test');
    await fs.ensureDir(testDir);
    console.log('✅ Directorio creado:', testDir);
    
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
    
    console.log('✅ PDFDocument creado');
    
    // Crear stream de escritura
    const testFile = path.join(testDir, 'test.pdf');
    const stream = fs.createWriteStream(testFile);
    doc.pipe(stream);
    
    console.log('✅ Stream creado');
    
    // Agregar contenido simple
    doc.fontSize(20)
       .text('Prueba de PDF', { align: 'center' });
    
    doc.moveDown(1);
    
    doc.fontSize(12)
       .text('Este es un PDF de prueba generado el ' + new Date().toLocaleString());
    
    console.log('✅ Contenido agregado');
    
    // Finalizar documento
    doc.end();
    
    console.log('✅ Documento finalizado');
    
    // Esperar a que se complete
    return new Promise((resolve, reject) => {
      stream.on('finish', () => {
        console.log('✅ PDF generado exitosamente:', testFile);
        console.log('📄 Tamaño del archivo:', fs.statSync(testFile).size, 'bytes');
        resolve(testFile);
      });
      
      stream.on('error', (error) => {
        console.error('❌ Error en stream:', error);
        reject(error);
      });
      
      // Timeout de seguridad
      setTimeout(() => {
        reject(new Error('Timeout generando PDF de prueba'));
      }, 5000);
    });
    
  } catch (error) {
    console.error('❌ Error en prueba de PDF:', error);
    throw error;
  }
}

// Ejecutar prueba
if (require.main === module) {
  testPDF()
    .then(() => {
      console.log('🎉 Prueba completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Prueba falló:', error);
      process.exit(1);
    });
}

module.exports = { testPDF }; 