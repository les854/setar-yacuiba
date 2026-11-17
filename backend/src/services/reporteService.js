// backend/src/services/reporteService.js
const pool = require('../db');

const reporteService = {
  async getResumen() {
    const [usuarios, tecnicos, clientes, medidores, lecturas] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM usuarios WHERE estado = TRUE'),
      pool.query('SELECT COUNT(*) FROM tecnicos WHERE estado = TRUE'),
      pool.query('SELECT COUNT(*) FROM clientes WHERE estado = TRUE'),
      pool.query('SELECT COUNT(*) FROM medidores'),
      pool.query('SELECT COUNT(*) FROM lecturas'),
    ]);

    return {
      usuariosActivos: parseInt(usuarios.rows[0].count),
      tecnicosActivos: parseInt(tecnicos.rows[0].count),
      clientesActivos: parseInt(clientes.rows[0].count),
      totalMedidores: parseInt(medidores.rows[0].count),
      totalLecturas: parseInt(lecturas.rows[0].count),
    };
  },

  async getMedidoresPorEstado() {
    const result = await pool.query(`
      SELECT estado, COUNT(*) AS total
      FROM medidores
      GROUP BY estado
      ORDER BY total DESC
    `);
    return result.rows.map((r) => ({
      estado: r.estado,
      total: parseInt(r.total),
    }));
  },

  async getMedidoresPorMarca() {
    const result = await pool.query(`
      SELECT marca, COUNT(*) AS total
      FROM medidores
      GROUP BY marca
      ORDER BY total DESC
    `);
    return result.rows.map((r) => ({
      marca: r.marca,
      total: parseInt(r.total),
    }));
  },

  async getClientesPorEstado() {
    const result = await pool.query(`
      SELECT 
        CASE WHEN estado THEN 'Activos' ELSE 'Inactivos' END AS tipo,
        COUNT(*) AS total
      FROM clientes
      GROUP BY estado
    `);
    return result.rows.map((r) => ({
      tipo: r.tipo,
      total: parseInt(r.total),
    }));
  },

  async getLecturasPorMes() {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(fecha_lectura, 'YYYY-MM') AS mes,
        COUNT(*) AS total,
        COALESCE(SUM(consumo), 0) AS consumo_total
      FROM lecturas
      WHERE fecha_lectura >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(fecha_lectura, 'YYYY-MM')
      ORDER BY mes ASC
    `);
    return result.rows.map((r) => ({
      mes: r.mes,
      total: parseInt(r.total),
      consumo: parseFloat(r.consumo_total),
    }));
  },

  async getTopMedidores() {
    const result = await pool.query(`
      SELECT 
        m.codigo_medidor,
        m.direccion,
        m.estado,
        COUNT(l.id_lectura) AS total_lecturas,
        COALESCE(SUM(l.consumo), 0) AS consumo_total
      FROM medidores m
      LEFT JOIN lecturas l ON m.id_medidor = l.id_medidor
      GROUP BY m.id_medidor, m.codigo_medidor, m.direccion, m.estado
      ORDER BY total_lecturas DESC, consumo_total DESC
      LIMIT 10
    `);
    return result.rows.map((r) => ({
      codigo: r.codigo_medidor,
      direccion: r.direccion,
      estado: r.estado,
      totalLecturas: parseInt(r.total_lecturas),
      consumoTotal: parseFloat(r.consumo_total),
    }));
  },
};

module.exports = reporteService;