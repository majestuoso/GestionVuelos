const db = require("../db");

const Reserva = {
    async getAll() {
        const [rows] = await db.query(`
            SELECT r.*, e.nombre_estado AS estado
            FROM reservas r
            LEFT JOIN Estados e ON r.id_estado = e.id_estado
            ORDER BY r.id_reserva DESC
        `);
        return rows;
    },

    async getById(id) {
        const [rows] = await db.query(`
            SELECT r.*, e.nombre_estado AS estado
            FROM reservas r
            LEFT JOIN estados e ON r.id_estado = e.id_estado
            WHERE r.id_reserva = ?
        `, [id]);
        return rows[0] || null;
    },

    async update(id, data) {
        const { fecha, asiento, estado } = data;
        const [estadoQuery] = await db.query(
            "SELECT id_estado FROM Estados WHERE nombre_estado = ?",
            [estado]
        );
        if (!estadoQuery.length) throw new Error("Estado inválido");
        const id_estado = estadoQuery[0].id_estado;

        await db.query(`
            UPDATE reservas SET
                fecha = ?, asiento = ?, id_estado = ?
            WHERE id_reserva = ?
        `, [fecha, asiento, id_estado, id]);

        return { id_reserva: id, ...data };
    }
};

module.exports = Reserva;