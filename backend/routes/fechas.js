// /routes/Fechas.js
const express = require("express");
const router = express.Router();
const { getAllFechas, getFechasByVueloId } = require("../models/FechasModels");

// GET /fechas → todas las fechas disponibles
router.get("/", async (req, res) => {
    try {
        const fechas = await getAllFechas();
        res.json(fechas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener las fechas" });
    }
});

// GET /fechas/:id_vuelo → fechas de un vuelo específico
router.get("/:id_vuelo", async (req, res) => {
    try {
        const fechas = await getFechasByVueloId(req.params.id_vuelo);
        if (!fechas || fechas.length === 0) {
            return res.status(404).json({ error: "No hay fechas disponibles para este vuelo" });
        }
        res.json(fechas);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener las fechas del vuelo" });
    }
});

module.exports = router;