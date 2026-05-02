# Mock Data — Mini Campaign Manager
Used for direct copy-paste when creating data through the UI.
---
## Test Accounts
| Email | Password | Name | password hashed 
|-------|---------|------|-----------------|
| john@company. com | password123 | John Smith | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
| sarah@company. com | password123 | Sarah Johnson | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
| mike@company. com | password123 | Mike Chen | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
| lisa@company. com | password123 | Lisa Wang | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
| tom@company. com | password123 | Tom Brown | 5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa |
---
## Recipients (20 people)
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
Subject: New 2025 Products
Body: Hi {{name}}, welcome the new year with an exclusive collection from the Shop! Offers up to 40% for VIP customers.
```
### Campaign 2 — Draft
```
Name: Flash Sale Weekend
Subject: Weekend Flash Sale!
Body: Hi {{name}}, only 48 hours! 50% off all products. Code: FLASH50
```
### Campaign 3 — Scheduled
```
Name: Summer Sale 2024
Subject: Summer Sale - 30% Off!
Body: Hi {{name}}, Summer Sale is here! Get 30% off all products now. Deadline: 06/30/2024
Scheduled: 2025-06-25 09:00:00
```
### Campaign 4 — Scheduled
```
Name: Monthly Newsletter #6
Subject: June 2025 Newsletter
Body: Hi {{name}}, June news update: 3 new features have launched!
Scheduled: 2025-06-01 08:00:00
```
### Campaign 5 — Sent
```
Name: Spring Newsletter
Subject: March Newsletter
Body: Hi {{name}}, March news update: 5 new features have launched!
Status: sent
Recipients: 15 → 13 sent, 2 failed, 8 opened
Stats: total=15, sent=13, failed=2, opened=8, open_rate=53.33%, send_rate=86.67%
```
### Campaign 6 — Sent
```
Name: Women's Day Promotion
Subject: International Women's Day Offer
Body: Hi {{name}}, happy March 8th! 20% off all orders for women.
Status: sent
Recipients: 20 → 20 sent, 0 failed, 15 opened
Stats: total=20, sent=20, failed=0, opened=15, open_rate=75%, send_rate=100%
```
### Campaign 7 — Sent
```
Name: Product Launch - Series X
Subject: Official Launch of Series X
Body: Hi {{name}}, Series X has officially launched! Order today to receive a special offer.
Status: sent
Recipients: 10 → 9 sent, 1 failed, 6 opened
Stats: total=10, sent=9, failed=1, opened=6, open_rate=60%, send_rate=90%
```
### Campaign 8 — Sent
```
Name: Anniversary Sale
Subject: 5th Anniversary - 25% Off
Body: Hi {{name}}, the Shop turns 5 years old! Thank you for being with us. 25% off all products.
Status: sent
Recipients: 18 → 16 sent, 2 failed, 10 opened
Stats: total=18, sent=16, failed=2, opened=10, open_rate=55.56%, send_rate=88.89%
```
### Campaign 9 — Sent
```
Name: Cyber Monday Deal
Subject: Cyber Monday - Up to 70% Off
Body: Hi {{name}}, Cyber Monday is back! Up to 70% off thousands of products. Today only!
Status: sent
Recipients: 12 → 11 sent, 1 failed, 7 opened
Stats: total=12, sent=11, failed=1, opened=7, open_rate=58.33%, send_rate=91.67%
```
### Campaign 10 — Sent
```
Name: VIP Exclusive Offer
Subject: Special Exclusive Offer for VIPs
Body: Hi {{name}}, thank you for being a VIP customer! Here is your special offer code: VIPOFF50
Status: sent
Recipients: 8 → 8 sent, 0 failed, 8 opened
Stats: total=8, sent=8, failed=0, opened=8, open_rate=100%, send_rate=100%
```
---
## Aggregate Stats
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
## Distribution by Status
| Status | Number of Campaigns |
|--------|----------|
| draft | 2 |
| scheduled | 2 |
| sent | 6 |
| Total | 10 |