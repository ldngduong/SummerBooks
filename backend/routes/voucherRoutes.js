const express = require("express");
const Voucher = require("../models/Voucher");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// post /api/vouchers - create new voucher - private/admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      code,
      value,
      start_date,
      end_date,
      remain,
      max_discount_amount,
      min_order_value,
      status,
    } = req.body;

    // Validate code format: 4 chữ cái + 4 chữ số (ví dụ: ABCD1234)
    if (!code || !/^[A-Z]{4}[0-9]{4}$/.test(code.toUpperCase())) {
      return res.status(400).json({ message: "Mã voucher phải có định dạng: 4 chữ cái và 4 chữ số (VD: ABCD1234)" });
    }

    // Validate dates
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
    }

    const voucher = new Voucher({
      code,
      value,
      start_date,
      end_date,
      remain,
      max_discount_amount: max_discount_amount || null,
      min_order_value: min_order_value || 0,
      status: status || 'active',
      user: req.user._id,
    });

    const createdVoucher = await voucher.save();
    
    // Get all vouchers and return 3 arrays
    const allVouchers = await Voucher.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const now = new Date();
    const activeVouchers = [];
    const expiredVouchers = [];
    const outOfStockVouchers = [];

    allVouchers.forEach(v => {
      if (new Date(v.end_date) >= now) {
        if (v.remain > 0) {
          activeVouchers.push(v);
        } else {
          outOfStockVouchers.push(v);
        }
      } else {
        expiredVouchers.push(v);
      }
    });

    res.status(201).json({
      voucher: createdVoucher,
      active: activeVouchers,
      expired: expiredVouchers,
      outOfStock: outOfStockVouchers
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại" });
    }
    res.status(500).send(error);
  }
});

// put /api/vouchers/:id - update voucher - private/admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const {
      code,
      value,
      start_date,
      end_date,
      remain,
      max_discount_amount,
      min_order_value,
      status,
    } = req.body;
    
    const voucher = await Voucher.findById(req.params.id);

    if (voucher) {
      // Validate code format if provided: 4 chữ cái + 4 chữ số (ví dụ: ABCD1234)
      if (code && !/^[A-Z]{4}[0-9]{4}$/.test(code.toUpperCase())) {
        return res.status(400).json({ message: "Mã voucher phải có định dạng: 4 chữ cái và 4 chữ số (VD: ABCD1234)" });
      }

      // Validate dates if both are provided
      if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
      }

      voucher.code = code || voucher.code;
      voucher.value = value !== undefined ? value : voucher.value;
      voucher.start_date = start_date || voucher.start_date;
      voucher.end_date = end_date || voucher.end_date;
      voucher.remain = remain !== undefined ? remain : voucher.remain;
      if (max_discount_amount !== undefined) voucher.max_discount_amount = max_discount_amount || null;
      if (min_order_value !== undefined) voucher.min_order_value = min_order_value || 0;
      voucher.status = status || voucher.status;

      const updatedVoucher = await voucher.save();
      
      // Get all vouchers and return 3 arrays
      const allVouchers = await Voucher.find({})
        .populate('user', 'name email')
        .sort({ createdAt: -1 });

      const now = new Date();
      const activeVouchers = [];
      const expiredVouchers = [];
      const outOfStockVouchers = [];

      allVouchers.forEach(v => {
        if (new Date(v.end_date) >= now) {
          if (v.remain > 0) {
            activeVouchers.push(v);
          } else {
            outOfStockVouchers.push(v);
          }
        } else {
          expiredVouchers.push(v);
        }
      });

      res.status(200).json({
        voucher: updatedVoucher,
        active: activeVouchers,
        expired: expiredVouchers,
        outOfStock: outOfStockVouchers
      });
    } else {
      res.status(404).json({ message: "Không tìm thấy voucher" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }
    if (error.code === 11000) {
      return res.status(400).json({ message: "Mã voucher đã tồn tại" });
    }
    res.status(500).json({ message: "Lỗi server" });
  }
});

// delete /api/vouchers/:id - delete voucher - private/admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);

    if (voucher) {
      await voucher.deleteOne();
      res.status(200).json({ message: "Xóa voucher thành công", voucher });
    } else {
      res.status(404).json({ message: "Voucher không tồn tại" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// get /api/vouchers - get all vouchers - private/admin
router.get("/", protect, admin, async (req, res) => {
  try {
    const { search, status } = req.query;

    let query = {};

    if (status && status.toLowerCase() !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    const allVouchers = await Voucher.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    // Phân loại voucher: còn hạn, hết hạn, hết lượt sử dụng
    const now = new Date();
    const activeVouchers = [];
    const expiredVouchers = [];
    const outOfStockVouchers = [];

    allVouchers.forEach(voucher => {
      if (new Date(voucher.end_date) >= now) {
        if (voucher.remain > 0) {
          activeVouchers.push(voucher);
        } else {
          outOfStockVouchers.push(voucher);
        }
      } else {
        expiredVouchers.push(voucher);
      }
    });
    
    res.json({
      active: activeVouchers,
      expired: expiredVouchers,
      outOfStock: outOfStockVouchers
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// get /api/vouchers/:id - get voucher by id - private/admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate('user', 'name email');
    
    if (voucher) {
      res.json(voucher);
    } else {
      res.status(404).json({ message: "Voucher không tồn tại" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

// get /api/vouchers/validate/:code - validate voucher code - public
router.get("/validate/:code", async (req, res) => {
  try {
    const voucher = await Voucher.findOne({ 
      code: req.params.code.toUpperCase(),
      status: 'active'
    });

    if (!voucher) {
      return res.status(404).json({ message: "Mã voucher không hợp lệ hoặc đã hết hạn" });
    }

    const now = new Date();
    if (now < new Date(voucher.start_date)) {
      return res.status(400).json({ message: "Mã voucher chưa đến thời gian áp dụng" });
    }

    if (now > new Date(voucher.end_date)) {
      return res.status(400).json({ message: "Mã voucher đã hết hạn" });
    }

    res.json({
      valid: true,
      voucher: {
        id: voucher._id,
        code: voucher.code,
        value: voucher.value,
        remain: voucher.remain,
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

module.exports = router;

