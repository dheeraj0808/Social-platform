const { query } = require("../db/db");

const initUsersTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE,
        password VARCHAR(255) NOT NULL DEFAULT '',
        bio VARCHAR(150) DEFAULT '',
        website VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration: add password column if it doesn't exist (for older schemas)
    try {
      await query(`ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '' AFTER email`);
      console.log("  ↳ Migrated: added password column to users");
    } catch (e) {
      // Column already exists — safe to ignore
    }

    console.log("✅ Users table ready");
  } catch (err) {
    console.log("❌ Error creating users table:", err.message);
  }
};

module.exports = { initUsersTable };
