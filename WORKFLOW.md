# Prova Ultimate 3.5 — Funnel đã chốt

> **Bộ nhớ hệ thống đầy đủ:** [`SYSTEM.md`](./SYSTEM.md) — đọc đầu mỗi phiên mới.

## Workflow chuẩn

1. **Ads** → LP-A `/` hoặc LP-B `/b/` + UTM  
2. **Landing** → xem + form (PageView + ViewContent)  
3. **Apps Script** → Sheet + Telegram (+ CAPI/Events)  
4. **Thank-you** → Lead + CompleteRegistration + TikTok SubmitForm  

## URL quan trọng

| Thành phần | URL |
|------------|-----|
| LP-A | https://votpickleball-prova.pages.dev/ |
| LP-B | https://votpickleball-prova.pages.dev/b/ |
| Thank-you | https://votpickleball-prova.pages.dev/thank-you |
| Web App | `.../AKfycbwSUhqIWt6cl4HH1iCDAhhoJ5eJtYLOS8xqb4rWG8erfimmL3BSy2pkttSSdHHwQE6X3w/exec` |
| Meta Pixel | `1032930589212752` |
| TikTok Pixel | `D9DSLURC77U79CKF57FG` |
| TikTok | https://www.tiktok.com/@votpickleballprova |
| Telegram chat | `446161379` (@provapickbot) |
| Hotline | 0868.93.16.91 |
| Giá sale | **990.000đ** (niêm yết 1.200.000đ) |

## Skill tái sử dụng

User skill: `~/.grok/skills/landing-ads-funnel/`  
Gọi: `/landing-ads-funnel` hoặc mô tả “tạo landing ads form sheet telegram”

## Performance đã áp dụng

- Ảnh hero/gallery nén lại (~50–60% dung lượng)
- Preload hero; video `preload=none`
- System font; FA async; pixel defer
- Thank-you không Tailwind
- Không `_redirects` (tránh redirect loop)
- Cache `/assets/*` dài hạn
- GA4: G-YBRL7V8BTM
