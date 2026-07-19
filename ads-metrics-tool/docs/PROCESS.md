# Quy trình code: Tool đo lường FB + TikTok cho Landing

## Mục tiêu nghiệp vụ

Trả lời 4 câu mỗi ngày/tuần:

1. Chi bao nhiêu tiền trên FB / TikTok?
2. Giá mỗi click / mỗi lead pixel là bao nhiêu?
3. Lead pixel có khớp đơn Sheet/Telegram không?
4. Campaign / adset nào nên scale hoặc tắt?

Landing funnel: **Ads → pages.dev → form → Sheet + Telegram → thank-you (Lead/SubmitForm)**

---

## Module code (đã scaffold)

```
ads-metrics-tool/
  src/
    config.py         # .env
    facebook_ads.py   # Graph insights
    tiktok_ads.py     # Integrated report
    leads.py          # Join CSV Sheet
    report.py         # CSV + MD + JSON
    main.py           # CLI
  .env.example
  requirements.txt
  README.md
```

### Luồng xử lý trong code

```
main.py
  ├─ parse --days / --since --until
  ├─ facebook_ads.fetch_insights()
  │     GET graph.facebook.com/v21.0/act_XXX/insights
  │     fields: spend, clicks, ctr, actions(lead)...
  ├─ tiktok_ads.fetch_insights()
  │     POST business-api.tiktok.com/.../report/integrated/get/
  │     metrics: spend, clicks, form/result...
  ├─ leads.load_leads_csv() [optional]
  │     group by date + utm_source
  ├─ attach_real_leads() → cpl_sheet
  └─ report.save_outputs() → output/*.csv|json|md
```

---

## Naming convention (bắt buộc để join được)

| Layer | Quy ước |
|-------|---------|
| FB campaign name | `fb_prova_ultimate_conv_*` |
| TT campaign name | `tt_prova_ultimate_submit_*` |
| UTM landing | `utm_source=facebook\|tiktok` |
| | `utm_campaign=<tên campaign hoặc short code>` |

Form Sheet đã lưu `utm_source`, `utm_campaign` → so được với ads.

---

## Auth chi tiết

### Facebook

1. App + Marketing API  
2. System user token `ads_read`  
3. `FB_AD_ACCOUNT_ID=act_...`  
4. Test nhanh:

```bash
curl "https://graph.facebook.com/v21.0/act_XXX/insights?access_token=TOKEN&date_preset=yesterday&fields=spend,impressions,clicks"
```

### TikTok

1. Developer app + advertiser authorize  
2. `TIKTOK_ACCESS_TOKEN` + `TIKTOK_ADVERTISER_ID`  
3. Report type BASIC, data_level AUCTION_CAMPAIGN  

---

## Công thức dashboard

```
CTR%     = clicks / impressions * 100
CPC      = spend / clicks
CPL_px   = spend / leads_pixel
CPL_real = spend / leads_sheet
Efficiency gap = leads_pixel - leads_sheet
```

**Ngưỡng gợi ý (mid-range vợt ~1tr):**

- CPL_real quá cao vs biên lợi nhuận → pause  
- CTR < 0.5% feed → đổi creative/text  
- Gap pixel>>sheet lớn → rà thank-you pixel / form  

---

## Lịch phát triển (phase)

| Phase | Việc | Effort |
|-------|------|--------|
| **P0** | Scaffold + FB + TT CSV (tool này) | Done |
| **P1** | Điền .env, chạy daily report | 0.5 ngày |
| **P2** | Google Sheets API auto-pull leads | 1 ngày |
| **P3** | Cron / GitHub Action 8:00 | 0.5 ngày |
| **P4** | Streamlit dashboard + alert Telegram nếu CPL > X | 1–2 ngày |

---

## Checklist implementer

- [ ] Tạo app FB + token `ads_read`  
- [ ] Tạo TikTok Marketing API token + advertiser_id  
- [ ] Copy `.env.example` → `.env`  
- [ ] `pip install -r requirements.txt`  
- [ ] `python -m src.main --days 7`  
- [ ] Export Sheet → `output/leads.csv` → `--leads`  
- [ ] Chuẩn hoá tên campaign = utm_campaign  
- [ ] (Sau) GA4_API_SECRET + Sheet API  

---

## Lưu ý pháp lý / kỹ thuật

- Chỉ dùng token tài khoản ads **bạn sở hữu / được ủy quyền**  
- Không scrape UI Ads Manager (dễ vỡ, vi phạm ToS) — dùng official API  
- Rate limit: cache kết quả `output/` theo ngày  
