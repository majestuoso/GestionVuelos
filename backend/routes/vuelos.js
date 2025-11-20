// routes/vuelos.js
const express = require("express");
const router = express.Router();
const Vuelos = require("../models/VuelosModel");

router.get("/", async (req, res) => {
    try {
        const vuelos = await Vuelos.getAll();
        res.json(vuelos);
    } catch (err) {
        console.error("Error al obtener vuelos:", err);
        res.status(500).json({ error: "Error al obtener los vuelos" });
    }
});

module.exports = router;