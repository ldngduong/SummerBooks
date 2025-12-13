const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// Hàm validation sản phẩm - đồng bộ với frontend
const validateProduct = (data, isUpdate = false) => {
  const errors = [];

  // Validation cho Tên sách: Bắt buộc, chuỗi ký tự, độ dài không quá 250 ký tự
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || (typeof data.name === 'string' && data.name.trim() === "")) {
      errors.push("Vui lòng nhập đầy đủ thông tin");
    } else if (typeof data.name === 'string' && data.name.trim().length > 250) {
      errors.push("Tên sách không được vượt quá 250 ký tự");
    }
  }

  // Validation cho Tác giả: Bắt buộc, chuỗi ký tự, tối thiểu 3 ký tự và tối đa 50 ký tự
  if (!isUpdate || data.author !== undefined) {
    if (!data.author || (typeof data.author === 'string' && data.author.trim() === "")) {
      errors.push("Vui lòng nhập đầy đủ thông tin");
    } else if (typeof data.author === 'string') {
      const authorTrimmed = data.author.trim();
      if (authorTrimmed.length < 3) {
        errors.push("Tác giả phải có tối thiểu 3 ký tự");
      } else if (authorTrimmed.length > 50) {
        errors.push("Tác giả không được vượt quá 50 ký tự");
      }
    }
  }

  // Validation cho Mô tả: Bắt buộc, chuỗi ký tự, độ dài không quá 2000 ký tự
  if (!isUpdate || data.description !== undefined) {
    if (!data.description || (typeof data.description === 'string' && data.description.trim() === "")) {
      errors.push("Vui lòng nhập đầy đủ thông tin");
    } else if (typeof data.description === 'string' && data.description.trim().length > 2000) {
      errors.push("Mô tả không được vượt quá 2000 ký tự");
    }
  }

  // Validation cho Giá bán: Bắt buộc, số tự nhiên, >= 1000 VNĐ
  if (!isUpdate || data.price !== undefined) {
    if (data.price === "" || data.price === null || data.price === undefined) {
      errors.push("Vui lòng nhập đầy đủ thông tin");
    } else {
      const priceNum = Number(data.price);
      if (isNaN(priceNum) || priceNum <= 0 || !Number.isInteger(priceNum)) {
        errors.push("Giá trị không hợp lệ");
      } else if (priceNum < 1000) {
        errors.push("Giá bán tối thiểu là 1.000 VNĐ");
      }
    }
  }

  // Validation cho Số lượng tồn kho: Bắt buộc, số tự nhiên, >= 1
  if (!isUpdate || data.countInStock !== undefined) {
    if (data.countInStock === "" || data.countInStock === null || data.countInStock === undefined) {
      errors.push("Vui lòng nhập đầy đủ thông tin");
    } else {
      const stockNum = Number(data.countInStock);
      if (isNaN(stockNum) || stockNum <= 0 || !Number.isInteger(stockNum)) {
        errors.push("Số lượng tồn kho tối thiểu là 1");
      }
    }
  }

  // Validation cho Thể loại: Bắt buộc
  if (!isUpdate || data.category !== undefined) {
    if (!data.category || data.category === "") {
      errors.push("Vui lòng nhập đầy đủ thông tin");
    }
  }

  // Validation cho Số trang: Bắt buộc, số tự nhiên, tối thiểu 24 trang
  if (!isUpdate || data.countOfPage !== undefined) {
    if (data.countOfPage === "" || data.countOfPage === null || data.countOfPage === undefined) {
      errors.push("Vui lòng nhập đầy đủ thông tin");
    } else {
      const pageNum = Number(data.countOfPage);
      if (isNaN(pageNum) || pageNum < 0 || !Number.isInteger(pageNum)) {
        errors.push("Giá trị không hợp lệ");
      } else if (pageNum < 24) {
        errors.push("Số trang tối thiểu là 24 trang");
      }
    }
  }

  // Validation cho Ngày xuất bản: Bắt buộc
  if (!isUpdate || data.publishedAt !== undefined) {
    if (!data.publishedAt || data.publishedAt === "") {
      errors.push("Vui lòng nhập đầy đủ thông tin");
    }
  }

  // Validation cho Ảnh: Bắt buộc có ít nhất 1 ảnh
  if (!isUpdate || data.images !== undefined) {
    if (!data.images || !Array.isArray(data.images) || data.images.length === 0) {
      errors.push("Vui lòng nhập đầy đủ thông tin (cần ít nhất 1 ảnh)");
    }
  }

  return errors;
};

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

    // Validate dữ liệu trước khi tạo sản phẩm
    const validationErrors = validateProduct({
      name,
      description,
      price,
      countOfPage,
      countInStock,
      category,
      author,
      images,
      publishedAt,
    }, false);

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

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
    res.status(500).json({ message: "Lỗi server" });
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

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // Validate dữ liệu trước khi cập nhật
    const validationErrors = validateProduct({
      name,
      description,
      price,
      countOfPage,
      countInStock,
      category,
      author,
      images,
      publishedAt,
    }, true);

    if (validationErrors.length > 0) {
      return res.status(400).json({ errors: validationErrors });
    }

    // Chỉ cập nhật các trường được cung cấp
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (countOfPage !== undefined) product.countOfPage = countOfPage;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (category !== undefined) product.category = category;
    if (images !== undefined) product.images = images;
    if (author !== undefined) product.author = author;
    if (publishedAt !== undefined) product.publishedAt = publishedAt;
    
    const updatedProduct = await product.save();
    res.status(200).json(updatedProduct);
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
