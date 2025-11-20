const db = require("../db");

const Vuelos = {
    async getAll() {
        try {
            const [rows] = await db.query(`
                SELECT v.id_vuelo, v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida, v.capacidad,
                       COUNT(r.id_reserva) AS reservas
                FROM Vuelos v
                LEFT JOIN Reservas r ON v.id_vuelo = r.id_vuelo
                GROUP BY v.id_vuelo, v.numero_vuelo, v.origen, v.destino, v.fecha_hora_salida, v.capacidad
            `);
            return rows;
        } catch (err) {
            console.error("Error al obtener vuelos:", err);
            return [];
        }
    }
};

module.exports = Vuelos;
