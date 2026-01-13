const mongoose = require('mongoose')
const dotenv = require('dotenv')
const Product = require('./models/Product')
const User = require('./models/User')
const products = require('./data/product')
const Cart = require('./models/Cart')
const Order = require('./models/Order')
const ShopManager = require('./models/ShopManager')

dotenv.config();
mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        await Product.deleteMany()
        await User.deleteMany()
        await Cart.deleteMany()
        await ShopManager.deleteMany()
        await Order.deleteMany()
        const createdUser = await User.create({
            name: 'Admin',
            email: 'admin@summerbooks.com',
            password: 'Admin123!@#',
            role: 'Quản trị viên',
        })

        const userID = createdUser._id;

        const sampleProducts = products.map((product) => {
            return { ...product, user: userID }
        })

        await Product.insertMany(sampleProducts)
        const shopManager = await ShopManager.create({
            name: 'SummerBooks',
            categories: [
                'Sách giáo khoa', 'Tiểu thuyết', 'Từ điển', 'Sách khoa học'
            ],
            heroImage: 'https://lh3.googleusercontent.com/proxy/LYg_haeSk9f9fG-Fk4j2dElP3sxtWNYibQoWrFOictLzRMC6G3yQ71vukxTAzTwFH-6JQTa67wwgeKmQo55ABl6HlDHBVgvj1OoE_k6SlSyVB5JqgGRNUDECl9p2G7XqHwuK7jJX6Q',
            announcement: 'Vận chuyển toàn quốc - Miễn phí vận chuyển cho đơn hàng từ 100.000vnđ',
            contact: {
                meta: '',
                x: '',
                instagram: '',
                tiktok: '',
                phone: '+84865641682'
            },
            slogan: 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc.'
        })
        console.log("Seed success")
        process.exit()
    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

seedData();