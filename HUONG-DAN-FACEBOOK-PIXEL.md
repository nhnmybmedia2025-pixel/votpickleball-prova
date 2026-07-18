# Facebook Pixel + Trang cảm ơn (chuyển đổi Lead)

Site: https://votpickleball-prova.pages.dev/

## Luồng đo lường chuẩn

```
Quảng cáo Facebook
    ↓  (có fbclid / UTM)
Landing: index.html          → Pixel: PageView
    ↓  điền form + gửi
Google Sheet (lưu lead)
    ↓  redirect
Thank you: thank-you.html    → Pixel: PageView + Lead  ★ = 1 chuyển đổi
    ↓
Meta Ads tối ưu sự kiện Lead
```

**Không bắn Lead trên landing** (tránh đếm ảo khi khách chỉ xem trang).  
**Chỉ bắn Lead trên trang cảm ơn** sau khi form gửi thành công.

---

## Bước 1 — Lấy Pixel ID

1. Vào [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Chọn **Data sources** → **Pixels** (hoặc tạo Pixel mới)
3. Copy **Pixel ID** (chuỗi số, ví dụ `1234567890123456`)

---

## Bước 2 — Dán Pixel ID vào code

Mở file `assets/tracking-config.js`:

```js
window.PROVA_TRACKING = {
  META_PIXEL_ID: '1234567890123456',  // ← dán ID thật
  TIKTOK_PIXEL_ID: ''
};
```

Commit + push (hoặc nhờ agent) để Cloudflare deploy.

---

## Bước 3 — Kiểm tra Pixel

1. Cài extension Chrome: **Meta Pixel Helper**
2. Mở https://votpickleball-prova.pages.dev/  
   → Helper hiện **PageView** (màu xanh)
3. Điền form test → sang trang cảm ơn  
   → Helper hiện **PageView** + **Lead**
4. Events Manager → **Test events** (có thể dán URL / bật test) → thấy Lead realtime

---

## Bước 4 — Tạo chiến dịch chuyển đổi trên Ads Manager

1. **Create** → **Sales** hoặc **Leads** (khuyến nghị **Leads** / **Engagement → Lead form** không dùng; dùng **Website**)
2. Conversion location: **Website**
3. Pixel: chọn pixel Prova
4. Conversion event: **Lead** (Standard event)
5. Website URL ads:
   ```
   https://votpickleball-prova.pages.dev/?utm_source=facebook&utm_medium=paid_social&utm_campaign=ten_campaign
   ```
6. **Không** trỏ ads thẳng vào `thank-you.html` (tránh Lead ảo)

### Domain verify (nên làm)

Events Manager → Settings → **Domains** → thêm `votpickleball-prova.pages.dev`  
(Cloudflare Pages: meta-tag hoặc DNS — làm theo hướng dẫn Meta)

---

## URL quan trọng

| Trang | URL | Event |
|-------|-----|--------|
| Landing | `/` hoặc `/index.html` | PageView |
| Cảm ơn | `/thank-you.html` | PageView + **Lead** |

Custom Conversion (tuỳ chọn, nếu không dùng standard Lead):
- Rule: URL contains `thank-you.html`
- Event: Lead / CompleteRegistration

---

## Troubleshooting

| Vấn đề | Xử lý |
|--------|--------|
| Pixel Helper không thấy pixel | Chưa dán đúng META_PIXEL_ID / chưa deploy |
| Có PageView nhưng không Lead | Form lỗi / chưa redirect thank-you / chặn adblock |
| Lead bị đếm 2 lần | Đã chặn bằng sessionStorage; không bắn Lead thêm trên index |
| Ads không tối ưu được Lead | Chờ 50+ events hoặc dùng standard event Lead đúng tên |

---

## Lưu ý pháp lý / iOS

- Meta có thể cần **Consent** (tuỳ khu vực). VN thường chạy được với pixel chuẩn.
- Nên bật **Aggregated Event Measurement** cho domain sau khi verify.
