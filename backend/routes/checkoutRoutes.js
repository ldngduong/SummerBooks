const express = require("express");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const { checkout } = require("./productRoutes");

const router = express.Router();
// post /api/checkout/:id/finalize - create order - protect
router.post('/finalize', protect, async (req, res) => {
  try {
      const { user, orderItems, shippingAddress, totalPrice, name, phone } = req.body;

      if (!Array.isArray(orderItems) || orderItems.length === 0) {
          return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ!" });
      }

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
      await Cart.findOneAndDelete({ user});
      return res.status(200).json(newOrder);
  } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});


module.exports = router
