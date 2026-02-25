// Set test environment before requiring any modules
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt'

const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/User')
const Product = require('../models/Product')

const app = require('../server')

describe('Bảng Testcase - Quản lý sách', () => {
  let adminUser, token

  beforeEach(async () => {
    // Xóa tất cả data trước mỗi test
    await User.deleteMany({})
    await Product.deleteMany({})

    // Tạo admin user để có quyền tạo sản phẩm
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'Admin123!@#',
      role: 'Quản trị viên'
    })

    // Tạo JWT token
    token = jwt.sign(
      { user: { id: adminUser._id.toString() } },
      process.env.JWT_SECRET
    )
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Product.deleteMany({})
  })

  // Helper function để tạo product data hợp lệ
  const getValidProductData = () => ({
    name: 'Cây cam ngọt của tôi',
    price: 120000,
    author: 'Jose Mauro De Vasconcelos',
    description: 'Cây cam ngọt là…',
    category: 'Tiểu thuyết',
    countOfPage: 193,
    publishedAt: '1968-11-14',
    countInStock: 200,
    images: [{ url: 'https://example.com/a.jpg', altText: '' }]
  })

  test('TT 1: a="", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.name = ''

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 1 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 2: a="Cây cam ngọt của tôi", b="", c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.price = ''

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 2 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 3: a="Cây cam ngọt của tôi", b=120000, c="", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.author = ''

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 3 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 4: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.description = ''

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 4 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 5: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.category = ''

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 5 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 6: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f="", g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countOfPage = ''

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 6 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 7: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.publishedAt = ''

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 7 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 8: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h="", i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countInStock = ''

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 8 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 9: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.images = []

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 9 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 10: a="Cây cam ngọt của tôi", b="abc", c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.price = 'abc'

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 10 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Giá bán tối thiểu là 1.000 VNĐ')
  })

  test('TT 11: a="Cây cam ngọt của tôi", b="12.000@", c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.price = '12.000@'

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 11 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Giá bán tối thiểu là 1.000 VNĐ')
  })

  test('TT 12: a="Cây cam ngọt của tôi", b=900, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.price = 900

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 12 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Giá bán tối thiểu là 1.000 VNĐ')
  })

  test('TT 13: a="Cây cam ngọt của tôi", b=-10000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.price = -10000

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 13 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Giá bán tối thiểu là 1.000 VNĐ')
  })

  test('TT 14: a="Cây cam ngọt của tôi" (300 ký tự), b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.name = 'A'.repeat(300) // 300 ký tự

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 14 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Name length:', productData.name.length)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('250 ký tự')
  })

  test('TT 15: a="Cây cam ngọt của tôi", b=120000, c="A" (1 ký tự), d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.author = 'A'

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 15 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('3 ký tự')
  })

  test('TT 16: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos" (51 ký tự), d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.author = 'A'.repeat(51) // 51 ký tự

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 16 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Author length:', productData.author.length)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('50 ký tự')
  })

  test('TT 17: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…" (2010 ký tự), e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.description = 'A'.repeat(2010) // 2010 ký tự

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 17 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Description length:', productData.description.length)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('2000 ký tự')
  })

  test('TT 18: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=-193, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countOfPage = -193

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 18 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('24 trang')
  })

  test('TT 19: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f="abc", g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countOfPage = 'abc'

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 19 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('24 trang')
  })

  test('TT 20: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f="123@", g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countOfPage = '123@'

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 20 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('24 trang')
  })

  test('TT 21: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=13, g="14/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countOfPage = 13 // < 24

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 21 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('24 trang')
  })

  test('TT 22: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="ab/11/1968", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.publishedAt = 'ab/11/1968' // Invalid date format

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 22 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    // Date validation có thể fail ở model level hoặc route level
    expect([400, 500]).toContain(response.status)
  })

  test('TT 23: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/@12", h=200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.publishedAt = '14/11/@12' // Invalid date format

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 23 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect([400, 500]).toContain(response.status)
  })

  test('TT 24: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h="abc", i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countInStock = 'abc'

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 24 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Số lượng tồn kho tối thiểu là 1')
  })

  test('TT 25: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h="200@", i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countInStock = '200@'

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 25 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Số lượng tồn kho tối thiểu là 1')
  })

  test('TT 26: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=-200, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countInStock = -200

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 26 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Số lượng tồn kho tối thiểu là 1')
  })

  test('TT 27: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=0, i="a.jpg" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.countInStock = 0

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 27 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Số lượng tồn kho tối thiểu là 1')
  })

  test('TT 28: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.pdf" => Thất bại', async () => {
    const productData = getValidProductData()
    productData.images = [{ url: 'https://example.com/a.pdf', altText: '' }]

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 28 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('định dạng')
  })

  test('TT 29: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" (35MB) => Thất bại', async () => {
    // Mock HTTP/HTTPS để simulate file > 25MB (35MB)
    const https = require('https')
    const http = require('http')
    
    // Lưu original implementations
    const originalHttpsRequest = https.request
    const originalHttpRequest = http.request
    
    const mockResponse = {
      headers: {
        'content-length': (35 * 1024 * 1024).toString() // 35MB > 25MB
      },
      destroy: jest.fn()
    }
    
    const mockRequest = {
      on: jest.fn(),
      setTimeout: jest.fn(() => mockRequest),
      destroy: jest.fn(),
      end: jest.fn(),
      setNoDelay: jest.fn(() => mockRequest),
      setSocketKeepAlive: jest.fn(() => mockRequest),
      setHeader: jest.fn(() => mockRequest),
      write: jest.fn(),
      once: jest.fn()
    }
    
    // Mock https.request - chỉ mock khi URL chứa 'large-image-35MB'
    https.request = jest.fn((options, callback) => {
      const path = options.path || ''
      const hostname = options.hostname || ''
      // Chỉ mock cho URL test case 29
      if (path.includes('large-image-35MB') || hostname.includes('example.com')) {
        if (callback) {
          callback(mockResponse)
        }
        return mockRequest
      }
      // Với các request khác, gọi original function
      return originalHttpsRequest.call(https, options, callback)
    })
    
    // Mock http.request - chỉ mock khi URL chứa 'large-image-35MB'
    http.request = jest.fn((options, callback) => {
      const path = options.path || ''
      const hostname = options.hostname || ''
      // Chỉ mock cho URL test case 29
      if (path.includes('large-image-35MB') || hostname.includes('example.com')) {
        if (callback) {
          callback(mockResponse)
        }
        return mockRequest
      }
      // Với các request khác, gọi original function
      return originalHttpRequest.call(http, options, callback)
    })
    
    try {
      const productData = getValidProductData()
      productData.images = [{ url: 'https://example.com/large-image-35MB.jpg', altText: '' }]

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${token}`)
        .send(productData)

      console.log('Test Case 29 - Đầu ra thực tế:')
      console.log('Status:', response.status)
      const message = response.body.message || response.body.errors || 'N/A'
      console.log('Message:', message)
      console.log('File size: 35 MB')
      console.log('')

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('25MB')
    } finally {
      // Restore original methods
      https.request = originalHttpsRequest
      http.request = originalHttpRequest
    }
  })

  test('TT 30: a="Cây cam ngọt của tôi", b=120000, c="Jose Mauro De Vasconcelos", d="Cây cam ngọt là…", e="Tiểu thuyết", f=193, g="14/11/1968", h=200, i="a.jpg" => Thành công', async () => {
    const productData = getValidProductData()

    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send(productData)

    console.log('Test Case 30 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Product ID:', response.body._id || 'N/A')
    console.log('Product Name:', response.body.name || 'N/A')
    console.log('Product Price:', response.body.price || 'N/A')
    console.log('')

    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('_id')
    expect(response.body.name).toBe('Cây cam ngọt của tôi')
    expect(response.body.price).toBe(120000)
    expect(response.body.author).toBe('Jose Mauro De Vasconcelos')

    // Verify product was actually created in database
    const createdProduct = await Product.findById(response.body._id)
    expect(createdProduct).toBeTruthy()
    expect(createdProduct.name).toBe('Cây cam ngọt của tôi')
  })
})

