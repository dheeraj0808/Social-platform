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
 * Initialize all database tables in dependency order
 * (respecting foreign key constraints)
 */
const initDatabase = async () => {
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
};

/**
 * Start the server after DB connection is confirmed
 */
const startServer = async () => {
    try {
        await initDatabase();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}\n`);
            console.log("Available API routes:");
            console.log("  Auth:          POST /auth/register, /auth/login");
            console.log("  Posts:         POST /createPost, GET /getPosts");
            console.log("  Post Actions:  POST /posts/:id/like, /save, /comments");
            console.log("  Users:         GET /users/:id, PUT /users/:id");
            console.log("  Follow:        POST /users/:id/follow");
            console.log("  Notifications: GET /notifications/:userId\n");
        });
    } catch (err) {
        console.error("❌ Failed to start server:", err.message);
        process.exit(1);
    }
};

// Wait for DB connection, then start
setTimeout(startServer, 1000);

/* ── Graceful Shutdown ───────────────────────────── */
const shutdown = (signal) => {
    console.log(`\n🛑 ${signal} received — shutting down gracefully...`);
    connection.end((err) => {
        if (err) console.error("Error closing DB:", err.message);
        else console.log("📦 Database connection closed");
        process.exit(0);
    });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
