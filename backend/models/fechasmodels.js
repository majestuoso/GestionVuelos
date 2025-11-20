// /models/FechasModels.js
const db = require("../db"); // tu conexión a la base de datos

// Traer todas las fechas disponibles
const getAllFechas = async () => {
    const [rows] = await db.query(
        "SELECT * FROM Fechas_Disponibles WHERE disponible = 1"
    );
    return rows;
};

// Traer fechas disponibles por id de vuelo
const getFechasByVueloId = async (id_vuelo) => {
    const [rows] = await db.query(
        "SELECT * FROM Fechas_Disponibles WHERE id_vuelo = ? AND disponible = 1",
        [id_vuelo]
    );
    return rows;
};

module.exports = {
    getAllFechas,
    getFechasByVueloId
};