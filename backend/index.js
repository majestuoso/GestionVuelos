// index.js
import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
  res.send('Bienvenidos al sistema de reservas de vuelos');
});

// Arrancar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
