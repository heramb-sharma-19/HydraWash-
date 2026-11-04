// ─────────────────────────────────────────────────────────────────────────────
// scripts/init-db.js – Database Table Setup & Auto-Migration Script
// ─────────────────────────────────────────────────────────────────────────────
'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function initDB() {
  console.log('🔄 Connecting to MySQL server at', process.env.DB_HOST || 'localhost');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true,
    });
    console.log('Connected to MySQL server.');

    const schemaPath = path.resolve(__dirname, '../sql/schema.sql');
    const seedPath   = path.resolve(__dirname, '../sql/seed.sql');

    if (fs.existsSync(schemaPath)) {
      console.log('Applying schema.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('Schema applied successfully.');
    }

    if (fs.existsSync(seedPath)) {
      console.log('Applying seed.sql...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('Seed data inserted successfully.');
    }

    console.log('Database initialization complete.');
  } catch (err) {
    console.warn('MySQL server connection or query failed:', err.message);
    console.warn('Note: HydraWash backend will continue using resilient in-memory fallback data.');
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  initDB();
}

module.exports = initDB;

