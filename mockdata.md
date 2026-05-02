# Mock Data — Mini Campaign Manager
Dùng để copy-paste trực tiếp khi tạo data bằng UI.
---
## Tài khoản Test
| Email | Password | Name | password hashed 
|-------|---------|------|-----------------|
| john@company. com | password123 | John Smith | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
| sarah@company. com | password123 | Sarah Johnson | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
| mike@company. com | password123 | Mike Chen | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
| lisa@company. com | password123 | Lisa Wang | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
| tom@company. com | password123 | Tom Brown | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
---
## Recipients (20 người)
| Email | Name |
|-------|------|
| alice@shop. example. com | Alice Brown |
| bob@shop. example. com | Bob Wilson |
| carol@shop. example. com | Carol Davis |
| david@shop. example. com | David Miller |
| emma@shop. example. com | Emma Thompson |
| frank@shop. example. com | Frank Garcia |
| grace@shop. example. com | Grace Lee |
| henry@shop. example. com | Henry Kim |
| iris@shop. example. com | Iris Nguyen |
| jack@shop. example. com | Jack Parker |
| kate@shop. example. com | Kate Anderson |
| liam@shop. example. com | Liam Martinez |
| mona@shop. example. com | Mona Hassan |
| nick@shop. example. com | Nick Taylor |
| olivia@shop. example. com | Olivia Clark |
| paul@shop. example. com | Paul Robinson |
| quinn@shop. example. com | Quinn Lewis |
| rita@shop. example. com | Rita Hall |
| steve@shop. example. com | Steve Young |
| uma@shop. example. com | Uma Patel |
---
## Campaigns (10 campaigns)
### Campaign 1 — Draft
```
Name: New Year 2025 Collection
Subject: Sản Phẩm Mới Năm 2025
Body: Chào {{name}}, Đón năm mới với bộ sưu tập độc quyền từ Shop! Ưu đãi lên tới 40% cho khách hàng VIP.
```
### Campaign 2 — Draft
```
Name: Flash Sale Weekend
Subject: Flash Sale Cuối Tuần!
Body: Chào {{name}}, Chỉ 48h! Giảm 50% cho tất cả sản phẩm. Mã: FLASH50
```
### Campaign 3 — Scheduled
```
Name: Summer Sale 2024
Subject: Summer Sale - Giảm 30%!
Body: Chào {{name}}, Summer Sale đã đến! Giảm ngay 30% cho tất cả sản phẩm. Hạn chót: 30/06/2024
Scheduled: 2025-06-25 09:00:00
```
### Campaign 4 — Scheduled
```
Name: Monthly Newsletter #6
Subject: Tin Tức Tháng 6/2025
Body: Chào {{name}}, Cập nhật tin tức tháng 6: 3 tính năng mới đã ra mắt!
Scheduled: 2025-06-01 08:00:00
```
### Campaign 5 — Sent
```
Name: Spring Newsletter
Subject: Tin Tức Tháng 3
Body: Chào {{name}}, Cập nhật tin tức tháng 3: 5 tính năng mới đã ra mắt!
Status: sent
Recipients: 15 → 13 sent, 2 failed, 8 opened
Stats: total=15, sent=13, failed=2, opened=8, open_rate=53.33%, send_rate=86.67%
```
### Campaign 6 — Sent
```
Name: Women's Day Promotion
Subject: Ưu Đãi Ngày Quốc Tế Phụ Nữ
Body: Chào {{name}}, Chúc mừng 8/3! Giảm 20% cho tất cả đơn hàng của phái đẹp.
Status: sent
Recipients: 20 → 20 sent, 0 failed, 15 opened
Stats: total=20, sent=20, failed=0, opened=15, open_rate=75%, send_rate=100%
```
### Campaign 7 — Sent
```
Name: Product Launch - Series X
Subject: Ra Mắt Series X Chính Hãng
Body: Chào {{name}}, Series X đã chính thức ra mắt! Đặt hàng ngay hôm nay để nhận ưu đãi đặc biệt.
Status: sent
Recipients: 10 → 9 sent, 1 failed, 6 opened
Stats: total=10, sent=9, failed=1, opened=6, open_rate=60%, send_rate=90%
```
### Campaign 8 — Sent
```
Name: Anniversary Sale
Subject: Kỷ Niệm 5 Năm - Giảm 25%
Body: Chào {{name}}, Shop tròn 5 tuổi! Cảm ơn bạn đã đồng hành. Ưu đãi 25% cho tất cả sản phẩm.
Status: sent
Recipients: 18 → 16 sent, 2 failed, 10 opened
Stats: total=18, sent=16, failed=2, opened=10, open_rate=55.56%, send_rate=88.89%
```
### Campaign 9 — Sent
```
Name: Cyber Monday Deal
Subject: Cyber Monday - Giảm Đến 70%
Body: Chào {{name}}, Cyber Monday đã quay lại! Giảm đến 70% cho hàng ngàn sản phẩm. Chỉ hôm nay!
Status: sent
Recipients: 12 → 11 sent, 1 failed, 7 opened
Stats: total=12, sent=11, failed=1, opened=7, open_rate=58.33%, send_rate=91.67%
```
### Campaign 10 — Sent
```
Name: VIP Exclusive Offer
Subject: Ưu Đãi Đặc Biệt Dành Riêng Cho VIP
Body: Chào {{name}}, Cảm ơn bạn là khách VIP! Đây là mã ưu đãi đặc biệt: VIPOFF50
Status: sent
Recipients: 8 → 8 sent, 0 failed, 8 opened
Stats: total=8, sent=8, failed=0, opened=8, open_rate=100%, send_rate=100%
```
---
## Stats Tổng Hợp
| Campaign | Status | Total | Sent | Failed | Opened | Open Rate | Send Rate |
|----------|--------|-------|------|--------|--------|----------|----------||
| New Year 2025 Collection | draft | 0 | 0 | 0 | 0 | 0% | 0% |
| Flash Sale Weekend | draft | 0 | 0 | 0 | 0 | 0% | 0% |
| Summer Sale 2024 | scheduled | 5 | 0 | 0 | 0 | 0% | 0% |
| Monthly Newsletter #6 | scheduled | 3 | 0 | 0 | 0 | 0% | 0% |
| Spring Newsletter | sent | 15 | 13 | 2 | 8 | 53.33% | 86.67% |
| Women's Day Promotion | sent | 20 | 20 | 0 | 15 | 75% | 100% |
| Product Launch - Series X | sent | 10 | 9 | 1 | 6 | 60% | 90% |
| Anniversary Sale | sent | 18 | 16 | 2 | 10 | 55.56% | 88.89% |
| Cyber Monday Deal | sent | 12 | 11 | 1 | 7 | 58.33% | 91.67% |
| VIP Exclusive Offer | sent | 8 | 8 | 0 | 8 | 100% | 100% |
---
## Phân Bổ Theo Trạng Thái
| Status | Số Campaign |
|--------|----------|
| draft | 2 |
| scheduled | 2 |
| sent | 6 |
| Total | 10 |