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

describe('Bảng Testcase - Đặt hàng', () => {
  let user, product, token, validVoucher, expiredVoucher, minOrderVoucher, nonExistentVoucherId

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

    // Tạo voucher hợp lệ (còn hạn, đủ điều kiện)
    validVoucher = await Voucher.create({
      code: 'VALID2024',
      value: 10, // 10% discount
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      remain: 10,
      min_order_value: 50000, // Minimum order 50,000 VND
      max_discount_amount: 50000,
      status: 'active',
      user: user._id
    })

    // Tạo user voucher hợp lệ
    const validUserVoucher = await UserVoucher.create({
      user: user._id,
      voucher: validVoucher._id,
      gifted_by: user._id,
      gift_type: 'individual',
      used: false
    })

    // Tạo voucher hết hạn
    expiredVoucher = await Voucher.create({
      code: 'EXPIRED2024',
      value: 10,
      start_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      end_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago (expired)
      remain: 5,
      min_order_value: 0,
      max_discount_amount: null,
      status: 'active',
      user: user._id
    })

    // Tạo user voucher hết hạn
    const expiredUserVoucher = await UserVoucher.create({
      user: user._id,
      voucher: expiredVoucher._id,
      gifted_by: user._id,
      gift_type: 'individual',
      used: false
    })

    // Tạo voucher yêu cầu đơn hàng tối thiểu >= 100,000 VND
    minOrderVoucher = await Voucher.create({
      code: 'MINORDER2024',
      value: 10,
      start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      remain: 10,
      min_order_value: 100000, // Minimum order 100,000 VND
      max_discount_amount: null,
      status: 'active',
      user: user._id
    })

    // Tạo user voucher với min order requirement
    const minOrderUserVoucher = await UserVoucher.create({
      user: user._id,
      voucher: minOrderVoucher._id,
      gifted_by: user._id,
      gift_type: 'individual',
      used: false
    })

    // ID voucher không tồn tại
    nonExistentVoucherId = new mongoose.Types.ObjectId()

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

  // Helper function để tạo orderItems hợp lệ
  const createOrderItems = (count = 1) => {
    return Array.from({ length: count }, () => ({
      productId: product._id.toString(),
      name: 'Test Book',
      image: 'https://example.com/image.jpg',
      author: 'Test Author',
      price: 100000,
      quantity: 1
    }))
  }

  test('TT 1: a>=1, b="Minh Đức", c="0377712126", d="96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội", e="Không chọn" => Đặt hàng thành công', async () => {
    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0377712126'
        // Không có userVoucherId
      })

    console.log('Test Case 1 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Order ID:', response.body._id || 'N/A')
    console.log('Message:', response.body.message || 'N/A')
    console.log('')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id')
    expect(response.body.name).toBe('Minh Đức')
    expect(response.body.phone).toBe('0377712126')
  })

  test('TT 2: a>=1, b="Minh Đức", c="0377712126", d="96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội", e="Chọn, còn hạn, đủ điều kiện" => Đặt hàng thành công', async () => {
    const validUserVoucher = await UserVoucher.findOne({ voucher: validVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0377712126',
        userVoucherId: validUserVoucher._id.toString()
      })

    console.log('Test Case 2 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Order ID:', response.body._id || 'N/A')
    console.log('Discount Amount:', response.body.discountAmount || 'N/A')
    console.log('Total Price:', response.body.totalPrice || 'N/A')
    console.log('Message:', response.body.message || 'N/A')
    console.log('')

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('_id')
    expect(response.body.discountAmount).toBeGreaterThan(0)
  })

  test('TT 3: a>=1, b="", c="", d="", e="Hết hạn" => Ném ngoại lệ E1', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: '',
        phone: '',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 3 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Họ và tên không được để trống')
    expect(response.body.field).toBe('name')
  })

  test('TT 4: a>=1, b="Minh 123", c="", d="", e="Hết hạn" => Ném ngoại lệ E2', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: 'Minh 123',
        phone: '',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 4 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không được là ký tự số')
    expect(response.body.field).toBe('name')
  })

  test('TT 5: a>=1, b="An^%#$", c="", d="", e="Hết hạn" => Ném ngoại lệ E3', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: 'An^%#$',
        phone: '',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 5 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không được là ký tự số và ký tự đặc biệt')
    expect(response.body.field).toBe('name')
  })

  test('TT 6: a>=1, b="Chuỗi ký tự > 50", c="", d="", e="Hết hạn" => Ném ngoại lệ E4', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })
    const longName = 'A'.repeat(51)

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: longName,
        phone: '',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 6 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Name length:', longName.length)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không được quá 50 ký tự')
    expect(response.body.field).toBe('name')
  })

  test('TT 7: a>=1, b="Chuỗi ký tự <5", c="", d="", e="Hết hạn" => Ném ngoại lệ E5', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })
    const shortName = 'An'

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: shortName,
        phone: '',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 7 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Name length:', shortName.length)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('nhỏ hơn 5 ký tự')
    expect(response.body.field).toBe('name')
  })

  test('TT 8: a>=1, b="Minh Đức", c="", d="", e="Hết hạn" => Ném ngoại lệ E6', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 8 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Số điện thoại không được để trống')
    expect(response.body.field).toBe('phone')
  })

  test('TT 9: a>=1, b="Minh Đức", c="090asdasd213", d="", e="Hết hạn" => Ném ngoại lệ E7', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '090asdasd213',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 9 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không được chứa ký tự chữ')
    expect(response.body.field).toBe('phone')
  })

  test('TT 10: a>=1, b="Minh Đức", c="037&^%&&", d="", e="Hết hạn" => Ném ngoại lệ E8', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '037&^%&&',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 10 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không được chứa ký tự chữ hoặc ký tự đặc biệt')
    expect(response.body.field).toBe('phone')
  })

  test('TT 11: a>=1, b="Minh Đức", c="0371", d="", e="Hết hạn" => Ném ngoại lệ E9', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0371',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 11 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('phải gồm đúng 10 chữ số')
    expect(response.body.field).toBe('phone')
  })

  test('TT 12: a>=1, b="Minh Đức", c="0371", d="", e="Hết hạn" => Ném ngoại lệ E10', async () => {
    // Same as TT 11 - testing same validation
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0371',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 12 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('phải gồm đúng 10 chữ số')
    expect(response.body.field).toBe('phone')
  })

  test('TT 13: a>=1, b="Minh Đức", c="9377712126", d="", e="Hết hạn" => Ném ngoại lệ E11', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '9377712126',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 13 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('phải bắt đầu bằng số 0')
    expect(response.body.field).toBe('phone')
  })

  test('TT 14: a>=1, b="Minh Đức", c="0777712126", d="", e="Hết hạn" => Ném ngoại lệ E12', async () => {
    // Note: Phone "0777712126" starts with 0 and has 10 digits, so it should pass phone validation
    // But address is empty, so it should fail on address validation (E12)
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0777712126',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 14 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Địa chỉ không được để trống')
    expect(response.body.field).toBe('address')
  })

  test('TT 15: a>=1, b="Minh Đức", c="0777712126", d="12 ^^^ Đống Đa", e="Hết hạn" => Ném ngoại lệ E13', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '12 ^^^ Đống Đa',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0777712126',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 15 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không được chứa ký tự đặc biệt')
    expect(response.body.field).toBe('address')
  })

  test('TT 16: a>=1, b="Minh Đức", c="0777712126", d="Chuỗi ký tự >100", e="Hết hạn" => Ném ngoại lệ E14', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })
    const longAddress = 'A'.repeat(101)

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: longAddress,
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0777712126',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 16 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Address length:', longAddress.length)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không được quá 100 ký tự')
    expect(response.body.field).toBe('address')
  })

  test('TT 17: a>=1, b="Minh Đức", c="0777712126", d="Chuỗi ký tự <10", e="Hết hạn" => Ném ngoại lệ E15', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })
    const shortAddress = 'Ha Noi' // 7 ký tự

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: shortAddress,
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0777712126',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 17 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Address length:', shortAddress.length)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('nhỏ hơn 10 ký tự')
    expect(response.body.field).toBe('address')
  })

  test('TT 18: a=0, b="", c="", d="", e="" => Ném ngoại lệ E16', async () => {
    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: [],
        address: '',
        totalPrice: 0,
        name: '',
        phone: ''
        // Không có userVoucherId
      })

    console.log('Test Case 18 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Giỏ hàng phải có ít nhất 1 sản phẩm')
    expect(response.body.field).toBe('cart')
  })

  test('TT 19: a>=1, b="Minh Đức", c="0777712126", d="96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội", e="Mã hết hạn" => Ném ngoại lệ E17', async () => {
    const expiredUserVoucher = await UserVoucher.findOne({ voucher: expiredVoucher._id, user: user._id })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0777712126',
        userVoucherId: expiredUserVoucher._id.toString()
      })

    console.log('Test Case 19 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('hết hạn sử dụng')
    expect(response.body.field).toBe('voucher')
  })

  test('TT 20: a>=1, b="Minh Đức", c="0777712126", d="96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội", e="Mã yêu cầu đơn >= 100.000 vnd" => Ném ngoại lệ E18', async () => {
    // Create order with total 50,000 (less than min_order_value of 100,000)
    const minOrderUserVoucher = await UserVoucher.findOne({ voucher: minOrderVoucher._id, user: user._id })
    
    // Create a cheaper product
    const cheapProduct = await Product.create({
      name: 'Cheap Book',
      author: 'Test Author',
      description: 'Test Description',
      price: 50000,
      countInStock: 10,
      category: 'Fiction',
      countOfPage: 100,
      images: [{ url: 'https://example.com/image.jpg', altText: 'Test' }],
      user: user._id,
      publishedAt: new Date()
    })

    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: [{
          productId: cheapProduct._id.toString(),
          name: 'Cheap Book',
          image: 'https://example.com/image.jpg',
          author: 'Test Author',
          price: 50000,
          quantity: 1
        }],
        address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
        totalPrice: 50000,
        name: 'Minh Đức',
        phone: '0777712126',
        userVoucherId: minOrderUserVoucher._id.toString()
      })

    console.log('Test Case 20 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Order total:', 50000)
    console.log('Min order value:', minOrderVoucher.min_order_value)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không đủ điều kiện áp dụng mã giảm giá')
    expect(response.body.field).toBe('voucher')
  })

  test('TT 21: a>=1, b="Minh Đức", c="0777712126", d="96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội", e="Mã không tồn tại" => Ném ngoại lệ E19', async () => {
    const response = await request(app)
      .post('/api/cart/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({
        user: user._id.toString(),
        orderItems: createOrderItems(1),
        address: '96 Hoàng Mai, quận Đống Đa, phường Ô Chợ Dừa, Hà Nội',
        totalPrice: 100000,
        name: 'Minh Đức',
        phone: '0777712126',
        userVoucherId: nonExistentVoucherId.toString()
      })

    console.log('Test Case 21 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không tồn tại')
    expect(response.body.field).toBe('voucher')
  })
})
