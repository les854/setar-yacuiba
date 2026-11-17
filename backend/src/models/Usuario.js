const pool = require('../db');

const Usuario = {
  //  Obtener todos los usuarios
  findAll: async () => {
    try {
      const result = await pool.query(
        'SELECT id, nombre, apellido, email, telefono, rol, activo, created_at FROM usuarios ORDER BY id ASC'
      );
      return result.rows;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  //  Obtener usuario por ID
  findById: async (id) => {
    try {
      const result = await pool.query(
        'SELECT id, nombre, apellido, email, telefono, rol, activo, created_at FROM usuarios WHERE id = $1',
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      throw error;
    }
  },

  //  Crear usuario
  create: async (data) => {
    try {
      const { nombre, apellido, email, password, telefono, rol } = data;
      
      const result = await pool.query(
        `INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, nombre, apellido, email, telefono, rol, activo, created_at`,
        [nombre, apellido, email, password, telefono, rol]
      );
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },

  //  Actualizar usuario
  update: async (id, data) => {
    try {
      const { nombre, apellido, email, telefono, rol, activo } = data;
      
      const result = await pool.query(
        `UPDATE usuarios 
         SET nombre = COALESCE($1, nombre),
             apellido = COALESCE($2, apellido),
             email = COALESCE($3, email),
             telefono = COALESCE($4, telefono),
             rol = COALESCE($5, rol),
             activo = COALESCE($6, activo),
             updated_at = NOW()
         WHERE id = $7
         RETURNING id, nombre, apellido, email, telefono, rol, activo, created_at`,
        [nombre, apellido, email, telefono, rol, activo, id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },

  //  Eliminar usuario
  delete: async (id) => {
    try {
      const result = await pool.query(
        `UPDATE usuarios SET activo = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id`,
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
};

module.exports = Usuario;