
const db = require("../db");

const Vuelos = {
    async getAll() {
        try {
            const [rows] = await db.query(`
                SELECT v.id_vuelo, v.numero_vuelo, v.origen, v.destino, v.fecha_hora, v.capacidad,
                       COUNT(r.vuelo_id) AS reservas
                FROM Vuelos v
                LEFT JOIN reservas r ON v.id_vuelo = r.vuelo_id
                GROUP BY v.id_vuelo
            `);
            return rows;
        } catch (err) {
            console.error("Error al obtener vuelos:", err);
            return [];
        }
    }
};

module.exports = Vuelos;