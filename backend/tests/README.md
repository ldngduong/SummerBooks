# Hướng dẫn chạy test

## Test chức năng Đánh giá đơn hàng (Review Routes)

### Chạy tất cả test
```bash
npm test tests/reviewRoutes.test.js
# hoặc
npm run test:review
```

### Chạy riêng từng phần

#### 1. Bảng Testcase (8 test cases chính)
```bash
npm run test:review:testcase
# hoặc
npm test -- --testNamePattern="Bảng Testcase"
```

#### 2. Phân vùng tương đương - Biến Điểm hài lòng
```bash
npm run test:review:rating-eq
# hoặc
npm test tests/reviewRoutes.test.js -- --testNamePattern="Phân vùng tương đương - Biến Điểm hài lòng"
```

#### 3. Phân tích giá trị biên - Biến Điểm hài lòng
```bash
npm run test:review:rating-boundary
# hoặc
npm test tests/reviewRoutes.test.js -- --testNamePattern="Phân tích giá trị biên - Biến Điểm hài lòng"
```

#### 4. Phân vùng tương đương - Biến Nhận xét
```bash
npm run test:review:comment-eq
# hoặc
npm test tests/reviewRoutes.test.js -- --testNamePattern="Phân vùng tương đương - Biến Nhận xét"
```

#### 5. Phân tích giá trị biên - Biến Nhận xét
```bash
npm run test:review:comment-boundary
# hoặc
npm test tests/reviewRoutes.test.js -- --testNamePattern="Phân tích giá trị biên - Biến Nhận xét"
```

#### 6. Phân vùng tương đương - Biến File ảnh
```bash
npm run test:review:image-eq
# hoặc
npm test tests/reviewRoutes.test.js -- --testNamePattern="Phân vùng tương đương - Biến File ảnh"
```

#### 7. Phân tích giá trị biên - Biến File ảnh
```bash
npm run test:review:image-boundary
# hoặc
npm test tests/reviewRoutes.test.js -- --testNamePattern="Phân tích giá trị biên - Biến File ảnh"
```

#### 8. Test các định dạng ảnh hợp lệ
```bash
npm run test:review:formats
# hoặc
npm test tests/reviewRoutes.test.js -- --testNamePattern="Test các định dạng ảnh hợp lệ"
```

### Chạy một test case cụ thể
```bash
# Ví dụ: Chạy test case 1 trong bảng testcase
npm test tests/reviewRoutes.test.js -- --testNamePattern="TT 1"

# Ví dụ: Chạy test case 8 (thành công)
npm test tests/reviewRoutes.test.js -- --testNamePattern="TT 8"
```

---

## Test chức năng Sửa thông tin cửa hàng (Shop Manager Routes)

### Chạy tất cả test
```bash
npm test tests/shopManagerRoutes.test.js
# hoặc
npm run test:shop
```

### Chạy bảng testcase
```bash
npm run test:shop:testcase
# hoặc
npm test tests/shopManagerRoutes.test.js -- --testNamePattern="Bảng testcase"
```

### Chạy một test case cụ thể
```bash
# Ví dụ: Chạy test case 1
npm test tests/shopManagerRoutes.test.js -- --testNamePattern="Test Case 1"
```

---

## Lệnh chung

### Chạy tất cả test trong thư mục tests
```bash
npm test
```

### Chạy test với watch mode (tự động chạy lại khi có thay đổi)
```bash
npm run test:watch
```

### Chạy test với coverage report
```bash
npm run test:coverage
```

### Chạy test với verbose output
```bash
npm test -- --verbose
```

### Chạy test và chỉ hiển thị kết quả (không hiển thị console.log)
```bash
npm test -- --silent
```

---

## Ví dụ sử dụng

### Để lấy đầu ra thực tế cho bảng testcase:
```bash
# Chạy 8 test case trong bảng testcase
npm run test:review:testcase

# Kết quả sẽ hiển thị trong console:
# Test Case 1 - Đầu ra thực tế:
# Status: 400
# Message: Điểm hài lòng không được để trống
```

### Để test một chức năng cụ thể:
```bash
# Test validation điểm hài lòng
npm run test:review:rating-eq
npm run test:review:rating-boundary

# Test validation nhận xét
npm run test:review:comment-eq
npm run test:review:comment-boundary

# Test validation file ảnh
npm run test:review:image-eq
npm run test:review:image-boundary
```

