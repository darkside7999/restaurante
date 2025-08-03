import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { products } from './data/products.js';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Crear directorios necesarios
const dataDir = path.join(__dirname, 'data');
const ordersDir = path.join(dataDir, 'orders');
const receiptsDir = path.join(__dirname, 'receipts');

await fs.ensureDir(dataDir);
await fs.ensureDir(ordersDir);
await fs.ensureDir(receiptsDir);

// Utility functions
function getDateString(date = new Date()) {
  return date.toISOString().split('T')[0];
}

function getOrdersFilePath(date = new Date()) {
  const dateStr = getDateString(date);
  return path.join(ordersDir, `pedidos-${dateStr}.json`);
}

function getReceiptDir(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return path.join(receiptsDir, String(year), month, day);
}

// Routes

// Productos
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = {
      id: uuidv4(),
      ...req.body,
      active: true
    };
    
    products.items.push(newProduct);
    
    // Guardar en archivo
    const productsFile = path.join(dataDir, 'products.js');
    const content = `export const products = ${JSON.stringify(products, null, 2)};\n\nexport default products;`;
    await fs.writeFile(productsFile, content);
    
    res.json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const productIndex = products.items.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    products.items[productIndex] = { ...products.items[productIndex], ...req.body };
    
    // Guardar en archivo
    const productsFile = path.join(dataDir, 'products.js');
    const content = `export const products = ${JSON.stringify(products, null, 2)};\n\nexport default products;`;
    await fs.writeFile(productsFile, content);
    
    res.json(products.items[productIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const productIndex = products.items.findIndex(p => p.id === req.params.id);
    if (productIndex === -1) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    
    products.items.splice(productIndex, 1);
    
    // Guardar en archivo
    const productsFile = path.join(dataDir, 'products.js');
    const content = `export const products = ${JSON.stringify(products, null, 2)};\n\nexport default products;`;
    await fs.writeFile(productsFile, content);
    
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Comandas/Pedidos
app.get('/api/orders/today', async (req, res) => {
  try {
    const filePath = getOrdersFilePath();
    if (await fs.pathExists(filePath)) {
      const orders = await fs.readJson(filePath);
      res.json(orders);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/orders/:date', async (req, res) => {
  try {
    const date = new Date(req.params.date);
    const filePath = getOrdersFilePath(date);
    if (await fs.pathExists(filePath)) {
      const orders = await fs.readJson(filePath);
      res.json(orders);
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = {
      id: uuidv4(),
      ...req.body,
      createdAt: new Date().toISOString(),
      status: 'pending' // pending, ready, served, cancelled
    };
    
    const filePath = getOrdersFilePath();
    let orders = [];
    
    if (await fs.pathExists(filePath)) {
      orders = await fs.readJson(filePath);
    }
    
    orders.push(order);
    await fs.writeJson(filePath, orders, { spaces: 2 });
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const updates = req.body;
    
    // Buscar en las órdenes de hoy primero
    const filePath = getOrdersFilePath();
    let orders = [];
    
    if (await fs.pathExists(filePath)) {
      orders = await fs.readJson(filePath);
    }
    
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    
    orders[orderIndex] = { ...orders[orderIndex], ...updates };
    await fs.writeJson(filePath, orders, { spaces: 2 });
    
    res.json(orders[orderIndex]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generar recibo PDF
app.post('/api/generate-receipt', async (req, res) => {
  try {
    const { order, paymentMethod } = req.body;
    const receiptDate = new Date();
    
    // Crear directorio para el recibo
    const receiptDirPath = getReceiptDir(receiptDate);
    await fs.ensureDir(receiptDirPath);
    
    // Generar HTML del recibo
    const receiptHtml = generateReceiptHtml(order, paymentMethod, receiptDate);
    
    // Generar PDF con Puppeteer
    const browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setContent(receiptHtml);
    
    const receiptFileName = `recibo-${order.id}.pdf`;
    const receiptPath = path.join(receiptDirPath, receiptFileName);
    
    await page.pdf({
      path: receiptPath,
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });
    
    await browser.close();
    
    res.json({ 
      success: true, 
      receiptPath: receiptPath,
      receiptUrl: `/receipts/${receiptDate.getFullYear()}/${String(receiptDate.getMonth() + 1).padStart(2, '0')}/${String(receiptDate.getDate()).padStart(2, '0')}/${receiptFileName}`
    });
  } catch (error) {
    console.error('Error generando recibo:', error);
    res.status(500).json({ error: error.message });
  }
});

// Servir archivos de recibos
app.use('/receipts', express.static(receiptsDir));

// Estadísticas
app.get('/api/stats/today', async (req, res) => {
  try {
    const filePath = getOrdersFilePath();
    if (await fs.pathExists(filePath)) {
      const orders = await fs.readJson(filePath);
      const completedOrders = orders.filter(o => o.status === 'served');
      
      const stats = {
        totalOrders: completedOrders.length,
        totalRevenue: completedOrders.reduce((sum, order) => sum + order.total, 0),
        averageOrder: completedOrders.length > 0 ? completedOrders.reduce((sum, order) => sum + order.total, 0) / completedOrders.length : 0
      };
      
      res.json(stats);
    } else {
      res.json({ totalOrders: 0, totalRevenue: 0, averageOrder: 0 });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/stats/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    let allOrders = [];
    let currentDate = new Date(start);
    
    while (currentDate <= end) {
      const filePath = getOrdersFilePath(currentDate);
      if (await fs.pathExists(filePath)) {
        const orders = await fs.readJson(filePath);
        allOrders = allOrders.concat(orders);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const completedOrders = allOrders.filter(o => o.status === 'served');
    
    const stats = {
      totalOrders: completedOrders.length,
      totalRevenue: completedOrders.reduce((sum, order) => sum + order.total, 0),
      averageOrder: completedOrders.length > 0 ? completedOrders.reduce((sum, order) => sum + order.total, 0) / completedOrders.length : 0,
      ordersByDay: {}
    };
    
    // Agrupar por día
    completedOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!stats.ordersByDay[date]) {
        stats.ordersByDay[date] = { orders: 0, revenue: 0 };
      }
      stats.ordersByDay[date].orders++;
      stats.ordersByDay[date].revenue += order.total;
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateReceiptHtml(order, paymentMethod, receiptDate) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recibo - ${order.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .order-info { margin-bottom: 20px; }
        .items { width: 100%; border-collapse: collapse; }
        .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        .items th { background-color: #f2f2f2; }
        .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>MI RESTAURANTE</h1>
        <p>Recibo de Compra</p>
      </div>
      
      <div class="order-info">
        <p><strong>Pedido:</strong> ${order.id}</p>
        <p><strong>Fecha:</strong> ${receiptDate.toLocaleString('es-ES')}</p>
        <p><strong>Método de pago:</strong> ${paymentMethod}</p>
      </div>
      
      <table class="items">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.name}${item.notes ? `<br><small>${item.notes}</small>` : ''}</td>
              <td>${item.quantity}</td>
              <td>€${item.price.toFixed(2)}</td>
              <td>€${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="total">
        <p>TOTAL: €${order.total.toFixed(2)}</p>
      </div>
      
      <div class="footer">
        <p>¡Gracias por su visita!</p>
        <p>Esperamos verle pronto</p>
      </div>
    </body>
    </html>
  `;
}

app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
});