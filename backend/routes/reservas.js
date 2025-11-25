// routes/reservas.js
import express from "express";
import mysql from "mysql2/promise";

const router = express.Router();

// Pool de conexión
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "sistema_vuelos",
});

// ==========================
// LISTAR TODAS LAS RESERVAS
// ==========================
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT r.id_reserva, r.id_vuelo, r.asiento, r.estado, r.fecha_reserva,
             p.id_pasajero, p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida, v.capacidad, v.plataforma
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

// ==========================
// OBTENER RESERVA POR ID
// ==========================
router.get("/:id_reserva", async (req, res) => {
  const { id_reserva } = req.params;
  try {
    const [rows] = await pool.query(`
      SELECT r.id_reserva, r.id_vuelo, r.id_pasajero, r.asiento, r.estado, r.fecha_reserva,
             p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida, v.capacidad, v.plataforma
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      WHERE r.id_reserva = ?
    `, [id_reserva]);

    if (rows.length === 0) return res.status(404).json({ error: "Reserva no encontrada" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error al obtener reserva:", err);
    res.status(500).json({ error: "Error al obtener reserva" });
  }
});

// ==========================
// CREAR NUEVA RESERVA
// ==========================
router.post("/", async (req, res) => {
  const { id_vuelo, nombre, apellido, dni, asiento } = req.body;

  if (!id_vuelo || !nombre || !apellido || !dni || !asiento) {
    return res.status(400).json({ error: "Faltan datos obligatorios" });
  }

  try {
    // 1️⃣ Verificar si el pasajero ya existe
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

    // 2️⃣ Verificar que el asiento no esté ocupado
    const [ocupado] = await pool.query(
      "SELECT 1 FROM Reservas WHERE id_vuelo = ? AND asiento = ?",
      [id_vuelo, asiento]
    );
    if (ocupado.length > 0) {
      return res.status(400).json({ error: `Asiento ${asiento} ya ocupado` });
    }

    // 3️⃣ Crear reserva
    const [reservaResult] = await pool.query(
      "INSERT INTO Reservas (id_vuelo, id_pasajero, asiento, estado) VALUES (?, ?, ?, 'CONFIRMADA')",
      [id_vuelo, id_pasajero, asiento]
    );

    const id_reserva = reservaResult.insertId;

    // 4️⃣ Devolver reserva creada con info completa
    const [resumen] = await pool.query(`
      SELECT r.id_reserva, r.id_vuelo, r.asiento, r.estado, r.fecha_reserva,
             p.id_pasajero, p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida, v.capacidad, v.plataforma
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      WHERE r.id_reserva = ?
    `, [id_reserva]);

    res.json(resumen[0]);
  } catch (err) {
    console.error("Error al crear reserva:", err);
    res.status(500).json({ error: "Error al crear reserva" });
  }
});

// ==========================
// ACTUALIZAR RESERVA
// ==========================
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { asiento, estado, id_vuelo } = req.body;

  try {
    // Verificar que exista
    const [rows] = await pool.query("SELECT * FROM Reservas WHERE id_reserva = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ error: "Reserva no encontrada" });

    // Verificar que el asiento esté libre si se cambia
    if (asiento) {
      const [ocupado] = await pool.query(
        "SELECT 1 FROM Reservas WHERE id_vuelo = ? AND asiento = ? AND id_reserva <> ?",
        [id_vuelo || rows[0].id_vuelo, asiento, id]
      );
      if (ocupado.length > 0) {
        return res.status(400).json({ error: `Asiento ${asiento} ya ocupado` });
      }
    }

    // Actualizar
    await pool.query(
      `UPDATE Reservas SET asiento = COALESCE(?, asiento), estado = COALESCE(?, estado), id_vuelo = COALESCE(?, id_vuelo) WHERE id_reserva = ?`,
      [asiento, estado, id_vuelo, id]
    );

    // Devolver reserva actualizada
    const [resumen] = await pool.query(`
      SELECT r.id_reserva, r.id_vuelo, r.asiento, r.estado, r.fecha_reserva,
             p.id_pasajero, p.nombre, p.apellido, p.dni,
             v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida, v.capacidad, v.plataforma
      FROM Reservas r
      JOIN Pasajeros p ON r.id_pasajero = p.id_pasajero
      JOIN Vuelos v ON r.id_vuelo = v.id_vuelo
      WHERE r.id_reserva = ?
    `, [id]);

    res.json(resumen[0]);
  } catch (err) {
    console.error("Error al actualizar reserva:", err);
    res.status(500).json({ error: "Error al actualizar reserva" });
  }
});

// ==========================
// CANCELAR RESERVA
// ==========================
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM Reservas WHERE id_reserva = ?", [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Reserva no encontrada" });
    res.json({ message: "Reserva cancelada" });
  } catch (err) {
    console.error("Error al cancelar reserva:", err);
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
});

export default router;
