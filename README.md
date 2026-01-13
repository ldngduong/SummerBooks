# 📚 Summerbooks - Hệ thống bán sách trực tuyến

> Bài tập lớn môn **Phát triển dự án phần mềm**  
> Nhóm 1 - Lớp 64KTPM5 - Trường Đại học Thủy Lợi

## 📖 Giới thiệu

**Summerbooks** là hệ thống thương mại điện tử chuyên về sách, được xây dựng với kiến trúc full-stack hiện đại. Dự án cung cấp trải nghiệm mua sắm trực tuyến hoàn chỉnh với giao diện thân thiện, quản lý giỏ hàng thông minh và hệ thống quản trị mạnh mẽ.

## 🌐 Demo

- **🖥️ Frontend**: [https://summer-books.vercel.app](https://summer-books.vercel.app)
- **⚙️ Backend API**: [https://summer-books-backend.vercel.app](https://summer-books-backend.vercel.app)
- **💻 GitHub Repository**: [https://github.com/ldngduong/SummerBooks](https://github.com/ldngduong/SummerBooks)

## 🛠️ Công nghệ sử dụng

### Frontend
- **React.js** - Thư viện xây dựng giao diện
- **Redux Toolkit** - Quản lý state toàn cục
- **Tailwind CSS** - Framework CSS utility-first
- **Axios** - HTTP client để gọi API

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Web framework
- **MongoDB** - Cơ sở dữ liệu NoSQL
- **JWT** - Xác thực và phân quyền
- **Cloudinary** - Lưu trữ và quản lý hình ảnh

### DevOps & Deployment
- **Vercel** - Triển khai và hosting
- **Git/GitHub** - Quản lý mã nguồn và version control

## ✨ Tính năng chính

### 👤 Dành cho Người dùng

- ✅ Đăng ký tài khoản và đăng nhập
- 🔍 Tìm kiếm và duyệt sách theo danh mục
- 🛒 Thêm sách vào giỏ hàng
- 📝 Quản lý giỏ hàng (thêm/xóa/cập nhật số lượng)
- 💳 Đặt hàng với phương thức thanh toán COD
- 📦 Theo dõi trạng thái đơn hàng
- 📜 Xem lịch sử đơn hàng

### 👨‍💼 Dành cho Quản trị viên

- 📚 Quản lý sách (thêm/sửa/xóa)
- 📊 Quản lý đơn hàng (xem/cập nhật trạng thái)
- 👥 Quản lý người dùng
- 📈 Dashboard thống kê (nếu có)

## 🏗️ Kiến trúc hệ thống
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │◄───────►│  Express API    │◄───────►│    MongoDB      │
│                 │   HTTP  │                 │  Mongoose│                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│   Redux Store   │         │   Cloudinary    │
│  (State Mgmt)   │         │  (Image Storage)│
└─────────────────┘         └─────────────────┘
```

## 🚀 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js >= 14.x
- MongoDB
- npm hoặc yarn

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## 📁 Cấu trúc thư mục
```
SummerBooks/
├── frontend/           # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── redux/
│   │   └── utils/
│   └── public/
├── backend/            # Express API
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
└── README.md
```

## 👥 Thành viên nhóm

| Họ và tên | Vai trò | 
|-----------|---------|
| Lê Tùng Dương | Team Leader, Backend Developer |
| Nguyễn Trà Giang | Frontend Developer |
| Nguyễn Bảo Chung | Frontend Developer |
| Lê Trí Đức | Backend Developer |

## 🎯 Mục tiêu dự án

- Áp dụng kiến thức lý thuyết vào thực tế
- Phát triển kỹ năng làm việc nhóm
- Làm quen với quy trình phát triển phần mềm chuyên nghiệp
- Xây dựng sản phẩm hoàn chỉnh có thể triển khai thực tế

## 📝 Tài liệu tham khảo

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com)
- [Redux Toolkit](https://redux-toolkit.js.org)

## 🙏 Lời cảm ơn

Nhóm xin chân thành cảm ơn **Thầy/Cô giáo hướng dẫn** đã tận tình chỉ bảo và hỗ trợ trong suốt quá trình thực hiện bài tập lớn. Dự án này là cơ hội quý báu giúp chúng em rèn luyện kỹ năng chuyên môn, làm việc nhóm và phát triển sản phẩm phần mềm hoàn chỉnh.

---

<div align="center">

**🎓 Summerbooks - Nhóm 1 | 64KTPM5 | Trường Đại học Thủy Lợi**

Made with ❤️ by Team 1

⭐ Nếu thấy hữu ích, hãy cho dự án một star nhé!

</div>
