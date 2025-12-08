const mongoose = require('mongoose')

const connectDB = async () => {
    try{
        if (!process.env.MONGO_URI) {
            console.error('MONGO_URI is not defined in environment variables');
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected successfully to MongoDB');
    }catch(err){
        console.error('Connection failed:', err.message);
        process.exit(1)
    }
}

module.exports = connectDB;