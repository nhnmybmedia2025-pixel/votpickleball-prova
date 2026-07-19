# Ads Metrics Tool – Đo lường FB + TikTok cho Landing Prova

Tool Python lấy **insights chiến dịch** từ:

| Nguồn | API | Mục tiêu |
|-------|-----|----------|
| **Facebook Ads** | Marketing API (Graph) | Spend, click, CTR, CPC, Lead (pixel) |
| **TikTok Ads** | Marketing API Reporting | Spend, click, CTR, CPC, SubmitForm |
| **Landing leads** *(tuỳ chọn)* | Google Sheet CSV / export | Số đơn thật theo `utm_source` / `utm_campaign` |

Landing: `https://votpickleball-prova.pages.dev/`

---

## 1. Kiến trúc đo lường (end-to-end)

```
┌─────────────────┐     ┌──────────────────┐
│ Facebook Ads    │     │ TikTok Ads       │
│ Pixel Lead      │     │ Pixel SubmitForm │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         │   Marketing API       │
         ▼                       ▼
┌────────────────────────────────────────┐
│         ads-metrics-tool (Python)      │
│  fetch_facebook + fetch_tiktok         │
│  → CSV/JSON + optional join leads      │
└────────────────┬───────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────┐
│ Báo cáo: CPA (ads), CPL (lead thật),   │
│ CTR, CPC, spend, ROAS proxy            │
│ so với đơn Google Sheet / Telegram     │
└────────────────────────────────────────┘
```

### Chỉ số quan trọng cho landing form

| Chỉ số | Công thức / nguồn |
|--------|-------------------|
| **Spend** | API ads |
| **Clicks (link)** | API ads |
| **CTR** | clicks / impressions |
| **CPC** | spend / clicks |
| **Leads (pixel)** | FB Lead / TT SubmitForm (API) |
| **Leads (thật)** | Dòng Sheet có `utm_source=facebook\|tiktok` |
| **CPL ads** | spend / leads_pixel |
| **CPL thật** | spend / leads_sheet |
| **Gap** | leads_pixel − leads_sheet (chênh do spam/double/không gọi được) |

---

## 2. Chuẩn bị quyền API

### Facebook

1. [developers.facebook.com](https://developers.facebook.com) → Create App → type **Business**
2. Thêm product **Marketing API**
3. Business Settings → System Users → Generate token với quyền:
   - `ads_read`
   - `ads_management` (chỉ đọc insights thì `ads_read` đủ)
   - `business_management` (nếu cần)
4. Lấy **Ad Account ID** dạng `act_123456789`
5. Pixel Lead phải gắn event **Lead** (đã có trên thank-you)

### TikTok

1. [TikTok for Business](https://business-api.tiktok.com/) / Marketing API
2. Tạo app, xin quyền **Ads Management / Reporting**
3. Lấy **Advertiser ID** + **Access Token** (long-lived)
4. Pixel `D9DSLURC77U79CKF57FG` event **SubmitForm** (browser + Events API)

### Google Sheet leads (tuỳ chọn)

- File → Download → CSV, đặt vào `output/leads.csv`
- Cột tối thiểu: `Thời gian`, `utm_source`, `utm_campaign` (đúng header landing)

---

## 3. Cài đặt tool

```bash
cd "/Users/macbook/Downloads/Landing page pickleball/ads-metrics-tool"
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Sửa .env với token thật
```

---

## 4. Chạy

```bash
# Lấy data 7 ngày gần nhất
python -m src.main --days 7

# Khoảng ngày cụ thể
python -m src.main --since 2026-07-01 --until 2026-07-19

# Chỉ Facebook / chỉ TikTok
python -m src.main --days 7 --facebook-only
python -m src.main --days 7 --tiktok-only

# Gộp với leads CSV
python -m src.main --days 7 --leads output/leads.csv
```

**Output** (trong `output/`):

- `facebook_insights_YYYYMMDD.csv`
- `tiktok_insights_YYYYMMDD.csv`
- `summary_YYYYMMDD.json`
- `report_YYYYMMDD.md` (bảng đọc nhanh)

---

## 5. Quy trình vận hành hàng ngày (10 phút)

1. Chạy tool `--days 1` hoặc `--days 7`
2. So `leads_pixel` vs `leads_sheet` (Telegram/Sheet)
3. CPL thật > ngưỡng → pause ad set / đổi creative
4. CTR thấp + CPC cao → đổi text/video (đã có 9:16)
5. Lead pixel nhiều, Sheet ít → kiểm tra thank-you / form / adblock audience

---

## 6. Bảo mật

- Không commit file `.env`
- Token FB/TikTok/GA chỉ local hoặc secret manager
- Rotate token nếu lộ chat

---

## 7. Mở rộng sau

- Google Sheets API đọc lead trực tiếp (không export CSV)
- Cron / GitHub Actions chạy 8h sáng mỗi ngày
- Dashboard Streamlit / Looker Studio
- Match `campaign_id` ads với `utm_campaign` naming convention

**Quy ước đặt tên campaign (khuyến nghị):**

```
fb_prova_ultimate_conv_t7
tt_prova_ultimate_submit_t7
```

UTM landing:

```
?utm_source=facebook&utm_medium=paid&utm_campaign=fb_prova_ultimate_conv_t7
?utm_source=tiktok&utm_medium=paid&utm_campaign=tt_prova_ultimate_submit_t7
```
