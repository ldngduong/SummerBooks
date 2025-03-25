const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/Order");

const router = express.Router();

// Help function get cart by userid or guestid - public
const getCart = async (userId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  }
  return null;
};

// post /api/cart - add product to cart - public
router.post("/", async (req, res) => {

  const { productId, quantity, author, guestId, userId } = req.body;
  console.log({ productId, quantity, author, guestId, userId })
  try {
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    let cart = await getCart(userId, guestId);
    
    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId
      );
      if (productIndex > -1) {
        cart.products[productIndex].quantity += quantity;
        cart.products[productIndex].author = author;
      } else {
        cart.products.push({
          productId,
          name: product.name,
          image: product.images[0]?.url,
          price: product.price,
          author,
          quantity,
        });
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      await cart.save();
      return res.status(200).json(cart);
    } else {
      const cart = await Cart.create({
        user: userId ? userId : undefined,
        guestId: guestId ? guestId : "guest_" + new Date().getTime(),
        products: [
          {
            productId,
            name: product.name,
            image: product.images[0].url,
            price: product.price,
            author,
            quantity,
          },
        ],
        totalPrice: product.price * quantity,
      });
      return res.status(201).json(cart);
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Server error" });
  }
});

// put /api/cart - edit cart quantity - public
router.put("/", async (req, res) => {
  const { productId, quantity, author, guestId, userId } = req.body;

  try {
    let cart = await getCart(userId, guestId);
    if (!cart) {
      res.status(404).json({ message: "không thấy cart" });
    }

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId
    );
    if (productIndex > -1) {
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1);
      }
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      cart.author=author;
      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm trong giỏ hàng" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "lỗi server" });
  }
});

// get /api/cart - get cart - public
router.get("/", async (req, res) => {
  const { userId } = req.query;
  try {
    const cart = await getCart(userId);
    if (cart) {
      return res.json(cart);
    } else {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
});

router.post('/checkout', protect, async (req, res) => {
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
