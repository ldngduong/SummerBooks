const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv')
const connectDB = require('./config/db')

const userRoutes = require('./routes/userRoutes')
const productRoutes = require('./routes/productRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require('./routes/orderRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const adminRoutes = require('./routes/adminRoutes')
const shopManagerRouter = require('./routes/shopManager')
const voucherRoutes = require('./routes/voucherRoutes')
const userVoucherRoutes = require('./routes/userVoucherRoutes')
const reviewRoutes = require('./routes/reviewRoutes')

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config();

const PORT = process.env.PORT || 3000;

// Only connect to DB if not in test environment
if (process.env.NODE_ENV !== 'test') {
    connectDB();
}

app.get('/', (req, res) => {
    res.send('the shop')
})

// API
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/shop-manager', shopManagerRouter);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/user-vouchers', userVoucherRoutes);

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log('Server is running on ', PORT)
    })
}

module.exports = app