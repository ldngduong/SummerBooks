const jwt = require('jsonwebtoken')
const User = require('../models/User')

// Middleware bảo vệ các routes
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token = req.headers.authorization.split(' ')[1]
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            req.user = await User.findById(decoded.user.id).select('-password') 
            next()
        } catch (error) {
            console.error('Token không hợp lệ', error)
            res.status(401).json({message: 'Bạn không có quyền truy cập'})
        }
    }
    else{
        res.status(401).json({message: 'Bạn không có quyền truy cập'})
    }
}

// Middleware yêu cầu admin
const admin = (req, res, next) => {
    if(req.user && req.user.role === 'Quản trị viên' || req.user && req.user.role === 'Nhân viên nhập liệu'  || req.user && req.user.role === 'Nhân viên bán hàng' ){
        next()
    } else{
        res.status(403).json({message: 'Bạn không có quyền admin'})
    }
}

const isUserResource = (req, res, next) => {
    
}

module.exports = {protect, admin};