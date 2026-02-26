const { query } = require("../db/db");

const initSavedPostsTable = async () => {
    try {
        await query(`
      CREATE TABLE IF NOT EXISTS saved_posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_save (post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      )
    `);
        console.log("✅ SavedPosts table ready");
    } catch (err) {
        console.log("❌ Error creating saved_posts table:", err.message);
    }
};

module.exports = { initSavedPostsTable };
