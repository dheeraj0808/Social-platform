const { query } = require("../db/db");

const initNotificationsTable = async () => {
    try {
        await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type ENUM('like', 'comment', 'follow') NOT NULL,
        message VARCHAR(255) NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
        console.log("✅ Notifications table ready");
    } catch (err) {
        console.log("❌ Error creating notifications table:", err.message);
    }
};

module.exports = { initNotificationsTable };
