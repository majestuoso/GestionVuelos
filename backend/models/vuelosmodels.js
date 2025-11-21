// models/vuelosmodels.js
import db from "../db/db.js"; // tu conexión en ES Modules

const vuelos = {
  async getAll() {
    const sql = `
      SELECT 
        id_vuelo,
        numero_vuelo,
        origen,
        destino,
        fecha_hora_salida,
        capacidad,
        asientos_disponibles,
        estado,
        created_at
      FROM Vuelos
      ORDER BY fecha_hora_salida ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  async getById(id) {
    const sql = `SELECT * FROM vuelos WHERE id_vuelo = ?`;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  async create(vuelo) {
    const sql = `
      INSERT INTO vuelos 
        (numero_vuelo, origen, destino, fecha_hora_salida, capacidad, asientos_disponibles, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      vuelo.numero_vuelo,
      vuelo.origen,
      vuelo.destino,
      vuelo.fecha_hora_salida,
      vuelo.capacidad,
      vuelo.asientos_disponibles,
      vuelo.estado || "programado"
    ]);
    return result.insertId;
  },

  async update(id, vuelo) {
    const sql = `
      UPDATE vuelos
      SET numero_vuelo = ?, origen = ?, destino = ?, fecha_hora_salida = ?, 
          capacidad = ?, asientos_disponibles = ?, estado = ?
      WHERE id_vuelo = ?
    `;
    const [result] = await db.query(sql, [
      vuelo.numero_vuelo,
      vuelo.origen,
      vuelo.destino,
      vuelo.fecha_hora_salida,
      vuelo.capacidad,
      vuelo.asientos_disponibles,
      vuelo.estado,
      id
    ]);
    return result.affectedRows;
  },

  async delete(id) {
    const sql = `DELETE FROM vuelos WHERE id_vuelo = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }
};

export default vuelos;   // 👈 ahora sí exporta default
