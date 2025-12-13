const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },
        comment: {
            type: String,
            maxlength: 500,
            default: ''
        },
        images: [{
            type: String
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
)

// Đảm bảo một user chỉ đánh giá một sản phẩm trong một đơn hàng một lần
reviewSchema.index({ user: 1, order: 1, productId: 1 }, { unique: true })

module.exports = mongoose.model('Review', reviewSchema)

