const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { query, sendSuccess, sendError } = require("../db/db");

const SALT_ROUNDS = 10;

/**
 * POST /auth/register
 * Create a new user with hashed password
 * Body: { fullName, username, email, password }
 */
router.post("/register", async (req, res) => {
    try {
        const { fullName, username, email, password } = req.body;

        // Validate required fields
        if (!fullName?.trim() || !username?.trim() || !email?.trim() || !password) {
            return sendError(res, "All fields are required (fullName, username, email, password)", 400);
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

        // Password strength check
        if (password.length < 6) {
            return sendError(res, "Password must be at least 6 characters long", 400);
        }

        // Check if email already exists
        const existingEmail = await query(
            `SELECT id FROM users WHERE email = ? LIMIT 1`,
            [cleanEmail]
        );
        if (existingEmail.length > 0) {
            return sendError(res, "An account with this email already exists. Please login instead.", 409);
        }

        // Check if username already exists
        const existingUsername = await query(
            `SELECT id FROM users WHERE username = ? LIMIT 1`,
            [cleanUser]
        );
        if (existingUsername.length > 0) {
            return sendError(res, "This username is already taken. Please choose a different one.", 409);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create new user
        const result = await query(
            `INSERT INTO users (full_name, username, email, password) VALUES (?, ?, ?, ?)`,
            [cleanName, cleanUser, cleanEmail, hashedPassword]
        );

        const newUser = await query(`SELECT id, full_name, username, email, bio, website, created_at FROM users WHERE id = ?`, [
            result.insertId,
        ]);

        return sendSuccess(
            res,
            "Account created successfully!",
            { user: newUser[0] },
            201
        );
    } catch (err) {
        console.log("Auth register error:", err.message);
        return sendError(res, "Registration failed. Please try again.", 500, err.message);
    }
});

/**
 * POST /auth/login
 * Authenticate user with email + password
 * Body: { email, password }
 */
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email?.trim()) {
            return sendError(res, "Email is required", 400);
        }
        if (!password) {
            return sendError(res, "Password is required", 400);
        }

        const cleanEmail = email.trim().toLowerCase();

        // Find user by email (include password for comparison)
        const users = await query(`SELECT * FROM users WHERE email = ? LIMIT 1`, [
            cleanEmail,
        ]);

        if (users.length === 0) {
            return sendError(res, "No account found with this email. Please sign up first.", 404);
        }

        const user = users[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return sendError(res, "Incorrect password. Please try again.", 401);
        }

        // Return user data WITHOUT the password
        const { password: _, ...safeUser } = user;

        return sendSuccess(res, "Login successful", { user: safeUser });
    } catch (err) {
        console.log("Auth login error:", err.message);
        return sendError(res, "Login failed. Please try again.", 500, err.message);
    }
});

module.exports = router;
