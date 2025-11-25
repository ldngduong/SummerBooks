const mongoose = require('mongoose');

const voucherSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            trim: true,
            unique: true,
            uppercase: true,
            validate: {
                validator: function(v) {
                    // Format: 4 chữ cái + 4 chữ số (ví dụ: ABCD1234)
                    return /^[A-Z]{4}[0-9]{4}$/.test(v);
                },
                message: 'Mã voucher phải có định dạng: 4 chữ cái và 4 chữ số (VD: ABCD1234)'
            }
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
        limit: {
            type: Number,
            required: true,
            default: 1,
            min: 1,
        },
        status: {
            type: String,
            required: true,
            enum: ['active', 'inactive', 'expired'],
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
voucherSchema.index({ code: 1 });
voucherSchema.index({ status: 1 });
voucherSchema.index({ start_date: 1, end_date: 1 });

module.exports = mongoose.model('Voucher', voucherSchema);

