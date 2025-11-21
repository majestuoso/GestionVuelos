// models/ReservasModel.js
const db = require("../db/DB");

const Reserva = {
  async getAll() {
    const sql = `
      SELECT r.id_reserva, r.id_vuelo, r.asiento, r.estado, r.fecha_reserva,
             p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      ORDER BY r.fecha_reserva DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },


async getById(id) {
    const sql = `SELECT * FROM Reservas WHERE id_reserva = ?`; // <-- Revisa esta línea
    const [rows] = await db.query(sql, [id]);
    return rows[0]; // Si rows[0] es undefined, el backend devuelve "No se encontró"

  },

  async getByDni(dni) {
    const sql = `
      SELECT r.id_reserva, r.id_vuelo, r.asiento, r.estado, r.fecha_reserva,
             p.id_pasajero, p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      WHERE p.dni = ?
      ORDER BY r.fecha_reserva DESC
    `;
    const [rows] = await db.query(sql, [dni]);
    return rows; // 🔥 devolver todas las reservas del pasajero
  },

  async create(reserva) {
    const sql = `
      INSERT INTO Reservas (id_vuelo, id_pasajero, asiento, estado)
      VALUES (?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      reserva.id_vuelo,
      reserva.id_pasajero,
      reserva.asiento,
      reserva.estado || "CONFIRMADA"
    ]);
    return result.insertId;
  },

  async update(id, data) {
    const sql = `
      UPDATE Reservas
      SET asiento = ?, estado = ?
      WHERE id_reserva = ?
    `;
    const [result] = await db.query(sql, [
      data.asiento,
      data.estado || "CONFIRMADA",
      id
    ]);
    return result.affectedRows;
  },

  async delete(id) {
    const sql = `DELETE FROM Reservas WHERE id_reserva = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }
};

module.exports = Reserva;
