const db = require("../db/db");

// Create the posts table if it doesn't exist (like defining a schema)
const createPostTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS posts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            image VARCHAR(255),
            caption VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    db.query(query, (err) => {
        if (err) {
            console.log("Error creating posts table:", err.message);
            return;
        }
        console.log("Posts table ready");
    });
};

createPostTable();

module.exports = db;
