const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const https = require("https");
const http = require("http");
const { URL } = require("url");

const router = express.Router();

// Helper function để kiểm tra kích thước ảnh từ URL
const checkImageSize = (imageUrl) => {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(imageUrl);
      const client = parsedUrl.protocol === "https:" ? https : http;
      const maxSize = 25 * 1024 * 1024; // 25MB

      const request = client.request(
        {
          method: "HEAD",
          hostname: parsedUrl.hostname,
          path: parsedUrl.pathname + parsedUrl.search,
          protocol: parsedUrl.protocol,
        },
        (response) => {
          const contentLength = response.headers["content-length"];
          if (contentLength && parseInt(contentLength) > maxSize) {
            resolve(false);
          } else {
            resolve(true);
          }
          response.destroy();
        }
      );

      request.on("error", () => {
        // Nếu không thể kiểm tra, cho phép (có thể là URL không hợp lệ hoặc không truy cập được)
        resolve(true);
      });

      request.setTimeout(5000, () => {
        request.destroy();
        resolve(true); // Timeout, cho phép để không block
      });

      request.end();
    } catch (error) {
      // Nếu URL không hợp lệ, cho phép (sẽ được validate ở chỗ khác)
      resolve(true);
    }
  });
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

    // Kiểm tra các trường bắt buộc trống
    if (!name || (typeof name === 'string' && name.trim() === "") ||
        !description || (typeof description === 'string' && description.trim() === "") ||
        price === "" || price === null || price === undefined ||
        countOfPage === "" || countOfPage === null || countOfPage === undefined ||
        countInStock === "" || countInStock === null || countInStock === undefined ||
        !category || category === "" ||
        !author || (typeof author === 'string' && author.trim() === "") ||
        !publishedAt || publishedAt === "" ||
        !images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // Validation cho Tên sách: độ dài không quá 250 ký tự
    if (typeof name === 'string' && name.trim().length > 250) {
      return res.status(400).json({ message: 'Tên sách không được vượt quá 250 ký tự' });
    }

    // Validation cho Tác giả: tối thiểu 3 ký tự và tối đa 50 ký tự
    if (typeof author === 'string') {
      const authorTrimmed = author.trim();
      if (authorTrimmed.length < 3) {
        return res.status(400).json({ message: 'Tác giả phải có tối thiểu 3 ký tự' });
      } else if (authorTrimmed.length > 50) {
        return res.status(400).json({ message: 'Tác giả không được vượt quá 50 ký tự' });
      }
    }

    // Validation cho Mô tả: độ dài không quá 2000 ký tự
    if (typeof description === 'string' && description.trim().length > 2000) {
      return res.status(400).json({ message: 'Mô tả không được vượt quá 2000 ký tự' });
    }

    // Validation cho Giá bán: số tự nhiên, >= 1000 VNĐ
    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0 || !Number.isInteger(priceNum)) {
      return res.status(400).json({ message: 'Giá trị không hợp lệ' });
    } else if (priceNum < 1000) {
      return res.status(400).json({ message: 'Giá bán tối thiểu là 1.000 VNĐ' });
    }

    // Validation cho Số lượng tồn kho: số tự nhiên, >= 1
    const stockNum = Number(countInStock);
    if (isNaN(stockNum) || stockNum <= 0 || !Number.isInteger(stockNum)) {
      return res.status(400).json({ message: 'Số lượng tồn kho tối thiểu là 1' });
    }

    // Validation cho Số trang: số tự nhiên, tối thiểu 24 trang
    const pageNum = Number(countOfPage);
    if (isNaN(pageNum) || pageNum < 0 || !Number.isInteger(pageNum)) {
      return res.status(400).json({ message: 'Giá trị không hợp lệ' });
    } else if (pageNum < 24) {
      return res.status(400).json({ message: 'Số trang tối thiểu là 24 trang' });
    }

    // Validation cho Hình ảnh: định dạng JPG, JPEG, PNG, SVG và kích thước không quá 25MB
    if (Array.isArray(images)) {
      const allowedTypes = /jpeg|jpg|png|svg/;
      for (const image of images) {
        if (image && image.url) {
          const urlLower = image.url.toLowerCase();
          const hasValidExtension = allowedTypes.test(urlLower);
          if (!hasValidExtension) {
            return res.status(400).json({ message: 'Hình ảnh phải có định dạng JPG, JPEG, PNG hoặc SVG' });
          }
          
          // Kiểm tra kích thước ảnh
          const isValidSize = await checkImageSize(image.url);
          if (!isValidSize) {
            return res.status(400).json({ message: 'Kích thước hình ảnh không được vượt quá 25MB' });
          }
        }
      }
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

    // Kiểm tra các trường bắt buộc trống (chỉ validate các trường được cung cấp)
    if (name !== undefined && (!name || (typeof name === 'string' && name.trim() === ""))) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (description !== undefined && (!description || (typeof description === 'string' && description.trim() === ""))) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (price !== undefined && (price === "" || price === null || price === undefined)) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (countOfPage !== undefined && (countOfPage === "" || countOfPage === null || countOfPage === undefined)) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (countInStock !== undefined && (countInStock === "" || countInStock === null || countInStock === undefined)) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (category !== undefined && (!category || category === "")) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (author !== undefined && (!author || (typeof author === 'string' && author.trim() === ""))) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (publishedAt !== undefined && (!publishedAt || publishedAt === "")) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    if (images !== undefined && (!images || !Array.isArray(images) || images.length === 0)) {
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin (cần ít nhất 1 ảnh)' });
    }

    // Validation cho Tên sách: độ dài không quá 250 ký tự
    if (name !== undefined && typeof name === 'string' && name.trim().length > 250) {
      return res.status(400).json({ message: 'Tên sách không được vượt quá 250 ký tự' });
    }

    // Validation cho Tác giả: tối thiểu 3 ký tự và tối đa 50 ký tự
    if (author !== undefined && typeof author === 'string') {
      const authorTrimmed = author.trim();
      if (authorTrimmed.length < 3) {
        return res.status(400).json({ message: 'Tác giả phải có tối thiểu 3 ký tự' });
      } else if (authorTrimmed.length > 50) {
        return res.status(400).json({ message: 'Tác giả không được vượt quá 50 ký tự' });
      }
    }

    // Validation cho Mô tả: độ dài không quá 2000 ký tự
    if (description !== undefined && typeof description === 'string' && description.trim().length > 2000) {
      return res.status(400).json({ message: 'Mô tả không được vượt quá 2000 ký tự' });
    }

    // Validation cho Giá bán: số tự nhiên, >= 1000 VNĐ
    if (price !== undefined) {
      const priceNum = Number(price);
      if (isNaN(priceNum) || priceNum <= 0 || !Number.isInteger(priceNum)) {
        return res.status(400).json({ message: 'Giá trị không hợp lệ' });
      } else if (priceNum < 1000) {
        return res.status(400).json({ message: 'Giá bán tối thiểu là 1.000 VNĐ' });
      }
    }

    // Validation cho Số lượng tồn kho: số tự nhiên, >= 1
    if (countInStock !== undefined) {
      const stockNum = Number(countInStock);
      if (isNaN(stockNum) || stockNum <= 0 || !Number.isInteger(stockNum)) {
        return res.status(400).json({ message: 'Số lượng tồn kho tối thiểu là 1' });
      }
    }

    // Validation cho Số trang: số tự nhiên, tối thiểu 24 trang
    if (countOfPage !== undefined) {
      const pageNum = Number(countOfPage);
      if (isNaN(pageNum) || pageNum < 0 || !Number.isInteger(pageNum)) {
        return res.status(400).json({ message: 'Giá trị không hợp lệ' });
      } else if (pageNum < 24) {
        return res.status(400).json({ message: 'Số trang tối thiểu là 24 trang' });
      }
    }

    // Validation cho Hình ảnh: định dạng JPG, JPEG, PNG, SVG và kích thước không quá 25MB
    if (images !== undefined && Array.isArray(images)) {
      const allowedTypes = /jpeg|jpg|png|svg/;
      for (const image of images) {
        if (image && image.url) {
          const urlLower = image.url.toLowerCase();
          const hasValidExtension = allowedTypes.test(urlLower);
          if (!hasValidExtension) {
            return res.status(400).json({ message: 'Hình ảnh phải có định dạng JPG, JPEG, PNG hoặc SVG' });
          }
          
          // Kiểm tra kích thước ảnh
          const isValidSize = await checkImageSize(image.url);
          if (!isValidSize) {
            return res.status(400).json({ message: 'Kích thước hình ảnh không được vượt quá 25MB' });
          }
        }
      }
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
