const express = require("express");
const UserVoucher = require("../models/UserVoucher");
const Voucher = require("../models/Voucher");
const User = require("../models/User");
const Order = require("../models/Order");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// post /api/user-vouchers/gift - gift voucher to users - private/admin
router.post("/gift", protect, admin, async (req, res) => {
  try {
    const {
      voucher_id,
      gift_type, // 'individual', 'new_users', 'order_count'
      user_ids, // array of user IDs for individual
      order_count, // number for order_count type
    } = req.body;

    // Validate voucher
    const voucher = await Voucher.findById(voucher_id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher không tồn tại" });
    }

    if (voucher.status !== 'active') {
      return res.status(400).json({ message: "Voucher không ở trạng thái active" });
    }

    let usersToGift = [];

    if (gift_type === 'individual') {
      // Gift to specific users
      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({ message: "Vui lòng chọn ít nhất một người dùng" });
      }
      usersToGift = await User.find({ _id: { $in: user_ids } });
    } else if (gift_type === 'new_users') {
      // Gift to users created in last 15 days
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
      usersToGift = await User.find({
        createdAt: { $gte: fifteenDaysAgo }
      });
    } else if (gift_type === 'order_count') {
      // Gift to users with specific order count
      if (!order_count || order_count < 1) {
        return res.status(400).json({ message: "Vui lòng nhập số đơn hàng hợp lệ" });
      }
      
      // Get users with order count >= order_count
      const usersWithOrders = await Order.aggregate([
        {
          $group: {
            _id: "$user",
            orderCount: { $sum: 1 }
          }
        },
        {
          $match: {
            orderCount: { $gte: order_count }
          }
        }
      ]);

      const userIds = usersWithOrders.map(item => item._id);
      usersToGift = await User.find({ _id: { $in: userIds } });
    } else {
      return res.status(400).json({ message: "Loại tặng voucher không hợp lệ" });
    }

    if (usersToGift.length === 0) {
      return res.status(400).json({ message: "Không tìm thấy người dùng phù hợp" });
    }

    // Create user vouchers
    const userVouchers = usersToGift.map(user => ({
      user: user._id,
      voucher: voucher_id,
      gifted_by: req.user._id,
      gift_type: gift_type,
      order_count: gift_type === 'order_count' ? order_count : null,
    }));

    // Check if user already has this voucher
    const existingVouchers = await UserVoucher.find({
      voucher: voucher_id,
      user: { $in: usersToGift.map(u => u._id) },
      used: false
    });

    const existingUserIds = new Set(existingVouchers.map(uv => uv.user.toString()));
    const newUserVouchers = userVouchers.filter(
      uv => !existingUserIds.has(uv.user.toString())
    );

    if (newUserVouchers.length === 0) {
      return res.status(400).json({ message: "Tất cả người dùng đã có voucher này" });
    }

    const created = await UserVoucher.insertMany(newUserVouchers);

    res.status(201).json({
      message: `Đã tặng voucher cho ${created.length} người dùng`,
      count: created.length,
      userVouchers: created
    });
  } catch (error) {
    console.error("Gift voucher error:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

// get /api/user-vouchers - get all user vouchers - private/admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const userVouchers = await UserVoucher.find()
      .populate('user', 'name email')
      .populate('voucher', 'code value')
      .populate('gifted_by', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(userVouchers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// get /api/user-vouchers/my-vouchers - get current user's vouchers - private
router.get("/my-vouchers", protect, async (req, res) => {
  try {
    const userVouchers = await UserVoucher.find({ user: req.user._id })
      .populate('voucher')
      .sort({ createdAt: -1 });
    
    // Phân loại voucher: còn hạn và hết hạn
    const now = new Date();
    const activeVouchers = [];
    const expiredVouchers = [];

    userVouchers.forEach(userVoucher => {
      const voucher = userVoucher.voucher;
      if (voucher && new Date(voucher.end_date) >= now && !userVoucher.used && voucher.remain > 0) {
        activeVouchers.push({
          ...userVoucher.toObject(),
          isExpired: false
        });
      } else {
        expiredVouchers.push({
          ...userVoucher.toObject(),
          isExpired: true
        });
      }
    });
    
    res.json({
      active: activeVouchers,
      expired: expiredVouchers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// get /api/user-vouchers/usable - get usable vouchers for checkout - private
router.get("/usable", protect, async (req, res) => {
  try {
    const { totalPrice } = req.query;
    const orderTotal = parseFloat(totalPrice) || 0;

    if (orderTotal <= 0) {
      return res.json({ vouchers: [] });
    }

    const now = new Date();
    const userVouchers = await UserVoucher.find({ 
      user: req.user._id,
      used: false
    })
      .populate('voucher')
      .sort({ createdAt: -1 });

    // Trả về tất cả voucher với thông tin có thể sử dụng hay không
    // Cho phép hiển thị cả voucher chưa đến hạn, chưa đủ điều kiện
    // Validation sẽ được thực hiện khi đặt hàng
    const allVouchers = [];

    for (const userVoucher of userVouchers) {
      const voucher = userVoucher.voucher;
      
      if (!voucher) continue;

      // Chỉ kiểm tra voucher active (không filter các điều kiện khác)
      if (voucher.status !== 'active') continue;

      allVouchers.push({
        _id: userVoucher._id,
        voucher: {
          _id: voucher._id,
          code: voucher.code,
          value: voucher.value,
          max_discount_amount: voucher.max_discount_amount,
          min_order_value: voucher.min_order_value,
        }
      });
    }
    
    res.json({ vouchers: allVouchers });
  } catch (error) {
    console.error('Error in /api/user-vouchers/usable:', error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;

