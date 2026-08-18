# 🛡️ Lá Chắn Gia Đình - Ứng Dụng Chống Lừa Đảo Trực Tuyến Cho Người Cao Tuổi

Ứng dụng hỗ trợ kiểm tra tin nhắn, hình ảnh lừa đảo qua trợ lý AI thông minh và đồng bộ cảnh báo an toàn thời gian thực giữa các thành viên trong gia đình.

---

## ⚡ Hướng dẫn Publish lên Vercel (Miễn phí 100%)

### Bước 1: Đẩy mã nguồn lên GitHub
1. Giải nén thư mục dự án `la-chan-gia-dinh.zip`.
2. Tạo một Repository mới trên [GitHub](https://github.com/new).
3. Tải toàn bộ mã nguồn lên GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - La Chan Gia Dinh"
   git branch -M main
   git remote add origin https://github.com/<tai-khoan-cua-ban>/<ten-repo>.git
   git push -u origin main
   ```

### Bước 2: Import vào Vercel
1. Đăng nhập [Vercel](https://vercel.com).
2. Bấm **"Add New..."** ➜ **"Project"**.
3. Chọn Repository vừa tạo trên GitHub và bấm **"Import"**.

### Bước 3: Cấu hình biến môi trường (Environment Variables)
Trong mục **Environment Variables** trên Vercel:
- **Key:** `GEMINI_API_KEY`
- **Value:** Điền mã API Key miễn phí từ [Google AI Studio](https://aistudio.google.com/apikey).

Sau đó bấm **"Deploy"** ➜ Sau khoảng 1 phút, bạn sẽ nhận được đường link web chính thức chạy 24/7 hoàn toàn miễn phí!

---

## 💻 Chạy cục bộ trên máy tính (Local Development)

1. Cài đặt các thư viện:
   ```bash
   npm install
   ```

2. Tạo file `.env` chứa Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Khởi chạy:
   ```bash
   npm run dev
   ```
   Truy cập tại: `http://localhost:3000`
