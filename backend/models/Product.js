const  mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Vui lòng nhập đầy đủ thông tin'],
            trim: true,
            maxlength: [250, 'Tên sách không được vượt quá 250 ký tự'],
            validate: {
                validator: function(v) {
                    return v && v.trim().length > 0;
                },
                message: 'Vui lòng nhập đầy đủ thông tin'
            }
        },
        author: {
            type: String,
            required: [true, 'Vui lòng nhập đầy đủ thông tin'],
            trim: true,
            minlength: [3, 'Tác giả phải có tối thiểu 3 ký tự'],
            maxlength: [50, 'Tác giả không được vượt quá 50 ký tự'],
            validate: {
                validator: function(v) {
                    return v && v.trim().length >= 3;
                },
                message: 'Tác giả phải có tối thiểu 3 ký tự'
            }
        },
        description: {
            type: String,
            required: [true, 'Vui lòng nhập đầy đủ thông tin'],
            maxlength: [2000, 'Mô tả không được vượt quá 2000 ký tự'],
            validate: {
                validator: function(v) {
                    return v && v.trim().length > 0;
                },
                message: 'Vui lòng nhập đầy đủ thông tin'
            }
        },
        price: {
            type: Number,
            required: [true, 'Vui lòng nhập đầy đủ thông tin'],
            min: [1000, 'Giá bán tối thiểu là 1.000 VNĐ'],
            validate: {
                validator: function(v) {
                    return Number.isInteger(v) && v >= 1000;
                },
                message: 'Giá bán tối thiểu là 1.000 VNĐ'
            }
        },
        countInStock: {
            type: Number,
            required: [true, 'Vui lòng nhập đầy đủ thông tin'],
            min: [1, 'Số lượng tồn kho tối thiểu là 1'],
            validate: {
                validator: function(v) {
                    return Number.isInteger(v) && v >= 1;
                },
                message: 'Số lượng tồn kho tối thiểu là 1'
            }
        },
        category: {
            type: String,
            required: [true, 'Vui lòng nhập đầy đủ thông tin'],
            validate: {
                validator: function(v) {
                    return v && v.trim().length > 0;
                },
                message: 'Vui lòng nhập đầy đủ thông tin'
            }
        },
        countOfPage: {
            type: Number,
            required: [true, 'Vui lòng nhập đầy đủ thông tin'],
            min: [24, 'Số trang tối thiểu là 24 trang'],
            validate: {
                validator: function(v) {
                    return Number.isInteger(v) && v >= 24;
                },
                message: 'Số trang tối thiểu là 24 trang'
            }
        },
        images: {
            type: [
                {
                    url: {
                        type: String,
                        required: true,
                    },
                    altText: {
                        type: String,
                    },
                },
            ],
            validate: {
                validator: function(v) {
                    return Array.isArray(v) && v.length > 0;
                },
                message: 'Vui lòng nhập đầy đủ thông tin (cần ít nhất 1 ảnh)'
            }
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        publishedAt: {
            type: Date,
            required: [true, 'Vui lòng nhập đầy đủ thông tin']
        },
    },
    {timestamps: true}
);

module.exports = mongoose.model('Product', productSchema)