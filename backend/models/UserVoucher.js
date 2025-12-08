const mongoose = require('mongoose');

const userVoucherSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        voucher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Voucher',
            required: true
        },
        gifted_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        gift_type: {
            type: String,
            enum: ['individual', 'new_users', 'order_count'],
            required: true
        },
        order_count: {
            type: Number,
            default: null
        },
        used: {
            type: Boolean,
            default: false
        },
        used_at: {
            type: Date,
            default: null
        },
    },
    {timestamps: true}
);

// Index for faster queries
userVoucherSchema.index({ user: 1, voucher: 1 });
userVoucherSchema.index({ voucher: 1 });
userVoucherSchema.index({ used: 1 });

module.exports = mongoose.model('UserVoucher', userVoucherSchema);

