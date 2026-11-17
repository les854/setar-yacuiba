// backend/src/services/lecturaService.js
const pool = require('../db');
const fs = require('fs');
const path = require('path');

// ============================================
// Guardar foto
// ============================================
const guardarFoto = (base64Data, idMedidor) => {
  try {
    if (!base64Data) return null;
    console.log(' Procesando foto para medidor:', idMedidor);

    const base64Clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');
    console.log(' Buffer:', buffer.length, 'bytes');

    const fileName = `medidor_${idMedidor}_${Date.now()}.jpg`;
    const uploadsDir = path.join(__dirname, '../../uploads');

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log(' Carpeta uploads creada');
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    console.log(' Foto guardada:', filePath);

    return `/uploads/${fileName}`;
  } catch (error) {
    console.error(' Error guardando foto:', error);
    return null;
  }
};

// ============================================
// GET - Todas
// ============================================
exports.findAll = async () => {
  const result = await pool.query(`
    SELECT 
      l.*,
      t.nombre AS tecnico_nombre,
      m.codigo_medidor,
      c.nombre AS cliente_nombre
    FROM lecturas l
    LEFT JOIN tecnicos t ON l.id_tecnico = t.id_tecnico
    LEFT JOIN medidores m ON l.id_medidor = m.id_medidor
    LEFT JOIN clientes c ON m.id_cliente = c.id_cliente
    ORDER BY l.fecha_lectura DESC, l.fecha_registro DESC
  `);
  return result.rows;
};

// ============================================
// GET - Por medidor
// ============================================
exports.findByMedidor = async (idMedidor) => {
  const result = await pool.query(`
    SELECT l.*, t.nombre AS tecnico_nombre
    FROM lecturas l
    LEFT JOIN tecnicos t ON l.id_tecnico = t.id_tecnico
    WHERE l.id_medidor = $1
    ORDER BY l.fecha_lectura DESC, l.fecha_registro DESC
  `, [idMedidor]);
  return result.rows;
};

// ============================================
// GET - Última
// ============================================
exports.getUltimaLectura = async (idMedidor) => {
  const result = await pool.query(`
    SELECT * FROM lecturas
    WHERE id_medidor = $1
    ORDER BY fecha_lectura DESC, fecha_registro DESC LIMIT 1
  `, [idMedidor]);
  return result.rows[0] || null;
};

// ============================================
// POST - Crear (SIN id_lectura, SIN consumo)
// ============================================
exports.create = async (data) => {
  console.log(' Datos recibidos:', {
    id_medidor: data.id_medidor,
    id_tecnico: data.id_tecnico,
    valor_lectura: data.valor_lectura,
    tipo_trabajo: data.tipo_trabajo,
    tiene_foto: !!data.foto_base64,
  });

  const {
    id_medidor, id_tecnico, valor_lectura, observaciones,
    foto_base64, latitud_lectura, longitud_lectura, tipo_trabajo,
  } = data;

  if (!id_medidor || !id_tecnico || valor_lectura === undefined) {
    const err = new Error('Faltan campos obligatorios');
    err.status = 400;
    throw err;
  }

  const valorNum = parseFloat(valor_lectura);
  if (isNaN(valorNum) || valorNum < 0) {
    const err = new Error('Valor inválido');
    err.status = 400;
    throw err;
  }

  // Lectura anterior
  const anteriorResult = await pool.query(`
    SELECT lectura_actual FROM lecturas
    WHERE id_medidor = $1
    ORDER BY fecha_lectura DESC, fecha_registro DESC LIMIT 1
  `, [id_medidor]);

  const lecturaAnterior = parseFloat(anteriorResult.rows[0]?.lectura_actual || 0);
  console.log(' Lectura anterior:', lecturaAnterior);

  if (valorNum < lecturaAnterior) {
    const err = new Error(
      `La lectura (${valorNum}) debe ser mayor o igual a la anterior (${lecturaAnterior})`
    );
    err.status = 400;
    throw err;
  }

  // Guardar foto
  let fotoUrl = null;
  if (foto_base64) {
    fotoUrl = guardarFoto(foto_base64, id_medidor);
  }

  
  const result = await pool.query(`
    INSERT INTO lecturas (
      id_medidor, id_tecnico, fecha_lectura,
      lectura_anterior, lectura_actual,
      observaciones, foto_url, latitud_lectura, longitud_lectura, tipo_trabajo
    ) VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [
    id_medidor, id_tecnico,
    lecturaAnterior, valorNum,
    observaciones || null,
    fotoUrl,
    latitud_lectura || null,
    longitud_lectura || null,
    tipo_trabajo || 'lectura',
  ]);

  console.log(' Lectura insertada ID:', result.rows[0].id_lectura);
  console.log(' Consumo calculado:', result.rows[0].consumo);

  return {
    message: 'Lectura registrada correctamente',
    lectura: result.rows[0],
  };
};