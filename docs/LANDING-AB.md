# Hai landing Prova — A/B structure

## Mục tiêu

Chạy **2 LP khác bố cục + nhịp chuyển đổi**, cùng brand Prova, cùng form/Sheet/pixel, để so **CPL / form CVR / contact rate**.

| | **LP-A (hiện tại)** | **LP-B (mới)** |
|--|---------------------|----------------|
| **URL** | `/` | `/b/` |
| **Phong cách** | Ads flash conversion | PDP trust / education |
| **Above-fold** | Hero dark + giá + CTA form | Gallery sáng + title + giá shop |
| **Video** | Sớm (sau trust) | Muộn hơn (sau specs/combo) |
| **Form** | Cuối trang (sau FAQ) | **Giữa trang** + lặp cuối |
| **Social proof** | Sớm (sau video/combo) | Sau form mid (xác nhận) |
| **Tone copy** | “Giữ giá 990k · 30 giây” | “Chính hãng · Carbon 16mm · CLB” |
| **Tham chiếu** | Funnel Vadmart (có kiểm soát) | PDP Thế Giới Pickleball (rút gọn) |

## Hành trình chung

```
Ads (utm_content=lpa|lpb)
  → Landing A hoặc B
  → Form (pack 1/2, màu, SĐT, địa chỉ)
  → /thank-you
       Path A: Gọi
       Path B: TikTok @votpickleballprova
  → CSKH chốt
```

## Ads setup gợi ý

| Campaign / Ad set | Destination |
|-------------------|-------------|
| Cold video / offer mạnh | `.../?utm_content=lpa` |
| Cold static / research | `.../b/?utm_content=lpb` |
| Retargeting | Test cả 2 |

Payload form có `lp_variant: "A"|"B"` và `page` URL để phân tích Sheet.

## Brand (cả 2 LP)

- Logo / CTA: `#E30613`
- 5 màu viền SP: Mint `#2DD4BF` · Cam `#F97316` · Tím `#C026D3` · Đỏ `#E30613` · Vàng `#EAB308`
