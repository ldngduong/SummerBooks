const express = require('express')
const multer = require('multer')
const cloudinary = require('cloudinary')
const streamifier = require('streamifier')
const Review = require('../models/Review')
const Order = require('../models/Order')
const { protect } = require('../middleware/authMiddleware')
require('dotenv').config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const router = express.Router()
const storage = multer.memoryStorage()
const upload = multer({
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|svg/
        const extname = allowedTypes.test(file.originalname.toLowerCase())
        const mimetype = allowedTypes.test(file.mimetype)
        
        if (extname && mimetype) {
            return cb(null, true)
        } else {
            cb(new Error('Ảnh không đúng định dạng. Chỉ chấp nhận jpg, png, jpeg, svg'))
        }
    }
})

// Helper function to upload image to cloudinary
const streamUpload = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((result, error) => {
            if (result) {
                resolve(result)
            } else {
                reject(error)
            }
        })
        streamifier.createReadStream(fileBuffer).pipe(stream)
    })
}

// GET /api/reviews/product/:productId - Get reviews for a product (public)
router.get('/product/:productId', async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .populate('user', 'name')
            .sort({ createdAt: -1 }) // Sort by newest first
        return res.json(reviews)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Lỗi server" })
    }
})

// GET /api/reviews/order/:orderId - Get reviews for an order
router.get('/order/:orderId', protect, async (req, res) => {
    try {
        const reviews = await Review.find({ order: req.params.orderId })
            .populate('user', 'name')
        return res.json(reviews)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: "Lỗi server" })
    }
})

// POST /api/reviews - Create a review
router.post('/', protect, upload.array('images', 5), async (req, res) => {
    try {
        const { orderId, productId, rating, comment } = req.body

        // Validate required fields
        if (!orderId || !productId || !rating) {
            return res.status(400).json({ message: "Điểm hài lòng không được để trống" })
        }

        // Validate rating (1-10, natural number)
        const ratingNum = parseInt(rating)
        if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 10 || !Number.isInteger(ratingNum)) {
            return res.status(400).json({ message: "Điểm hài lòng không hợp lệ" })
        }

        // Validate comment length
        if (comment && comment.length > 500) {
            return res.status(400).json({ message: "Nhận xét không được vượt quá 500 ký tự" })
        }

        // Find order and check ownership
        const order = await Order.findById(orderId)
        if (!order) {
            return res.status(404).json({ message: "Đơn hàng không tồn tại" })
        }

        if (order.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "Không có quyền đánh giá đơn hàng này" })
        }

        // Check if order is delivered
        if (order.status !== 'Đã giao') {
            return res.status(400).json({ message: "Đơn hàng chưa hoàn thành, chưa thể đánh giá" })
        }

        // Check if order has deliveredAtes.status(400).json({ message: "Sản phẩm không có trong đơn hàng này" })
        if (!order.deliveredAt) {
            // If status is 'Đã giao' but no deliveredAt, set it to now
            order.deliveredAt = new Date()
            await order.save()
        }

        // Check if review period has expired (14 days from delivery)
        const deliveryDate = new Date(order.deliveredAt)
        const expiryDate = new Date(deliveryDate)
        expiryDate.setDate(expiryDate.getDate() + 14)
        
        if (new Date() > expiryDate) {
            return res.status(400).json({ message: "Đơn hàng đã quá thời hạn đánh giá" })
        }

        // Check if product exists in order
        const productInOrder = order.orderItems.find(
            item => item.productId.toString() === productId.toString()
        )
        if (!productInOrder) {
            return res.status(400).json({ message: "Sản phẩm không có trong đơn hàng này" }) 
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            user: req.user._id,
            order: orderId,
            productId: productId
        })
        if (existingReview) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi" })
        }

        // Upload images if any
        let imageUrls = []
        if (req.files && req.files.length > 0) {
            try {
                const uploadPromises = req.files.map(file => streamUpload(file.buffer))
                const uploadResults = await Promise.all(uploadPromises)
                imageUrls = uploadResults.map(result => result.secure_url)
            } catch (uploadError) {
                console.log('Upload error:', uploadError)
                return res.status(400).json({ message: "Lỗi khi upload ảnh" })
            }
        }

        // Create review
        const review = await Review.create({
            user: req.user._id,
            order: orderId,
            productId: productId,
            rating: ratingNum,
            comment: comment || '',
            images: imageUrls
        })

        const populatedReview = await Review.findById(review._id).populate('user', 'name')
        return res.status(201).json(populatedReview)
    } catch (error) {
        console.error("Lỗi khi tạo đánh giá:", error)
        if (error.code === 11000) {
            return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này trong đơn hàng này rồi" })
        }
        return res.status(500).json({ message: "Lỗi server", error: error.message })
    }
})

module.exports = router


