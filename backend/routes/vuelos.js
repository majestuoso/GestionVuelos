// routes/vuelos.js
const express = require("express");
const router = express.Router();
const Vuelos = require("../models/VuelosModel");

// --- Listar todos los vuelos ---
router.get("/", async (req, res) => {
  try {
    let vuelos = await Vuelos.getAll();

    // Calcular estado dinámico según hora actual
    const ahora = new Date();
    vuelos = vuelos.map(v => {
      const salida = new Date(v.fecha_hora_salida);

      // Ejemplo: vuelo dura 3 horas
      const llegada = new Date(salida.getTime() + 3 * 60 * 60 * 1000);

      let estado = "Programado";
      if (ahora >= salida && ahora <= llegada) {
        estado = "En curso";
      } else if (ahora > llegada) {
        estado = "Finalizado";
      }

      // Si existe un campo de demora en la DB
      if (v.demorado && v.demorado === 1) {
        estado = "Demorado";
      }

      return { ...v, estado };
    });

    res.json(vuelos);
  } catch (err) {
    console.error("Error al obtener vuelos:", err);
    res.status(500).json({ error: "Error al obtener los vuelos" });
  }
});

module.exports = router;
