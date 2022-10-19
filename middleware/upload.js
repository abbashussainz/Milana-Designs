const cloudinary = require("cloudinary").v2;
const cloud_name = process.env.CLOUDNAME
const api_key = process.env.CLOUD_KEY
const api_secret = process.env.CLOUD_SECRET


cloudinary.config({
    cloud_name: cloud_name,
    api_key: api_key,
    api_secret: api_secret
})

module.exports = cloudinary;