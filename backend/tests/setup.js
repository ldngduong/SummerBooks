const mongoose = require('mongoose')
require('dotenv').config()

// Setup before all tests
beforeAll(async () => {
  // Use test database if MONGO_URI_TEST is set, otherwise use regular MONGO_URI
  const mongoUri = process.env.MONGO_URI_TEST || process.env.MONGO_URI || 'mongodb://localhost:27017/summerbooks-test'
  
  // Only connect if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000
    })
  }
}, 30000) // Increase timeout to 30 seconds

// Cleanup after each test
afterEach(async () => {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
})

// Cleanup after all tests
afterAll(async () => {
  await mongoose.connection.dropDatabase()
  await mongoose.connection.close()
})

