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

        if (!fullName || !username || !email) {
            return sendError(res, "fullName, username, and email are required", 400);
        }

        // Check if user already exists by email or username
        const existing = await query(
            `SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1`,
            [email, username]
        );

        if (existing.length > 0) {
            // Return existing user (login simulation)
            return sendSuccess(res, "User found, logged in", { user: existing[0] });
        }

        // Create new user
        const result = await query(
            `INSERT INTO users (full_name, username, email) VALUES (?, ?, ?)`,
            [fullName, username, email]
        );

        const newUser = await query(`SELECT * FROM users WHERE id = ?`, [
            result.insertId,
        ]);

        return sendSuccess(res, "User registered successfully", {
            user: newUser[0],
        }, 201);
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

        if (!email) {
            return sendError(res, "Email is required", 400);
        }

        const users = await query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [
            email,
        ]);

        if (users.length === 0) {
            return sendError(res, "User not found", 404);
        }

        return sendSuccess(res, "Login successful", { user: users[0] });
    } catch (err) {
        console.log("Auth login error:", err.message);
        return sendError(res, "Login failed", 500, err.message);
    }
});

module.exports = router;
