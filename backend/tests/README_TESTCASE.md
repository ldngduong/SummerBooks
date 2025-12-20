# Hướng dẫn chạy test và điền bảng testcase

## Chạy test cho bảng testcase

Để chạy các test case trong bảng testcase và xem kết quả chi tiết:

```bash
cd backend
npm test -- tests/reviewRoutes.test.js -t "BẢNG TESTCASE"
```

Hoặc chạy tất cả test:
```bash
npm test
```

## Cách xem kết quả và điền vào bảng testcase

Khi chạy test, mỗi test case sẽ hiển thị:

### Đầu vào (Input):
- **a**: Điểm hài lòng
- **b**: Nhận xét  
- **c**: File ảnh

### Đầu ra thực tế (Actual Output):
- **Status Code**: Mã trạng thái HTTP (200, 201, 400, 413, 500, etc.)
- **Response Body**: Nội dung phản hồi từ server
- **Kết quả**: Thành công ✓ hoặc Thất bại ✗

## Bảng testcase mẫu

| TT | a (Điểm hài lòng) | b (Nhận xét) | c (File ảnh) | Kết quả mong đợi | Đầu ra thực tế |
|---|---|---|---|---|---|
| 1 | "" | "Sách rất hay!" | nhanxet.jpg | Thất bại | [Xem trong console khi chạy test] |
| 2 | 0 | "Sách rất hay!" | nhanxet.jpg | Thất bại | [Xem trong console khi chạy test] |
| 3 | 1.5 | "Sách rất hay!" | nhanxet.jpg | Thất bại | [Xem trong console khi chạy test] |
| 4 | 20 | "Sách rất hay!" | nhanxet.jpg | Thất bại | [Xem trong console khi chạy test] |
| 5 | 10 | "Sách rất hay... (600 ký tự)" | nhanxet.jpg | Thất bại | [Xem trong console khi chạy test] |
| 6 | 10 | "Sách rất hay" | nhanxet.htm | Thất bại | [Xem trong console khi chạy test] |
| 7 | 10 | "Sách rất hay" | nhanxet.png (50mb) | Thất bại | [Xem trong console khi chạy test] |
| 8 | 10 | "Sách rất hay" | nhanxet.jpg | Thành công | [Xem trong console khi chạy test] |

## Ví dụ kết quả test

Khi chạy test, bạn sẽ thấy output như sau:

```
=== TEST CASE 1 ===
Đầu vào:
  a (Điểm hài lòng): ""
  b (Nhận xét): "Sách rất hay!"
  c (File ảnh): nhanxet.jpg
Đầu ra thực tế:
  Status Code: 400
  Response Body: {
    "message": "Điểm hài lòng không được để trống"
  }
  Kết quả: Thất bại ✓
```

## Lưu ý

1. **Status Code**:
   - `201`: Thành công (tạo review thành công)
   - `400`: Thất bại (lỗi validation)
   - `413`: Thất bại (file quá lớn)
   - `500`: Thất bại (lỗi server)

2. **Response Body**: Chứa thông tin chi tiết về lỗi hoặc dữ liệu thành công

3. Để điền vào bảng testcase, copy thông tin từ console output:
   - Status Code
   - Message (nếu có)
   - Kết quả (Thành công/Thất bại)

