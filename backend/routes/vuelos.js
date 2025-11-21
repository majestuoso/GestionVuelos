// routes/vuelos.js
import express from "express";
import Vuelos from "../models/vuelosmodels.js"; // asegúrate que el nombre coincide EXACTO

const router = express.Router();

// Obtener todos los vuelos
router.get("/", async (req, res) => {
  try {
    let vuelos = await Vuelos.getAll();

    const ahora = new Date();
    vuelos = vuelos.map(v => {
      const salida = new Date(v.fecha_hora_salida);
      const llegada = new Date(salida.getTime() + 3 * 60 * 60 * 1000);

      let estado = "programado";
      if (ahora >= salida && ahora <= llegada) {
        estado = "en curso";
      } else if (ahora > llegada) {
        estado = "finalizado";
      }
      if (v.estado && v.estado.toLowerCase() === "demorado") {
        estado = "demorado";
      }

      return { ...v, estado };
    });

    res.json(vuelos);
  } catch (err) {
    console.error("Error al obtener vuelos:", err);
    // devolver siempre un array para que el front no rompa con forEach
    res.status(500).json([]);
  }
});

// Obtener un vuelo por ID
router.get("/:id", async (req, res) => {
  try {
    const vuelo = await Vuelos.getById(req.params.id);
    if (!vuelo) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }
    res.json(vuelo);
  } catch (err) {
    console.error("Error al obtener vuelo:", err);
    res.status(500).json({ error: "Error al obtener el vuelo" });
  }
});

// Crear un nuevo vuelo
router.post("/", async (req, res) => {
  try {
    const id = await Vuelos.create(req.body);
    res.status(201).json({ id });
  } catch (err) {
    console.error("Error al crear vuelo:", err);
    res.status(500).json({ error: "Error al crear el vuelo" });
  }
});

// Actualizar vuelo
router.put("/:id", async (req, res) => {
  try {
    const updated = await Vuelos.update(req.params.id, req.body);
    if (updated === 0) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }
    res.json({ message: "Vuelo actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar vuelo:", err);
    res.status(500).json({ error: "Error al actualizar el vuelo" });
  }
});

// Eliminar vuelo
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Vuelos.delete(req.params.id);
    if (deleted === 0) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }
    res.json({ message: "Vuelo eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar vuelo:", err);
    res.status(500).json({ error: "Error al eliminar el vuelo" });
  }
});

export default router;   // 👈 obligatorio en ES Modules
