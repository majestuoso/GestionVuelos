// db/db.js
import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
password: "",

  database: "sistema_vuelos",
});

export default pool;   