
const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        const count = await Product.countDocuments();
        console.log(`Product Count: ${count}`);

        if (count === 0) {
            console.log('NO_PRODUCTS');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkProducts();
