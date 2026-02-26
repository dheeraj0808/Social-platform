const { query } = require("../db/db");

const initLikesTable = async () => {
    try {
        await query(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      )
    `);
        console.log("✅ PostLikes table ready");
    } catch (err) {
        console.log("❌ Error creating post_likes table:", err.message);
    }
};

module.exports = { initLikesTable };
