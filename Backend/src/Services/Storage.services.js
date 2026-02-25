const ImageKit = require("imagekit");

const imagekitInstance = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT

})

async function uploadImage(buffer) {
    const result = await imagekitInstance.upload({
        file: buffer,
        fileName: "test.jpg",

    })
    return result
}

module.exports = uploadImage
