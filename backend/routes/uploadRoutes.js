const express = require('express')
const multer = require('multer')
const cloudinary = require('cloudinary')
const streamifier = require('streamifier')
const { protect, admin } = require('../middleware/authMiddleware')
require('dotenv').config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({storage})

router.post('/', upload.single('image'), protect, admin, async (req, res) => {
    try {
        if(!req.file){
            return res.status(400).json({message: 'Không có file đã tải lên'})
        }
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream((result, error) => {
                    if(result){
                        resolve(result)
                    } else {
                        console.log("Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);
                        reject(error)
                    }
                })
                streamifier.createReadStream(fileBuffer).pipe(stream)
            })
        }
        const result = await streamUpload(req.file.buffer)
        return res.json({imageUrl: result.secure_url})
    } catch (error) {
        console.log(error)
        return res.status(500).send({message: "Lỗi server"})
    }
})

module.exports = router