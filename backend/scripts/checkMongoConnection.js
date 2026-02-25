const mongoose = require('mongoose')
require('dotenv').config()

const checkConnection = async () => {
  try {
    const mongoUri = process.env.MONGO_URI
    
    if (!mongoUri) {
      console.error('❌ MONGO_URI không được định nghĩa trong file .env')
      process.exit(1)
    }
    
    console.log('🔌 Đang kết nối đến MongoDB...')
    console.log('📍 URI:', mongoUri.replace(/\/\/.*@/, '//***:***@')) // Ẩn thông tin đăng nhập
    
    await mongoose.connect(mongoUri)
    
    const connectionState = mongoose.connection.readyState
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }
    
    console.log('✅ Kết nối MongoDB thành công!')
    console.log('📊 Trạng thái:', states[connectionState])
    console.log('🗄️  Database:', mongoose.connection.db.databaseName)
    console.log('🖥️  Host:', mongoose.connection.host)
    console.log('🔌 Port:', mongoose.connection.port)
    
    // Kiểm tra số lượng collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('📁 Số collections:', collections.length)
    
    if (collections.length > 0) {
      console.log('📋 Danh sách collections:')
      collections.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.name}`)
      })
    }
    
    await mongoose.connection.close()
    console.log('✅ Đã đóng kết nối')
    process.exit(0)
    
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:')
    console.error('   Message:', error.message)
    console.error('   Code:', error.code)
    process.exit(1)
  }
}

checkConnection()


