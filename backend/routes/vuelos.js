// routes/vuelos.js
import express from "express";
import Vuelos from "../models/vuelosmodels.js";
import db from "../db/db.js";

const router = express.Router();

// =====================================================
// 🔵 OBTENER TODOS LOS VUELOS (SIN FINALIZADOS)
// =====================================================
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

      return {
        ...v,
        estado,
        plataforma: v.plataforma || "-"
      };
    });

    // ❌ FILTRA FINALIZADOS
    vuelos = vuelos.filter(v => v.estado !== "finalizado");

    res.json(vuelos);
  } catch (err) {
    console.error("Error al obtener vuelos:", err);
    res.status(500).json([]);
  }
});

// =====================================================
// 🔵 OBTENER ASIENTOS OCUPADOS
// =====================================================
router.get("/:id/asientos", async (req, res) => {
  const { id } = req.params;
  try {
    const vuelo = await Vuelos.getById(id);

    // ❌ EVITA CONSULTAR ASIENTOS DE VUELO FINALIZADO
    if (vuelo && vuelo.estado === "finalizado") {
      return res.status(400).json({ error: "El vuelo está finalizado" });
    }

    const [rows] = await db.query(
      "SELECT asiento FROM Reservas WHERE id_vuelo = ?",
      [id]
    );

    res.json(rows.map(r => r.asiento));
  } catch (err) {
    console.error("Error obteniendo asientos ocupados:", err);
    res.status(500).json([]);
  }
});

// =====================================================
// 🔵 ASIENTOS DISPONIBLES (SIN FINALIZADOS)
// =====================================================
router.get("/:id/asientos-disponibles", async (req, res) => {
  const { id } = req.params;

  try {
    const vuelo = await Vuelos.getById(id);
    if (!vuelo) return res.json([]);

    // ❌ NO PERMITIR SI ESTÁ FINALIZADO
    if (vuelo.estado === "finalizado") {
      return res.status(400).json({ error: "El vuelo está finalizado" });
    }

    const capacidad = Number(vuelo.capacidad);

    const todosLosAsientos = [];
    for (let i = 1; i <= capacidad; i++) {
      todosLosAsientos.push("A" + i);
    }

    const [rows] = await db.query(
      "SELECT asiento FROM Reservas WHERE id_vuelo = ?",
      [id]
    );
    const ocupados = rows.map(r => r.asiento);

    const disponibles = todosLosAsientos.filter(a => !ocupados.includes(a));

    res.json(disponibles);

  } catch (err) {
    console.error("Error obteniendo asientos disponibles:", err);
    res.status(500).json([]);
  }
});

// =====================================================
// 🔵 OBTENER VUELO POR ID (INCLUYE ESTADO)
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const vuelo = await Vuelos.getById(req.params.id);
    if (!vuelo)
      return res.status(404).json({ error: "Vuelo no encontrado" });

    res.json({
      ...vuelo,
      plataforma: vuelo.plataforma || "-"
    });

  } catch (err) {
    console.error("Error al obtener vuelo:", err);
    res.status(500).json({ error: "Error al obtener el vuelo" });
  }
});

// =====================================================
// 🔵 CREAR NUEVO VUELO
// =====================================================
router.post("/", async (req, res) => {
  try {
    const id = await Vuelos.create(req.body);
    res.status(201).json({ id });
  } catch (err) {
    console.error("Error al crear vuelo:", err);
    res.status(500).json({ error: "Error al crear el vuelo" });
  }
});

// =====================================================
// 🔵 ACTUALIZAR VUELO
// =====================================================
router.put("/:id", async (req, res) => {
  try {
    const updated = await Vuelos.update(req.params.id, req.body);
    if (updated === 0)
      return res.status(404).json({ error: "Vuelo no encontrado" });

    res.json({ message: "Vuelo actualizado correctamente" });
  } catch (err) {
    console.error("Error al actualizar vuelo:", err);
    res.status(500).json({ error: "Error al actualizar el vuelo" });
  }
});

// =====================================================
// 🔵 ELIMINAR VUELO
// =====================================================
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Vuelos.delete(req.params.id);
    if (deleted === 0)
      return res.status(404).json({ error: "Vuelo no encontrado" });

    res.json({ message: "Vuelo eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar vuelo:", err);
    res.status(500).json({ error: "Error al eliminar el vuelo" });
  }
});

export default router;
