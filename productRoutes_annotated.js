// Biểu đồ điều khiển - PUT /api/products/:id (Dòng 166-287)
// Đánh số nguyên liên tục từ 1-64 (bao gồm cả return statements)

router.put("/:id", protect, admin, async (req, res) => {
  try {
    // [1] Destructure req.body
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
    
    // [2] Find product by ID
    const product = await Product.findById(req.params.id);

    // [3] Check if product exists
    if (!product) {
      // [4] Return 404 if product not found
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // [5] Validate name (if provided)
    if (name !== undefined && (!name || (typeof name === 'string' && name.trim() === ""))) {
      // [6] Return 400 if name invalid
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // [7] Validate description (if provided)
    if (description !== undefined && (!description || (typeof description === 'string' && description.trim() === ""))) {
      // [8] Return 400 if description invalid
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // [9] Validate price (if provided)
    if (price !== undefined && (price === "" || price === null || price === undefined)) {
      // [10] Return 400 if price invalid
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // [11] Validate countOfPage (if provided)
    if (countOfPage !== undefined && (countOfPage === "" || countOfPage === null || countOfPage === undefined)) {
      // [12] Return 400 if countOfPage invalid
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // [13] Validate countInStock (if provided)
    if (countInStock !== undefined && (countInStock === "" || countInStock === null || countInStock === undefined)) {
      // [14] Return 400 if countInStock invalid
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // [15] Validate category (if provided)
    if (category !== undefined && (!category || category === "")) {
      // [16] Return 400 if category invalid
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // [17] Validate author (if provided)
    if (author !== undefined && (!author || (typeof author === 'string' && author.trim() === ""))) {
      // [18] Return 400 if author invalid
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // [19] Validate publishedAt (if provided)
    if (publishedAt !== undefined && (!publishedAt || publishedAt === "")) {
      // [20] Return 400 if publishedAt invalid
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }
    
    // [21] Validate images (if provided)
    if (images !== undefined && (!images || !Array.isArray(images) || images.length === 0)) {
      // [22] Return 400 if images invalid
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin (cần ít nhất 1 ảnh)' });
    }

    // [23] Validate name length (if provided)
    if (name !== undefined && typeof name === 'string' && name.trim().length > 250) {
      // [24] Return 400 if name length > 250
      return res.status(400).json({ message: 'Tên sách không được vượt quá 250 ký tự' });
    }

    // [25] Validate author length (if author is string)
    if (typeof author === 'string') {
      // [26] Trim author string
      const authorTrimmed = author.trim();
      // [27] Check author length
      if (authorTrimmed.length < 3|| authorTrimmed.length > 50) {
        // [28] Return 400 if author length invalid
        return res.status(400).json({ message: 'Tác giả phải có tối thiểu 3 ký tự không được vượt quá 50 ký tự' });
      }
    }

    // [29] Validate description length (if provided)
    if (description !== undefined && typeof description === 'string' && description.trim().length > 2000) {
      // [30] Return 400 if description length > 2000
      return res.status(400).json({ message: 'Mô tả không được vượt quá 2000 ký tự' });
    }

    // [31] Convert price to number
    const priceNum = Number(price);
    
    // [32] Validate price value
    if (isNaN(priceNum) || priceNum <= 1000 || !Number.isInteger(priceNum)) {
      // [33] Return 400 if price invalid
      return res.status(400).json({ message: 'Giá bán tối thiểu là 1.000 VNĐ' });
    }

    // [34] Validate countInStock (if provided)
    if (countInStock !== undefined) {
      // [35] Convert countInStock to number
      const stockNum = Number(countInStock);
      // [36] Check stockNum validity
      if (isNaN(stockNum) || stockNum <= 0 || !Number.isInteger(stockNum)) {
        // [37] Return 400 if stockNum invalid
        return res.status(400).json({ message: 'Số lượng tồn kho tối thiểu là 1' });
      }
    }

    // [38] Validate countOfPage (if provided)
    if (countOfPage !== undefined) {
      // [39] Convert countOfPage to number
      const pageNum = Number(countOfPage);
      // [40] Check pageNum format
      if (isNaN(pageNum) || pageNum < 0 || !Number.isInteger(pageNum)) {
        // [41] Return 400 if pageNum format invalid
        return res.status(400).json({ message: 'Giá trị không hợp lệ' });
      }
      // [42] Check pageNum minimum value
      else if (pageNum < 24) {
        // [43] Return 400 if pageNum < 24
        return res.status(400).json({ message: 'Số trang tối thiểu là 24 trang' });
      }
    }

    // [44] Validate images (if provided and is array)
    if (images !== undefined && Array.isArray(images)) {
      const allowedTypes = /jpeg|jpg|png|svg/;
      // [45] Loop through each image
      for (const image of images) {
        // [46] Check if image has URL
        if (image && image.url) {
          // [47] Convert URL to lowercase
          const urlLower = image.url.toLowerCase();
          // [48] Check if extension is valid
          const hasValidExtension = allowedTypes.test(urlLower);
          // [49] Check image extension
          if (!hasValidExtension) {
            // [50] Return 400 if image extension invalid
            return res.status(400).json({ message: 'Hình ảnh phải có định dạng JPG, JPEG, PNG hoặc SVG' });
          }
          
          // [51] Check image size
          const isValidSize = await checkImageSize(image.url);
          // [52] Validate image size
          if (!isValidSize) {
            // [53] Return 400 if image size invalid
            return res.status(400).json({ message: 'Kích thước hình ảnh không được vượt quá 25MB' });
          }
        }
      }
    }

    // [54-62] Update product fields (only if provided)
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (countOfPage !== undefined) product.countOfPage = countOfPage;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (category !== undefined) product.category = category;
    if (images !== undefined) product.images = images;
    if (author !== undefined) product.author = author;
    if (publishedAt !== undefined) product.publishedAt = publishedAt;
    
    // [63] Save updated product to database
    const updatedProduct = await product.save();
    
    // [64] Return success response
    res.status(200).json(updatedProduct);
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ message: "Lỗi server" });
  }
});



