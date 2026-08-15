# SYSTEM.md — Bộ nhớ hệ thống dự án Prova Pickleball

> **Đọc file này đầu mỗi phiên làm việc mới.**  
> Cập nhật mục *Changelog phiên* khi có thay đổi quan trọng (URL, pixel, giá, deploy).

**Cập nhật lần cuối:** 2026-07-30  
**Repo landing:** `nhnmybmedia2025-pixel/votpickleball-prova`  
**Workspace:** `/Users/macbook/Downloads/Landing page pickleball`

---

## 1. Dự án là gì?

Funnel bán **vợt pickleball Prova Ultimate 3.5** qua **Facebook / TikTok ads**:

```
Ads → Landing (A hoặc B) → Form lead
    → Google Apps Script → Sheet + Telegram (+ Meta CAPI / TikTok Events)
    → /thank-you (pixel Lead)
         ├─ Path A: Gọi hotline
         └─ Path B: TikTok @votpickleballprova
```

Không phải app fullstack: **static HTML** trên Cloudflare Pages + **Apps Script** backend form.

---

## 2. URL production (quan trọng)

| Thành phần | URL |
|------------|-----|
| **LP-A** (ads flash) | https://votpickleball-prova.pages.dev/ |
| **LP-B** (PDP trust) | https://votpickleball-prova.pages.dev/b/ |
| **Thank-you** | https://votpickleball-prova.pages.dev/thank-you |
| **GitHub** | https://github.com/nhnmybmedia2025-pixel/votpickleball-prova |
| **TikTok shop** | https://www.tiktok.com/@votpickleballprova |
| **Brand web** | https://provasport.vn |
| **Hotline** | 0868.93.16.91 |

### Form Web App (Apps Script)

```
https://script.google.com/macros/s/AKfycbwSUhqIWt6cl4HH1iCDAhhoJ5eJtYLOS8xqb4rWG8erfimmL3BSy2pkttSSdHHwQE6X3w/exec
```

- Landing POST `no-cors`, `Content-Type: text/plain` + JSON body.  
- Đổi script → **Deploy New version** + cập nhật URL trong `index.html` và `b/index.html`.

### Ads Metrics Hub (repo riêng)

| | |
|--|--|
| Local | `/Users/macbook/Downloads/ads-metrics-hub` |
| GitHub | `nhnmybmedia2025-pixel/ads-metrics-hub` |
| Live | https://ads-metrics-hub.pages.dev |
| Ghi chú | Tool **đa dự án**, không gắn 1 landing; Prova chỉ là 1 project config |

---

## 3. Sản phẩm & brand (không được sai)

### Offer

| Mục | Giá trị |
|-----|---------|
| Sản phẩm | Prova Ultimate 3.5 |
| Giá sale | **990.000đ** |
| Giá niêm yết | **1.200.000đ** |
| Giảm | ~18% (tiết kiệm 210.000đ) |
| Combo | Mũ + áo + khăn + hộp bóng + 2 tất + cuốn cán + dán viền |
| BH / đổi | BH 12 tháng · Đổi 7 ngày · Free ship · Giao 2–4 ngày |

### Màu thương hiệu Prova

| Token | Hex | Dùng cho |
|-------|-----|----------|
| Brand red | **`#E30613`** | Logo, CTA, badge UI |
| Brand hover | `#C00510` | Hover nút |
| Dark | `#0B0B0B` | Section tối |
| Logo SVG | `#E30613` | `assets/logo-mark.svg` |
| Logo trắng | `#FFFFFF` | `assets/logo-mark-white.svg` (nền tối) |

⚠️ **Không** đổi logo/brand sang xanh/hồng “thử nghiệm” nếu không có yêu cầu brand mới.

### Màu viền sản phẩm (5 màu — đúng SP)

| Tên form | Hex |
|----------|-----|
| Xanh mint / Mint | `#2DD4BF` |
| Cam | `#F97316` |
| Tím | `#C026D3` |
| Đỏ | `#E30613` |
| Vàng | `#EAB308` |

UI brand đỏ ≠ “thay màu SP”. Swatch/form phải khớp bảng trên.

---

## 4. Hai landing A/B

Chi tiết: `docs/LANDING-AB.md`, `docs/LANDING-DESIGN-PROVA-V3.md`

| | **LP-A** `/` | **LP-B** `/b/` |
|--|--------------|----------------|
| File | `index.html` | `b/index.html` |
| Phong cách | Ads flash conversion | PDP trust / education |
| Above-fold | Hero dark + giá + CTA | Gallery + title shop + giá |
| Video | Sớm (sau trust) | Muộn (sau specs/combo) |
| Form | Cuối trang | **Giữa trang** + sticky |
| `lp_variant` | `"A"` | `"B"` |

**Ads gợi ý:**

```
LP-A: https://votpickleball-prova.pages.dev/?utm_source=facebook&utm_medium=paid&utm_campaign=prova_990k&utm_content=lpa
LP-B: https://votpickleball-prova.pages.dev/b/?utm_source=facebook&utm_medium=paid&utm_campaign=prova_990k&utm_content=lpb
```

Cùng funnel: form → Apps Script → thank-you (pixel Lead).

---

## 5. Tracking / Pixel

Config công khai: `assets/tracking-config.js`

| Nền tảng | ID |
|----------|-----|
| Meta Pixel / Dataset | `1032930589212752` |
| TikTok Pixel | `D9DSLURC77U79CKF57FG` |
| GA4 | `G-YBRL7V8BTM` |

### Event

| Trang | Meta | TikTok |
|-------|------|--------|
| LP-A, LP-B | PageView + ViewContent | PageView + ViewContent |
| Thank-you | PageView + **Lead** + CompleteRegistration | PageView + **SubmitForm** |

Scripts:

- `assets/meta-pixel.js`
- `assets/tiktok-pixel.js`
- Thank-you: load config + pixel, tắt ViewContent (`data-meta-view-content=0`), bắn Lead/SubmitForm

**Secrets (không commit):** TikTok Events token, FB Marketing token, Telegram bot → Script properties / Cloudflare Secrets / `.env` local.

---

## 6. Form payload (chuẩn)

```json
{
  "name": "",
  "phone": "",
  "color": "Xanh mint",
  "address": "",
  "pack": "1",
  "quantity": 1,
  "product": "Prova Ultimate 3.5",
  "lp_variant": "A",
  "utm_source": "",
  "utm_medium": "",
  "utm_campaign": "",
  "fbclid": "",
  "ttclid": "",
  "fbp": "",
  "fbc": "",
  "user_agent": "",
  "page": ""
}
```

- POST `mode: 'no-cors'`, body JSON string.  
- Redirect: `/thank-you` + giữ query string.  
- `sessionStorage.prova_lead` cho personalize thank-you.

Backend: `google-apps-script/Code.gs`  
- `SALE_VALUE = 990000`  
- Sheet + Telegram + optional CAPI  

Telegram: chat `446161379` (@provapickbot) — token trong Script properties.

---

## 7. Cấu trúc thư mục (ý nghĩa)

```
Landing page pickleball/
├── SYSTEM.md                 ← file này
├── WORKFLOW.md               ← funnel tóm tắt
├── index.html                ← LP-A
├── b/index.html              ← LP-B
├── thank-you.html
├── assets/                   ← ảnh, video, pixel, logo
│   ├── tracking-config.js
│   ├── meta-pixel.js
│   ├── tiktok-pixel.js
│   ├── prova-intro.mp4       ← video landing (đã nén từ kb3)
│   └── logo-mark.svg         ← brand red #E30613
├── google-apps-script/Code.gs
├── docs/
│   ├── LANDING-AB.md
│   └── LANDING-DESIGN-PROVA-V3.md
├── ads-metrics-tool/         ← CLI Python (local)
├── ads-metrics-web/          ← DEPRECATED (bản gắn Prova; dùng hub riêng)
└── HUONG-DAN-*.md            ← hướng dẫn từng tích hợp
```

**Repo metrics riêng:** `~/Downloads/ads-metrics-hub` (multi-project CF Pages).

---

## 8. Deploy Cloudflare

### Landing (votpickleball-prova)

1. GitHub `main` đã connect Cloudflare Pages  
2. Root = repo root (có `index.html`)  
3. **Không** đổi Production branch / root bừa bãi  
4. Sau `git push origin main` → auto deploy  
5. Hard refresh nếu cache: `Cmd+Shift+R`  
6. **Không** Retry deployment trên commit cũ (từng rollback mất feature)

### Ads Metrics Hub

- Project CF: `ads-metrics-hub`  
- Root: repo `ads-metrics-hub`  
- Secrets: `APP_PASSWORD`, `FB_ACCESS_TOKEN`, `PROJECTS_JSON`, optional TikTok  

---

## 9. Quy tắc làm việc (cho agent / phiên sau)

1. **Đọc `SYSTEM.md` trước** khi sửa landing/metrics.  
2. **Brand + màu SP chính xác** — không replace hex brand hàng loạt (đã từng làm hỏng swatch Đỏ & logo).  
3. **Secrets không commit** (token FB/TT/Telegram).  
4. Sửa form URL → cả `index.html` **và** `b/index.html`.  
5. Sửa pixel ID → chỉ `assets/tracking-config.js` (+ noscript id nếu có).  
6. Deploy = push GitHub; xác nhận live bằng curl/marker version.  
7. Thank-you: **không** `_redirects` gây loop; path `/thank-you`.  
8. Video: `assets/prova-intro.mp4`, poster `video-poster.jpg`, cache bust `?v=...`.  

---

## 10. Checklist khi mở phiên mới

- [ ] Đọc `SYSTEM.md` + `docs/LANDING-AB.md` nếu đụng LP  
- [ ] `git status` / branch `main`  
- [ ] Live A/B/thank-you còn online  
- [ ] Giá sale vẫn 990k (nếu đổi giá → index + b + thank-you events + Code.gs SALE_VALUE)  
- [ ] Không commit `.env` / token  

---

## 11. Changelog phiên (ghi tiếp bên dưới)

### 2026-07-30

- Giá sale: **990.000đ** (từ 1.060.000); badge ~18%.  
- Video landing: `kb3 pickleball.mp4` → nén `assets/prova-intro.mp4`.  
- V3 structure + reorder video/combo sau hero.  
- **LP-A** `/` + **LP-B** `/b/` (A/B).  
- Pixel Meta + TikTok thống nhất mọi LP + thank-you.  
- TikTok CTAs → `@votpickleballprova`.  
- Brand/logo/swatch: **khôi phục đỏ Prova**; không dùng palette xanh UI.  
- LP-B combo icons ép `#E30613` + glyph trắng.  
- Ads Metrics Hub multi-project: repo/path riêng (không chung landing).  

### (Thêm dòng mới khi có thay đổi)

```
### YYYY-MM-DD
- …
```

---

## 12. Tài liệu liên quan

| File | Nội dung |
|------|----------|
| `WORKFLOW.md` | Funnel tóm tắt |
| `docs/LANDING-AB.md` | So sánh A/B |
| `docs/LANDING-DESIGN-PROVA-V3.md` | Phân tích đối thủ + blueprint |
| `HUONG-DAN-FACEBOOK-PIXEL.md` | Meta pixel |
| `HUONG-DAN-TIKTOK-EVENTS-API.md` | TikTok Events server |
| `HUONG-DAN-GOOGLE-SHEET.md` | Sheet form |
| `HUONG-DAN-TELEGRAM.md` | Bot đơn |
| `HUONG-DAN-META-CRM.md` | CAPI |
| `ads-metrics-hub/docs/*` | Token FB/TT Marketing, personas hub |

---

## 13. Skill / tool

- Grok skill funnel: `~/.grok/skills/landing-ads-funnel/`  
- GitHub user deploy: `nhnmybmedia2025-pixel`  
- Email CF/GitHub context: `nhn.mybmedia2025@gmail.com` (tài khoản vận hành)

---

*File này là nguồn sự thật vận hành dự án. Ưu tiên cập nhật đây trước khi tạo doc rời.*
