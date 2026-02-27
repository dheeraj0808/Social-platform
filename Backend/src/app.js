const express = require("express");
const cors = require("cors");

// Route imports
const authRoutes = require("./routes/auth.routes");
const postRoutes = require("./routes/post.routes");
const userRoutes = require("./routes/user.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

/* ── Global Middleware ────────────────────────────── */
app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "x-user-id"],
    })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ── Request Logger (dev) ────────────────────────── */
app.use((req, res, next) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next();
});

/* ── Health Check ────────────────────────────────── */
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Social Platform API v2",
        version: "2.0.0",
        uptime: `${Math.floor(process.uptime())}s`,
        endpoints: {
            auth: ["POST /auth/register", "POST /auth/login"],
            posts: [
                "POST /createPost",
                "GET /getPosts",
                "DELETE /posts/:id",
                "POST /posts/:id/like",
                "GET /posts/:id/comments",
                "POST /posts/:id/comments",
                "DELETE /comments/:id",
                "POST /posts/:id/save",
            ],
            users: [
                "GET /users/:id",
                "PUT /users/:id",
                "POST /users/:id/follow",
                "GET /users/:id/followers",
                "GET /users/:id/following",
                "GET /users/:id/saved",
            ],
            notifications: [
                "GET /notifications/:userId",
                "PUT /notifications/:userId/read-all",
            ],
        },
    });
});

/* ── Routes ──────────────────────────────────────── */
app.use("/auth", authRoutes);
app.use("/", postRoutes);
app.use("/", userRoutes);
app.use("/", notificationRoutes);

/* ── 404 Handler ─────────────────────────────────── */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
    });
});

/* ── Global Error Handler ────────────────────────── */
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error",
    });
});

module.exports = app;