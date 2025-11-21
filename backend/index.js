import express from "express";
import cors from "cors";

// importa tus routers
import reservasRouter from "./routes/reservas.js";
import vuelosRouter from "./routes/vuelos.js";

const app = express();
app.use(cors());
app.use(express.json());

// montar routers
app.use("/reservas", reservasRouter);
app.use("/vuelos", vuelosRouter);

// levantar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
