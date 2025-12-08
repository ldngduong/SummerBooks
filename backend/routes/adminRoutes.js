const express = require('express')
const User = require('../models/User')
const {protect, admin} = require ('../middleware/authMiddleware')
const Product = require('../models/Product')
const Order = require('../models/Order')

const router = express.Router()
// admin user
    // get /api/admin/users - get all user - admin only
    router.get('/users', protect, admin, async (req, res) => {
        try {
            const { search } = req.query;
            let query = {};
            
            if (search) {
                query.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }
            
            const users = await User.find(query).select('-password')
            return res.json(users)
        } catch (error) {
            res.status(500).json({message: "Lỗi server"})
        }
    })

    // post /api/admin/users - add new user - admin only
    router.post('/users', protect, admin, async (req, res) => {
        const {email, name, password, role} = req.body
        try {
            let user = await User.findOne({email});
            if(user){
                return res.status(400).json({message: "Người dùng đã tồn tại"})
            }
            user = new User({email, name, password, role})
            await user.save()
            return res.status(201).json(user)
        } catch (error) {
            return res.status(500).json({message: "Lỗi server"})
        }
    })


    // put /api/admin/users/:id - edit user - admin only
    router.put('/users/:id', protect, admin, async (req, res) => {
        const { email, password, role } = req.body;
        try {
            let user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "Không tìm thấy người dùng" });
            }

            if (email) {
                let checkUser = await User.findOne({email})
                if(checkUser){
                    return res.status(400).json({message: "Người dùng đã tồn tại"})
                }
                user.email = email;
            }
            if (password) {
                if (password.length < 6) {
                    return res.status(400).json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });
                }
                user.password = password;
            }
            if (role) {
                user.role = role;
            }
            await user.save();
            return res.status(200).json({ message: "Cập nhật thành công", user });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server" });
        }
    });

    // delete /api/admin/users/:id - delete user - admin only
    router.delete('/users/:id', protect, admin, async (req, res) => {
        try {
            const user = await User.findById(req.params.id)
            if(user){
                await user.deleteOne()
                res.status(200).json(user)
            } else {
                res.status(404).json("Không tìm thấy người dùng")
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({message: "Lỗi server"})
        }
    })

// admin orders
    // get /api/admin/orders - get all product - admin only
    router.get('/orders', protect, admin, async (req, res) => {
        try {
            const {status, limit} = req.query
            let query = {}
            if (status){
                query.status = status
            }
            const limitNumber = limit ? parseInt(limit, 10) : null;
            const orders = limitNumber 
                ? await Order.find(query).populate('user', 'name email').limit(limitNumber) 
                : await Order.find(query).populate('user', 'name email');
            return res.json(orders)
        } catch (error) {
            res.status(500).json({message: "Lỗi server"})
        }
    })
    
    // put /api/admin/orders/:id - edit order status - admin only
    router.put('/orders/:id', protect, admin, async (req, res) => {
        const { status } = req.body;
        try {
            let order = await Order.findById(req.params.id);
            if (!order) {
                return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
            }
    
            if (status) {
                if(order.status === 'Đã giao' || order.status === 'Đã hủy'){
                    return res.status(500).json({ message: "Lỗi server" });
                }
                order.status = status;
                order.isDelivered = status === 'Đã giao' ? true : false
                order.deliveredAt = status === 'Đã giao' ? Date.now() : null
            }
            
            await order.save();
            return res.status(200).json({ message: "Cập nhật thành công", order });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi server" });
        }
    });
module.exports = router