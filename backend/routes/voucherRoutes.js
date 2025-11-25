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
      limit,
      status,
    } = req.body;

    // Validate dates
    if (new Date(start_date) >= new Date(end_date)) {
      return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
    }

    const voucher = new Voucher({
      code,
      value,
      start_date,
      end_date,
      limit,
      status: status || 'active',
      user: req.user._id,
    });

    const createdVoucher = await voucher.save();
    res.status(201).json(createdVoucher);
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
      limit,
      status,
    } = req.body;
    
    const voucher = await Voucher.findById(req.params.id);

    if (voucher) {
      // Validate dates if both are provided
      if (start_date && end_date && new Date(start_date) >= new Date(end_date)) {
        return res.status(400).json({ message: "Ngày kết thúc phải sau ngày bắt đầu" });
      }

      voucher.code = code || voucher.code;
      voucher.value = value !== undefined ? value : voucher.value;
      voucher.start_date = start_date || voucher.start_date;
      voucher.end_date = end_date || voucher.end_date;
      voucher.limit = limit !== undefined ? limit : voucher.limit;
      voucher.status = status || voucher.status;

      const updatedVoucher = await voucher.save();
      res.status(200).json(updatedVoucher);
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

    const vouchers = await Voucher.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(vouchers);
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
      // Auto update status to expired
      voucher.status = 'expired';
      await voucher.save();
      return res.status(400).json({ message: "Mã voucher đã hết hạn" });
    }

    res.json({
      valid: true,
      voucher: {
        id: voucher._id,
        code: voucher.code,
        value: voucher.value,
        limit: voucher.limit,
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

module.exports = router;

