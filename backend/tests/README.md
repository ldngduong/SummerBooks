# Hướng dẫn chạy test

## Cài đặt dependencies

```bash
npm install
```

## Chạy test

```bash
# Chạy tất cả test
npm test

# Chạy test với watch mode
npm run test:watch

# Chạy test với coverage report
npm run test:coverage
```

## Cấu trúc test

File `reviewRoutes.test.js` chứa các test case cho chức năng đánh giá đơn hàng theo phương pháp kiểm thử hộp đen:

### 7 test cases từ bảng quyết định:
1. TC1: Điểm hài lòng để trống - Thất bại
2. TC2: Điểm hài lòng = 1.5 (không phải số tự nhiên) - Thất bại
3. TC3: Điểm hài lòng = 20 (ngoài khoảng [1,10]) - Thất bại
4. TC4: Nhận xét > 500 ký tự - Thất bại
5. TC5: File ảnh không đúng định dạng (.htm) - Thất bại
6. TC6: File ảnh > 25MB - Thất bại
7. TC7: Tất cả dữ liệu hợp lệ - Thành công

### Test bổ sung:
- Kiểm thử giá trị biên cho điểm hài lòng (1, 10, 0, 11)
- Kiểm thử độ dài nhận xét (500, 501 ký tự)
- Kiểm thử các định dạng file ảnh hợp lệ (jpg, png, jpeg, svg)
- Kiểm thử trường không bắt buộc (file ảnh, nhận xét)

## Lưu ý

- Test sử dụng mocks cho database, authentication middleware, và cloudinary
- Validation URL/Email/SĐT trong nhận xét chưa được implement trong code, các test case tương ứng sẽ pass nhưng cần được cập nhật khi validation được thêm vào

