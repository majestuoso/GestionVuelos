// index.js
import express from "express";
import cors from "cors";

import reservasRouter from "./routes/reservas.js";
import vuelosRouter from "./routes/vuelos.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/reservas", reservasRouter);
app.use("/vuelos", vuelosRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
