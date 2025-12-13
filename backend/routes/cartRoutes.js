const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");
const Order = require("../models/Order");
const UserVoucher = require("../models/UserVoucher");
const Voucher = require("../models/Voucher");

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
      return res.status(404).json({ message: "không thấy cart" });
    }

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId
    );
    
    if (productIndex > -1) {
      // Nếu quantity = 0 hoặc sản phẩm không tồn tại, xóa khỏi giỏ hàng
      if (quantity === 0) {
        cart.products.splice(productIndex, 1);
      } else {
        // Kiểm tra sản phẩm có tồn tại không (trừ khi đang xóa)
        const product = await Product.findById(productId);
        if (!product) {
          // Sản phẩm đã bị xóa, tự động xóa khỏi giỏ hàng
          cart.products.splice(productIndex, 1);
        } else {
          // Kiểm tra số lượng có đủ không
          if (product.countInStock < quantity) {
            return res.status(400).json({ 
              message: `Sản phẩm ${product.name} chỉ còn ${product.countInStock} sản phẩm trong kho` 
            });
          }
          cart.products[productIndex].quantity = quantity;
        }
      }
      
      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      cart.author = author;
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
      // Kiểm tra và loại bỏ sản phẩm không tồn tại
      const validProducts = [];
      for (const item of cart.products) {
        const product = await Product.findById(item.productId);
        if (product) {
          validProducts.push(item);
        }
      }
      
      // Nếu có sản phẩm bị xóa, cập nhật lại giỏ hàng
      if (validProducts.length !== cart.products.length) {
        cart.products = validProducts;
        cart.totalPrice = cart.products.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        await cart.save();
      }
      
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
    const { user, orderItems, address, totalPrice, name, phone, userVoucherId } = req.body;

    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({ message: "Danh sách sản phẩm không hợp lệ!" });
    }

    // Lọc và kiểm tra sản phẩm hợp lệ
    const validOrderItems = [];
    const invalidProducts = [];
    
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        invalidProducts.push(item.productId);
        continue;
      }
      if (product.countInStock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm ${product.name} không đủ hàng. Chỉ còn ${product.countInStock} sản phẩm trong kho` });
      }
      validOrderItems.push(item);
    }

    // Nếu có sản phẩm không tồn tại, cập nhật giỏ hàng và trả về lỗi
    if (invalidProducts.length > 0) {
      // Tự động xóa sản phẩm không tồn tại khỏi giỏ hàng
      const cart = await getCart(user);
      if (cart) {
        cart.products = cart.products.filter(
          (item) => !invalidProducts.some(id => id.toString() === item.productId.toString())
        );
        cart.totalPrice = cart.products.reduce(
          (acc, item) => acc + item.price * item.quantity,
          0
        );
        await cart.save();
      }
      
      return res.status(400).json({ 
        message: `Một số sản phẩm không còn tồn tại đã được xóa khỏi giỏ hàng. Vui lòng kiểm tra lại giỏ hàng.`,
        removedProducts: invalidProducts
      });
    }

    // Nếu không còn sản phẩm hợp lệ nào
    if (validOrderItems.length === 0) {
      return res.status(400).json({ message: "Không có sản phẩm hợp lệ để đặt hàng!" });
    }

    // Tính toán giá gốc từ danh sách sản phẩm hợp lệ
    const originalPrice = validOrderItems.reduce(
      (acc, item) => acc + (item.price * item.quantity),
      0
    );
    let finalPrice = originalPrice;
    let discountAmount = 0;
    let voucherId = null;
    let userVoucher = null;

    // Xử lý voucher nếu có
    if (userVoucherId) {
      userVoucher = await UserVoucher.findById(userVoucherId)
        .populate('voucher');
      
      if (!userVoucher || userVoucher.user.toString() !== user.toString()) {
        return res.status(400).json({ message: "Voucher không hợp lệ" });
      }

      if (userVoucher.used) {
        return res.status(400).json({ message: "Voucher đã được sử dụng" });
      }

      const voucher = userVoucher.voucher;
      if (!voucher || voucher.status !== 'active') {
        return res.status(400).json({ message: "Voucher không hợp lệ hoặc đã hết hạn" });
      }

      // Kiểm tra ngày hết hạn
      const now = new Date();
      if (new Date(voucher.end_date) < now || new Date(voucher.start_date) > now) {
        return res.status(400).json({ message: "Voucher đã hết hạn hoặc chưa đến thời gian áp dụng" });
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (originalPrice < (voucher.min_order_value || 0)) {
        return res.status(400).json({ message: `Đơn hàng phải có giá trị tối thiểu ${voucher.min_order_value} VNĐ` });
      }

      // Kiểm tra lượt sử dụng còn lại
      if (voucher.remain <= 0) {
        return res.status(400).json({ message: "Voucher đã hết lượt sử dụng" });
      }

      // Tính toán giảm giá
      const discountPercent = voucher.value / 100;
      discountAmount = originalPrice * discountPercent;

      // Áp dụng giới hạn giảm tối đa nếu có
      if (voucher.max_discount_amount && discountAmount > voucher.max_discount_amount) {
        discountAmount = voucher.max_discount_amount;
      }

      finalPrice = originalPrice - discountAmount;
      if (finalPrice < 0) finalPrice = 0;

      voucherId = voucher._id;
    }

    // Tạo đơn hàng với danh sách sản phẩm hợp lệ
    const newOrder = await Order.create({
      user,
      orderItems: validOrderItems,
      address,
      totalPrice: finalPrice,
      originalPrice: originalPrice,
      discountAmount: discountAmount,
      voucher: voucherId,
      userVoucher: userVoucherId,
      paidAt: new Date().toISOString(),
      isDelivered: false,
      name,
      phone,
    });

    // Đánh dấu voucher đã sử dụng và trừ remain
    if (userVoucher) {
      userVoucher.used = true;
      userVoucher.used_at = new Date();
      await userVoucher.save();
      
      // Trừ số lượt sử dụng còn lại của voucher
      if (voucherId) {
        const voucherToUpdate = await Voucher.findById(voucherId);
        if (voucherToUpdate) {
          voucherToUpdate.remain = Math.max(0, voucherToUpdate.remain - 1);
          await voucherToUpdate.save();
        }
      }
    }

    // Giảm số lượng sản phẩm trong kho
    await Promise.all(validOrderItems.map(async (item) => {
      const product = await Product.findById(item.productId);
      if (product) {
        product.countInStock -= item.quantity;
        await product.save();
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
