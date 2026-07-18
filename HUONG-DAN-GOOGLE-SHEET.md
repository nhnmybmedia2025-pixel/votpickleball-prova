# Kết nối form → Google Sheet (Prova Landing)

Site: https://votpickleball-prova.pages.dev/

## Tổng quan

```
Khách điền form trên landing
        ↓
JavaScript gửi dữ liệu (POST)
        ↓
Google Apps Script (Web App)
        ↓
Dòng mới trong Google Sheet
```

---

## Bước 1 — Tạo Google Sheet

1. Vào https://sheets.google.com → **Blank spreadsheet**
2. Đặt tên file: `Prova Ultimate 3.5 - Don hang`
3. (Tuỳ chọn) Đổi tên tab thành `DonHang`

---

## Bước 2 — Gắn Apps Script

1. Trong Sheet: **Extensions** → **Apps Script**
2. Xóa code mẫu, dán toàn bộ nội dung file:
   `google-apps-script/Code.gs`
3. **Save** (Ctrl/Cmd + S), đặt tên project: `Prova Form API`

---

## Bước 3 — Deploy Web App

1. **Deploy** → **New deployment**
2. Biểu tượng bánh răng ⚙️ → chọn **Web app**
3. Cấu hình:
   - **Description:** `v1 form don hang`
   - **Execute as:** **Me** (email của bạn)
   - **Who has access:** **Anyone**
4. **Deploy**
5. Lần đầu: **Authorize access** → chọn Google account → Advanced → Go to … → Allow
6. **Copy** URL dạng:
   `https://script.google.com/macros/s/AKfycb.../exec`

⚠️ Mỗi lần sửa code script phải **Deploy → Manage deployments → Edit (bút) → New version → Deploy** để URL nhận code mới.

---

## Bước 4 — Dán URL vào landing page

Mở `index.html`, tìm:

```js
const GOOGLE_SCRIPT_URL = 'PASTE_YOUR_WEB_APP_URL_HERE';
```

Thay bằng URL vừa copy, ví dụ:

```js
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbXXXX/exec';
```

Commit + push:

```bash
cd "/Users/macbook/Downloads/Landing page pickleball"
git add index.html
git commit -m "Connect form to Google Sheets"
git push
```

Cloudflare tự deploy ~1 phút.

---

## Bước 5 — Test

1. Mở https://votpickleball-prova.pages.dev/#form-section
2. Điền form test → **Xác nhận đặt hàng**
3. Mở Google Sheet → thấy 1 dòng mới (thời gian, tên, SĐT, màu, địa chỉ + UTM)

---

## Cột trong Sheet

| Cột | Ý nghĩa |
|-----|---------|
| Thời gian | Lúc gửi form |
| Họ tên | |
| Số điện thoại | |
| Màu vợt | |
| Địa chỉ | |
| utm_source | facebook / tiktok / ... |
| utm_campaign | Tên campaign ads |
| utm_medium | cpc / paid_social |
| fbclid | Click ID Facebook |
| ttclid | Click ID TikTok |
| User Agent | Thiết bị trình duyệt |
| Trang | URL lúc submit |

### Link ads mẫu

Facebook:
```
https://votpickleball-prova.pages.dev/?utm_source=facebook&utm_medium=paid_social&utm_campaign=prova_t7
```

TikTok:
```
https://votpickleball-prova.pages.dev/?utm_source=tiktok&utm_medium=paid_social&utm_campaign=prova_t7
```

---

## Pixel Facebook / TikTok (tuỳ chọn)

Sau khi form gửi **thành công**, landing bắn event:

- `fbq('track', 'Lead')` — nếu đã gắn Meta Pixel
- `ttq.track('SubmitForm')` — nếu đã gắn TikTok Pixel

Chèn Pixel ID vào phần `<!-- PIXELS -->` trong `index.html` (xem comment trong file).

---

## Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| Sheet không có dòng mới | Kiểm tra URL Web App, Who has access = Anyone, đã Authorize |
| Sửa script nhưng không ăn | Deploy lại **New version** |
| CORS / failed fetch | Dùng `Content-Type: text/plain` (đã có trong code landing) |
| Báo lỗi URL chưa cấu hình | Chưa thay `PASTE_YOUR_WEB_APP_URL_HERE` |
