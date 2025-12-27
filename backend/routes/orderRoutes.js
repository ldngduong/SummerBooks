const express = require("express");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// get /api/orders/my-orders - get all logged-in user's orders - protect
router.get("/my-orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res.json(orders);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

// get /api/orders/:id - get order details - protect
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.json(order);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Lỗi server" });
  }
});

module.exports = router;
