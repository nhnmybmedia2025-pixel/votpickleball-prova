# Phân tích đối thủ + Thiết kế Landing Prova Ultimate 3.5 (V3)

**Mục tiêu:** Rút pattern từ 2 LP mẫu, map hành trình ads → form → thank-you / TikTok, xuất **cấu trúc + vận hành + blueprint UI** cho vợt Prova.

**Sản phẩm Prova (hiện có):** Ultimate 3.5 · 990.000đ (niêm yết 1.200.000đ) · full combo · 5 màu · form lead · free ship · BH 12 tháng · hotline 0868.93.16.91

---

## 1. Phân tích 2 landing mẫu

### A. [Vadmart – Joola Gen 5](https://www.vadmart.store/joola-gen5)

| Trục | Cách làm | Hiệu quả với traffic ads |
|------|----------|---------------------------|
| **Mô hình** | Landing “chốt đơn nóng” kiểu TMĐT / dropship | Tối đa conversion cold traffic |
| **Above-the-fold** | Countdown “giờ vàng” + badge −50% + social proof (đã bán, rating) + giá gạch / giá sale + CTA **MUA NGAY** lặp lại | Giảm bounce trong 3s |
| **Offer** | Mua 1 tặng 2 cuốn cán; gói 1 vợt / 2 vợt; free ship trong ngày | Tăng AOV & urgency |
| **Trust** | “Thanh toán bảo mật”, hủy dễ, hỗ trợ 24/7, review ẩn tên | Giảm e ngại COD/online |
| **Form** | Cuối trang / popup: tỉnh-quận-phường, màu, số lượng, SĐT → **Xác nhận đặt hàng** | Form dài hơn Prova nhưng có địa chỉ chi tiết |
| **Thank-you** | “Đặt hàng thành công” + cam kết giao theo miền + “sẽ gọi xác nhận” | Đóng loop lead |
| **Tone** | Urgency mạnh, social proof “ảo/cường điệu” (9.3k sold…) | Convert cao nhưng **rủi ro brand** nếu Prova muốn uy tín CLB |

**Luồng vận hành (suy ra):**

```
FB/TT Ads (offer −50%) 
  → LP scroll dọc (giá + countdown + review + mô tả)
  → CTA lặp → Form đặt hàng
  → Thank-you “gọi xác nhận”
  → Call center / Zalo chốt COD
```

**Lấy được:**  
Urgency + giá nổi + CTA sticky lặp + thank-you expectation + multi-pack (1/2 vợt).  

**Không copy:**  
Số liệu sold/rating “phóng đại”; tone hàng super-cheap; mô tả brand mập mờ.

---

### B. [Thế Giới Pickleball – Balbon Air Power](https://thegioipickleball.com/vot-pickleball-balbon-air-power-chinh-hang/)

| Trục | Cách làm | Hiệu quả |
|------|----------|----------|
| **Mô hình** | **PDP e-commerce** (Woo) — shop thật, đa SKU | SEO + brand + remarketing |
| **Above-the-fold** | Gallery nhiều ảnh, badge −20%, rating 5★, đã bán, giá KM + tiết kiệm | Build trust “cửa hàng” |
| **Offer** | Quà theo mốc hóa đơn + voucher | Phức tạp hơn, tốt cho giỏ hàng |
| **Nội dung** | Long-form SEO: công nghệ lõi, carbon, bảng so sánh, FAQ | Education cho người research |
| **CTA** | Thêm giỏ / Mua ngay + **Zalo / FB Messenger / Hotline** sticky | Nhiều kênh tư vấn |
| **Thank-you** | Checkout Woo chuẩn (không phải lead form đơn) | Phù hợp thanh toán / giỏ |

**Luồng vận hành:**

```
Ads / SEO / organic
  → PDP (đọc spec + review)
  → Chọn màu → Giỏ / Mua ngay  HOẶC  chat Zalo/FB
  → Checkout / tư vấn 1-1
```

**Lấy được:**  
Gallery màu rõ · bảng thông số · FAQ · multi-channel (Zalo/call) · “tiết kiệm Xđ” minh bạch.  

**Không copy nguyên:**  
Voucher hết hạn gây nhiễu; form giỏ hàng dài; sticky chat quá nhiều widget làm chậm mobile ads.

---

### C. So sánh với Prova hiện tại

| | Vadmart | TG Pickleball | **Prova hiện tại** |
|--|---------|---------------|---------------------|
| Mục tiêu | Lead/COD nóng | Bán shop + SEO | **Lead form ads** |
| Form | Địa chỉ chi tiết | Checkout | **Tên + SĐT + màu + địa chỉ** |
| Thank-you | Có + call | Checkout | **Có + pixel Lead** |
| Video/TikTok | Không rõ | Không rõ | **Video on-page** |
| Urgency | Countdown mạnh | Voucher/mốc quà | Flash sale badge |
| Brand tone | Mass | Shop chính hãng | **CLB / mid-range Prova** |

**Kết luận chiến lược Prova V3:**  
Giữ **lead form nhanh** (ads) như hiện tại + mượn **urgency/price hierarchy** của Vadmart (có kiểm soát) + **education/gallery/FAQ** của TG Pickleball + **nhánh post-purchase TikTok** (xem video, follow shop) để nuôi remarketing & content.

---

## 2. Hành trình khách hàng (Customer Journey) — Prova

### 2.1 Sơ đồ tổng

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ FB / TikTok │────▶│ Landing Prova    │────▶│ Form lead       │
│ Ads (cold/  │ UTM │ (mobile-first)   │ CTA │ 30s             │
│ warm)       │     │ ViewContent/Page │     │                 │
└─────────────┘     └────────┬─────────┘     └────────┬────────┘
                             │                        │
                    ┌────────▼────────┐      ┌────────▼────────┐
                    │ (tuỳ chọn)      │      │ Apps Script     │
                    │ Xem video on-LP │      │ → Sheet         │
                    │ hoặc TikTok     │      │ → Telegram      │
                    └─────────────────┘      │ → Meta CAPI     │
                                             │ → TikTok Events │
                                             └────────┬────────┘
                                                      │
                                             ┌────────▼────────┐
                                             │ /thank-you      │
                                             │ Lead + Complete │
                                             │ Registration   │
                                             └────────┬────────┘
                                    ┌─────────────────┼─────────────────┐
                                    ▼                 ▼                 ▼
                             Gọi hotline        Xem TikTok         Chờ call
                             (urgent)           video/review       (default)
                                    │                 │
                                    └────────┬────────┘
                                             ▼
                                      CSKH chốt COD
                                      → Giao 2–4 ngày
```

### 2.2 Từng bước vận hành

| # | Giai đoạn | Hành vi KH | Hệ thống | KPI |
|---|-----------|------------|----------|-----|
| 1 | **Ad impression** | Thấy offer 990k / combo | FB/TT Ads Manager | CTR, CPC |
| 2 | **Click → Landing** | Scan hero 3–5s | PageView + Pixel | Bounce, time |
| 3 | **Engage** | Xem giá, video, combo, màu | Scroll depth (optional) | % xem video |
| 4 | **Intent** | Bấm CTA / sticky bar | — | CTA click rate |
| 5 | **Lead** | Gửi form | Sheet + Telegram + CAPI | CPL, form CVR |
| 6 | **Thank-you** | Đọc “sẽ gọi” | Lead event (1 lần) | Event match |
| 7a | **Path A – Call** | Gọi shop / chờ call | Hotline | Contact rate |
| 7b | **Path B – TikTok** | Xem video/review shop | Click-out TikTok | View, follow |
| 8 | **Close** | CSKH chốt màu/địa chỉ | CRM/Sheet status | Close rate |
| 9 | **Fulfill** | Nhận hàng COD | Logistics | Delivery % |

### 2.3 UTM & tracking chuẩn

```
https://votpickleball-prova.pages.dev/
  ?utm_source=facebook|tiktok
  &utm_medium=paid
  &utm_campaign=prova_ultimate_990k
  &utm_content=video_a|static_b
```

| Event | Nơi fire | Mục đích |
|-------|----------|----------|
| PageView | Landing | Top funnel |
| ViewContent (optional) | Hero load | Catalog |
| Lead / SubmitForm | Thank-you | Optimization |
| CompleteRegistration | Thank-you (Meta) | Alt conversion |
| Click TikTok (optional) | Thank-you CTA | Content nurture |

### 2.4 Vai trò từng kênh sau form

| Kênh | Khi nào dùng |
|------|----------------|
| **Gọi ra (Prova)** | Default — mọi lead trong giờ HC |
| **Hotline** | KH gấp / đổi màu |
| **TikTok** | KH muốn xem review trước khi nghe máy; warm lead; content loop ads |
| **Zalo (phase 2)** | Gửi bill / tracking đơn |

---

## 3. Blueprint Landing Prova V3 (cấu trúc section)

### 3.1 Information Architecture (mobile-first, thứ tự scroll)

```
[0] Sticky header: Logo | Đặt hàng | (Gọi)
[1] HERO — Offer 3s
    Badge flash · H1 · 1 dòng pain · pills trust · Price card · CTA primary · CTA secondary (video/gọi)
[2] TRUST STRIP — 4 điểm (ship, đổi, combo, 5 màu)
[3] SOCIAL PROOF mini — “Người chơi CLB đang chọn” + 3 quote ngắn (hoặc fake-light thật)
[4] VIDEO — 9:16 product/combo (on-page) + CTA form
[5] COMBO QUÀ — checklist quà (value stacking)
[6] 5 MÀU + GALLERY — swatch + ảnh
[7] CÔNG NGHỆ / SPECS — 4 card + bảng thông số (rút gọn TG Pickleball)
[8] SO SÁNH — Entry vs Ultimate 3.5 (1 bảng)
[9] FAQ — 4–5 câu COD/ship/BH
[10] PRICE RECAP + FORM — checkout card + form 4 field
[11] FOOTER + Sticky bar mobile
```

**Thank-you (ngoài landing):**

```
[T1] Success + personalize (tên, màu)
[T2] 3 bước tiếp theo
[T3] Primary: Gọi Prova
[T4] Secondary: Xem video review trên TikTok
[T5] Tertiary: Về landing
```

### 3.2 Wireframe chữ (mobile ~390px)

```
┌─────────────────────────┐
│ PROVA          [Đặt]    │
├─────────────────────────┤
│ [FLASH −18% FULL COMBO] │
│ PROVA                   │
│ ULTIMATE 3.5            │
│ Vợt đánh đã cho CLB…    │
│ [Free ship][BH][Đổi 7d] │
│ ┌─────────────────────┐ │
│ │ 1.200k   990.000đ   │ │
│ │ tiết kiệm 210k      │ │
│ └─────────────────────┘ │
│ [ Đặt form 30 giây    ] │
│ [Video] [Gọi]           │
├─────────────────────────┤
│ ✓Ship ✓Đổi ✓Combo ✓Màu  │
├─────────────────────────┤
│ ★★★★★ “Vợt đầm…” — Minh │
├─────────────────────────┤
│ ▶ VIDEO 9:16            │
│ [Đặt sau khi xem]       │
├─────────────────────────┤
│ COMBO: mũ áo khăn…      │
├─────────────────────────┤
│ ●●●●● 5 màu             │
│ [gallery]               │
├─────────────────────────┤
│ Specs Carbon / 16mm     │
├─────────────────────────┤
│ FAQ accordion           │
├─────────────────────────┤
│ GIÁ 990k + FORM         │
│ Tên | SĐT | Màu | Địa chỉ│
│ [Gửi đơn]               │
├─────────────────────────┤
│ sticky: 990k | Đặt | 📞 │
└─────────────────────────┘
```

### 3.3 Design system (giữ brand Prova)

| Token | Giá trị |
|-------|---------|
| Primary | `#E30613` |
| Dark | `#0B0B0B` |
| Surface | `#FFFFFF` / `#FAFAFA` |
| Success | `#059669` |
| Radius CTA | full pill |
| Tap target | ≥ 48px |
| Font | system-ui (tốc độ ads) |
| Price | tabular-nums, 28–34px mobile |

### 3.4 Nguyên tắc UX ads (từ 2 mẫu + Prova)

1. **3 giây đầu = offer** (giá + quà + trust), không storytelling dài.  
2. **CTA lặp** (hero, sau video, sticky, form) — như Vadmart nhưng tối đa 1 style.  
3. **Form ngắn** hơn e-com, **dài vừa đủ** để ship (đã có địa chỉ).  
4. **Thank-you = conversion pixel + expectation management + 2 path** (call / TikTok).  
5. **Không countdown giả** nếu brand Prova muốn uy tín; dùng “ưu đãi hôm nay / còn suất combo” thay số sold ảo.  
6. **Video on-page** + **TikTok off-site** sau lead (nurture, không chặn form).

---

## 4. Cách thức vận hành team (ops)

| Team | Việc |
|------|------|
| **Media** | Ads → LP UTM; optimize CPL theo Lead event |
| **Landing** | A/B hero CTA, video, màu default |
| **CSKH** | Telegram/Sheet lead → gọi 5–30’ HC |
| **Content** | TikTok video review / unbox gắn thank-you |
| **Analytics** | Sheet UTM + Ads Metrics Hub spend |

**SLA gợi ý:**  
- Lead giờ HC: gọi ≤ 30 phút  
- Lead ngoài giờ: nhắn / gọi 8h–9h sáng hôm sau  
- Lead từ TikTok ads: ưu tiên xem comment tone (younger)  

---

## 5. So sánh “nên làm gì trên Prova V3”

| Feature | Vadmart | TG PB | **Prova V3** |
|---------|---------|-------|--------------|
| Countdown giả | Có | Không | **Không** (dùng badge offer) |
| Social proof số lớn | Có (mạnh) | Có (thật, nhỏ) | **Review 3–5 câu + “CLB”** |
| Multi-pack 1/2 vợt | Có | Giỏ | **Phase 2 (optional)** |
| Gallery màu | Ít | Mạnh | **Giữ + swatch form** |
| Long SEO | Không | Có | **Rút gọn 1 screen specs** |
| Sticky CTA | Có | Chat nhiều | **1 sticky bar** |
| Thank-you + call | Có | Checkout | **Có + TikTok** |
| Pixel Lead | — | — | **Đã có — giữ** |

---

## 6. Deliverable triển khai (checklist build)

- [x] Landing mobile CRO hiện tại (hero, sticky, form)  
- [x] Thank-you Lead pixel  
- [ ] Thank-you: CTA TikTok video (cần link shop)  
- [ ] Hero: dòng “tiết kiệm 210k” (đã có một phần)  
- [ ] Optional: chọn gói 1 vợt / 2 vợt  
- [ ] Optional: Zalo chat  
- [ ] Heatmap / scroll (phase 2)  

---

## 7. Copy khung hero (sẵn dùng ads)

**Primary text ads:**  
`Prova Ultimate 3.5 — 990k (giảm 18%). Mua vợt tặng full combo. Free ship · BH 12 tháng. Điền form 30s, Prova gọi chốt.`

**Headline:** `Vợt CLB 990k + full combo`  
**Description:** `Carbon 16mm · 5 màu · Đổi 7 ngày`

---

## 8. Next step kỹ thuật

1. Dán **link TikTok shop/channel** → gắn thank-you + (tuỳ chọn) nút “Xem review TikTok” trên landing.  
2. Nếu OK blueprint → implement block missing (multi-pack, Zalo).  
3. Chạy A/B: Hero CTA “Giữ giá 990k” vs “Nhận combo + vợt 990k”.

---

*Tài liệu này là design + ops blueprint. Landing live: https://votpickleball-prova.pages.dev/*
