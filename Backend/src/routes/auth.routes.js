const express = require("express");
const router = express.Router();
const { query, sendSuccess, sendError } = require("../db/db");

/**
 * POST /auth/register
 * Create a new user or return existing user
 * Body: { fullName, username, email }
 */
router.post("/register", async (req, res) => {
    try {
        const { fullName, username, email } = req.body;

        // Validate required fields
        if (!fullName?.trim() || !username?.trim() || !email?.trim()) {
            return sendError(res, "fullName, username, and email are required", 400);
        }

        const cleanName = fullName.trim();
        const cleanUser = username.trim().toLowerCase();
        const cleanEmail = email.trim().toLowerCase();

        // Basic email format check
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            return sendError(res, "Please enter a valid email address", 400);
        }

        // Username format check (alphanumeric + underscores, 3-30 chars)
        if (!/^[a-z0-9_]{3,30}$/.test(cleanUser)) {
            return sendError(
                res,
                "Username must be 3-30 characters (lowercase letters, numbers, underscores only)",
                400
            );
        }

        // Check if user already exists by email or username
        const existing = await query(
            `SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1`,
            [cleanEmail, cleanUser]
        );

        if (existing.length > 0) {
            // Return existing user (login simulation)
            return sendSuccess(res, "User found, logged in", { user: existing[0] });
        }

        // Create new user
        const result = await query(
            `INSERT INTO users (full_name, username, email) VALUES (?, ?, ?)`,
            [cleanName, cleanUser, cleanEmail]
        );

        const newUser = await query(`SELECT * FROM users WHERE id = ?`, [
            result.insertId,
        ]);

        return sendSuccess(
            res,
            "User registered successfully",
            { user: newUser[0] },
            201
        );
    } catch (err) {
        console.log("Auth register error:", err.message);
        return sendError(res, "Registration failed", 500, err.message);
    }
});

/**
 * POST /auth/login
 * Find user by email (simulated login — no password)
 * Body: { email }
 */
router.post("/login", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email?.trim()) {
            return sendError(res, "Email is required", 400);
        }

        const cleanEmail = email.trim().toLowerCase();

        const users = await query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [
            cleanEmail,
        ]);

        if (users.length === 0) {
            return sendError(res, "No account found with this email", 404);
        }

        return sendSuccess(res, "Login successful", { user: users[0] });
    } catch (err) {
        console.log("Auth login error:", err.message);
        return sendError(res, "Login failed", 500, err.message);
    }
});

module.exports = router;
