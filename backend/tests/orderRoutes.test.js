// Set test environment before requiring any modules
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt'

const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/User')
const Order = require('../models/Order')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const Voucher = require('../models/Voucher')
const UserVoucher = require('../models/UserVoucher')

const app = require('../server')

describe('POST /api/cart/checkout - Đặt hàng (Kiểm thử hộp đen)', () => {
  let user, product, token

  beforeEach(async () => {
    // Tạo user test
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Test123!@#',
      role: 'Khách hàng'
    })

    // Tạo product test
    product = await Product.create({
      name: 'Test Book',
      author: 'Test Author',
      description: 'Test Description',
      price: 100000,
      countInStock: 10,
      category: 'Fiction',
      countOfPage: 100,
      images: [{ url: 'https://example.com/image.jpg', altText: 'Test' }],
      user: user._id,
      publishedAt: new Date()
    })

    // Tạo JWT token
    token = jwt.sign(
      { user: { id: user._id.toString() } },
      process.env.JWT_SECRET
    )
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Order.deleteMany({})
    await Product.deleteMany({})
    await Cart.deleteMany({})
    await Voucher.deleteMany({})
    await UserVoucher.deleteMany({})
  })

  describe('1. Phân vùng tương đương - Biến Giỏ hàng', () => {
    test('Phân vùng 1: Giá trị hợp lệ (>=1 sản phẩm) - 1 sản phẩm', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(200)
      expect(response.body).toHaveProperty('_id')
    })

    test('Phân vùng 2: Giá trị không hợp lệ (=0 sản phẩm) - Giỏ hàng trống', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 0,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('Giỏ hàng phải có ít nhất 1 sản phẩm')
    })
  })

  describe('2. Phân vùng tương đương - Biến Họ và tên', () => {
    test('Phân vùng 1: Giá trị hợp lệ - Chỉ chứa chữ cái và khoảng trắng', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(200)
    })

    test('Phân vùng 2: Giá trị không hợp lệ - Để trống', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: '',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('Họ và tên không được để trống')
    })

    test('Phân vùng 3: Giá trị không hợp lệ - Chứa số', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh 123',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('không được là ký tự số')
    })

    test('Phân vùng 4: Giá trị không hợp lệ - Chứa ký tự đặc biệt', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'An^%#$',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('không được là ký tự số và ký tự đặc biệt')
    })

    test('Phân vùng 5: Giá trị không hợp lệ - Quá 50 ký tự', async () => {
      const longName = 'A'.repeat(51)
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: longName,
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('không được quá 50 ký tự')
    })
  })

  describe('3. Phân tích giá trị biên - Biến Họ và tên', () => {
    test('Biên dưới: Độ dài = 0 => Lỗi', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: '',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
    })

    test('Biên trên: Độ dài = 50 => Pass', async () => {
      const name = 'A'.repeat(50)
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: name,
          phone: '0377712126'
        })

      expect(response.status).toBe(200)
    })

    test('Biên trên + 1: Độ dài = 51 => Lỗi', async () => {
      const name = 'A'.repeat(51)
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: name,
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('4. Phân vùng tương đương - Biến Số điện thoại', () => {
    test('Phân vùng 1: Giá trị hợp lệ - 10 chữ số, bắt đầu bằng 0', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(200)
    })

    test('Phân vùng 2: Giá trị không hợp lệ - Để trống', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: ''
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('Số điện thoại không được để trống')
    })

    test('Phân vùng 3: Giá trị không hợp lệ - Chứa chữ cái', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '090asdasd213'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('không được chứa ký tự chữ')
    })

    test('Phân vùng 4: Giá trị không hợp lệ - Chứa ký tự đặc biệt', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '037&^%&&'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('không được chứa ký tự chữ hoặc ký tự đặc biệt')
    })

    test('Phân vùng 5: Giá trị không hợp lệ - Không đủ 10 chữ số', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0371'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('phải gồm đúng 10 chữ số')
    })

    test('Phân vùng 6: Giá trị không hợp lệ - Không bắt đầu bằng 0', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '9377712126'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('phải bắt đầu bằng số 0')
    })
  })

  describe('5. Phân tích giá trị biên - Biến Số điện thoại', () => {
    test('Biên dưới: Độ dài = 0 => Lỗi', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: ''
        })

      expect(response.status).toBe(400)
    })

    test('Biên dưới + 1: Độ dài = 9 => Lỗi', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '037771212'
        })

      expect(response.status).toBe(400)
    })

    test('Biên trên: Độ dài = 10 => Pass', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(200)
    })

    test('Biên trên + 1: Độ dài = 11 => Lỗi', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '03777121266'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('6. Phân vùng tương đương - Biến Địa chỉ', () => {
    test('Phân vùng 1: Giá trị hợp lệ - Chứa chữ, số, dấu phẩy, dấu chấm', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(200)
    })

    test('Phân vùng 2: Giá trị không hợp lệ - Để trống', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('Địa chỉ không được để trống')
    })

    test('Phân vùng 3: Giá trị không hợp lệ - Chứa ký tự đặc biệt không cho phép', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '12 ^^^ Đống Đa',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('không được chứa ký tự đặc biệt')
    })

    test('Phân vùng 4: Giá trị không hợp lệ - Quá 100 ký tự', async () => {
      const longAddress = 'A'.repeat(101)
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: longAddress,
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('không được quá 100 ký tự')
    })
  })

  describe('7. Phân tích giá trị biên - Biến Địa chỉ', () => {
    test('Biên dưới: Độ dài = 0 => Lỗi', async () => {
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: '',
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
    })

    test('Biên trên: Độ dài = 100 => Pass', async () => {
      const address = 'A'.repeat(100)
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: address,
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(200)
    })

    test('Biên trên + 1: Độ dài = 101 => Lỗi', async () => {
      const address = 'A'.repeat(101)
      const response = await request(app)
        .post('/api/cart/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send({
          user: user._id.toString(),
          orderItems: [{
            productId: product._id.toString(),
            name: 'Test Book',
            image: 'https://example.com/image.jpg',
            author: 'Test Author',
            price: 100000,
            quantity: 1
          }],
          address: address,
          totalPrice: 100000,
          name: 'Minh Đức',
          phone: '0377712126'
        })

      expect(response.status).toBe(400)
    })
  })
})




