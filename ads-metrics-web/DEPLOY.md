# Deploy Prova Ads Metrics lên GitHub + Cloudflare

Dùng tài khoản Cloudflare / GitHub gắn với **nhn.mybmedia2025@gmail.com**  
(landing hiện tại: `votpickleball-prova` trên Pages).

---

## Cách A — Cùng repo landing (khuyến nghị, nhanh)

Repo: `nhnmybmedia2025-pixel/votpickleball-prova`  
Folder web app: **`ads-metrics-web/`**

### A1. Đẩy code lên GitHub

Trên máy (đã `git push` xong nhánh `main` có folder `ads-metrics-web`).

### A2. Tạo project Pages mới (tách với landing)

1. Đăng nhập https://dash.cloudflare.com (email `nhn.mybmedia2025@…`)
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. Chọn repo **`votpickleball-prova`**
4. Cấu hình build:

| Field | Giá trị |
|-------|---------|
| **Project name** | `prova-ads-metrics` |
| **Production branch** | `main` |
| **Root directory** | `ads-metrics-web` |
| **Build command** | *(để trống)* |
| **Build output directory** | `/` hoặc `.` |

5. **Save and Deploy**

URL sẽ dạng:  
`https://prova-ads-metrics.pages.dev`

> Landing vẫn là project cũ `votpickleball-prova` — **không** đổi root directory landing.

### A3. Thêm Environment variables (quan trọng)

Project **prova-ads-metrics** → **Settings** → **Environment variables**  
Thêm cho **Production** (và **Preview** nếu muốn):

| Name | Value | Encrypt? |
|------|--------|----------|
| `APP_PASSWORD` | mật khẩu bạn tự đặt (vd. chuỗi dài) | Yes (Secret) |
| `FB_ACCESS_TOKEN` | token `EAA…` | Yes (Secret) |
| `FB_AD_ACCOUNT_ID` | `act_1368401193726999` | No / Yes |
| `FB_CAMPAIGN_FILTER` | `prova` | No |
| `LANDING_URL` | `https://votpickleball-prova.pages.dev/` | No |
| `TIKTOK_ACCESS_TOKEN` | (khi có) | Yes |
| `TIKTOK_ADVERTISER_ID` | (khi có) | No |
| `TIKTOK_CAMPAIGN_FILTER` | `prova` | No |

Sau khi lưu secrets → **Deployments** → **Retry deployment** (hoặc push commit nhỏ) để Functions nhận env mới.

### A4. Mở web

1. Vào `https://prova-ads-metrics.pages.dev`
2. Nhập **APP_PASSWORD**
3. Chọn ngày → **Chạy báo cáo**

---

## Cách B — Repo riêng (tuỳ chọn)

1. Tạo repo mới `prova-ads-metrics` trên GitHub
2. Copy nội dung folder `ads-metrics-web/` lên root repo
3. Connect Pages, Root directory = `/` (để trống)
4. Gắn env như A3

---

## Kiểm tra sau deploy

### Health (không cần mật khẩu)

```
https://prova-ads-metrics.pages.dev/api/health
```

JSON mong đợi:

```json
{
  "ok": true,
  "facebook_configured": true,
  "tiktok_configured": false,
  "app_password_set": true
}
```

- `facebook_configured: false` → thiếu token / act_  
- `app_password_set: false` → chưa set `APP_PASSWORD` → web không login được  

### Metrics (có mật khẩu)

```bash
curl -s "https://prova-ads-metrics.pages.dev/api/metrics?days=7" \
  -H "X-App-Password: MAT_KHAU_CUA_BAN"
```

---

## Bảo mật

1. **Không** commit `.env` / `.dev.vars` / token vào Git  
2. Token đã lộ trong chat → **generate token FB mới** rồi dán vào Cloudflare  
3. `APP_PASSWORD` đủ dài, không dùng password Facebook  
4. Dashboard có `noindex` — vẫn **không public** password  
5. (Tuỳ chọn) Cloudflare → Access / Zero Trust chặn theo email

---

## Cập nhật code sau này

```bash
# sửa file trong ads-metrics-web/
git add ads-metrics-web
git commit -m "Update ads metrics web"
git push origin main
```

Cloudflare auto-deploy từ GitHub (giống landing).

---

## Lỗi thường gặp

| Hiện tượng | Cách xử lý |
|------------|------------|
| 404 `/api/metrics` | Root directory sai — phải là `ads-metrics-web` |
| `app_password_set: false` | Thêm `APP_PASSWORD` + redeploy |
| Sai mật khẩu | Đúng secret trên Cloudflare |
| Facebook permission error | Token / ad account / filter |
| TikTok skip | Chưa set token Marketing (không dùng Events token) |
| Deploy OK nhưng UI trắng | Xem tab Network; hard refresh |

---

## Liên hệ flow với landing

| URL | Mục đích |
|-----|----------|
| `votpickleball-prova.pages.dev` | Landing bán hàng |
| `prova-ads-metrics.pages.dev` | Dashboard metrics nội bộ |

Hai project Pages **cùng** account Cloudflare / GitHub, **khác** root directory (hoặc khác repo).
