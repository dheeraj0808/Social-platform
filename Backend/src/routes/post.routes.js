const express = require("express");
const router = express.Router();
const multer = require("multer");
const uploadImage = require("../Services/Storage.services");
const { query, sendSuccess, sendError } = require("../db/db");

const upload = multer({ storage: multer.memoryStorage() });

/* ═══════════════════════════════════════════════════
   MIDDLEWARE — extract userId from header
   ═══════════════════════════════════════════════════ */
const requireUser = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    if (!userId) {
        return sendError(res, "x-user-id header is required", 401);
    }
    req.userId = parseInt(userId, 10);
    next();
};

/* optional — attach userId if present, don't block */
const optionalUser = (req, res, next) => {
    const userId = req.headers["x-user-id"];
    req.userId = userId ? parseInt(userId, 10) : null;
    next();
};

/* ═══════════════════════════════════════════════════
   POST /createPost
   Body (multipart): image (single/multiple), caption
   ═══════════════════════════════════════════════════ */
router.post(
    "/createPost",
    upload.array("image", 5),
    optionalUser,
    async (req, res) => {
        try {
            const caption = (req.body.caption || "").trim();
            const files = req.files || [];

            if (files.length === 0) {
                return sendError(res, "At least one image is required", 400);
            }
            if (!caption) {
                return sendError(res, "Caption cannot be empty", 400);
            }
            if (files.length > 5) {
                return sendError(res, "Maximum 5 images allowed", 400);
            }

            // Upload all images to ImageKit
            const uploadResults = [];
            for (const file of files) {
                const result = await uploadImage(file.buffer);
                uploadResults.push(result);
            }

            // Insert post
            const postResult = await query(
                `INSERT INTO posts (user_id, caption) VALUES (?, ?)`,
                [req.userId, caption]
            );
            const postId = postResult.insertId;

            // Insert images
            for (let i = 0; i < uploadResults.length; i++) {
                await query(
                    `INSERT INTO post_images (post_id, image_url, sort_order) VALUES (?, ?, ?)`,
                    [postId, uploadResults[i].url, i]
                );
            }

            // Fetch created post
            const post = await getEnrichedPost(postId, req.userId);

            return sendSuccess(
                res,
                "Post created successfully",
                { post },
                201
            );
        } catch (err) {
            console.log("Create post error:", err.message);
            return sendError(res, "Error creating post", 500, err.message);
        }
    }
);

/* ═══════════════════════════════════════════════════
   GET /getPosts?search=keyword
   ═══════════════════════════════════════════════════ */
router.get("/getPosts", optionalUser, async (req, res) => {
    try {
        const search = (req.query.search || "").trim();
        const userId = req.userId;

        let whereClause = "";
        let params = [];

        if (search) {
            whereClause = `WHERE (p.caption LIKE ? OR u.username LIKE ? OR u.full_name LIKE ?)`;
            const searchTerm = `%${search}%`;
            params = [searchTerm, searchTerm, searchTerm];
        }

        const posts = await query(
            `
      SELECT
        p.id,
        p.user_id,
        p.caption,
        p.created_at,
        u.full_name AS author,
        u.username,
        u.bio AS author_bio,
        (SELECT COUNT(*) FROM post_likes pl WHERE pl.post_id = p.id) AS likes,
        (SELECT COUNT(*) FROM post_comments pc WHERE pc.post_id = p.id) AS comment_count
      FROM posts p
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      `,
            params
        );

        // Fetch images and enrichments for each post
        const enrichedPosts = [];
        for (const post of posts) {
            const images = await query(
                `SELECT image_url FROM post_images WHERE post_id = ? ORDER BY sort_order ASC`,
                [post.id]
            );

            let isLiked = false;
            let isSaved = false;
            if (userId) {
                const liked = await query(
                    `SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?`,
                    [post.id, userId]
                );
                isLiked = liked.length > 0;

                const saved = await query(
                    `SELECT id FROM saved_posts WHERE post_id = ? AND user_id = ?`,
                    [post.id, userId]
                );
                isSaved = saved.length > 0;
            }

            // Fetch latest 3 comments
            const comments = await query(
                `
        SELECT pc.id, pc.comment_text, pc.created_at, pc.user_id,
               u.full_name AS author, u.username
        FROM post_comments pc
        LEFT JOIN users u ON pc.user_id = u.id
        WHERE pc.post_id = ?
        ORDER BY pc.created_at DESC
        LIMIT 3
        `,
                [post.id]
            );

            const imageUrls = images.map((i) => i.image_url);

            enrichedPosts.push({
                id: post.id,
                user_id: post.user_id,
                caption: post.caption,
                description: post.caption, // backward compat
                created_at: post.created_at,
                timestamp: post.created_at, // backward compat
                author: post.author || "User",
                username: post.username || "user",
                avatar: (post.author || "U").charAt(0).toUpperCase(),
                image: imageUrls[0] || null, // backward compat (single image)
                images: imageUrls,
                likes: post.likes,
                comment_count: post.comment_count,
                comments: comments.reverse(), // chronological order
                is_liked: isLiked,
                is_saved: isSaved,
            });
        }

        return sendSuccess(res, "Posts fetched successfully", {
            posts: enrichedPosts,
        });
    } catch (err) {
        console.log("Get posts error:", err.message);
        return sendError(res, "Error fetching posts", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   DELETE /posts/:id
   ═══════════════════════════════════════════════════ */
router.delete("/posts/:id", requireUser, async (req, res) => {
    try {
        const postId = req.params.id;

        const posts = await query(`SELECT * FROM posts WHERE id = ?`, [postId]);
        if (posts.length === 0) {
            return sendError(res, "Post not found", 404);
        }

        if (posts[0].user_id && posts[0].user_id !== req.userId) {
            return sendError(res, "You can only delete your own posts", 403);
        }

        await query(`DELETE FROM posts WHERE id = ?`, [postId]);
        return sendSuccess(res, "Post deleted successfully");
    } catch (err) {
        console.log("Delete post error:", err.message);
        return sendError(res, "Error deleting post", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   POST /posts/:id/like — toggle
   ═══════════════════════════════════════════════════ */
router.post("/posts/:id/like", requireUser, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;

        // Check post exists
        const posts = await query(`SELECT * FROM posts WHERE id = ?`, [postId]);
        if (posts.length === 0) {
            return sendError(res, "Post not found", 404);
        }

        // Toggle like
        const existing = await query(
            `SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?`,
            [postId, userId]
        );

        let liked;
        if (existing.length > 0) {
            await query(
                `DELETE FROM post_likes WHERE post_id = ? AND user_id = ?`,
                [postId, userId]
            );
            liked = false;
        } else {
            await query(
                `INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)`,
                [postId, userId]
            );
            liked = true;

            // Create notification for post owner (if not self-like)
            if (posts[0].user_id && posts[0].user_id !== userId) {
                const user = await query(`SELECT full_name FROM users WHERE id = ?`, [
                    userId,
                ]);
                const name = user.length > 0 ? user[0].full_name : "Someone";
                await query(
                    `INSERT INTO notifications (user_id, type, message) VALUES (?, 'like', ?)`,
                    [posts[0].user_id, `${name} liked your post`]
                );
            }
        }

        // Get updated count
        const countResult = await query(
            `SELECT COUNT(*) AS like_count FROM post_likes WHERE post_id = ?`,
            [postId]
        );

        return sendSuccess(res, liked ? "Post liked" : "Post unliked", {
            liked,
            like_count: countResult[0].like_count,
        });
    } catch (err) {
        console.log("Like error:", err.message);
        return sendError(res, "Error toggling like", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   GET /posts/:id/comments
   ═══════════════════════════════════════════════════ */
router.get("/posts/:id/comments", async (req, res) => {
    try {
        const postId = req.params.id;

        const comments = await query(
            `
      SELECT pc.id, pc.comment_text, pc.created_at, pc.user_id,
             u.full_name AS author, u.username
      FROM post_comments pc
      LEFT JOIN users u ON pc.user_id = u.id
      WHERE pc.post_id = ?
      ORDER BY pc.created_at ASC
      `,
            [postId]
        );

        return sendSuccess(res, "Comments fetched", { comments });
    } catch (err) {
        console.log("Get comments error:", err.message);
        return sendError(res, "Error fetching comments", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   POST /posts/:id/comments
   Body: { text }
   ═══════════════════════════════════════════════════ */
router.post("/posts/:id/comments", requireUser, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;
        const text = (req.body.text || "").trim();

        if (!text) {
            return sendError(res, "Comment text cannot be empty", 400);
        }

        // Check post exists
        const posts = await query(`SELECT * FROM posts WHERE id = ?`, [postId]);
        if (posts.length === 0) {
            return sendError(res, "Post not found", 404);
        }

        const result = await query(
            `INSERT INTO post_comments (post_id, user_id, comment_text) VALUES (?, ?, ?)`,
            [postId, userId, text]
        );

        // Fetch the created comment with author info
        const comment = await query(
            `
      SELECT pc.id, pc.comment_text, pc.created_at, pc.user_id,
             u.full_name AS author, u.username
      FROM post_comments pc
      LEFT JOIN users u ON pc.user_id = u.id
      WHERE pc.id = ?
      `,
            [result.insertId]
        );

        // Create notification for post owner (if not self-comment)
        if (posts[0].user_id && posts[0].user_id !== userId) {
            const user = await query(`SELECT full_name FROM users WHERE id = ?`, [
                userId,
            ]);
            const name = user.length > 0 ? user[0].full_name : "Someone";
            const preview = text.length > 30 ? text.substring(0, 30) + "..." : text;
            await query(
                `INSERT INTO notifications (user_id, type, message) VALUES (?, 'comment', ?)`,
                [posts[0].user_id, `${name} commented: "${preview}"`]
            );
        }

        return sendSuccess(
            res,
            "Comment added",
            { comment: comment[0] },
            201
        );
    } catch (err) {
        console.log("Add comment error:", err.message);
        return sendError(res, "Error adding comment", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   DELETE /comments/:id
   ═══════════════════════════════════════════════════ */
router.delete("/comments/:id", requireUser, async (req, res) => {
    try {
        const commentId = req.params.id;

        const comments = await query(
            `SELECT * FROM post_comments WHERE id = ?`,
            [commentId]
        );
        if (comments.length === 0) {
            return sendError(res, "Comment not found", 404);
        }
        if (comments[0].user_id !== req.userId) {
            return sendError(res, "You can only delete your own comments", 403);
        }

        await query(`DELETE FROM post_comments WHERE id = ?`, [commentId]);
        return sendSuccess(res, "Comment deleted");
    } catch (err) {
        console.log("Delete comment error:", err.message);
        return sendError(res, "Error deleting comment", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   POST /posts/:id/save — toggle bookmark
   ═══════════════════════════════════════════════════ */
router.post("/posts/:id/save", requireUser, async (req, res) => {
    try {
        const postId = req.params.id;
        const userId = req.userId;

        const posts = await query(`SELECT id FROM posts WHERE id = ?`, [postId]);
        if (posts.length === 0) {
            return sendError(res, "Post not found", 404);
        }

        const existing = await query(
            `SELECT id FROM saved_posts WHERE post_id = ? AND user_id = ?`,
            [postId, userId]
        );

        let saved;
        if (existing.length > 0) {
            await query(
                `DELETE FROM saved_posts WHERE post_id = ? AND user_id = ?`,
                [postId, userId]
            );
            saved = false;
        } else {
            await query(
                `INSERT INTO saved_posts (post_id, user_id) VALUES (?, ?)`,
                [postId, userId]
            );
            saved = true;
        }

        return sendSuccess(res, saved ? "Post saved" : "Post unsaved", { saved });
    } catch (err) {
        console.log("Save post error:", err.message);
        return sendError(res, "Error toggling save", 500, err.message);
    }
});

/* ═══════════════════════════════════════════════════
   HELPER — fetch single enriched post
   ═══════════════════════════════════════════════════ */
async function getEnrichedPost(postId, userId) {
    const posts = await query(
        `
    SELECT p.id, p.user_id, p.caption, p.created_at,
           u.full_name AS author, u.username
    FROM posts p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
    `,
        [postId]
    );

    if (posts.length === 0) return null;
    const post = posts[0];

    const images = await query(
        `SELECT image_url FROM post_images WHERE post_id = ? ORDER BY sort_order ASC`,
        [postId]
    );
    const imageUrls = images.map((i) => i.image_url);

    return {
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
        likes: 0,
        comment_count: 0,
        comments: [],
        is_liked: false,
        is_saved: false,
    };
}

module.exports = router;
