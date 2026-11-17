const pool = require('.');

const store = {
  async query(sql, params = []) {
    const result = await pool.query(sql, params);
    return result.rows;
  },

  async one(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  },

  async all(sql, params = []) {
    return this.query(sql, params);
  },

  async insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${placeholders}) RETURNING *`;
    return this.one(sql, values);
  },

  async update(table, id, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    return this.one(sql, [...values, id]);
  },

  async delete(table, id) {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return true;
  },

  async findById(table, id) {
    return this.one(`SELECT * FROM ${table} WHERE id = $1`, [id]);
  },

  async findAll(table, orderBy = 'id') {
    return this.all(`SELECT * FROM ${table} ORDER BY ${orderBy}`);
  },

  async count(table, where = 'activo = true') {
    const result = await this.one(`SELECT COUNT(*)::int AS total FROM ${table} WHERE ${where}`);
    return result?.total || 0;
  },
};

module.exports = store;