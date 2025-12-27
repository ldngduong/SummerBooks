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
  console.log({ productId, quantity, author, guestId, userId });
  try {
    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    let cart = await getCart(userId, guestId);

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) => p.productId.toString() === productId
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
      (p) => p.productId.toString() === productId
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
              message: `Sản phẩm ${product.name} chỉ còn ${product.countInStock} sản phẩm trong kho`,
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

router.post("/checkout", protect, async (req, res) => {
  try {
    const {
      user,
      orderItems,
      address,
      totalPrice,
      name,
      phone,
      userVoucherId,
    } = req.body;

    // Validation: Giỏ hàng trống (E14)
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      return res.status(400).json({
        message: "Giỏ hàng phải có ít nhất 1 sản phẩm để đặt hàng",
        field: "cart",
      });
    }

    // Validation: Họ và tên (E1, E2, E3, E4)
    if (!name || name.trim() === "") {
      return res.status(400).json({
        message: "Họ và tên không được để trống",
        field: "name",
      });
    }

    const nameTrimmed = name.trim();
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(nameTrimmed)) {
      return res.status(400).json({
        message: "Họ và tên không được là ký tự số và ký tự đặc biệt",
        field: "name",
      });
    }

    if (nameTrimmed.length < 5 || nameTrimmed.length > 50) {
      return res.status(400).json({
        message: "Họ và tên không được quá 50 ký tự hoặc nhỏ hơn 5 ký tự",
        field: "name",
      });
    }

    // Validation: Số điện thoại (E5, E6, E7, E8, E9, E10)
    if (!phone || phone.toString().trim() === "") {
      return res.status(400).json({
        message: "Số điện thoại không được để trống",
        field: "phone",
      });
    }

    const phoneStr = phone.toString().trim();
    if (!/^\d+$/.test(phoneStr)) {
      return res.status(400).json({
        message: "Số điện thoại không được chứa ký tự chữ hoặc ký tự đặc biệt",
        field: "phone",
      });
    }

    if (phoneStr.length !== 10) {
      return res.status(400).json({
        message: "Số điện thoại phải gồm đúng 10 chữ số",
        field: "phone",
      });
    }

    if (phoneStr[0] !== "0") {
      return res.status(400).json({
        message: "Số điện thoại phải bắt đầu bằng số 0",
        field: "phone",
      });
    }

    // Validation: Địa chỉ (E11, E12, E13)
    if (!address || address.trim() === "") {
      return res.status(400).json({
        message: "Địa chỉ không được để trống",
        field: "address",
      });
    }

    const addressTrimmed = address.trim();
    if (!/^[a-zA-Z0-9À-ỹ\s,.\/]+$/.test(addressTrimmed)) {
      return res.status(400).json({
        message: "Địa chỉ không được chứa ký tự đặc biệt",
        field: "address",
      });
    }

    if (addressTrimmed.length < 10 || addressTrimmed.length > 100) {
      return res.status(400).json({
        message: "Địa chỉ không được quá 100 ký tự và nhỏ hơn 10 ký tự",
        field: "address",
      });
    }

    // Kiểm tra và lọc sản phẩm hợp lệ
    const productIds = orderItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    const invalidProducts = orderItems
      .filter((item) => !productMap.has(item.productId.toString()))
      .map((item) => item.productId);
    const validOrderItems = orderItems.filter((item) =>
      productMap.has(item.productId.toString())
    );

    // Tính giá và xử lý voucher
    const originalPrice = validOrderItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    let finalPrice = originalPrice;
    let discountAmount = 0;
    let voucherId = null;
    let userVoucher = null;

    if (userVoucherId) {
      userVoucher = await UserVoucher.findById(userVoucherId).populate(
        "voucher"
      );
      const voucher = userVoucher?.voucher;
      const now = new Date();

      if (!voucher || voucher.status !== "active") {
        return res.status(400).json({
          message: "Mã giảm giá không tồn tại. Vui lòng thử lại sau.",
          field: "voucher",
        });
      }
      if (
        new Date(voucher.end_date) < now ||
        new Date(voucher.start_date) > now ||
        voucher.remain <= 0
      ) {
        return res.status(400).json({
          message: "Mã giảm giá đã hết hạn sử dụng",
          field: "voucher",
        });
      }
      if (originalPrice < (voucher.min_order_value || 0)) {
        return res.status(400).json({
          message: "Đơn hàng không đủ điều kiện áp dụng mã giảm giá này",
          field: "voucher",
        });
      }

      discountAmount = Math.min(
        originalPrice * (voucher.value / 100),
        voucher.max_discount_amount || Infinity
      );
      finalPrice = Math.max(0, originalPrice - discountAmount);
      voucherId = voucher._id;
    }

    // Tạo đơn hàng với danh sách sản phẩm hợp lệ
    const newOrder = await Order.create({
      user,
      orderItems: validOrderItems,
      address: addressTrimmed,
      totalPrice: finalPrice,
      originalPrice: originalPrice,
      discountAmount: discountAmount,
      voucher: voucherId,
      userVoucher: userVoucherId,
      paidAt: new Date().toISOString(),
      isDelivered: false,
      name: nameTrimmed,
      phone: phoneStr,
    });

    // Cập nhật voucher và sản phẩm
    if (userVoucher) {
      userVoucher.used = true;
      userVoucher.used_at = new Date();
      await userVoucher.save();
      await Voucher.findByIdAndUpdate(voucherId, { $inc: { remain: -1 } });
    }
    await Promise.all(
      validOrderItems.map((item) =>
        Product.findByIdAndUpdate(
          item.productId,
          { $inc: { countInStock: -item.quantity } },
          { runValidators: false }
        )
      )
    );

    // Xóa giỏ hàng sau khi đặt hàng thành công
    await Cart.findOneAndDelete({ user });

    return res.status(200).json(newOrder);
  } catch (error) {
    console.error("Lỗi khi tạo đơn hàng:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
});

module.exports = router;
