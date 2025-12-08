const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product'
        },
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true
        },
        author: String,
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    },
    {_id: false}
)

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        orderItems: [orderItemSchema],
        address: {
            type: String,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true
        },
        paidAt: {
            type: Date
        },

        status: {
            type: String,
            enum: ['Chờ duyệt', 'Đang giao', 'Đã giao', 'Đã hủy'],
            default: 'Chờ duyệt'
        },
        name: {
            type: String
        },
        phone: {
            type: String
        },
        voucher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voucher',
            default: null
        },
        userVoucher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'UserVoucher',
            default: null
        },
        discountAmount: {
            type: Number,
            default: 0
        },
        originalPrice: {
            type: Number,
            required: true
        }
    }, 
    {timeseries: true}
)

module.exports = mongoose.model('order', orderSchema);