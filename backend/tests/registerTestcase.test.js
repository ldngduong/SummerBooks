// Set test environment before requiring any modules
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt'

const request = require('supertest')
const mongoose = require('mongoose')
require('dotenv').config()
const User = require('../models/User')

const app = require('../server')

describe('Bảng Testcase - Đăng ký tài khoản', () => {
  beforeEach(async () => {
    // Xóa tất cả users trước mỗi test để đảm bảo môi trường sạch
    await User.deleteMany({})
    
    // Tạo user với email B@gmail.com cho test case 7 (email đã tồn tại)
    await User.create({
      name: 'Existing User',
      email: 'B@gmail.com',
      password: 'Existing123!@#'
    })
  })

  afterEach(async () => {
    await User.deleteMany({})
  })

  test('TT 1: a="", b="B@gmail.com", c="Giang12@" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: '',
        email: 'B@gmail.com',
        password: 'Giang12@'
      })

    console.log('Test Case 1 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 2: a="G", b="B@gmail.com", c="Giang12@" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'G',
        email: 'B@gmail.com',
        password: 'Giang12@'
      })

    console.log('Test Case 2 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('định dạng')
  })

  test('TT 3: a="Giang141", b="B@gmail.com", c="Giang12@" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang141',
        email: 'B@gmail.com',
        password: 'Giang12@'
      })

    console.log('Test Case 3 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('định dạng')
  })

  test('TT 4: a="Giang@", b="B@gmail.com", c="Giang12@" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang@',
        email: 'B@gmail.com',
        password: 'Giang12@'
      })

    console.log('Test Case 4 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('định dạng')
  })

  test('TT 5: a="Giang", b="", c="Giang12@" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang',
        email: '',
        password: 'Giang12@'
      })

    console.log('Test Case 5 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 6: a="Giang", b="B@gmail", c="Giang12@" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang',
        email: 'B@gmail',
        password: 'Giang12@'
      })

    console.log('Test Case 6 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('định dạng')
  })

  test('TT 7: a="Giang", b="B@gmail.com" (Đã tồn tại), c="Giang12@" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang',
        email: 'B@gmail.com', // Email đã tồn tại (được tạo trong beforeEach)
        password: 'Giang12@'
      })

    console.log('Test Case 7 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đã tồn tại')
  })

  test('TT 8: a="Giang", b="B@gmail.com", c="" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang',
        email: 'B@gmail.com',
        password: ''
      })

    console.log('Test Case 8 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('đầy đủ thông tin')
  })

  test('TT 9: a="Giang", b="B@gmail.com", c="Giang12" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang',
        email: 'B@gmail.com',
        password: 'Giang12' // Thiếu ký tự đặc biệt
      })

    console.log('Test Case 9 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Mật khẩu không hợp lệ')
  })

  test('TT 10: a="Giang", b="B@gmail.com", c="GiangTra" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang',
        email: 'B@gmail.com',
        password: 'GiangTra' // Thiếu ký tự đặc biệt
      })

    console.log('Test Case 10 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Mật khẩu không hợp lệ')
  })

  test('TT 11: a="Giang", b="B@gmail.com", c="12345678" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang',
        email: 'B@gmail.com',
        password: '12345678' // Thiếu ký tự in hoa và ký tự đặc biệt
      })

    console.log('Test Case 11 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Mật khẩu không hợp lệ')
  })

  test('TT 12: a="Giang", b="B@gmail.com", c="giang12@" => Thất bại', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang',
        email: 'B@gmail.com',
        password: 'giang12@' // Thiếu ký tự in hoa
      })

    console.log('Test Case 12 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('Message:', response.body.message || response.body.errors || 'N/A')
    console.log('')
    
    expect(response.status).toBe(400)
    expect(response.body.message).toContain('Mật khẩu không hợp lệ')
  })

  test('TT 13: a="Giang", b="B@gmail.com", c="Giang12@" => Thành công', async () => {
    // Xóa user với email B@gmail.com để test case này có thể thành công
    await User.deleteOne({ email: 'B@gmail.com' })
    
    const response = await request(app)
      .post('/api/users/register')
      .send({
        name: 'Giang',
        email: 'B@gmail.com',
        password: 'Giang12@'
      })

    console.log('Test Case 13 - Đầu ra thực tế:')
    console.log('Status:', response.status)
    console.log('User ID:', response.body.user?._id || 'N/A')
    console.log('User Name:', response.body.user?.name || 'N/A')
    console.log('User Email:', response.body.user?.email || 'N/A')
    console.log('Token:', response.body.token ? 'Có token' : 'Không có token')
    console.log('')
    
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('user')
    expect(response.body.user).toHaveProperty('_id')
    expect(response.body.user.name).toBe('Giang')
    expect(response.body.user.email).toBe('B@gmail.com')
    expect(response.body).toHaveProperty('token')
    
    // Verify user was actually created in database
    const createdUser = await User.findOne({ email: 'B@gmail.com' })
    expect(createdUser).toBeTruthy()
    expect(createdUser.name).toBe('Giang')
  })
})


