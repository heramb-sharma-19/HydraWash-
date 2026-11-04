require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  multipleStatements: false,   // blocks stacked-query SQL injection
  dateStrings: true,           // DATE/DATETIME come back as plain strings
  decimalNumbers: true         // DECIMAL comes back as numbers, not strings
});

const HINTS = {
  ECONNREFUSED: 'MySQL is not running or host/port in .env is wrong. Start the MySQL service and check DB_HOST / DB_PORT.',
  ER_ACCESS_DENIED_ERROR: 'Wrong DB_USER / DB_PASSWORD. Test the same login in MySQL Workbench. Did you run 00_create_user.sql?',
  ER_BAD_DB_ERROR: 'Database not found. Run sql/01_schema.sql in Workbench first.',
  ENOTFOUND: 'DB_HOST could not be resolved. Use 127.0.0.1 for a local MySQL.'
};

async function verifyConnection() {
  try {
    const conn = await pool.getConnection();
    const [[row]] = await conn.query('SELECT DATABASE() AS db, VERSION() AS version');
    conn.release();
    console.log(`MySQL connected -> database "${row.db}" (v${row.version})`);
  } catch (err) {
    console.error('MySQL connection failed:', err.code || '', err.message);
    console.error('Hint:', HINTS[err.code] || 'Check your .env values against MySQL Workbench.');
    process.exit(1);
  }
}

module.exports = pool;
module.exports.verifyConnection = verifyConnection;
