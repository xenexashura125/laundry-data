const mysql = require('mysql2');

// Create a connection pool
const pool = mysql.createPool({
  port:"3307",
  host: "localhost", // Replace with your MySQL server host
  user: "root", // Replace with your MySQL username
  password: "", // Replace with your MySQL password
  database: "laundry_db", // Replace with your MySQL database name
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0, // Unlimited
});

module.exports = pool.promise();