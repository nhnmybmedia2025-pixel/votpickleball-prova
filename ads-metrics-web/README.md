# Prova Ads Metrics (Web)

Web app báo cáo **Facebook + TikTok Ads** cho landing  
https://votpickleball-prova.pages.dev/

Chạy trên **Cloudflare Pages + Functions** (không cần server Python).

## Tính năng

- Đăng nhập bằng mật khẩu (`APP_PASSWORD`)
- Kéo spend / impressions / clicks / CTR / CPC / leads pixel
- Lọc theo khoảng ngày + platform
- Bảng theo campaign + theo ngày
- Tải CSV

## Cấu trúc

```
ads-metrics-web/
  index.html           # UI
  assets/              # CSS + JS client
  functions/
    api/health.js      # GET /api/health
    api/metrics.js     # GET /api/metrics (cần mật khẩu)
    _shared/           # FB / TikTok / auth / summary
  wrangler.toml
  .env.example
  DEPLOY.md            # Hướng dẫn GitHub + Cloudflare
```

## Biến môi trường (bắt buộc trên Cloudflare)

| Tên | Mô tả |
|-----|--------|
| `APP_PASSWORD` | Mật khẩu mở dashboard |
| `FB_ACCESS_TOKEN` | Token Marketing API |
| `FB_AD_ACCOUNT_ID` | `act_…` |
| `FB_CAMPAIGN_FILTER` | vd. `prova` |
| `TIKTOK_ACCESS_TOKEN` | (tuỳ chọn) |
| `TIKTOK_ADVERTISER_ID` | (tuỳ chọn) |
| `TIKTOK_CAMPAIGN_FILTER` | vd. `prova` |
| `LANDING_URL` | URL landing |

**Không commit token.** Dùng Cloudflare → Settings → Variables and Secrets.

## Deploy

Xem **[DEPLOY.md](./DEPLOY.md)** (GitHub + Cloudflare Pages, account `nhn.mybmedia2025@gmail.com`).

## Local (tuỳ chọn)

```bash
cd ads-metrics-web
cp .env.example .dev.vars   # điền token + password
npx wrangler pages dev . --compatibility-date=2024-11-01
```

Mở http://localhost:8788

## CLI Python (cũ)

Vẫn nằm ở `../ads-metrics-tool/` nếu cần chạy terminal local.
