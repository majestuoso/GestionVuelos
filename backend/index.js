// index.js
import express from "express";
import cors from "cors";

// Conexión a la base de datos MySQL
import db from "./db/db.js";

// Routers
import vuelosRouter from "./routes/vuelos.js";
import reservasRouter from "./routes/reservas.js";
import pasajerosRouter from "./routes/pasajeros.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use("/vuelos", vuelosRouter);
app.use("/reservas", reservasRouter);
app.use("/pasajeros", pasajerosRouter);

// Ruta raíz
app.get("/", (req, res) => {
  res.send("API de Gestión de Vuelos funcionando");
});

// ===========================
// RUTA ESTADÍSTICAS
// ===========================
app.get("/estadisticas", async (req, res) => {
  try {
    // Vuelos más solicitados (por reservas confirmadas)
    const [vuelos] = await db.query(`
      SELECT v.numero_vuelo, v.origen, v.destino, COUNT(r.id_reserva) AS reservas
      FROM Vuelos v
      LEFT JOIN Reservas r ON v.id_vuelo = r.id_vuelo
      WHERE r.estado = 'CONFIRMADA'
      GROUP BY v.id_vuelo
      ORDER BY reservas DESC
      LIMIT 5
    `);

    // Total de cambios de fecha
    const [totalCambios] = await db.query(`
      SELECT COUNT(*) AS cambios
      FROM Historial_Cambios
    `);

    // Vuelos que más recibieron cambios (historial de destinos)
    const [vuelosConCambios] = await db.query(`
      SELECT v.numero_vuelo, v.origen, v.destino, COUNT(h.id_cambio) AS cambios_recibidos
      FROM Vuelos v
      LEFT JOIN Historial_Cambios h ON v.id_vuelo = h.id_vuelo_nuevo
      GROUP BY v.id_vuelo
      ORDER BY cambios_recibidos DESC
      LIMIT 5
    `);

    res.json({
      vuelos_mas_solicitados: vuelos,
      total_cambios: totalCambios[0].cambios,
      vuelos_mas_cambiados: vuelosConCambios
    });
  } catch (error) {
    console.error("Error al generar estadísticas:", error);
    res.status(500).json({ error: "Error al generar estadísticas" });
  }
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
