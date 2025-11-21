import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

// conexión pool (podés importar desde un módulo db.js si ya lo tenés)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "sistema_vuelos",
});

// --- Listar todas las reservas ---
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id_reserva, r.id_vuelo, r.asiento, r.estado, r.fecha_reserva,
             p.id_pasajero, p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      ORDER BY r.fecha_reserva DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener reservas:", err);
    res.status(500).json({ error: "Error al obtener reservas" });
  }
});

// --- Buscar reservas por ID de vuelo ---
router.get("/:id_reserva", async (req, res) => {
  const { id_reserva } = req.params;
  try {
    const reserva = await pool.query(
      `
      SELECT id_reserva, id_vuelo, id_pasajero, fecha_reserva, asiento, estado
      FROM Reservas r
      WHERE r.id_reserva = ?
     `,
      [id_reserva]
    );

    if (!reserva) {
      return res.status(404).json({ error: "No se encontro la reserva" });
    }
    res.json(reserva);
  } catch (err) {
    console.error("Error al buscar reservas por vuelo:", err);
    res.status(500).json({ error: "Error al buscar reservas por vuelo" });
  }
});

// --- Crear nueva reserva ---
router.post("/", async (req, res) => {
  const { id_vuelo, nombre, apellido, dni, asiento } = req.body;
  try {
    // Buscar pasajero por DNI
    let [rows] = await pool.query(
      "SELECT id_pasajero FROM Pasajeros WHERE dni = ?",
      [dni]
    );
    let id_pasajero;
    if (rows.length > 0) {
      id_pasajero = rows[0].id_pasajero;
    } else {
      const [result] = await pool.query(
        "INSERT INTO Pasajeros (nombre, apellido, dni) VALUES (?, ?, ?)",
        [nombre, apellido, dni]
      );
      id_pasajero = result.insertId;
    }

    // Crear reserva
    const [reservaResult] = await pool.query(
      "INSERT INTO Reservas (id_vuelo, id_pasajero, asiento, estado) VALUES (?, ?, ?, 'CONFIRMADA')",
      [id_vuelo, id_pasajero, asiento]
    );

    const id_reserva = reservaResult.insertId;

    // Obtener resumen
    const [resumen] = await pool.query(
      `
      SELECT r.id_reserva, r.asiento, r.estado, r.fecha_reserva,
             p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      WHERE r.id_reserva = ?
    `,
      [id_reserva]
    );

    res.json(resumen[0]);
  } catch (err) {
    console.error("Error al crear reserva:", err);
    res.status(500).json({ error: "Error al crear reserva" });
  }
});

// --- Actualizar reserva (incluye cambio de vuelo) ---
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { id_vuelo } = req.body;

  try {
    // Obtener reserva para saber pasajero asociado
    const [rows] = await pool.query(
      "SELECT * FROM Reservas WHERE id_reserva = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }

    // Actualizar reserva (incluye cambio de vuelo)
    if (id_vuelo) {
      await pool.query(
        "UPDATE Reservas SET  id_vuelo = COALESCE(?, id_vuelo) WHERE id_reserva = ?",
        [id_vuelo, id]
      );
    }

    // Devolver reserva actualizada
    const [resumen] = await pool.query(
      `
      SELECT r.id_reserva, r.asiento, r.estado, r.fecha_reserva,
             p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      WHERE r.id_reserva = ?
    `,
      [id]
    );

    res.json(resumen[0]);
  } catch (err) {
    console.error("Error al actualizar reserva:", err);
    res.status(500).json({ error: "Error al actualizar reserva" });
  }
});

// --- Cancelar reserva ---
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      "DELETE FROM Reservas WHERE id_reserva = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Reserva no encontrada" });
    }
    res.json({ message: "Reserva cancelada" });
  } catch (err) {
    console.error("Error al cancelar reserva:", err);
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
});

export default router;
