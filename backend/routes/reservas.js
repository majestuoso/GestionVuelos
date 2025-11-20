// routes/reservas.js
const express = require("express");
const router = express.Router();
const Reserva = require("../models/Reservamodels");

router.get("/", async (req, res) => {
    try {
        const reservas = await Reserva.getAll();
        res.json(reservas);
    } catch (err) {
        console.error("Error al obtener reservas:", err);
        res.status(500).json({ error: "Error al obtener reservas" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const reserva = await Reserva.getById(req.params.id);
        if (!reserva) return res.status(404).json({ error: "No encontrada" });
        res.json(reserva);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener la reserva" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const id = req.params.id;
        const updated = await Reserva.update(id, req.body);
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al actualizar la reserva" });
    }
});

module.exports = router;
