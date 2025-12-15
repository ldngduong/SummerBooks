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

    // E1–E3: Mã giảm giá
    if (!code?.toString().trim())
      return res
        .status(400)
        .json({ message: "Mã giảm giá không được để trống", field: "code" });
    if (!/^[A-Z0-9]+$/.test(code.toString().trim().toUpperCase()))
      return res.status(400).json({
        message: "Mã giảm giá không được chứa ký tự đặc biệt",
        field: "code",
      });
    if (code.toString().trim().length > 8)
      return res.status(400).json({
        message: "Mã giảm giá không được vượt quá 8 ký tự",
        field: "code",
      });

    // Kiểm tra mã voucher đã tồn tại
    const existingVoucher = await Voucher.findOne({
      code: code.toString().trim().toUpperCase(),
    });
    if (existingVoucher)
      return res.status(400).json({
        message: "Mã voucher đã tồn tại",
        field: "code",
      });

    // E4–E7: Giá trị giảm
    if (value === undefined || value === null || value.toString().trim() === "")
      return res.status(400).json({
        message: "Giá trị giảm (%) không được để trống",
        field: "value",
      });
    if (!/^\d+$/.test(value.toString().trim()))
      return res.status(400).json({
        message:
          "Gía trị giảm giá theo % không chứa ký tự chữ và ký tự đặc biệt",
        field: "value",
      });
    if (
      parseFloat(value.toString().trim()) < 1 ||
      parseFloat(value.toString().trim()) > 100
    )
      return res.status(400).json({
        message: "Giá trị giảm (%) phải nằm trong khoảng từ 1 đến 100",
        field: "value",
      });

    // E8–E10: Số tiền giảm tối đa
    if (max_discount_amount && max_discount_amount.toString().trim() === "")
      return res.status(400).json({
        message: "Số tiền giảm tối đa không được để trống",
        field: "max_discount_amount",
      });
    if (
      max_discount_amount &&
      !/^\d+$/.test(max_discount_amount.toString().trim())
    )
      return res.status(400).json({
        message: "Số tiền giảm tối đa không chứa ký tự chữ và ký tự đặc biệt",
        field: "max_discount_amount",
      });

    // E11–E13: Giá trị đơn hàng tối thiểu
    if (!min_order_value?.toString().trim())
      return res.status(400).json({
        message: "Giá trị đơn hàng tối thiểu không được để trống",
        field: "min_order_value",
      });
    if (!/^\d+$/.test(min_order_value.toString().trim()))
      return res.status(400).json({
        message:
          "Giá trị đơn hàng tối thiểu không chứa ký tự chữ và ký tự đặc biệt",
        field: "min_order_value",
      });

    // E14–E17: Ngày bắt đầu & kết thúc
    if (!start_date?.toString().trim())
      return res.status(400).json({
        message: "Ngày bắt đầu không được để trống",
        field: "start_date",
      });
    if (!end_date?.toString().trim())
      return res.status(400).json({
        message: "Ngày kết thúc không được để trống",
        field: "end_date",
      });
    if (new Date(start_date) >= new Date(end_date))
      return res.status(400).json({
        message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
        field: "start_date",
      });

    // E18–E22: Giới hạn sử dụng
    if (!remain?.toString().trim())
      return res.status(400).json({
        message: "Giới hạn sử dụng không được để trống",
        field: "remain",
      });
    if (!/^\d+$/.test(remain.toString().trim()))
      return res.status(400).json({
        message: remain.toString().match(/[a-zA-Z]/)
          ? "Giới hạn sử dụng phải là số nguyên, không được chứa chữ cái"
          : "Giới hạn sử dụng không được chứa ký tự đặc biệt",
        field: "remain",
      });
    if (!Number.isInteger(parseFloat(remain.toString().trim())))
      return res
        .status(400)
        .json({ message: "Nhập đúng định dạng", field: "remain" });
    if (
      parseFloat(remain.toString().trim()) < 1 ||
      parseFloat(remain.toString().trim()) > 100
    )
      return res.status(400).json({
        message: "Giới hạn sử dụng phải nằm trong khoảng từ 1 đến 100",
        field: "remain",
      });

    // E23: Trạng thái
    if (!status?.toString().trim())
      return res.status(400).json({
        message: "Vui lòng chọn trạng thái cho mã giảm giá",
        field: "status",
      });

    const createdVoucher = await new Voucher({
      code: code.toString().trim().toUpperCase(),
      value: parseFloat(value.toString().trim()),
      start_date,
      end_date,
      remain: parseInt(remain),
      max_discount_amount: max_discount_amount
        ? parseFloat(max_discount_amount)
        : null,
      min_order_value: parseFloat(min_order_value),
      status,
      user: req.user._id,
    }).save();

    const all = await Voucher.find({})
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    const now = new Date();
    res.status(201).json({
      voucher: createdVoucher,
      active: all.filter((v) => new Date(v.end_date) >= now && v.remain > 0),
      expired: all.filter((v) => new Date(v.end_date) < now),
      outOfStock: all.filter(
        (v) => new Date(v.end_date) >= now && v.remain <= 0
      ),
    });
  } catch (error) {
    if (error.name === "ValidationError")
      return res
        .status(400)
        .json({ errors: Object.values(error.errors).map((e) => e.message) });
    if (error.code === 11000)
      return res.status(400).json({ message: "Mã voucher đã tồn tại" });
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
      // E1: Mã giảm giá để trống (nếu có)
      if (code !== undefined && (!code || code.toString().trim() === "")) {
        return res.status(400).json({
          message: "Mã giảm giá không được để trống",
          field: "code",
        });
      }

      if (code !== undefined && code) {
        // E2: Mã giảm giá chứa ký tự đặc biệt
        const codeStr = code.toString().trim();
        if (!/^[A-Z0-9]+$/.test(codeStr.toUpperCase())) {
          return res.status(400).json({
            message: "Mã giảm giá không được chứa ký tự đặc biệt",
            field: "code",
          });
        }

        // E3: Mã giảm giá vượt quá 8 ký tự
        if (codeStr.length > 8) {
          return res.status(400).json({
            message: "Mã giảm giá không được vượt quá 8 ký tự",
            field: "code",
          });
        }

        // Kiểm tra mã voucher đã tồn tại (trừ voucher hiện tại)
        const existingVoucher = await Voucher.findOne({
          code: codeStr.toUpperCase(),
          _id: { $ne: req.params.id },
        });
        if (existingVoucher) {
          return res.status(400).json({
            message: "Mã voucher đã tồn tại",
            field: "code",
          });
        }
      }

      // E4: Giá trị giảm (%) để trống (nếu có)
      if (
        value !== undefined &&
        (value === null || value.toString().trim() === "")
      ) {
        return res.status(400).json({
          message: "Giá trị giảm (%) không được để trống",
          field: "value",
        });
      }

      if (value !== undefined && value !== null) {
        // E5, E6: Giá trị giảm (%) chứa ký tự chữ hoặc ký tự đặc biệt
        if (!/^\d+$/.test(value.toString().trim())) {
          return res.status(400).json({
            message:
              "Gía trị giảm giá theo % không chứa ký tự chữ và ký tự đặc biệt",
            field: "value",
          });
        }

        // E7: Giá trị giảm (%) ngoài khoảng 1-100
        const valueNum = parseFloat(value.toString().trim());
        if (valueNum < 1 || valueNum > 100) {
          return res.status(400).json({
            message: "Giá trị giảm (%) phải nằm trong khoảng từ 1 đến 100",
            field: "value",
          });
        }
      }

      // E8: Số tiền giảm tối đa để trống (nếu có)
      if (
        max_discount_amount !== undefined &&
        max_discount_amount !== null &&
        max_discount_amount !== ""
      ) {
        if (max_discount_amount.toString().trim() === "") {
          return res.status(400).json({
            message: "Số tiền giảm tối đa không được để trống",
            field: "max_discount_amount",
          });
        }
      }

      // E9, E10: Số tiền giảm tối đa chứa ký tự chữ hoặc ký tự đặc biệt
      if (
        max_discount_amount !== undefined &&
        max_discount_amount !== null &&
        max_discount_amount !== ""
      ) {
        const maxDiscountStr = max_discount_amount.toString().trim();
        if (maxDiscountStr !== "" && !/^\d+$/.test(maxDiscountStr)) {
          return res.status(400).json({
            message:
              "Số tiền giảm tối đa không chứa ký tự chữ và ký tự đặc biệt",
            field: "max_discount_amount",
          });
        }
      }

      // E11: Giá trị đơn hàng tối thiểu để trống (nếu có)
      if (
        min_order_value !== undefined &&
        (min_order_value === null || min_order_value.toString().trim() === "")
      ) {
        return res.status(400).json({
          message: "Giá trị đơn hàng tối thiểu không được để trống",
          field: "min_order_value",
        });
      }

      if (min_order_value !== undefined && min_order_value !== null) {
        // E12, E13: Giá trị đơn hàng tối thiểu chứa ký tự chữ hoặc ký tự đặc biệt
        const minOrderStr = min_order_value.toString().trim();
        if (minOrderStr === "") {
          return res.status(400).json({
            message: "Giá trị đơn hàng tối thiểu không được để trống",
            field: "min_order_value",
          });
        }

        if (!/^\d+$/.test(minOrderStr)) {
          return res.status(400).json({
            message:
              "Giá trị đơn hàng tối thiểu không chứa ký tự chữ và ký tự đặc biệt",
            field: "min_order_value",
          });
        }
      }

      // E14: Ngày bắt đầu để trống (nếu có)
      if (
        start_date !== undefined &&
        (!start_date || start_date.toString().trim() === "")
      ) {
        return res.status(400).json({
          message: "Ngày bắt đầu không được để trống",
          field: "start_date",
        });
      }

      // E16: Ngày kết thúc để trống (nếu có)
      if (
        end_date !== undefined &&
        (!end_date || end_date.toString().trim() === "")
      ) {
        return res.status(400).json({
          message: "Ngày kết thúc không được để trống",
          field: "end_date",
        });
      }

      // E15, E17: Ngày bắt đầu >= ngày kết thúc
      const finalStartDate = start_date || voucher.start_date;
      const finalEndDate = end_date || voucher.end_date;
      if (new Date(finalStartDate) >= new Date(finalEndDate)) {
        return res.status(400).json({
          message: "Ngày bắt đầu phải nhỏ hơn ngày kết thúc",
          field: "start_date",
        });
      }

      // E18: Giới hạn sử dụng để trống (nếu có)
      if (
        remain !== undefined &&
        (remain === null || remain.toString().trim() === "")
      ) {
        return res.status(400).json({
          message: "Giới hạn sử dụng không được để trống",
          field: "remain",
        });
      }

      if (remain !== undefined && remain !== null) {
        // E19, E20: Giới hạn sử dụng chứa ký tự chữ hoặc ký tự đặc biệt
        const remainStr = remain.toString().trim();
        if (!/^\d+$/.test(remainStr)) {
          return res.status(400).json({
            message: remainStr.match(/[a-zA-Z]/)
              ? "Giới hạn sử dụng phải là số nguyên, không được chứa chữ cái"
              : "Giới hạn sử dụng không được chứa ký tự đặc biệt",
            field: "remain",
          });
        }

        // E22: Giới hạn sử dụng là số thực
        const remainNum = parseFloat(remainStr);
        if (!Number.isInteger(remainNum)) {
          return res.status(400).json({
            message: "Nhập đúng định dạng",
            field: "remain",
          });
        }

        // E21: Giới hạn sử dụng ngoài khoảng 1-100
        if (remainNum < 1 || remainNum > 100) {
          return res.status(400).json({
            message: "Giới hạn sử dụng phải nằm trong khoảng từ 1 đến 100",
            field: "remain",
          });
        }
      }

      // E23: Trạng thái để trống (nếu có)
      if (
        status !== undefined &&
        (!status || status.toString().trim() === "")
      ) {
        return res.status(400).json({
          message: "Vui lòng chọn trạng thái cho mã giảm giá",
          field: "status",
        });
      }

      if (code !== undefined)
        voucher.code = code.toString().trim().toUpperCase();
      if (value !== undefined) voucher.value = parseFloat(value);
      if (start_date !== undefined) voucher.start_date = start_date;
      if (end_date !== undefined) voucher.end_date = end_date;
      if (remain !== undefined) voucher.remain = parseFloat(remain);
      if (max_discount_amount !== undefined) {
        voucher.max_discount_amount =
          max_discount_amount && max_discount_amount.toString().trim() !== ""
            ? parseFloat(max_discount_amount)
            : null;
      }
      if (min_order_value !== undefined)
        voucher.min_order_value = parseFloat(min_order_value) || 0;
      if (status !== undefined) voucher.status = status;

      const updatedVoucher = await voucher.save();

      // Get all vouchers and return 3 arrays
      const allVouchers = await Voucher.find({})
        .populate("user", "name email")
        .sort({ createdAt: -1 });

      const now = new Date();
      const expiredVouchers = allVouchers.filter(
        (v) => new Date(v.end_date) < now
      );
      const notExpiredVouchers = allVouchers.filter(
        (v) => new Date(v.end_date) >= now
      );
      const activeVouchers = notExpiredVouchers.filter((v) => v.remain > 0);
      const outOfStockVouchers = notExpiredVouchers.filter(
        (v) => v.remain <= 0
      );

      res.status(200).json({
        voucher: updatedVoucher,
        active: activeVouchers,
        expired: expiredVouchers,
        outOfStock: outOfStockVouchers,
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

    if (status && status.toLowerCase() !== "all") {
      query.status = status;
    }

    if (search) {
      query.$or = [{ code: { $regex: search, $options: "i" } }];
    }

    const allVouchers = await Voucher.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    // Phân loại voucher: còn hạn, hết hạn, hết lượt sử dụng
    const now = new Date();
    const expiredVouchers = allVouchers.filter(
      (v) => new Date(v.end_date) < now
    );
    const notExpiredVouchers = allVouchers.filter(
      (v) => new Date(v.end_date) >= now
    );
    const activeVouchers = notExpiredVouchers.filter((v) => v.remain > 0);
    const outOfStockVouchers = notExpiredVouchers.filter((v) => v.remain <= 0);

    res.json({
      active: activeVouchers,
      expired: expiredVouchers,
      outOfStock: outOfStockVouchers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// get /api/vouchers/:id - get voucher by id - private/admin
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id).populate(
      "user",
      "name email"
    );

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
      status: "active",
    });

    if (!voucher) {
      return res
        .status(404)
        .json({ message: "Mã voucher không hợp lệ hoặc đã hết hạn" });
    }

    const now = new Date();
    if (now < new Date(voucher.start_date)) {
      return res
        .status(400)
        .json({ message: "Mã voucher chưa đến thời gian áp dụng" });
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
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
});

module.exports = router;
