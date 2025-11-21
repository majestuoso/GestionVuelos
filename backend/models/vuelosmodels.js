// models/VuelosModel.js
const db = require("../db/DB"); // tu clase de conexión (usa mysql2 o similar)

const Vuelos = {
  // Obtener todos los vuelos
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

  // Obtener un vuelo por ID
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
        created_at
      FROM Vuelos
      WHERE id_vuelo = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0];
  },

  // Crear un nuevo vuelo
  async create(vuelo) {
    const sql = `
      INSERT INTO Vuelos 
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
      vuelo.estado || "Programado"
    ]);
    return result.insertId;
  },

  // Actualizar vuelo
  async update(id, vuelo) {
    const sql = `
      UPDATE Vuelos
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

  // Eliminar vuelo
  async delete(id) {
    const sql = `DELETE FROM Vuelos WHERE id_vuelo = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }
};

module.exports = Vuelos;
