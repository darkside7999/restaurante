const express = require('express');
const router = express.Router();
const { get, run } = require('../database/connection');

// GET /api/config - Obtener configuración del restaurante
router.get('/', async (req, res) => {
  try {
    const config = await get(`
      SELECT id, nombre_restaurante, impuesto, horario_apertura, 
             horario_cierre, telefono, direccion, created_at, updated_at
      FROM configuracion 
      LIMIT 1
    `);

    if (!config) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }

    res.json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo la configuración'
    });
  }
});

// PUT /api/config - Actualizar configuración del restaurante
router.put('/', async (req, res) => {
  try {
    const {
      nombre_restaurante,
      impuesto,
      horario_apertura,
      horario_cierre,
      telefono,
      direccion
    } = req.body;

    // Validar campos requeridos
    if (!nombre_restaurante) {
      return res.status(400).json({
        success: false,
        error: 'El nombre del restaurante es requerido'
      });
    }

    // Verificar si existe configuración
    const configExistente = await get('SELECT id FROM configuracion LIMIT 1');

    if (configExistente) {
      // Actualizar configuración existente
      await run(`
        UPDATE configuracion 
        SET nombre_restaurante = ?, impuesto = ?, horario_apertura = ?, 
            horario_cierre = ?, telefono = ?, direccion = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        nombre_restaurante,
        impuesto || 0,
        horario_apertura || '08:00',
        horario_cierre || '22:00',
        telefono || null,
        direccion || null,
        configExistente.id
      ]);
    } else {
      // Crear nueva configuración
      await run(`
        INSERT INTO configuracion (nombre_restaurante, impuesto, horario_apertura, 
                                  horario_cierre, telefono, direccion)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        nombre_restaurante,
        impuesto || 0,
        horario_apertura || '08:00',
        horario_cierre || '22:00',
        telefono || null,
        direccion || null
      ]);
    }

    // Obtener configuración actualizada
    const configActualizada = await get(`
      SELECT id, nombre_restaurante, impuesto, horario_apertura, 
             horario_cierre, telefono, direccion, created_at, updated_at
      FROM configuracion 
      LIMIT 1
    `);

    res.json({
      success: true,
      data: configActualizada,
      message: 'Configuración actualizada correctamente'
    });

  } catch (error) {
    console.error('Error actualizando configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error actualizando la configuración'
    });
  }
});

// GET /api/config/horarios - Obtener solo horarios
router.get('/horarios', async (req, res) => {
  try {
    const config = await get(`
      SELECT horario_apertura, horario_cierre
      FROM configuracion 
      LIMIT 1
    `);

    if (!config) {
      return res.json({
        success: true,
        data: {
          horario_apertura: '08:00',
          horario_cierre: '22:00'
        }
      });
    }

    res.json({
      success: true,
      data: {
        horario_apertura: config.horario_apertura,
        horario_cierre: config.horario_cierre
      }
    });

  } catch (error) {
    console.error('Error obteniendo horarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo los horarios'
    });
  }
});

// GET /api/config/impuesto - Obtener solo impuesto
router.get('/impuesto', async (req, res) => {
  try {
    const config = await get(`
      SELECT impuesto
      FROM configuracion 
      LIMIT 1
    `);

    res.json({
      success: true,
      data: {
        impuesto: config ? config.impuesto : 0
      }
    });

  } catch (error) {
    console.error('Error obteniendo impuesto:', error);
    res.status(500).json({
      success: false,
      error: 'Error obteniendo el impuesto'
    });
  }
});

module.exports = router; 