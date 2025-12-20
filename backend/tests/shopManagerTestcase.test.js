// Set test environment before requiring any modules
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt'

const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/User')
const ShopManager = require('../models/ShopManager')

const app = require('../server')

describe('Bảng Testcase - Sửa thông tin cửa hàng', () => {
  let adminUser, token, shopManager

  beforeEach(async () => {
    // Tạo admin user test
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!@#',
      role: 'Quản trị viên'
    })

    // Tạo JWT token
    token = jwt.sign(
      { user: { id: adminUser._id.toString() } },
      process.env.JWT_SECRET
    )

    // Tạo shop manager mặc định
    shopManager = await ShopManager.create({
      _id: 'shopmanager',
      name: 'SummerBooks',
      categories: ['Sách giáo khoa', 'Tiểu thuyết'],
      slogan: 'Tiệm sách chất lượng',
      announcement: 'Vận chuyển toàn quốc',
      contact: {
        meta: 'https://facebook.com/summerbooks',
        instagram: '',
        x: '',
        tiktok: ''
      },
      heroImage: ''
    })
  })

  afterEach(async () => {
    await User.deleteMany({})
    await ShopManager.deleteMany({})
  })

  test('TT 1: Tất cả hợp lệ => Thành công', async () => {
    const response = await request(app)
      .put('/api/shop-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'SummerBooks',
        slogan: 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc',
        announcement: 'Vận chuyển toàn quốc',
        categories: ['Sách giáo khoa', 'Tiểu thuyết'],
        contact: {
          meta: 'https://facebook.com/summerbooks',
          instagram: '',
          x: '',
          tiktok: ''
        },
        heroImage: 'https://example.com/hero.jpg'
      })

    console.log('Test Case 1 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Name:', response.body.name)
    console.log('Categories:', response.body.categories)
    console.log('')
    
    expect(response.status).toBe(200)
    expect(response.body.name).toBe('SummerBooks')
  })

  test('TT 2: Tên cửa hàng để trống => Thất bại', async () => {
    const response = await request(app)
      .put('/api/shop-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '',
        slogan: 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc',
        announcement: 'Vận chuyển toàn quốc',
        categories: ['Sách giáo khoa', 'Tiểu thuyết'],
        contact: {
          meta: 'https://facebook.com/summerbooks',
          instagram: '',
          x: '',
          tiktok: ''
        },
        heroImage: 'https://example.com/hero.jpg'
      })

    console.log('Test Case 2 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Tên cửa hàng là bắt buộc')
  })

  test('TT 3: Tên cửa hàng > 100 ký tự => Thất bại', async () => {
    const longName = 'SummerBooks' + 'A'.repeat(200)
    const response = await request(app)
      .put('/api/shop-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: longName,
        slogan: 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc',
        announcement: 'Vận chuyển toàn quốc',
        categories: ['Sách giáo khoa', 'Tiểu thuyết'],
        contact: {
          meta: 'https://facebook.com/summerbooks',
          instagram: '',
          x: '',
          tiktok: ''
        },
        heroImage: 'https://example.com/hero.jpg'
      })

    console.log('Test Case 3 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Name length:', longName.length)
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('100 ký tự')
  })

  test('TT 4: Slogan > 200 ký tự => Thất bại', async () => {
    const longSlogan = 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc' + 'A'.repeat(300)
    const response = await request(app)
      .put('/api/shop-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'SummerBooks',
        slogan: longSlogan,
        announcement: 'Vận chuyển toàn quốc',
        categories: ['Sách giáo khoa', 'Tiểu thuyết'],
        contact: {
          meta: 'https://facebook.com/summerbooks',
          instagram: '',
          x: '',
          tiktok: ''
        },
        heroImage: 'https://example.com/hero.jpg'
      })

    console.log('Test Case 4 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Slogan length:', longSlogan.length)
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('200 ký tự')
  })

  test('TT 5: Thông báo > 300 ký tự => Thất bại', async () => {
    const longAnnouncement = 'Vận chuyển toàn quốc' + 'A'.repeat(300)
    const response = await request(app)
      .put('/api/shop-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'SummerBooks',
        slogan: 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc',
        announcement: longAnnouncement,
        categories: ['Sách giáo khoa', 'Tiểu thuyết'],
        contact: {
          meta: 'https://facebook.com/summerbooks',
          instagram: '',
          x: '',
          tiktok: ''
        },
        heroImage: 'https://example.com/hero.jpg'
      })

    console.log('Test Case 5 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Announcement length:', longAnnouncement.length)
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('300 ký tự')
  })

  test('TT 6: Không có danh mục => Thất bại', async () => {
    const response = await request(app)
      .put('/api/shop-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'SummerBooks',
        slogan: 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc',
        announcement: 'Vận chuyển toàn quốc',
        categories: [],
        contact: {
          meta: 'https://facebook.com/summerbooks',
          instagram: '',
          x: '',
          tiktok: ''
        },
        heroImage: 'https://example.com/hero.jpg'
      })

    console.log('Test Case 6 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Categories:', response.body.categories || [])
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('ít nhất một danh mục')
  })

  test('TT 7: Danh mục > 50 ký tự => Thất bại', async () => {
    const longCategory = 'Tiểu thuyết' + 'A'.repeat(100)
    const response = await request(app)
      .put('/api/shop-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'SummerBooks',
        slogan: 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc',
        announcement: 'Vận chuyển toàn quốc',
        categories: [longCategory],
        contact: {
          meta: 'https://facebook.com/summerbooks',
          instagram: '',
          x: '',
          tiktok: ''
        },
        heroImage: 'https://example.com/hero.jpg'
      })

    console.log('Test Case 7 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Category length:', longCategory.length)
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('50 ký tự')
  })

  test('TT 8: Liên lạc không đúng định dạng (fb123) => Thất bại', async () => {
    const response = await request(app)
      .put('/api/shop-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'SummerBooks',
        slogan: 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc',
        announcement: 'Vận chuyển toàn quốc',
        categories: ['Tiểu thuyết', 'Sách giáo khoa'],
        contact: {
          meta: 'fb123',
          instagram: '',
          x: '',
          tiktok: ''
        },
        heroImage: 'https://example.com/hero.jpg'
      })

    console.log('Test Case 8 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Contact meta:', response.body.contact?.meta || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không hợp lệ')
  })

  test('TT 9: Ảnh hero không đúng định dạng (.html) => Thất bại', async () => {
    const response = await request(app)
      .put('/api/shop-manager')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'SummerBooks',
        slogan: 'Tiệm sách chất lượng với dịch vụ giao hàng toàn quốc',
        announcement: 'Vận chuyển toàn quốc',
        categories: ['Tiểu thuyết', 'Sách giáo khoa'],
        contact: {
          meta: 'https://facebook.com/summerbooks',
          instagram: '',
          x: '',
          tiktok: ''
        },
        heroImage: 'https://example.com/hero.html'
      })

    console.log('Test Case 9 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('Hero Image:', response.body.heroImage || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('định dạng')
  })
})

