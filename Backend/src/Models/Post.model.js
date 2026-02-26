const { query } = require("../db/db");

const initPostTables = async () => {
    try {
        // ── Create posts table (upgraded with user_id) ──────────────
        await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        caption VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);

        try {
            await query(`ALTER TABLE posts CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        } catch (e) { /* already converted */ }

        // ── Migrate: add user_id column if missing (old schema) ─────
        try {
            await query(`ALTER TABLE posts ADD COLUMN user_id INT AFTER id`);
            console.log("  ↳ Migrated: added user_id to posts");
        } catch (e) {
            // Column already exists — safe to ignore
        }

        // ── Create post_images table ────────────────────────────────
        await query(`
      CREATE TABLE IF NOT EXISTS post_images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        image_url VARCHAR(500) NOT NULL,
        sort_order INT DEFAULT 0,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      )
    `);

        // ── Migrate old single-image data into post_images ──────────
        try {
            const oldPosts = await query(
                `SELECT id, image FROM posts WHERE image IS NOT NULL AND image != ''`
            );
            for (const post of oldPosts) {
                const existing = await query(
                    `SELECT id FROM post_images WHERE post_id = ?`,
                    [post.id]
                );
                if (existing.length === 0) {
                    await query(
                        `INSERT INTO post_images (post_id, image_url, sort_order) VALUES (?, ?, 0)`,
                        [post.id, post.image]
                    );
                }
            }
            if (oldPosts.length > 0) {
                console.log(`  ↳ Migrated ${oldPosts.length} old posts to post_images`);
            }
        } catch (e) {
            // 'image' column might not exist on fresh installs — safe to ignore
        }

        console.log("✅ Posts & PostImages tables ready");
    } catch (err) {
        console.log("❌ Error creating post tables:", err.message);
    }
};

module.exports = { initPostTables };
