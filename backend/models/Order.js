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
        shippingAddress: {
            address1: {
                type: String, required: true
            },
            address2: {
                type: String, required: true
            },
            address3: {
                type: String, required: true
            },
            city: {
                type: String, required: true
            }
        },
        paymentMethod: {
            type: String,
            required: true,
        },
        totalPrice: {
            type: Number,
            required: true
        },
        isPaid: {
            type: Boolean,
            default: false
        },
        paidAt: {
            type: Date
        },
        isDelivered: {
            type: Boolean,
            default: false
        },
        deliveredAt: {
            type: Date
        },
        paymentStatus: {
            type: String,
            default: 'Đang chờ'
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
        }
    }, 
    {timeseries: true}
)

module.exports = mongoose.model('order', orderSchema);