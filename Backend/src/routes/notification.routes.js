const express = require("express");
const router = express.Router();
const { query, sendSuccess, sendError } = require("../db/db");

/* ═══════════════════════════════════════════════════
   GET /notifications/:userId
   Returns notifications + unread count
   ═══════════════════════════════════════════════════ */
router.get("/notifications/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const notifications = await query(
            `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`,
            [userId]
        );

        const unreadResult = await query(
            `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
            [userId]
        );

        return sendSuccess(res, "Notifications fetched", {
            notifications,
            unread_count: unreadResult[0].count,
        });
    } catch (err) {
        console.log("Get notifications error:", err.message);
        return sendError(res, "Error fetching notifications", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   PUT /notifications/:userId/read-all
   Mark all notifications as read
   ═══════════════════════════════════════════════════ */
router.put("/notifications/:userId/read-all", async (req, res) => {
    try {
        const userId = req.params.userId;

        await query(
            `UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE`,
            [userId]
        );

        return sendSuccess(res, "All notifications marked as read");
    } catch (err) {
        console.log("Mark read error:", err.message);
        return sendError(res, "Error marking notifications", 500, err.message);
    }
});

module.exports = router;
