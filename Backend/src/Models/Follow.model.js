const { query } = require("../db/db");

const initFollowsTable = async () => {
    try {
        await query(`
      CREATE TABLE IF NOT EXISTS follows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_id INT NOT NULL,
        following_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_follow (follower_id, following_id)
      )
    `);
        console.log("✅ Follows table ready");
    } catch (err) {
        console.log("❌ Error creating follows table:", err.message);
    }
};

module.exports = { initFollowsTable };
