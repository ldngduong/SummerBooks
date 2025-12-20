// Set test environment before requiring any modules
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt'

const request = require('supertest')
const mongoose = require('mongoose')
require('dotenv').config()
const User = require('../models/User')

const app = require('../server')

describe('Kiểm thử hộp đen - Chức năng đăng ký tài khoản', () => {
    beforeEach(async () => {
        // Clear all users from test database
        await User.deleteMany({})
    })

    afterEach(async () => {
        // Clean up after each test
        await User.deleteMany({})
    })

    afterAll(async () => {
        // Close database connection after all tests
        await mongoose.connection.close()
    })

    describe('Bảng quyết định - 12 test cases', () => {
        // Test case 1: Họ và tên để trống
        test('TC1: Họ và tên để trống - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: '',
                    email: 'B@gmail.com',
                    password: 'Giang12@'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Vui lòng nhập đầy đủ thông tin')
        })

        // Test case 2: Họ và tên < 2 ký tự
        test('TC2: Họ và tên = "G" (< 2 ký tự) - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'G',
                    email: 'B@gmail.com',
                    password: 'Giang12@'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Họ và tên không đúng định dạng (chỉ chữ, tối thiểu 2 ký tự).')
        })

        // Test case 3: Họ và tên chứa chữ số
        test('TC3: Họ và tên = "Giang141" (chứa chữ số) - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang141',
                    email: 'B@gmail.com',
                    password: 'Giang12@'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Họ và tên không đúng định dạng (chỉ chữ, tối thiểu 2 ký tự).')
        })

        // Test case 4: Họ và tên chứa ký tự đặc biệt
        test('TC4: Họ và tên = "Giang141@" (chứa ký tự đặc biệt) - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang141@',
                    email: 'B@gmail.com',
                    password: 'Giang12@'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Họ và tên không đúng định dạng (chỉ chữ, tối thiểu 2 ký tự).')
        })

        // Test case 5: Email để trống
        test('TC5: Email để trống - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang',
                    email: '',
                    password: 'Giang12@'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Vui lòng nhập đầy đủ thông tin')
        })

        // Test case 6: Email sai định dạng
        test('TC6: Email = "B@gmail" (sai định dạng) - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang',
                    email: 'B@gmail',
                    password: 'Giang12@'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Email không đúng định dạng.')
        })

        // Test case 7: Email đã tồn tại trong hệ thống
        test('TC7: Email = "B@gmail.com" (đã tồn tại trên hệ thống) - Thất bại', async () => {
            // Tạo user với email này trước
            const existingUser = new User({
                name: 'Existing User',
                email: 'B@gmail.com',
                password: 'Existing12@'
            })
            await existingUser.save()

            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang',
                    email: 'B@gmail.com',
                    password: 'Giang12@'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Email đã tồn tại')
        })

        // Test case 8: Mật khẩu để trống
        test('TC8: Mật khẩu để trống - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang',
                    email: 'B@gmail.com',
                    password: ''
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Vui lòng nhập đầy đủ thông tin')
        })

        // Test case 9: Mật khẩu < 8 ký tự
        test('TC9: Mật khẩu = "Giang12" (< 8 ký tự) - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang',
                    email: 'B@gmail.com',
                    password: 'Giang12'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Mật khẩu không hợp lệ. tối thiểu 8 ký tự trong đó tối thiếu 1 ký tự đặc biệt và 1 ký tự in hoa.')
        })

        // Test case 10: Mật khẩu không có ký tự đặc biệt
        test('TC10: Mật khẩu = "GiangTra" (không có ký tự đặc biệt) - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang',
                    email: 'B@gmail.com',
                    password: 'GiangTra'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Mật khẩu không hợp lệ. tối thiểu 8 ký tự trong đó tối thiếu 1 ký tự đặc biệt và 1 ký tự in hoa.')
        })

        // Test case 11: Mật khẩu không có chữ in hoa và ký tự đặc biệt
        test('TC11: Mật khẩu = "12345678" (không có chữ in hoa và ký tự đặc biệt) - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang',
                    email: 'B@gmail.com',
                    password: '12345678'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Mật khẩu không hợp lệ. tối thiểu 8 ký tự trong đó tối thiếu 1 ký tự đặc biệt và 1 ký tự in hoa.')
        })

        // Test case 12: Mật khẩu không có chữ in hoa
        test('TC12: Mật khẩu = "giang12@" (không có chữ in hoa) - Thất bại', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang',
                    email: 'B@gmail.com',
                    password: 'giang12@'
                })

            expect(response.status).toBe(400)
            expect(response.body.message).toBe('Mật khẩu không hợp lệ. tối thiểu 8 ký tự trong đó tối thiếu 1 ký tự đặc biệt và 1 ký tự in hoa.')
        })

        // Test case 13: Tất cả dữ liệu hợp lệ - Thành công
        test('TC13: Tất cả dữ liệu hợp lệ - Thành công', async () => {
            const response = await request(app)
                .post('/api/users/register')
                .send({
                    name: 'Giang',
                    email: 'B@gmail.com',
                    password: 'Giang12@'
                })

            expect(response.status).toBe(201)
            expect(response.body).toHaveProperty('user')
            expect(response.body).toHaveProperty('token')
            expect(response.body.user).toHaveProperty('_id')
            expect(response.body.user).toHaveProperty('name', 'Giang')
            expect(response.body.user).toHaveProperty('email', 'B@gmail.com')
            expect(response.body.user).toHaveProperty('role', 'Khách hàng')

            // Verify user was saved to database
            const savedUser = await User.findOne({ email: 'B@gmail.com' })
            expect(savedUser).toBeTruthy()
            expect(savedUser.name).toBe('Giang')
        })
    })
})

