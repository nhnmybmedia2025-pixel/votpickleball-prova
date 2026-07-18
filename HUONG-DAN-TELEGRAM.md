# Báo đơn mới về Telegram (Prova Landing)

SĐT liên hệ shop: **0868.93.16.91**  
(Telegram **không** gửi theo số điện thoại — gửi theo **Chat ID** tài khoản Telegram của bạn.)

---

## Bước 1 — Tạo Bot Telegram (~2 phút)

1. Mở app Telegram → tìm **@BotFather**
2. Gõ `/newbot`
3. Đặt tên bot, ví dụ: `Prova Don Hang Bot`
4. Đặt username kết thúc bằng `bot`, ví dụ: `prova_donhang_bot`
5. BotFather trả về **token** dạng:
   ```
   7123456789:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
6. **Copy token** (giữ bí mật, không đưa lên GitHub)

---

## Bước 2 — Lấy Chat ID của bạn

### Cách A (dễ)

1. Mở bot vừa tạo → bấm **Start** / gõ `/start`
2. Mở trình duyệt:
   ```
   https://api.telegram.org/bot<TOKEN>/getUpdates
   ```
   (thay `<TOKEN>` bằng token thật)
3. Trong JSON, tìm `"chat":{"id": 123456789`  
   → số đó là **TELEGRAM_CHAT_ID** (có thể âm nếu là group)

### Cách B (trong Apps Script)

1. Nhắn `/start` cho bot
2. Apps Script → chạy function **`getTelegramUpdates`**
3. Xem **Executions / Logs** → copy `chat.id`

---

## Bước 3 — Gắn vào Google Apps Script

1. Sheet đơn hàng → **Tiện ích** → **Apps Script**
2. **Dán toàn bộ** file `google-apps-script/Code.gs` (bản mới có Telegram)
3. **Lưu**
4. Bánh răng **Project settings** → **Script properties** → Add:

| Property | Value |
|----------|--------|
| `TELEGRAM_BOT_TOKEN` | token từ BotFather |
| `TELEGRAM_CHAT_ID` | chat id của bạn |

5. **Deploy** → **Manage deployments** → ✏️ Edit → **New version** → **Deploy**  
   - Execute as: **Me**  
   - Who has access: **Anyone**

---

## Bước 4 — CẤP QUYỀN UrlFetch (bắt buộc)

**Triệu chứng:** Sheet có đơn, Telegram không báo.

**Nguyên nhân:** Apps Script chưa được cấp  
`https://www.googleapis.com/auth/script.external_request`

### Làm đúng thứ tự:
1. Dropdown function chọn **`testTelegram`**
2. Bấm **Run** (▶)
3. **Authorization required** → **Review permissions**
4. Chọn account Sheet → **Advanced** → **Go to … (unsafe)** → **Allow**
5. Executions: thành công + Telegram nhận tin
6. **Deploy** → Manage → ✏️ → **New version** → Deploy  
   (Me + Anyone)

### Test web
1. Hard refresh landing → điền form  
2. Sheet có dòng + Telegram có **ĐƠN MỚI**  

---

## Nội dung tin nhắn mẫu

```
🏓 ĐƠN MỚI – Prova Ultimate 3.5

⏰ 18/07/2026 22:30:00
👤 Nguyễn Văn A
📱 0901234567
🎨 Màu: Xanh mint
📍 123 Đường ABC, Q.1, HCM

📣 Nguồn: facebook / prova_t7

☎️ Gọi ngay: 0868.93.16.91
```

---

## Lỗi thường gặp

| Lỗi | Cách xử lý |
|-----|------------|
| Không nhận tin | Chưa `/start` bot; sai chat_id |
| 401 Unauthorized | Sai token |
| 400 chat not found | Chat ID sai / chưa Start bot |
| Sửa code không ăn | Quên **New version** Deploy |

---

## Bảo mật

- Không commit token lên Git public  
- Chỉ lưu trong **Script properties**  
- Có thể tạo bot riêng cho đơn hàng, không dùng bot cá nhân khác
