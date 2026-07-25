# Meta CRM + Conversions API (Prova) — đồng bộ với Pixel mới

Kết nối: **Form landing → Google Sheet (Apps Script) → Meta Graph API** (sự kiện **Lead** server-side / CRM)

| | ID |
|--|-----|
| **Pixel browser** (đã live) | `1032930589212752` |
| **META_DATASET_ID** (CAPI) | **`1032930589212752`** (thường = Pixel ID) |
| ~~Dataset cũ~~ | ~~`1700938823637870`~~ — **không dùng** với pixel mới |

> **Không** dán URL landing / CAPIG vào màn “Cổng API Chuyển đổi”.  
> CRM dùng **Access Token + Dataset/Pixel ID** gửi Graph API từ Apps Script.

---

## Hai lớp đo lường (chuẩn tối ưu ads)

| Lớp | Nơi bắn | Event | Mục đích |
|-----|---------|--------|----------|
| **1. Browser Pixel** | `thank-you.html` | PageView + **Lead** | Nhanh, realtime |
| **2. CRM / CAPI** | Apps Script sau khi form vào Sheet | **Lead** (`action_source: system_generated`) | Bù adblock / iOS, quality matching |

Ads tối ưu event **Lead** — hai lớp **cùng tên event** + cùng dataset/pixel → Meta gộp tốt hơn.

```
Ads → Landing (PageView browser)
        → Form OK → Sheet + Telegram
                 → thank-you (Lead browser)
                 → Apps Script (Lead CAPI/CRM)
```

---

## Bước 1 — Lấy Dataset ID (pixel mới)

1. Vào [Meta Events Manager](https://business.facebook.com/events_manager2)
2. Chọn đúng nguồn dữ liệu / Pixel **`1032930589212752`**
3. **Cài đặt** (Settings) của nguồn đó → tìm **ID tập dữ liệu / Dataset ID / Pixel ID**
4. Copy dãy số — **thường trùng Pixel ID**: `1032930589212752`

Nếu Settings chỉ hiện một ID (Pixel ID) → dùng luôn ID đó cho `META_DATASET_ID`.

---

## Bước 2 — Tạo Access Token (cho đúng pixel/dataset)

Trong Events Manager, với **pixel `1032930589212752`**:

1. Vào **Cài đặt** → phần **Conversions API** / **Tạo mã truy cập**  
   hoặc luồng **Gửi sự kiện từ CRM / partner**
2. **Generate access token** / **Tạo mã truy cập**
3. Copy token (dài, thường bắt đầu `EAA...`)
4. **Chỉ lưu trong Apps Script properties** — không commit GitHub, không dán landing

Token gắn **Business / pixel cũ** sẽ lỗi hoặc bắn nhầm dataset → **tạo token mới** trên pixel mới.

---

## Bước 3 — (Tuỳ chọn) Mã Test events

1. Events Manager → pixel mới → tab **Test events** / **Sự kiện thử nghiệm**
2. Copy **Test event code** (vd. `TEST12345`)
3. Dùng tạm khi test CAPI; **xóa** property khi chạy ads thật (tránh event chỉ vào Test)

---

## Bước 4 — Cấu hình Google Apps Script

1. Mở **Google Sheet đơn hàng** Prova  
2. **Tiện ích** → **Apps Script**
3. Dán / cập nhật code từ file repo: `google-apps-script/Code.gs` (có `testMetaLead`)
4. **Lưu** (Ctrl/Cmd+S)
5. Menu bánh răng **Project Settings** (trái) → **Script properties** → chỉnh:

| Property | Value | Bắt buộc |
|----------|--------|----------|
| `META_ACCESS_TOKEN` | Token `EAA...` vừa tạo | **Có** |
| `META_DATASET_ID` | `1032930589212752` | **Có** (đổi từ `1700938823637870`) |
| `META_TEST_EVENT_CODE` | Mã Test events (tạm) | Tuỳ chọn khi test |

6. **Deploy** → **Manage deployments** → ✏️ **Edit** → **New version** → **Deploy**  
   - Execute as: **Me**  
   - Who has access: **Anyone** (để form web gọi được)

> Chỉ sửa Script properties **không** cần redeploy.  
> **Sửa code** `Code.gs` → **bắt buộc** New version + Deploy.

---

## Bước 5 — Test CAPI trong Apps Script

1. Trong editor Apps Script, chọn function **`testMetaLead`** → **Run**
2. Lần đầu: **Allow** / cấp quyền UrlFetch
3. **Executions** hoặc **View → Logs**:

**Thành công (gần đúng):**
```json
{"ok":true,"http":200,"body":"{...}"}
```

**Hay gặp lỗi:**

| Lỗi | Nguyên nhân | Xử lý |
|-----|-------------|--------|
| `Chưa set META_ACCESS_TOKEN` | Chưa thêm property | Thêm token |
| HTTP 190 / invalid token | Token sai/hết hạn | Tạo token mới |
| HTTP 400 / invalid parameter | Dataset ID sai | Dùng `1032930589212752` |
| HTTP 403 | Token không quyền dataset | Token tạo đúng pixel/BM |

4. Events Manager → **Test events** (nếu đã set `META_TEST_EVENT_CODE`)  
   → thấy **Lead** (server / CRM), không chỉ browser.

---

## Bước 6 — Test end-to-end từ landing

1. Mở https://votpickleball-prova.pages.dev/  
2. Điền form (SĐT thật/test) → vào **thank-you**
3. Kiểm tra:
   - [ ] Sheet có dòng mới  
   - [ ] Pixel Helper: **Lead** (browser)  
   - [ ] Events Manager: **Lead** (browser + CAPI nếu token đúng)  
4. Xóa `META_TEST_EVENT_CODE` sau khi test xong.

---

## Bước 7 — Ads Manager

| Mục | Giá trị |
|-----|---------|
| Pixel / Dataset | `1032930589212752` |
| Event tối ưu | **Lead** |
| URL ads | Landing (không trỏ thank-you) |

Sau khi có traffic: theo dõi **Event Match Quality** (EMQ) trong Events Manager — CAPI + `ph` hash + `fbc`/`fbp` giúp EMQ cao hơn chỉ pixel.

---

## Checklist đồng bộ CRM (pixel mới)

- [ ] Pixel browser live = `1032930589212752`  
- [ ] `META_DATASET_ID` = `1032930589212752` (không còn `1700938823637870`)  
- [ ] `META_ACCESS_TOKEN` mới, gắn đúng pixel  
- [ ] `testMetaLead` → `ok: true`  
- [ ] Form landing → Sheet + Lead (browser + CAPI)  
- [ ] Đã Deploy New version nếu sửa code  
- [ ] Xóa `META_TEST_EVENT_CODE` khi chạy ads thật  

---

## Bảo mật

- **Không** dán Access Token vào `index.html` / Git public.  
- Chỉ **Script properties**.  
- Token lộ → revoke trên Meta + tạo token mới.

---

## Payload CAPI (tham khảo)

```json
{
  "data": [{
    "event_name": "Lead",
    "event_time": 1710000000,
    "action_source": "system_generated",
    "custom_data": {
      "event_source": "crm",
      "lead_event_source": "Prova Landing CRM",
      "content_name": "Prova Ultimate 3.5",
      "currency": "VND",
      "value": 1060000
    },
    "user_data": {
      "ph": ["<sha256 SĐT 84...>"],
      "fn": ["<sha256>"],
      "ln": ["<sha256>"],
      "fbc": "fb.1....fbclid...",
      "client_user_agent": "..."
    }
  }]
}
```

Endpoint:

```text
POST https://graph.facebook.com/v25.0/{META_DATASET_ID}/events?access_token=...
```
