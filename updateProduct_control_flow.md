# Biểu đồ điều khiển - updateProduct

## Mô tả luồng điều khiển

```
Start
  ↓
[1] Destructure request body (const { name, description, ... } = req.body)
  ↓
[2] Tìm sản phẩm theo ID (const product = await Product.findById(req.params.id))
  ↓
[3] Kiểm tra sản phẩm có tồn tại không (if (!product))
  ├─ T → [4] Return lỗi 404: "Không tìm thấy sản phẩm" → End
  └─ F → [5] Kiểm tra các trường bắt buộc trống
         ├─ T → [6] Return lỗi 400: "Vui lòng nhập đầy đủ thông tin" → End
         └─ F → [7] Validation cho Tên sách: độ dài không quá 250 ký tự
                ├─ T → [8] Return lỗi 400: "Tên sách không được vượt quá 250 ký tự" → End
                └─ F → [9] Validation cho Tác giả: kiểm tra type (if (typeof author === 'string'))
                       ├─ T → [10] Validation cho Tác giả: tối thiểu 3 ký tự và tối đa 50 ký tự
                       │        ├─ T → [11] Return lỗi 400: "Tác giả phải có tối thiểu 3 ký tự..." → End
                       │        └─ F → [12] Validation cho Mô tả: độ dài không quá 2000 ký tự
                       └─ F → [12] Validation cho Mô tả: độ dài không quá 2000 ký tự
                              ├─ T → [13] Return lỗi 400: "Mô tả không được vượt quá 2000 ký tự" → End
                              └─ F → [14] Validation cho Giá bán: chuyển đổi sang số (const priceNum = Number(price))
                                     ↓
                                     [15] Validation cho Giá bán: số tự nhiên, >= 1000 VNĐ
                                     ├─ T → [16] Return lỗi 400: "Giá bán tối thiểu là 1.000 VNĐ" → End
                                     └─ F → [17] Validation cho Số lượng tồn kho: kiểm tra có được cung cấp không
                                            ├─ T → [18] Validation cho Số lượng tồn kho: số tự nhiên, >= 1
                                            │        ├─ T → [19] Return lỗi 400: "Số lượng tồn kho tối thiểu là 1" → End
                                            │        └─ F → [20] Validation cho Số trang: kiểm tra có được cung cấp không
                                            └─ F → [20] Validation cho Số trang: kiểm tra có được cung cấp không
                                                   ├─ T → [21] Validation cho Số trang: kiểm tra hợp lệ
                                                   │        ├─ T → [22] Return lỗi 400: "Giá trị không hợp lệ" → End
                                                   │        └─ F → [23] Validation cho Số trang: tối thiểu 24 trang
                                                   │                 ├─ T → [24] Return lỗi 400: "Số trang tối thiểu là 24 trang" → End
                                                   │                 └─ F → [25] Validation cho Hình ảnh: kiểm tra có được cung cấp và là array không
                                                   └─ F → [25] Validation cho Hình ảnh: kiểm tra có được cung cấp và là array không
                                                          ├─ T → [26] Lặp qua từng hình ảnh (for loop)
                                                          │        ↓
                                                          │        [27] Kiểm tra image có url không
                                                          │        ├─ T → [28] Kiểm tra định dạng file
                                                          │        │        ├─ T → [29] Return lỗi 400: "Hình ảnh phải có định dạng..." → End
                                                          │        │        └─ F → [30] Kiểm tra kích thước ảnh
                                                          │        │                 ↓
                                                          │        │                 [31] Kiểm tra kích thước có hợp lệ không
                                                          │        │                 ├─ T → [32] Return lỗi 400: "Kích thước hình ảnh..." → End
                                                          │        │                 └─ F → Tiếp tục vòng lặp (quay lại [26])
                                                          │        └─ F → Tiếp tục vòng lặp (quay lại [26])
                                                          └─ F → [33] Cập nhật các trường được cung cấp
                                                                 ↓
                                                                 [34] Lưu sản phẩm đã cập nhật (await product.save())
                                                                 ↓
                                                                 [35] Trả về kết quả thành công (res.status(200).json(updatedProduct))
                                                                 ↓
                                                                 End
```

## Sơ đồ điều khiển dạng node

```
Node 1: Start
  ↓
Node 2: [1] Destructure request body
  ↓
Node 3: [2] Tìm sản phẩm theo ID
  ↓
Node 4: [3] if (!product)
  ├─ T → Node 5: [4] Return 404 → End
  └─ F → Node 6: [5] if (validation các trường bắt buộc)
         ├─ T → Node 7: [6] Return 400 → End
         └─ F → Node 8: [7] if (name.length > 250)
                ├─ T → Node 9: [8] Return 400 → End
                └─ F → Node 10: [9] if (typeof author === 'string')
                       ├─ T → Node 11: [10] if (author.length < 3 || > 50)
                       │        ├─ T → Node 12: [11] Return 400 → End
                       │        └─ F → Node 13: [12] if (description.length > 2000)
                       └─ F → Node 13: [12] if (description.length > 2000)
                              ├─ T → Node 14: [13] Return 400 → End
                              └─ F → Node 15: [14] const priceNum = Number(price)
                                     ↓
                                     Node 16: [15] if (priceNum invalid)
                                     ├─ T → Node 17: [16] Return 400 → End
                                     └─ F → Node 18: [17] if (countInStock !== undefined)
                                            ├─ T → Node 19: [18] if (stockNum invalid)
                                            │        ├─ T → Node 20: [19] Return 400 → End
                                            │        └─ F → Node 21: [20] if (countOfPage !== undefined)
                                            └─ F → Node 21: [20] if (countOfPage !== undefined)
                                                   ├─ T → Node 22: [21] if (pageNum invalid)
                                                   │        ├─ T → Node 23: [22] Return 400 → End
                                                   │        └─ F → Node 24: [23] if (pageNum < 24)
                                                   │                 ├─ T → Node 25: [24] Return 400 → End
                                                   │                 └─ F → Node 26: [25] if (images !== undefined && Array.isArray(images))
                                                   └─ F → Node 26: [25] if (images !== undefined && Array.isArray(images))
                                                          ├─ T → Node 27: [26] for (const image of images)
                                                          │        ↓
                                                          │        Node 28: [27] if (image && image.url)
                                                          │        ├─ T → Node 29: [28] if (!hasValidExtension)
                                                          │        │        ├─ T → Node 30: [29] Return 400 → End
                                                          │        │        └─ F → Node 31: [30] await checkImageSize()
                                                          │        │                 ↓
                                                          │        │                 Node 32: [31] if (!isValidSize)
                                                          │        │                 ├─ T → Node 33: [32] Return 400 → End
                                                          │        │                 └─ F → Loop back to Node 27
                                                          │        └─ F → Loop back to Node 27
                                                          └─ F → Node 34: [33] Cập nhật các trường
                                                                 ↓
                                                                 Node 35: [34] await product.save()
                                                                 ↓
                                                                 Node 36: [35] Return 200 → End
```

## Danh sách các node và mô tả

| Node | Mô tả | Loại |
|------|------|------|
| 1 | Start | Entry |
| 2 | Destructure request body | Process |
| 3 | Tìm sản phẩm theo ID | Process |
| 4 | Kiểm tra sản phẩm có tồn tại không | Decision |
| 5 | Return lỗi 404 | Exit |
| 6 | Kiểm tra các trường bắt buộc trống | Decision |
| 7 | Return lỗi 400: Thiếu thông tin | Exit |
| 8 | Validation tên sách > 250 ký tự | Decision |
| 9 | Return lỗi 400: Tên sách quá dài | Exit |
| 10 | Kiểm tra type của author | Decision |
| 11 | Validation độ dài author | Decision |
| 12 | Return lỗi 400: Tác giả không hợp lệ | Exit |
| 13 | Validation mô tả > 2000 ký tự | Decision |
| 14 | Return lỗi 400: Mô tả quá dài | Exit |
| 15 | Chuyển đổi price sang số | Process |
| 16 | Validation giá bán | Decision |
| 17 | Return lỗi 400: Giá bán không hợp lệ | Exit |
| 18 | Kiểm tra countInStock có được cung cấp | Decision |
| 19 | Validation số lượng tồn kho | Decision |
| 20 | Return lỗi 400: Số lượng tồn kho không hợp lệ | Exit |
| 21 | Kiểm tra countOfPage có được cung cấp | Decision |
| 22 | Validation số trang hợp lệ | Decision |
| 23 | Return lỗi 400: Số trang không hợp lệ | Exit |
| 24 | Validation số trang >= 24 | Decision |
| 25 | Return lỗi 400: Số trang quá ít | Exit |
| 26 | Kiểm tra images có được cung cấp và là array | Decision |
| 27 | Lặp qua từng hình ảnh | Loop |
| 28 | Kiểm tra image có url | Decision |
| 29 | Kiểm tra định dạng file | Decision |
| 30 | Return lỗi 400: Định dạng file không hợp lệ | Exit |
| 31 | Kiểm tra kích thước ảnh | Process |
| 32 | Kiểm tra kích thước hợp lệ | Decision |
| 33 | Return lỗi 400: Kích thước ảnh quá lớn | Exit |
| 34 | Cập nhật các trường được cung cấp | Process |
| 35 | Lưu sản phẩm đã cập nhật | Process |
| 36 | Return kết quả thành công | Exit |
