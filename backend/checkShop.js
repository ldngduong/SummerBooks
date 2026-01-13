
const mongoose = require('mongoose');
const ShopManager = require('./models/ShopManager');
require('dotenv').config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/summerbooks'); // Fallback purely for safety
        console.log('Connected to DB');
        const shop = await ShopManager.findById('shopmanager');
        console.log('ShopManager Document:', shop);

        if (!shop) {
            console.log('MISSING_SHOP_MANAGER');
        } else {
            console.log('FOUND_SHOP_MANAGER');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkDB();
