const  mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        author: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        countInStock: {
            type: Number,
            required: true,
            default: 0
        },
        category: {
            type: String,
            required: true,
        },
        countOfPage: {
            type: Number,  
        },
        images: [
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
        rating: {
            type: Number,
            default: 0,
        },
        numReviews: {
            type: Number,
            default: 0,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        publishedAt: Date,
    },
    {timestamps: true}
);

module.exports = mongoose.model('Product', productSchema)