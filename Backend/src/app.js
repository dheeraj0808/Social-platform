const express = require("express");
const cors = require("cors");
const multer = require("multer");
const uploadImage = require("./Services/Storage.services");
const db = require("./Models/Post.model");

const app = express();


app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() })

app.post("/createPost", upload.single("image"), async (req, res) => {
    console.log(req.body);
    console.log(req.file);

    try {
        const result = await uploadImage(req.file.buffer);
        console.log(result);

        db.query("INSERT INTO posts (image, caption) VALUES (?, ?)", [result.url, req.body.caption], (err, post) => {
            if (err) {
                return res.status(500).json({ message: "Error creating post", error: err.message })
            }

            return res.status(201).json({
                message: "Post created successfully",
                post
            })
        })
    } catch (error) {
        console.log("Upload error:", error.message);
        return res.status(500).json({ message: "Error uploading image", error: error.message });
    }

});

app.get("/getPosts", async (req, res) => {

    db.query("SELECT * FROM posts", (err, posts) => {
        if (err) {
            return res.status(500).json({ message: "Error fetching posts", error: err.message })
        }

        return res.status(200).json({
            message: "Posts fetched successfully",
            posts
        })
    })

})

module.exports = app;