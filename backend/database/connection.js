const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear conexión a la base de datos
const dbPath = path.join(__dirname, 'restaurante.db');
const db = new sqlite3.Database(dbPath);

// Habilitar foreign keys
db.run('PRAGMA foreign_keys = ON');

// Función para ejecutar consultas con promesas
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        console.error('❌ Error en consulta SQL:', err);
        console.error('📋 SQL:', sql);
        console.error('📋 Parámetros:', params);
        reject(err);
      } else {
        const result = { 
          id: this.lastID, 
          changes: this.changes,
          lastID: this.lastID // Mantener compatibilidad
        };
        console.log('✅ Consulta SQL ejecutada:', { sql, lastID: this.lastID, changes: this.changes });
        resolve(result);
      }
    });
  });
}

// Función para obtener una fila
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Función para obtener múltiples filas
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

module.exports = {
  db,
  run,
  get,
  all
}; 