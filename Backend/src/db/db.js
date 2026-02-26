const mysql = require("mysql");

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

connection.connect((err) => {
    if (err) {
        console.log("❌ Database connection failed:", err.message);
        return;
    }
    console.log("✅ Connected to MySQL database");
});

/**
 * Promise wrapper for db.query
 * Usage: const rows = await query("SELECT * FROM users WHERE id = ?", [1]);
 */
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
};

/**
 * Consistent JSON response helpers
 */
const sendSuccess = (res, message, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, message, ...data });
};

const sendError = (res, message, statusCode = 500, error = null) => {
    const response = { success: false, message };
    if (error) response.error = error;
    return res.status(statusCode).json(response);
};

module.exports = { connection, query, sendSuccess, sendError };