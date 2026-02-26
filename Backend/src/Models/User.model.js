const { query } = require("../db/db");

const initUsersTable = async () => {
    try {
        await query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100),
        bio VARCHAR(150) DEFAULT '',
        website VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log("✅ Users table ready");
    } catch (err) {
        console.log("❌ Error creating users table:", err.message);
    }
};

module.exports = { initUsersTable };
