const { query } = require("../db/db");

const initCommentsTable = async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS post_comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        comment_text VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    try {
      await query(`ALTER TABLE post_comments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    } catch (e) { /* already converted */ }
    console.log("✅ PostComments table ready");
  } catch (err) {
    console.log("❌ Error creating post_comments table:", err.message);
  }
};

module.exports = { initCommentsTable };
