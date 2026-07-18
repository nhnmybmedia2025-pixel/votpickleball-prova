# Prova Ultimate 3.5 — Funnel đã chốt

## Workflow chuẩn

1. **Ads** → `https://votpickleball-prova.pages.dev/?utm_source=facebook&utm_medium=paid&utm_campaign=...`
2. **Landing** → xem + điền form (PageView)
3. **Apps Script** → Sheet + Telegram
4. **Thank-you** → PageView + Lead

## URL quan trọng

| Thành phần | URL |
|------------|-----|
| Landing | https://votpickleball-prova.pages.dev/ |
| Thank-you | https://votpickleball-prova.pages.dev/thank-you |
| Web App | `.../AKfycbwSUhqIWt6cl4HH1iCDAhhoJ5eJtYLOS8xqb4rWG8erfimmL3BSy2pkttSSdHHwQE6X3w/exec` |
| Pixel | `4340331656281072` |
| Telegram chat | `446161379` (@provapickbot) |
| Hotline | 0868.93.16.91 |

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
