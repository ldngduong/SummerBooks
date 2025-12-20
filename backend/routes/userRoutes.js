const express = require('express');
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const {protect} = require('../middleware/authMiddleware')
const router = express.Router();

// post /api/users/register - register user - public
router.post('/register', async (req, res) => {
    const {name, email, password} = req.body
    try{
        if(!name || !email || !password){
            return res.status(400).json({message: 'Vui lòng nhập đầy đủ thông tin'})
        }

        const namePattern = /^[\p{L}\s]{2,}$/u
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>_\-]).{8,}$/

        if(!namePattern.test(name.trim())){
            return res.status(400).json({message: 'Họ và tên không đúng định dạng (chỉ chữ, tối thiểu 2 ký tự).'})
        }

        if(!emailPattern.test(email.trim())){
            return res.status(400).json({message: 'Email không đúng định dạng.'})
        }

        if(!passwordPattern.test(password)){
            return res.status(400).json({message: 'Mật khẩu không hợp lệ. tối thiểu 8 ký tự trong đó tối thiếu 1 ký tự đặc biệt và 1 ký tự in hoa.'})
        }

        let user = await User.findOne({email})

        if(user) return res.status(400).json({message: 'Email đã tồn tại'})

        user = new User({name, email, password})
        await user.save();

        // tạo payload, định dạng cần mã hóa và giải mã
        const payload = {user: {id: user._id, role: user.role}}

      jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '40h'}, (err, token) => {
            if(err) throw err;
            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }, token
            })
        })
        
    } catch(err){
        console.log(err)
        if(err.name === 'ValidationError'){
            const passwordError = err.errors?.password?.message
            if(passwordError){
                return res.status(400).json({message: passwordError})
            }
            return res.status(400).json({message: 'Thông tin không hợp lệ.'})
        }
        return res.status(500).json({message: 'Lỗi không xác định'})
    }
})

// post /api/users/login - auth user - public
router.post('/login', async (req, res) => {
    const {email, password} = req.body

    try{
        let user = await User.findOne({email})
        if (!user) return res.status(400).json({message: 'Thông tin không hợp lệ.'})
        const isMatch = await user.matchPassword(password)
        if(!isMatch) return res.status(400).json({message: 'Thông tin không hợp lệ'})
            const payload = {user: {id: user._id, role: user.role}}

        jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '40h'}, (err, token) => {
            if(err) throw err;
            res.status(201).json({
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                }, token
            })
        })
    } catch (error) {
        console.log(error)
        res.status(500).send('Lỗi server')
    }
})

// get /api/users/profile - get user info - protected
router.get('/profile', protect,  async (req, res) => {
    res.json(req.user)

})
module.exports = router