const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect } = require("../middleware/authMiddleware");
const { checkout } = require("./productRoutes");

const router = express.Router();

// post /api/checkout - create new chekcout session - protect
router.post("/", protect, async (req, res) => {
  const { 
    checkoutItems,
    shippingAddress, 
    paymentMethod, 
    totalPrice,
    name,
    phone
  } = req.body;
  if (!checkoutItems || checkoutItems.length === 0){
    return res.status(400).json({message: "không có sản phẩm trong checkout"})
  }
  try {
    const newCheckout = await Checkout.create({
        user: req.user._id,
        checkoutItems: checkoutItems,
        shippingAddress,
        paymentMethod,
        totalPrice,
        paymentStatus: "Đang chờ",
        isPaid: false,
        name,
        phone
    });
    console.log('Checkout created for user: ', req.user._id)
    return res.status(201).json(newCheckout)
  } catch (error) {
    console.log('Lỗi khi tạo checkout session')
    return res.status(500).json({message: "lỗi server"})
  }
});

// put /api/checkout/:id/pay - update checkout as paid - protect
router.put('/:id/pay', protect, async(req, res) => {
    const {paymentStatus} = req.body;
    try{
        const checkout = await Checkout.findById(req.params.id)
        if(!checkout){
            return res.status(404).json({message: "Không thấy checkout"})
        }
        if(paymentStatus === 'Đã thanh toán'){
            checkout.isPaid = true
            checkout.paymentStatus = paymentStatus
            checkout.paidAt = Date.now();
            await checkout.save()
            await Cart.findOneAndDelete({user: checkout.user})
            return res.status(200).json(checkout)
        }
        else{
            return res.status(400).json({message: "Trạng thái không hợp lệ"})
        }
    }
     catch(error){
        console.log(error)
        return res.status(500).send("Lỗi server")
    }
})

// post /api/checkout/:id/finalize - convert to order if checkout is paid - protect
router.post('/:id/finalize', protect, async(req, res) => {
    try {
      const checkout = await Checkout.findById(req.params.id)
      
      if(!checkout){
        return res.status(404).json({message: "Không tìm thấy checkout"})
      }
      if(checkout.isPaid && !checkout.isFinalized){
        const finalOrder = await Order.create({
            user: checkout.user,
            orderItems: checkout.checkoutItems,
            shippingAddress: checkout.shippingAddress,
            paymentMethod: checkout.paymentMethod,
            totalPrice: checkout.totalPrice,
            isPaid: true,
            paidAt: checkout.paidAt,
            isDelivered: false,
            paymentStatus: "Đã thanh toán",
            paymentDetails: checkout.paymentDetails,
            name: checkout.name,
            phone: checkout.phone
        })
        checkout.isFinalized = true;
        checkout.finalizedAt = Date.now()
        await checkout.save()
        res.status(201).json(finalOrder)
      }
      else if (checkout.isFinalized) {
        res.status(400).json({message: "checkout đã được xuất đơn hàng"})
      }
      else {
        res.status(400).json({message: "Checkout chưa được thanh toán"});
      }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Lỗi server"})
    }
})

module.exports = router
