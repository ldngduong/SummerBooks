// delete /api/products:id - delete product - private/admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    // [1] const product = await Product.findById(req.params.id);
    const product = await Product.findById(req.params.id);

    // [2] if (product) {
    if (product) {
      // [3] await product.deleteOne();
      await product.deleteOne();
      // [4] res.status(200).json(product);
      res.status(200).json(product);
    // [5] } else {
    } else {
      // [6] res.status(404).json({ message: "Sản phẩm không tồn tại" });
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
  // [7] } catch (error) {
  } catch (error) {
    // [8] console.log(error);
    console.log(error);
    // [9] res.status(500).send(error);
    res.status(500).send(error);
  }
});



