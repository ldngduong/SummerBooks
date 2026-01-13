
const mongoose = require('mongoose');
const ShopManager = require('./models/ShopManager');
require('dotenv').config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const exists = await ShopManager.findById('shopmanager');
        if (exists) {
            console.log('ShopManager already exists.');
        } else {
            console.log('Creating default ShopManager...');
            await ShopManager.create({
                _id: 'shopmanager',
                name: 'My Awesome Shop',
                slogan: 'Best shop ever',
                announcement: 'Welcome to our shop!',
                categories: ['General'],
                contact: { meta: 'https://facebook.com' }
            });
            console.log('ShopManager created!');
        }
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedDB();
