// routes/pasajeros.js
const express = require("express");
const router = express.Router();
const Pasajero = require("../models/pasajeromodels");

// --- Listar todos los pasajeros ---
router.get("/", async (req, res) => {
  try {
    const pasajeros = await Pasajero.getAll();
    res.json(pasajeros);
  } catch (err) {
    console.error("Error al obtener pasajeros:", err);
    res.status(500).json({ error: "Error al obtener pasajeros" });
  }
});

// --- Obtener pasajero por ID ---
router.get("/:id", async (req, res) => {
  try {
    const pasajero = await Pasajero.getById(req.params.id);
    if (!pasajero) return res.status(404).json({ error: "No encontrado" });
    res.json(pasajero);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener pasajero" });
  }
});

// --- Crear pasajero ---
router.post("/", async (req, res) => {
  try {
    const { nombre, apellido, dni } = req.body;
    const id_pasajero = await Pasajero.create({ nombre, apellido, dni });
    const nuevo = await Pasajero.getById(id_pasajero);
    res.json(nuevo);
  } catch (err) {
    console.error("Error al crear pasajero:", err);
    res.status(500).json({ error: "Error al crear pasajero" });
  }
});

// --- Actualizar pasajero ---
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updated = await Pasajero.update(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error("Error al actualizar pasajero:", err);
    res.status(500).json({ error: "Error al actualizar pasajero" });
  }
});

// --- Borrar pasajero ---
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Pasajero.delete(id);
    res.json(result);
  } catch (err) {
    console.error("Error al borrar pasajero:", err);
    res.status(500).json({ error: "Error al borrar pasajero" });
  }
});

module.exports = router;
