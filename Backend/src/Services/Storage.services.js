const ImageKit = require("@imagekit/nodejs").default;
const { toFile } = require("@imagekit/nodejs");
const crypto = require("crypto");

const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

/**
 * Upload an image buffer to ImageKit CDN
 * @param {Buffer} buffer - Raw image data
 * @param {string} [originalName] - Original filename for extension detection
 * @returns {Promise<object>} ImageKit upload response with url, fileId, etc.
 */
async function uploadImage(buffer, originalName = "upload.jpg") {
    const ext = originalName.split(".").pop() || "jpg";
    const uniqueName = `post_${Date.now()}_${crypto.randomBytes(4).toString("hex")}.${ext}`;

    const file = await toFile(buffer, uniqueName);
    const result = await client.files.upload({
        file: file,
        fileName: uniqueName,
        folder: "/social-platform",
    });
    return result;
}

module.exports = uploadImage;
