const ImageKit = require("@imagekit/nodejs").default;
const { toFile } = require("@imagekit/nodejs");

const client = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadImage(buffer) {
    const file = await toFile(buffer, "upload.jpg");
    const result = await client.files.upload({
        file: file,
        fileName: "upload.jpg",
    });
    return result;
}

module.exports = uploadImage;
