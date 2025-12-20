// put /api/products:id - update product - private/admin
router.put("/:id", protect, admin, async (req, res) => {
  try {
    // [1] Bắt đầu: Destructure request body
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
    
    // [2] Tìm sản phẩm theo ID
    const product = await Product.findById(req.params.id);

    // [3] Kiểm tra sản phẩm có tồn tại không
    if (!product) {
      // [4] Return lỗi: Không tìm thấy sản phẩm
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    // [5] Kiểm tra các trường bắt buộc trống (chỉ validate các trường được cung cấp)
    if ((name !== undefined && (!name || (typeof name === 'string' && name.trim() === ""))) ||
        (description !== undefined && (!description || (typeof description === 'string' && description.trim() === ""))) ||
        (price !== undefined && (price === "" || price === null || price === undefined)) ||
        (countOfPage !== undefined && (countOfPage === "" || countOfPage === null || countOfPage === undefined)) ||
        (countInStock !== undefined && (countInStock === "" || countInStock === null || countInStock === undefined)) ||
        (category !== undefined && (!category || category === "")) ||
        (author !== undefined && (!author || (typeof author === 'string' && author.trim() === ""))) ||
        (publishedAt !== undefined && (!publishedAt || publishedAt === "")) ||
        (images !== undefined && (!images || !Array.isArray(images) || images.length === 0))) {
      // [6] Return lỗi: Thiếu thông tin bắt buộc
      return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
    }

    // [7] Validation cho Tên sách: độ dài không quá 250 ký tự
    if (name !== undefined && typeof name === 'string' && name.trim().length > 250) {
      // [8] Return lỗi: Tên sách quá dài
      return res.status(400).json({ message: 'Tên sách không được vượt quá 250 ký tự' });
    }

    // [9] Validation cho Tác giả: kiểm tra type
    if (typeof author === 'string') {
      const authorTrimmed = author.trim();
      // [10] Validation cho Tác giả: tối thiểu 3 ký tự và tối đa 50 ký tự
      if (authorTrimmed.length < 3 || authorTrimmed.length > 50) {
        // [11] Return lỗi: Tác giả không hợp lệ
        return res.status(400).json({ message: 'Tác giả phải có tối thiểu 3 ký tự không được vượt quá 50 ký tự' });
      }
    }

    // [12] Validation cho Mô tả: độ dài không quá 2000 ký tự
    if (description !== undefined && typeof description === 'string' && description.trim().length > 2000) {
      // [13] Return lỗi: Mô tả quá dài
      return res.status(400).json({ message: 'Mô tả không được vượt quá 2000 ký tự' });
    }

    // [14] Validation cho Giá bán: chuyển đổi sang số
    const priceNum = Number(price);
    // [15] Validation cho Giá bán: số tự nhiên, >= 1000 VNĐ
    if (isNaN(priceNum) || priceNum <= 1000 || !Number.isInteger(priceNum)) {
      // [16] Return lỗi: Giá bán không hợp lệ
      return res.status(400).json({ message: 'Giá bán tối thiểu là 1.000 VNĐ' });
    }

    // [17] Validation cho Số lượng tồn kho: kiểm tra có được cung cấp không
    if (countInStock !== undefined) {
      const stockNum = Number(countInStock);
      // [18] Validation cho Số lượng tồn kho: số tự nhiên, >= 1
      if (isNaN(stockNum) || stockNum <= 0 || !Number.isInteger(stockNum)) {
        // [19] Return lỗi: Số lượng tồn kho không hợp lệ
        return res.status(400).json({ message: 'Số lượng tồn kho tối thiểu là 1' });
      }
    }

    // [20] Validation cho Số trang: kiểm tra có được cung cấp không
    if (countOfPage !== undefined) {
      const pageNum = Number(countOfPage);
      // [21] Validation cho Số trang: kiểm tra hợp lệ
      if (isNaN(pageNum) || pageNum < 0 || !Number.isInteger(pageNum)) {
        // [22] Return lỗi: Số trang không hợp lệ
        return res.status(400).json({ message: 'Giá trị không hợp lệ' });
      } 
      // [23] Validation cho Số trang: tối thiểu 24 trang
      else if (pageNum < 24) {
        // [24] Return lỗi: Số trang quá ít
        return res.status(400).json({ message: 'Số trang tối thiểu là 24 trang' });
      }
    }

    // [25] Validation cho Hình ảnh: kiểm tra có được cung cấp và là array không
    if (images !== undefined && Array.isArray(images)) {
      const allowedTypes = /jpeg|jpg|png|svg/;
      // [26] Lặp qua từng hình ảnh
      for (const image of images) {
        // [27] Kiểm tra image có url không
        if (image && image.url) {
          const urlLower = image.url.toLowerCase();
          const hasValidExtension = allowedTypes.test(urlLower);
          // [28] Kiểm tra định dạng file
          if (!hasValidExtension) {
            // [29] Return lỗi: Định dạng file không hợp lệ
            return res.status(400).json({ message: 'Hình ảnh phải có định dạng JPG, JPEG, PNG hoặc SVG' });
          }
          
          // [30] Kiểm tra kích thước ảnh
          const isValidSize = await checkImageSize(image.url);
          // [31] Kiểm tra kích thước có hợp lệ không
          if (!isValidSize) {
            // [32] Return lỗi: Kích thước ảnh quá lớn
            return res.status(400).json({ message: 'Kích thước hình ảnh không được vượt quá 25MB' });
          }
        }
      }
    }

    // [33] Cập nhật các trường được cung cấp
    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = price;
    if (countOfPage !== undefined) product.countOfPage = countOfPage;
    if (countInStock !== undefined) product.countInStock = countInStock;
    if (category !== undefined) product.category = category;
    if (images !== undefined) product.images = images;
    if (author !== undefined) product.author = author;
    if (publishedAt !== undefined) product.publishedAt = publishedAt;
    
    // [34] Lưu sản phẩm đã cập nhật
    const updatedProduct = await product.save();
    // [35] Trả về kết quả thành công
    res.status(200).json(updatedProduct);
  } catch (error) {
    // Không tính catch block
  }
});
