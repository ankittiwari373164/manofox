const mysql = require("mysql2/promise");

// Hostinger gives you these values in hPanel > Databases > MySQL Databases.
// Set them as environment variables in hPanel > Advanced > Node.js app > Environment variables.
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
});

module.exports = pool;
