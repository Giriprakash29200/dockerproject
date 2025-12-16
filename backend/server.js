const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

/* ===============================
   PostgreSQL DB Connection
   =============================== */
const pool = new Pool({
  host: "db",          // docker-compose service name
  user: "admin",
  password: "admin",
  database: "appdb",
  port: 5432
});

/* ===============================
   SQL: Create Table
   =============================== */
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(10) NOT NULL,
    date DATE DEFAULT CURRENT_DATE
  );
`;

pool.query(createTableQuery)
  .then(() => console.log("Attendance table ready"))
  .catch(err => console.error("Table creation error", err));

/* ===============================
   SQL: INSERT Attendance
   =============================== */
app.post("/attendance", async (req, res) => {
  try {
    const { name, status } = req.body;

    const insertQuery = `
      INSERT INTO attendance (name, status)
      VALUES ($1, $2);
    `;

    await pool.query(insertQuery, [name, status]);
    res.send("Attendance marked successfully");
  } catch (err) {
    res.status(500).send("Error saving attendance");
  }
});

/* ===============================
   SQL: SELECT Attendance
   =============================== */
app.get("/attendance", async (req, res) => {
  try {
    const selectQuery = `
      SELECT * FROM attendance
      ORDER BY id DESC;
    `;

    const result = await pool.query(selectQuery);
    res.json(result.rows);
  } catch (err) {
    res.status(500).send("Error fetching attendance");
  }
});

/* ===============================
   Server Start
   =============================== */
app.listen(3000, () => {
  console.log("Attendance backend running on port 3000");
});

