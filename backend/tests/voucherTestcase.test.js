// Set test environment before requiring any modules
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt'

const request = require('supertest')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const User = require('../models/User')
const Voucher = require('../models/Voucher')

const app = require('../server')

describe('Bảng Testcase - Thêm mã giảm giá', () => {
  let adminUser, token

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
  })

  afterEach(async () => {
    await User.deleteMany({})
    await Voucher.deleteMany({})
  })

  // Helper function để tạo voucher data hợp lệ
  const createVoucherData = (overrides = {}) => {
    const defaultData = {
      code: 'BOOK2004',
      value: 20,
      max_discount_amount: 15000,
      min_order_value: 100000,
      start_date: new Date('2025-01-12').toISOString(),
      end_date: new Date('2025-02-22').toISOString(),
      remain: 59,
      status: 'active'
    }
    return { ...defaultData, ...overrides }
  }

  test('TT 1: a="BOOK2004", b=20, c=15000, d=100000, e="12/01/2025", f="22/02/2025", g=59, h="Hoạt động" => S1', async () => {
    const voucherData = createVoucherData()

    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(voucherData)

    console.log('Test Case 1 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Voucher ID:', response.body.voucher?._id || 'N/A')
    console.log('Code:', response.body.voucher?.code || 'N/A')
    console.log('Message:', response.body.message || 'N/A')
    console.log('')

    expect(response.status).toBe(201)
    expect(response.body.voucher).toHaveProperty('_id')
    expect(response.body.voucher.code).toBe('BOOK2004')
    expect(response.body.voucher.value).toBe(20)
  })

  test('TT 2: a="", b="", c="", d="", e="", f="", g="", h="" => E1', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        code: '',
        value: '',
        max_discount_amount: '',
        min_order_value: '',
        start_date: '',
        end_date: '',
        remain: '',
        status: ''
      })

    console.log('Test Case 2 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Mã giảm giá không được để trống')
    expect(response.body.field).toBe('code')
  })

  test('TT 3: a="BOOK2$#6", b="", c="", d="", e="", f="", g="", h="" => E2', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        code: 'BOOK2$#6'
      }))

    console.log('Test Case 3 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không được chứa ký tự đặc biệt')
    expect(response.body.field).toBe('code')
  })

  test('TT 4: a="BOOK200443", b="", c="", d="", e="", f="", g="", h="" => E3', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        code: 'BOOK200443' // 10 ký tự, không đủ 8
      }))

    console.log('Test Case 4 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Code length:', 'BOOK200443'.length)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không đủ 8 ký tự')
    expect(response.body.field).toBe('code')
  })

  test('TT 5: a="BOOK2004", b="", c="", d="", e="", f="", g="", h="" => E4', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        value: ''
      }))

    console.log('Test Case 5 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Giá trị giảm (%) không được để trống')
    expect(response.body.field).toBe('value')
  })

  test('TT 6: a="BOOK2004", b="2A", c="", d="", e="", f="", g="", h="" => E5', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        value: '2A'
      }))

    console.log('Test Case 6 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không chứa ký tự chữ')
    expect(response.body.field).toBe('value')
  })

  test('TT 7: a="BOOK2004", b="2^", c="", d="", e="", f="", g="", h="" => E6', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        value: '2^'
      }))

    console.log('Test Case 7 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không chứa ký tự chữ và ký tự đặc biệt')
    expect(response.body.field).toBe('value')
  })

  test('TT 8: a="BOOK2004", b=120, c="", d="", e="", f="", g="", h="" => E7', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        value: 120 // > 100
      }))

    console.log('Test Case 8 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Value:', 120)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('phải nằm trong khoảng từ 1 đến 100')
    expect(response.body.field).toBe('value')
  })

  test('TT 9: a="BOOK2004", b=20, c="", d="", e="", f="", g="", h="" => E8', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: ''
      }))

    console.log('Test Case 9 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Số tiền giảm tối đa không được để trống')
    expect(response.body.field).toBe('max_discount_amount')
  })

  test('TT 10: a="BOOK2004", b=20, c="10.000Đ", d="", e="", f="", g="", h="" => E9', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: '10.000Đ'
      }))

    console.log('Test Case 10 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không chứa ký tự chữ')
    expect(response.body.field).toBe('max_discount_amount')
  })

  test('TT 11: a="BOOK2004", b=20, c="10.000$#", d="", e="", f="", g="", h="" => E10', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: '10.000$#'
      }))

    console.log('Test Case 11 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không chứa ký tự chữ và ký tự đặc biệt')
    expect(response.body.field).toBe('max_discount_amount')
  })

  test('TT 12: a="BOOK2004", b=20, c=50000, d="", e="", f="", g="", h="" => E11', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: ''
      }))

    console.log('Test Case 12 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Giá trị đơn hàng tối thiểu không được để trống')
    expect(response.body.field).toBe('min_order_value')
  })

  test('TT 13: a="BOOK2004", b=20, c=50000, d="100.00d", e="", f="", g="", h="" => E12', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: '100.00d'
      }))

    console.log('Test Case 13 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không chứa ký tự chữ')
    expect(response.body.field).toBe('min_order_value')
  })

  test('TT 14: a="BOOK2004", b=20, c=50000, d="100.00*^&", e="", f="", g="", h="" => E13', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: '100.00*^&'
      }))

    console.log('Test Case 14 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không chứa ký tự chữ và ký tự đặc biệt')
    expect(response.body.field).toBe('min_order_value')
  })

  test('TT 15: a="BOOK2004", b=20, c=50000, d=100000, e="", f="", g="", h="" => E14', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: 100000,
        start_date: ''
      }))

    console.log('Test Case 15 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Ngày bắt đầu không được để trống')
    expect(response.body.field).toBe('start_date')
  })

  test('TT 16: a="BOOK2004", b=20, c=50000, d=100000, e="12/01/2025", f="01/01/2025", g="", h="" => E15', async () => {
    // Ngày kết thúc < ngày bắt đầu
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: 100000,
        start_date: new Date('2025-01-12').toISOString(),
        end_date: new Date('2025-01-01').toISOString() // Trước start_date
      }))

    console.log('Test Case 16 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Start date:', '2025-01-12')
    console.log('End date:', '2025-01-01')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Ngày bắt đầu phải nhỏ hơn ngày kết thúc')
    expect(response.body.field).toBe('start_date')
  })

  test('TT 17: a="BOOK2004", b=20, c=50000, d=100000, e="12/01/2025", f="", g="", h="" => E16', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: 100000,
        start_date: new Date('2025-01-12').toISOString(),
        end_date: ''
      }))

    console.log('Test Case 17 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Ngày kết thúc không được để trống')
    expect(response.body.field).toBe('end_date')
  })

  test('TT 18: a="BOOK2004", b=20, c=50000, d=100000, e="12/01/2025", f="15/02/2025", g="", h="" => E17', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: 100000,
        start_date: new Date('2025-01-12').toISOString(),
        end_date: new Date('2025-02-15').toISOString(),
        remain: ''
      }))

    console.log('Test Case 18 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Số lượt còn lại không được để trống')
    expect(response.body.field).toBe('remain')
  })

  test('TT 19: a="BOOK2004", b=20, c=50000, d=100000, e="12/01/2025", f="15/02/2025", g="13a", h="" => E18', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: 100000,
        start_date: new Date('2025-01-12').toISOString(),
        end_date: new Date('2025-02-15').toISOString(),
        remain: '13a'
      }))

    console.log('Test Case 19 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không chứa ký tự đặc biệt và chữ cái')
    expect(response.body.field).toBe('remain')
  })

  test('TT 20: a="BOOK2004", b=20, c=50000, d=100000, e="12/01/2025", f="15/02/2025", g="13%", h="" => E19', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: 100000,
        start_date: new Date('2025-01-12').toISOString(),
        end_date: new Date('2025-02-15').toISOString(),
        remain: '13%'
      }))

    console.log('Test Case 20 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('không chứa ký tự đặc biệt và chữ cái')
    expect(response.body.field).toBe('remain')
  })

  test('TT 21: a="BOOK2004", b=20, c=50000, d=100000, e="12/01/2025", f="15/02/2025", g=-36, h="" => E20', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: 100000,
        start_date: new Date('2025-01-12').toISOString(),
        end_date: new Date('2025-02-15').toISOString(),
        remain: -36
      }))

    console.log('Test Case 21 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Remain value:', -36)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('phải nằm trong khoảng từ 1 đến 100')
    expect(response.body.field).toBe('remain')
  })

  test('TT 22: a="BOOK2004", b=20, c=50000, d=100000, e="12/01/2025", f="15/02/2025", g=67.0, h="" => E21', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: 100000,
        start_date: new Date('2025-01-12').toISOString(),
        end_date: new Date('2025-02-15').toISOString(),
        remain: 67.0
      }))

    console.log('Test Case 22 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('Remain value:', 67.0)
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Nhập đúng định dạng')
    expect(response.body.field).toBe('remain')
  })

  test('TT 23: a="BOOK2004", b=20, c=50000, d=100000, e="12/01/2025", f="15/02/2025", g=56, h="Không chọn" => E22', async () => {
    const response = await request(app)
      .post('/api/vouchers')
      .set('Authorization', `Bearer ${token}`)
      .send(createVoucherData({
        max_discount_amount: 50000,
        min_order_value: 100000,
        start_date: new Date('2025-01-12').toISOString(),
        end_date: new Date('2025-02-15').toISOString(),
        remain: 56,
        status: '' // Không chọn trạng thái
      }))

    console.log('Test Case 23 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || 'N/A')
    console.log('Field:', response.body.field || 'N/A')
    console.log('')

    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Vui lòng chọn trạng thái cho mã giảm giá')
    expect(response.body.field).toBe('status')
  })
})



