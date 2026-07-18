# TikTok Events API (server-side) – Prova

Bổ sung cho pixel trình duyệt: mỗi đơn form → Apps Script gửi **SubmitForm** lên TikTok.

## Script properties (Apps Script)

| Property | Value |
|----------|--------|
| `TIKTOK_ACCESS_TOKEN` | Access token Events API (generate 1 lần, TikTok **không lưu**) |
| `TIKTOK_PIXEL_ID` | `D9DSLURC77U79CKF57FG` (có thể bỏ nếu dùng mặc định trong code) |
| `TIKTOK_TEST_EVENT_CODE` | *(tuỳ chọn)* mã test trong Events Manager |

**Không** dán token vào HTML / GitHub.

## Cài đặt

1. Dán `Code.gs` mới (có `sendTikTokSubmitForm_`)
2. Thêm property `TIKTOK_ACCESS_TOKEN` = token bạn generate
3. Run **`testTikTok`** → Allow UrlFetch nếu hỏi
4. Xem Logs: `ok: true` / `code: 0`
5. Deploy Web App → **New version**

## Funnel events

| Nơi | Event |
|-----|--------|
| Landing browser | `ttq.page()` |
| Thank-you browser | `ttq.track('SubmitForm')` |
| Apps Script server | Events API `SubmitForm` (cùng pixel) |

Ads TikTok: tối ưu **Submit Form**.

## Bảo mật

Token đã từng hiện trong chat → sau khi setup ổn, generate token mới trên TikTok và cập nhật Script property.
