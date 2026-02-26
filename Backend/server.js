require("dotenv").config();

const app = require("./src/app");
const { connection } = require("./src/db/db");

// Model table initializers
const { initUsersTable } = require("./src/Models/User.model");
const { initPostTables } = require("./src/Models/Post.model");
const { initLikesTable } = require("./src/Models/Like.model");
const { initCommentsTable } = require("./src/Models/Comment.model");
const { initSavedPostsTable } = require("./src/Models/SavedPost.model");
const { initFollowsTable } = require("./src/Models/Follow.model");
const { initNotificationsTable } = require("./src/Models/Notification.model");

const PORT = process.env.PORT || 3000;

/**
 * Initialize all database tables in correct order
 * (respecting foreign key dependencies)
 */
const initDatabase = async () => {
    try {
        console.log("\n📦 Initializing database tables...\n");

        // 1. Users first (no dependencies)
        await initUsersTable();

        // 2. Posts (depends on users)
        await initPostTables();

        // 3. Dependent tables (depend on posts and/or users)
        await initLikesTable();
        await initCommentsTable();
        await initSavedPostsTable();
        await initFollowsTable();
        await initNotificationsTable();

        console.log("\n✅ All database tables initialized\n");
    } catch (err) {
        console.log("❌ Database initialization failed:", err.message);
    }
};

// Wait for DB connection, then init tables, then start server
setTimeout(async () => {
    await initDatabase();

    app.listen(PORT, () => {
        console.log(`\n🚀 Server running on http://localhost:${PORT}\n`);
        console.log("Available API routes:");
        console.log("  Auth:          POST /auth/register, /auth/login");
        console.log("  Posts:         POST /createPost, GET /getPosts");
        console.log("  Post Actions:  POST /posts/:id/like, /save, /comments");
        console.log("  Users:         GET /users/:id, PUT /users/:id");
        console.log("  Follow:        POST /users/:id/follow");
        console.log("  Notifications: GET /notifications/:userId\n");
    });
}, 1000); // 1s delay to ensure DB connection is established
