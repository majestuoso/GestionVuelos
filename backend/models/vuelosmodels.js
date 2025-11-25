import db from "../db/db.js";


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
        plataforma,
        created_at
      FROM Vuelos
      ORDER BY fecha_hora_salida ASC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  async getById(id) {
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
        plataforma,
        created_at
      FROM Vuelos
      WHERE id_vuelo = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  async create(vuelo) {
    const sql = `
      INSERT INTO Vuelos 
        (numero_vuelo, origen, destino, fecha_hora_salida, capacidad, asientos_disponibles, estado, plataforma)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      vuelo.numero_vuelo,
      vuelo.origen,
      vuelo.destino,
      vuelo.fecha_hora_salida,
      vuelo.capacidad,
      vuelo.asientos_disponibles,
      vuelo.estado || "programado",
      vuelo.plataforma || null
    ]);
    return result.insertId;
  },

  async update(id, vuelo) {
    const sql = `
      UPDATE Vuelos
      SET numero_vuelo = ?, origen = ?, destino = ?, fecha_hora_salida = ?, 
          capacidad = ?, asientos_disponibles = ?, estado = ?, plataforma = ?
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
      vuelo.plataforma || null,
      id
    ]);
    return result.affectedRows;
  },

  async delete(id) {
    const sql = `DELETE FROM Vuelos WHERE id_vuelo = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }
};

export default vuelos;
