const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Help function get cart by userid or guestid - public
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
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
  const { userId, guestId } = req.query;
  try {
    const cart = await getCart(userId, guestId);
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

// post /api/cart/merge - merge guest cart into user cart - protect
router.post("/merge", protect, async (req, res) => {
  const { guestId } = req.body;
  try {
    const guestCart = await Cart.findOne({ guestId });
    const userCart = await Cart.findOne({ user: req.user._id });
    if (guestCart) {
      if (guestCart.products.length === 0) {
        return res.status(400).json({ message: "Guest cart is empty" });
      }
      if (userCart) {
        guestCart.products.forEach((guestItem) => {
          const productIndex = userCart.products.findIndex(
            (item) =>
              item.productId.toString() === guestItem.productId.toString()
          );
          if(productIndex > -1){
            userCart.products[productIndex].quantity += guestItem.quantity
          } else {
            userCart.products.push(guestItem)
          }
        });
        userCart.totalPrice = userCart.products.reduce((acc, item) => acc + item.price *item.quantity,0)
        await userCart.save()
        try {
            await Cart.findOneAndDelete({guestId})
        } catch (error) {
            console.log('error deleting guest cart', error)
            return res.status(500).send({message: 'Lỗi'})
        }
        res.status(200).json(userCart)
      } else{
        guestCart.user = req.user._id;
        guestCart.guestId = undefined
        await guestCart.save()
        return res.status(200).json(guestCart)
      }
    } else {
        if(userCart){
            return res.status(200).json(userCart)
        }
        return res.status(404).json({message: "Không thấy guest cart"})
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
});

module.exports = router;
