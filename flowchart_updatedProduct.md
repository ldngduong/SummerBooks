# Biểu đồ điều khiển của updatedProduct

## Luồng điều khiển từ điểm bắt đầu `const updatedProduct`

```
[Điểm 1: BẮT ĐẦU]
    ↓
┌─────────────────────────────────────────────┐
│ const updatedProduct = await product.save() │
│ (Dòng 286)                                  │
│                                             │
│ - Gọi phương thức save() trên object       │
│   product đã được cập nhật                 │
│ - Chờ kết quả trả về từ database           │
│ - Gán kết quả vào biến updatedProduct      │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ res.status(200).json(updatedProduct)       │
│ (Dòng 287)                                  │
│                                             │
│ - Trả về HTTP status code 200 (Success)    │
│ - Trả về JSON response chứa updatedProduct │
│   (product đã được lưu vào database)       │
└─────────────────────────────────────────────┘
    ↓
[KẾT THÚC]
```

## Luồng điều khiển đầy đủ (từ phần cập nhật product)

```
┌─────────────────────────────────────────────┐
│ [275-284] Cập nhật các trường của product  │
│                                             │
│ if (name !== undefined)                     │
│   └─> product.name = name                   │
│                                             │
│ if (description !== undefined)              │
│   └─> product.description = description     │
│                                             │
│ if (price !== undefined)                    │
│   └─> product.price = price                 │
│                                             │
│ if (countOfPage !== undefined)              │
│   └─> product.countOfPage = countOfPage     │
│                                             │
│ if (countInStock !== undefined)             │
│   └─> product.countInStock = countInStock   │
│                                             │
│ if (category !== undefined)                 │
│   └─> product.category = category           │
│                                             │
│ if (images !== undefined)                   │
│   └─> product.images = images               │
│                                             │
│ if (author !== undefined)                   │
│   └─> product.author = author               │
│                                             │
│ if (publishedAt !== undefined)              │
│   └─> product.publishedAt = publishedAt     │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ [Điểm 1] const updatedProduct =            │
│            await product.save()             │
│                                             │
│ - product object đã được cập nhật các      │
│   trường từ req.body (nếu được cung cấp)   │
│ - Lưu product vào MongoDB database         │
│ - MongoDB trả về document đã được lưu      │
│ - Gán vào biến updatedProduct              │
└─────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────┐
│ res.status(200).json(updatedProduct)       │
│                                             │
│ - Gửi HTTP response 200 OK                 │
│ - Body chứa updatedProduct (JSON)          │
└─────────────────────────────────────────────┘
    ↓
[KẾT THÚC - Response được gửi về client]
```

## Mermaid Diagram (có thể render trong Markdown viewer hỗ trợ)

\`\`\`mermaid
flowchart TD
    A["[Điểm 1] const updatedProduct = await product.save()<br/>(Dòng 286)"] --> B["product.save() được gọi<br/>Lưu product đã cập nhật vào DB"]
    B --> C["Chờ response từ MongoDB"]
    C --> D["MongoDB trả về document đã lưu"]
    D --> E["Gán kết quả vào updatedProduct"]
    E --> F["res.status(200).json(updatedProduct)<br/>(Dòng 287)"]
    F --> G["Gửi HTTP 200 response<br/>với JSON body chứa updatedProduct"]
    G --> H["[KẾT THÚC]"]
\`\`\`

## Chi tiết các bước:

### Điểm 1: `const updatedProduct = await product.save()`
- **Input**: `product` object đã được cập nhật (từ dòng 275-284)
- **Thao tác**: 
  - Gọi phương thức `.save()` trên Mongoose document
  - Await để chờ kết quả từ database
- **Output**: Document đã được lưu vào database (có thể có các trường auto-generated như timestamps)

### Điểm 2: `res.status(200).json(updatedProduct)`
- **Input**: `updatedProduct` từ điểm 1
- **Thao tác**:
  - Set HTTP status code = 200
  - Serialize `updatedProduct` thành JSON
  - Gửi response về client
- **Output**: HTTP response với status 200 và body là JSON của updatedProduct



