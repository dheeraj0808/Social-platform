const express = require("express");
const router = express.Router();
const { query, sendSuccess, sendError } = require("../db/db");

/* ═══════════════════════════════════════════════════
   MIDDLEWARE
   ═══════════════════════════════════════════════════ */
const requireUser = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    if (!userId) {
        return sendError(res, "x-user-id header is required", 401);
    }
    req.userId = parseInt(userId, 10);
    next();
};

/* ═══════════════════════════════════════════════════
   GET /users/:id — fetch user profile
   ═══════════════════════════════════════════════════ */
router.get("/users/:id", async (req, res) => {
    try {
        const userId = req.params.id;

        const users = await query(`SELECT * FROM users WHERE id = ?`, [userId]);
        if (users.length === 0) {
            return sendError(res, "User not found", 404);
        }

        const user = users[0];

        // Count posts, followers, following
        const postCount = await query(
            `SELECT COUNT(*) AS count FROM posts WHERE user_id = ?`,
            [userId]
        );
        const followerCount = await query(
            `SELECT COUNT(*) AS count FROM follows WHERE following_id = ?`,
            [userId]
        );
        const followingCount = await query(
            `SELECT COUNT(*) AS count FROM follows WHERE follower_id = ?`,
            [userId]
        );

        // Check if current user follows this profile
        const currentUserId = req.headers["x-user-id"];
        let isFollowing = false;
        if (currentUserId && parseInt(currentUserId) !== parseInt(userId)) {
            const followCheck = await query(
                `SELECT id FROM follows WHERE follower_id = ? AND following_id = ?`,
                [currentUserId, userId]
            );
            isFollowing = followCheck.length > 0;
        }

        return sendSuccess(res, "User fetched", {
            user: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                email: user.email,
                bio: user.bio,
                website: user.website,
                created_at: user.created_at,
                post_count: postCount[0].count,
                follower_count: followerCount[0].count,
                following_count: followingCount[0].count,
                is_following: isFollowing,
            },
        });
    } catch (err) {
        console.log("Get user error:", err.message);
        return sendError(res, "Error fetching user", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   PUT /users/:id — update profile
   Body: { fullName, bio, website }
   ═══════════════════════════════════════════════════ */
router.put("/users/:id", requireUser, async (req, res) => {
    try {
        const targetId = parseInt(req.params.id, 10);

        if (targetId !== req.userId) {
            return sendError(res, "You can only edit your own profile", 403);
        }

        const { fullName, bio, website } = req.body;

        const updates = [];
        const params = [];

        if (fullName !== undefined) {
            updates.push("full_name = ?");
            params.push(fullName.trim());
        }
        if (bio !== undefined) {
            updates.push("bio = ?");
            params.push(bio.trim());
        }
        if (website !== undefined) {
            updates.push("website = ?");
            params.push(website.trim());
        }

        if (updates.length === 0) {
            return sendError(res, "No fields to update", 400);
        }

        params.push(targetId);
        await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, params);

        const updated = await query(`SELECT * FROM users WHERE id = ?`, [
            targetId,
        ]);

        return sendSuccess(res, "Profile updated", { user: updated[0] });
    } catch (err) {
        console.log("Update user error:", err.message);
        return sendError(res, "Error updating profile", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   POST /users/:id/follow — toggle follow
   ═══════════════════════════════════════════════════ */
router.post("/users/:id/follow", requireUser, async (req, res) => {
    try {
        const followingId = parseInt(req.params.id, 10);
        const followerId = req.userId;

        if (followerId === followingId) {
            return sendError(res, "You cannot follow yourself", 400);
        }

        // Check target user exists
        const users = await query(`SELECT * FROM users WHERE id = ?`, [
            followingId,
        ]);
        if (users.length === 0) {
            return sendError(res, "User not found", 404);
        }

        const existing = await query(
            `SELECT id FROM follows WHERE follower_id = ? AND following_id = ?`,
            [followerId, followingId]
        );

        let following;
        if (existing.length > 0) {
            await query(
                `DELETE FROM follows WHERE follower_id = ? AND following_id = ?`,
                [followerId, followingId]
            );
            following = false;
        } else {
            await query(
                `INSERT INTO follows (follower_id, following_id) VALUES (?, ?)`,
                [followerId, followingId]
            );
            following = true;

            // Notification
            const follower = await query(
                `SELECT full_name FROM users WHERE id = ?`,
                [followerId]
            );
            const name =
                follower.length > 0 ? follower[0].full_name : "Someone";
            await query(
                `INSERT INTO notifications (user_id, type, message) VALUES (?, 'follow', ?)`,
                [followingId, `${name} started following you`]
            );
        }

        // Updated counts
        const followerCount = await query(
            `SELECT COUNT(*) AS count FROM follows WHERE following_id = ?`,
            [followingId]
        );

        return sendSuccess(
            res,
            following ? "Followed" : "Unfollowed",
            {
                following,
                follower_count: followerCount[0].count,
            }
        );
    } catch (err) {
        console.log("Follow error:", err.message);
        return sendError(res, "Error toggling follow", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   GET /users/:id/followers
   ═══════════════════════════════════════════════════ */
router.get("/users/:id/followers", async (req, res) => {
    try {
        const userId = req.params.id;

        const followers = await query(
            `
      SELECT u.id, u.full_name, u.username, u.bio
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
      `,
            [userId]
        );

        return sendSuccess(res, "Followers fetched", { followers });
    } catch (err) {
        console.log("Get followers error:", err.message);
        return sendError(res, "Error fetching followers", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   GET /users/:id/following
   ═══════════════════════════════════════════════════ */
router.get("/users/:id/following", async (req, res) => {
    try {
        const userId = req.params.id;

        const following = await query(
            `
      SELECT u.id, u.full_name, u.username, u.bio
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
      `,
            [userId]
        );

        return sendSuccess(res, "Following fetched", { following });
    } catch (err) {
        console.log("Get following error:", err.message);
        return sendError(res, "Error fetching following", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   GET /users/:id/saved — saved posts
   ═══════════════════════════════════════════════════ */
router.get("/users/:id/saved", async (req, res) => {
    try {
        const userId = req.params.id;

        const posts = await query(
            `
      SELECT p.id, p.user_id, p.caption, p.created_at,
             u.full_name AS author, u.username,
             (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes,
             (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comment_count
      FROM saved_posts sp
      JOIN posts p ON sp.post_id = p.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE sp.user_id = ?
      ORDER BY sp.created_at DESC
      `,
            [userId]
        );

        // Enrich with images
        const enriched = [];
        for (const post of posts) {
            const images = await query(
                `SELECT image_url FROM post_images WHERE post_id = ? ORDER BY sort_order ASC`,
                [post.id]
            );
            const imageUrls = images.map((i) => i.image_url);

            enriched.push({
                id: post.id,
                user_id: post.user_id,
                caption: post.caption,
                description: post.caption,
                created_at: post.created_at,
                timestamp: post.created_at,
                author: post.author || "User",
                username: post.username || "user",
                avatar: (post.author || "U").charAt(0).toUpperCase(),
                image: imageUrls[0] || null,
                images: imageUrls,
                likes: post.likes,
                comment_count: post.comment_count,
                is_saved: true,
            });
        }

        return sendSuccess(res, "Saved posts fetched", { posts: enriched });
    } catch (err) {
        console.log("Get saved posts error:", err.message);
        return sendError(res, "Error fetching saved posts", 500, err.message);
    }
});

module.exports = router;
