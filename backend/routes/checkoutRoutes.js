const express = require("express");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product"); 
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// post /api/checkout/finalize - create order - protect
router.post('/finalize', protect, async (req, res) => {
  try {
    const { user, orderItems, shippingAddress, totalPrice, name, phone } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ!" });
    }

    // Kiểm tra số lượng sản phẩm trước khi trừ
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm ${item.productId} không tồn tại` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ hàng` });
      }
    }

    // Tạo đơn hàng
    const newOrder = await Order.create({
      user,
      orderItems,
      shippingAddress,
      totalPrice,
      paidAt: new Date().toISOString(),
      isDelivered: false,
      name,
      phone,
    });

    // Giảm số lượng sản phẩm trong kho
    await Promise.all(orderItems.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (product) {
        product.countInStock -= item.quantity;
        await product.save();
      }
      else{
        return res.status(500).json({ message: "Lỗi server", error: error.message });

      }
    }));

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await Cart.findOneAndDelete({ user });

    return res.status(200).json(newOrder);
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;
