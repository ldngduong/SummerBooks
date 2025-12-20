# Biểu đồ luồng điều khiển - Delete Product Route

## Code được đánh số (bắt đầu từ dòng const):

```
[1] const product = await Product.findById(req.params.id);
[2] if (product) {
[3]   await product.deleteOne();
[4]   res.status(200).json(product);
[5] } else {
[6]   res.status(404).json({ message: "Sản phẩm không tồn tại" });
[7] } catch (error) {
[8]   console.log(error);
[9]   res.status(500).send(error);
}
```

## Biểu đồ luồng điều khiển (Mermaid):

```mermaid
flowchart TD
    Start([Bắt đầu: DELETE /api/products/:id]) --> Try[try block]
    Try --> Step1["[1] const product = await Product.findById(req.params.id)"]
    Step1 --> CheckError{Error xảy ra?}
    
    CheckError -->|Có| Catch["[7] catch (error)"]
    Catch --> Step8["[8] console.log(error)"]
    Step8 --> Step9["[9] res.status(500).send(error)"]
    Step9 --> End1([Kết thúc: Lỗi 500])
    
    CheckError -->|Không| Step2{"[2] if (product)"}
    
    Step2 -->|product tồn tại| Step3["[3] await product.deleteOne()"]
    Step3 --> Step4["[4] res.status(200).json(product)"]
    Step4 --> End2([Kết thúc: Thành công 200])
    
    Step2 -->|product không tồn tại| Step5["[5] res.status(404).json({ message: 'Sản phẩm không tồn tại' })"]
    Step5 --> End3([Kết thúc: Không tìm thấy 404])
    
    style Start fill:#e1f5ff
    style End1 fill:#ffcccc
    style End2 fill:#ccffcc
    style End3 fill:#fff4cc
    style Step1 fill:#f0f0f0
    style Step2 fill:#e6f3ff
    style Step3 fill:#f0f0f0
    style Step4 fill:#ccffcc
    style Step5 fill:#fff4cc
    style Catch fill:#ffcccc
    style Step8 fill:#ffcccc
    style Step9 fill:#ffcccc
```

## Mô tả luồng điều khiển:

1. **Bắt đầu**: Route handler nhận request DELETE `/api/products/:id`
2. **Bước [1]**: Tìm sản phẩm theo ID từ database
3. **Kiểm tra lỗi**: 
   - Nếu có lỗi → chuyển sang catch block
   - Nếu không có lỗi → tiếp tục kiểm tra product
4. **Bước [2]**: Kiểm tra xem product có tồn tại không
   - **Nếu product tồn tại**:
     - **Bước [3]**: Xóa sản phẩm khỏi database
     - **Bước [4]**: Trả về response 200 với thông tin sản phẩm đã xóa
   - **Nếu product không tồn tại**:
     - **Bước [5]**: Trả về response 404 với thông báo "Sản phẩm không tồn tại"
5. **Xử lý lỗi (catch block)**:
   - **Bước [8]**: Ghi log lỗi ra console
   - **Bước [9]**: Trả về response 500 với thông tin lỗi

## Các trường hợp kết thúc:

- ✅ **200 OK**: Xóa sản phẩm thành công
- ⚠️ **404 Not Found**: Sản phẩm không tồn tại
- ❌ **500 Internal Server Error**: Lỗi server khi thực hiện thao tác



