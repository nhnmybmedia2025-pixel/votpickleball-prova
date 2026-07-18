# Meta CRM Events + Conversions API (Prova)

Kết nối: **Form landing → Google Sheet → Meta API** (sự kiện Lead CRM)

Dataset ID (từ Events Manager của bạn): `1700938823637870`  
Pixel browser: `4340331656281072`

---

## Hai lớp đo lường (đúng chuẩn)

| Lớp | Cách | Event |
|-----|------|--------|
| **1. Browser Pixel** | `thank-you.html` | PageView + Lead |
| **2. CRM / CAPI** | Google Apps Script → Graph API | Lead (`action_source: system_generated`) |

Layer 2 = màn hình **“Gửi sự kiện CRM”** bạn đang xem trên Meta.

---

## Bước A — Tạo mã truy cập (Access Token)

Trong Events Manager → **Gửi sự kiện CRM** / **Tích hợp**:

1. Bấm **Tạo mã truy cập** (Generate access token)
2. Copy token (dạng dài, bắt đầu `EAA...`)
3. **Lưu riêng**, không public lên GitHub / frontend

---

## Bước B — Gắn token vào Apps Script

1. Mở Google Sheet đơn hàng → **Tiện ích** → **Apps Script**
2. **Xóa code cũ**, dán toàn bộ file `google-apps-script/Code.gs` (bản mới)
3. **Lưu** (Ctrl/Cmd+S)
4. Bánh răng **Project Settings** (trái) → **Script properties** → **Add script property**:

| Property | Value |
|----------|--------|
| `META_ACCESS_TOKEN` | *(token vừa copy)* |
| `META_DATASET_ID` | `1700938823637870` |
| `META_TEST_EVENT_CODE` | *(tuỳ chọn – mã Test events, xóa khi chạy ads thật)* |

5. **Deploy** → **Manage deployments** → ✏️ Edit → **New version** → **Deploy**  
   - Execute as: **Me**  
   - Who has access: **Anyone**

---

## Bước C — Test

### 1) Test trong Apps Script
- Chọn function `testMetaLead` → **Run** → cho phép quyền  
- **Executions** / **Logs**: thấy `ok: true` hoặc body JSON Meta

### 2) Test từ landing
1. Mở https://votpickleball-prova.pages.dev/  
2. Điền form → trang cảm ơn  
3. Sheet có dòng mới  
4. Events Manager → **Test events** / Overview → event **Lead** (CRM)

---

## Payload gửi lên Meta (rút gọn)

```json
{
  "data": [{
    "event_name": "Lead",
    "event_time": 1710000000,
    "action_source": "system_generated",
    "custom_data": {
      "event_source": "crm",
      "lead_event_source": "Prova Landing CRM"
    },
    "user_data": {
      "ph": ["<sha256 số ĐT chuẩn 84...>"],
      "fn": ["<sha256 tên>"],
      "ln": ["<sha256 họ>"],
      "fbc": "fb.1....fbclid...",
      "client_user_agent": "..."
    }
  }]
}
```

- SĐT được **chuẩn hoá** `09xx` → `849xx` rồi **SHA256** (Meta bắt buộc).  
- `lead_id` Meta (15–17 số) chỉ có khi lead từ **Lead Ads** form Meta — form website **không bắt buộc**.

---

## Ads Manager

- Tối ưu **Lead** (pixel + CAPI cùng event name).  
- URL ads: landing (không trỏ thank-you).  
- Sau khi đủ event, bật **Aggregated Event Measurement** cho domain.

---

## Bảo mật

- **Không** dán Access Token vào `index.html` / Git public.  
- Chỉ lưu trong **Script properties** (Apps Script).  
- Nếu token lộ: revoke + tạo token mới trên Meta.
