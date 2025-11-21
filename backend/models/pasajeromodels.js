const pool = require("../db"); // conexión MySQL (mysql2/promise)

const Pasajero = {
  // Buscar pasajero por DNI
  async getByDni(dni) {
    const [rows] = await pool.query(
      "SELECT * FROM Pasajeros WHERE dni = ?",
      [dni]
    );
    return rows[0] || null;
  },

  // Crear pasajero nuevo
  async create({ nombre, apellido, dni }) {
    const [result] = await pool.query(
      "INSERT INTO Pasajeros (nombre, apellido, dni) VALUES (?, ?, ?)",
      [nombre, apellido, dni]
    );
    return result.insertId; // devuelve el id_pasajero
  },

  // Obtener todos los pasajeros
  async getAll() {
    const [rows] = await pool.query(
      "SELECT * FROM Pasajeros ORDER BY id_pasajero ASC"
    );
    return rows;
  },

  // Obtener pasajero por ID
  async getById(id) {
    const [rows] = await pool.query(
      "SELECT * FROM Pasajeros WHERE id_pasajero = ?",
      [id]
    );
    return rows[0] || null;
  },

  // Actualizar pasajero
  async update(id, { nombre, apellido, dni }) {
    const [result] = await pool.query(
      "UPDATE Pasajeros SET nombre = ?, apellido = ?, dni = ? WHERE id_pasajero = ?",
      [nombre, apellido, dni, id]
    );
    return result.affectedRows > 0 ? await this.getById(id) : null;
  },

  // Borrar pasajero
  async delete(id) {
    const [result] = await pool.query(
      "DELETE FROM Pasajeros WHERE id_pasajero = ?",
      [id]
    );
    return result.affectedRows > 0;
  }
};

module.exports = Pasajero;
