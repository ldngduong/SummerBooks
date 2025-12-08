const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            uppercase: true,
        },
        value: {
            type: Number,
            required: true,
            min: 0,
        },
        start_date: {
            type: Date,
            required: true,
        },
        end_date: {
            type: Date,
            required: true,
        },
        remain: {
            type: Number,
            required: true,
            default: 1,
            min: 0,
            max: 100,
        },
        max_discount_amount: {
            type: Number,
            required: false,
            min: 0,
            default: null,
        },
        min_order_value: {
            type: Number,
            required: false,
            min: 0,
            default: 0,
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'inactive'],
            default: 'active',
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
    },
    {timestamps: true}
);

// Index for faster queries
// Note: code already has unique index from unique: true
voucherSchema.index({ status: 1 });
voucherSchema.index({ start_date: 1, end_date: 1 });

module.exports = mongoose.model('Voucher', voucherSchema);

