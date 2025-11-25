// models/ReservasModel.js
import db from "../db/db.js"; // ES Modules

const Reserva = {

  // Traer todas las reservas con info de pasajero y vuelo
  async getAll() {
    const sql = `
      SELECT r.id_reserva, r.id_vuelo, r.asiento, r.estado, r.fecha_reserva,
             p.id_pasajero, p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida, v.capacidad, v.plataforma
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      ORDER BY r.fecha_reserva DESC
    `;
    const [rows] = await db.query(sql);
    return rows;
  },

  // Traer una reserva por ID
  async getById(id) {
    const sql = `
      SELECT r.id_reserva, r.id_vuelo, r.asiento, r.estado, r.fecha_reserva,
             p.id_pasajero, p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida, v.capacidad, v.plataforma
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      WHERE r.id_reserva = ?
    `;
    const [rows] = await db.query(sql, [id]);
    return rows[0] || null;
  },

  // Traer reservas de un pasajero por DNI
  async getByDni(dni) {
    const sql = `
      SELECT r.id_reserva, r.id_vuelo, r.asiento, r.estado, r.fecha_reserva,
             p.id_pasajero, p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida, v.capacidad, v.plataforma
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      WHERE p.dni = ?
      ORDER BY r.fecha_reserva DESC
    `;
    const [rows] = await db.query(sql, [dni]);
    return rows;
  },

  // Crear reserva con validaciones
  async create({ id_vuelo, pasajero, asiento, estado }) {
    // 1️⃣ Verificar si el pasajero existe por DNI
    let id_pasajero;
    const [rows] = await db.query("SELECT id_pasajero FROM Pasajeros WHERE dni = ?", [pasajero.dni]);
    if (rows.length > 0) {
      id_pasajero = rows[0].id_pasajero;
    } else {
      // Crear pasajero
      const result = await db.query(
        "INSERT INTO Pasajeros (nombre, apellido, dni) VALUES (?, ?, ?)",
        [pasajero.nombre, pasajero.apellido, pasajero.dni]
      );
      id_pasajero = result[0].insertId;
    }

    // 2️⃣ Verificar que el asiento esté disponible en ese vuelo
    const [asientoExist] = await db.query(
      "SELECT 1 FROM Reservas WHERE id_vuelo = ? AND asiento = ?",
      [id_vuelo, asiento]
    );
    if (asientoExist.length > 0) {
      throw new Error(`Asiento ${asiento} ya ocupado en este vuelo`);
    }

    // 3️⃣ Crear reserva
    const [result] = await db.query(
      "INSERT INTO Reservas (id_vuelo, id_pasajero, asiento, estado) VALUES (?, ?, ?, ?)",
      [id_vuelo, id_pasajero, asiento, estado || "CONFIRMADA"]
    );

    return result.insertId;
  },

  // Actualizar reserva
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

  // Eliminar reserva
  async delete(id) {
    const sql = `DELETE FROM Reservas WHERE id_reserva = ?`;
    const [result] = await db.query(sql, [id]);
    return result.affectedRows;
  }

};

export default Reserva;
