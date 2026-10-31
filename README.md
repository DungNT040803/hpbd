# 🎂 Happy Birthday - Chuyến Du Hành Ngân Hà Kỷ Niệm (3D Three.js)

Một trang web 3D chúc mừng sinh nhật lãng mạn và ấn tượng, được xây dựng với **Three.js**, **GSAP**, và **Web Audio API**.

---

## ✨ Điểm Nổi Bật

- 🌌 **Không gian Vũ Trụ 3D (Cosmic Galaxy):** Hơn 5.000 vì sao lấp lánh, tinh vân phát sáng và sao băng lướt qua bầu trời.
- 📸 **Dải Ngân Hà Kỷ Niệm (2019 - 2023+):** 
  - Toàn bộ 24 hình ảnh và video của bạn được tối ưu hóa sang định dạng WebP/MP4 mượt mà.
  - Sắp xếp dọc theo đường xoắn ốc không gian 3D.
  - Tương tác di chuột phóng to, click để mở modal xem ảnh độ phân giải cao và phát video.
- 🎂 **Chiếc Bánh Sinh Nhật 3D & Nghi Thức Thổi Nến:**
  - Bánh kem 3 tầng với nến cháy bập bùng và ánh sáng vàng ấm áp.
  - Nút **"Thổi Nến Ngay"**: nến tắt kèm hiệu ứng khói bay lên chân thực.
  - Ngay sau đó, **đại tiệc pháo hoa & hoa giấy (confetti)** rực rỡ bùng nổ khắp màn hình.
- 💌 **Bức Thư Tay Chúc Mừng Ẩn Giấu:** Phong bì thư mở ra với hiệu ứng chữ gõ máy (typewriter) mang lại cảm xúc sâu lắng.
- 🎵 **Âm Nhạc Vũ Trụ:** Tích hợp bộ tổng hợp âm thanh hộp nhạc (Music Box) chơi giai điệu *Happy Birthday* êm dịu, không lo lỗi bản quyền hay file hỏng.

---

## 🚀 Hướng Dẫn Chạy Thử Trên Máy (Local)

1. Mở terminal tại thư mục này và chạy:
   ```bash
   npm run dev
   ```
2. Mở trình duyệt tại địa chỉ: `http://localhost:3000` (hoặc cổng mà Vite thông báo).

---

## ✍️ Cách Tùy Chỉnh Lời Chúc & Tên Người Nhận

Mọi thông tin có thể chỉnh sửa trực tiếp trong file [`public/data/config.json`](file:///c:/Users/Admin/Pictures/HPBD/public/data/config.json):

```json
{
  "recipientName": "Thủy Tiên",
  "birthdayDate": "Special Day",
  "title": "Chuyến Du Hành Ngân Hà Kỷ Niệm",
  "subtitle": "Mỗi khoảnh khắc bên nhau đều là một vì sao sáng lấp lánh",
  "letter": {
    "title": "Gửi Người Đặc Biệt Nhất Trong Ngân Hà 💖",
    "greeting": "Chúc mừng sinh nhật, Tiên!",
    "body": [
      "Hôm nay là một ngày vô cùng đặc biệt...",
      "..."
    ],
    "closing": "Mãi yêu thương & trân trọng,",
    "signature": "Người luôn bên cạnh bạn 💫"
  }
}
```

---

## 🌐 Hướng Dẫn Deploy Lên GitHub Pages (Miễn Phí)

### Cách 1: Tự động qua GitHub Actions (Được khuyến nghị nhất)

1. Tạo một repository mới trên GitHub (ví dụ: đặt tên là `HPBD`).
2. Liên kết thư mục dự án với GitHub và đẩy code lên:
   ```bash
   git add .
   git commit -m "feat: 3D birthday celebration galaxy website"
   git remote add origin https://github.com/<tai-khoan-github-cua-ban>/HPBD.git
   git branch -M main
   git push -u origin main
   ```
3. Trên GitHub, vào mục **Settings** của repository $\rightarrow$ chọn **Pages** (cột bên trái).
4. Tại mục **Build and deployment** $\rightarrow$ **Source**, chọn:
   **GitHub Actions**
5. Chờ khoảng 1-2 phút, GitHub Actions sẽ tự động build và cung cấp link trang web cho bạn:
   `https://<tai-khoan-github-cua-ban>.github.io/HPBD/`

---

### Cách 2: Deploy bằng lệnh 1-click (`gh-pages`)

Nếu bạn đã cài GitHub CLI hoặc đã liên kết git remote:
```bash
npm run deploy
```
Lệnh này sẽ tự động build và đẩy thư mục `dist/` lên nhánh `gh-pages` của GitHub.

---

Chúc bạn có một món quà sinh nhật thật ý nghĩa và trọn vẹn! 🎉✨
