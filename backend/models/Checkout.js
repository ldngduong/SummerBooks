const mongoose = require('mongoose');

const CheckoutItem = mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        author: String,
        price: {
            type: Number,
            required: true
        },
        quantity:{
            type: Number,
            required: true
        },
    }, 
    {_id: false}
);

const checkoutSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        checkoutItems: [CheckoutItem],
        shippingAddress: {
            address1: {type: String, required: true},
            address2: {type: String, required: true},
            address3: {type: String, required: true},
            city: {type: String, required: true},
        },
        paymentMethod: {
            type: String,
            required: true
        },
        totalPrice: {
            type: Number,
            required: true,
        },
        isPaid: {
            type: Boolean,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        paymentStatus: {
            type: String,
            default: "Đang chờ"
        },
        isFinalized: {
            type: Boolean,
            default: false
        },
        finalizedAt: {
            type: Date,
        },
        name: {
            type: String,
        },
        phone: {
            type: Number
        },
    },
    {timestamps: true}
)

module.exports = mongoose.model('Checkout', checkoutSchema)