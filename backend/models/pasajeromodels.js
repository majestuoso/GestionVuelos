// backend/models/pasajeromodels.js
import db from "../db/db.js"; // tu conexión MySQL (mysql2/promise)

const Pasajero = {
  // Obtener todos los pasajeros
  async getAll() {
    const [rows] = await db.query(
      "SELECT id_pasajero, nombre, apellido, dni, created_at FROM Pasajeros ORDER BY created_at DESC"
    );
    return rows;
  },

  // Obtener pasajero por ID
  async getById(id) {
    const [rows] = await db.query(
      "SELECT id_pasajero, nombre, apellido, dni, created_at FROM Pasajeros WHERE id_pasajero = ?",
      [id]
    );
    return rows[0];
  },

  // Crear pasajero
  async create({ nombre, apellido, dni }) {
    const [result] = await db.query(
      "INSERT INTO Pasajeros (nombre, apellido, dni) VALUES (?, ?, ?)",
      [nombre, apellido, dni]
    );
    return result.insertId;
  },

  // Actualizar pasajero
  async update(id, { nombre, apellido, dni }) {
    const [result] = await db.query(
      "UPDATE Pasajeros SET nombre=?, apellido=?, dni=? WHERE id_pasajero=?",
      [nombre, apellido, dni, id]
    );
    return result.affectedRows;
  },

  // Borrar pasajero
  async delete(id) {
    const [result] = await db.query(
      "DELETE FROM Pasajeros WHERE id_pasajero=?",
      [id]
    );
    return result.affectedRows;
  },
};

export default Pasajero;
