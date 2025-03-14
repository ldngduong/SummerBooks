const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// post /api/products - create new product - private/admin
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      countOfPage,
      countInStock,
      category,
      author,
      images,
      publishedAt,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      countOfPage,
      countInStock,
      category,
      author,
      images,
      publishedAt,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).send(error);
  }
});

// put /api/products:id - update product - private/admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      countOfPage,
      countInStock,
      category,
      author,
      images,
      publishedAt,
    } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.countOfPage = countOfPage || product.countOfPage;
      product.countInStock = countInStock || product.countInStock;
      product.category = category || product.category;
      product.images = images || product.images;
      product.author = author || product.author;
      product.publishedAt = publishedAt || product.publishedAt;
      const updatedProduct = await product.save();
      res.status(200).json(updatedProduct);
    } else {
      res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ message: "Lỗi server" });
  }
});

// delete /api/products:id - delete product - private/admin
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.status(200).json(product);
    } else {
      res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});

// get /api/products - get all product - public
router.get("/", async (req, res) => {
  try {
    const {
      size,
      sortBy,
      search,
      category,
      limit,
    } = req.query;

    let query = {}

    if(category && category.toLocaleLowerCase() !== 'all'){
        query.category = category
    }
    if(size){
        query.size = {$in: size.split(',')};
    }
    if(search){
        query.$or = [
            {name: {$regex: search, $options: 'i'}},
            {description: {$regex: search, $options: 'i'}},
            {colors: {$regex: search, $options: 'i'}},
            {brand: {$regex: search, $options: 'i'}},
            {material: {$regex: search, $options: 'i'}}

        ]
    }
    let sort={}
    if(sortBy){
        switch(sortBy){
            case 'all': 
              sort = {};
            break;
            case 'priceAsc': 
                sort = {price: 1};
                break;
            case 'priceDesc':
                sort = {price: - 1};
                break;
            case 'popularity':
                sort = {rating: -1};
                break
            default:
                break;
        }
    }

    let products = await Product.find(query).sort(sort).limit(Number(limit) || 0);
    res.json(products);

  } catch (error) {
    console.log(error);
    res.status(500).send(error)
  }
});

// get /api/products/best-seller - get highest rate product - public
router.get('/best-seller', async (req, res) => {
  try {
    const product = await Product.findOne().sort({rating: -1})
    if (product){
      res.json(product)
    } else {
      res.status(404).json({message: "Không có best seller"})
    }
  } catch (error) {
    res.status(500).send(error)
  }
})

// get /api/products/new-arrival - get newest products - public
router.get('/new-arrival', async (req, res) => {
  try {
    const product = await Product.find().sort({createdAt: -1}).limit(10)
    if (product){
      res.json(product)
    } else {
      res.status(404).json({message: "Không có hàng mới về"})
    }
  } catch (error) {
    res.status(500).send(error)
  }
})

// get /api/products/:id - get details product - public
router.get("/:id", async(req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        if(product){
            res.json(product)
        }
        else{
            res.status(404).json({message: "Sản phẩm không tồn tại"})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Lỗi hệ thống"})
    }
})

// get /api/products/similar/:id - get similar product - public
router.get('/similar/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product){
      similarProducts = await Product.find({
        _id : {$ne: product._id},
        category: product.category,
      }).limit(4)
      res.json(similarProducts)
    } else{
      res.status(404).json({message: "Không tìm thấy sản phẩm"})
    }
  } catch (error) {
    res.status(500).send({message: "Server lỗi"})

  }
})

// get /api/products/best-seller - get highest rate product - public
router.get('/best-seller', async (req, res) => {
  try {
    const product = await Product.findOne().sort({rating: -1})
    if (product){
      res.json(product)
    } else {
      res.status(404).json({message: "Không có best seller"})
    }
  } catch (error) {
    res.status(500).send(error)
  }
})


module.exports = router;
