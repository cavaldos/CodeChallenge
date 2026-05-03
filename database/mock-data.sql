-- ============================================================
-- Mock Data for Mini Campaign Manager
-- Based on: mockdata.md
-- ============================================================

-- Disable triggers temporarily for bulk insert
ALTER TABLE campaigns DISABLE TRIGGER trg_campaigns_updated_at;

-- ============================================================
-- CLEANUP (remove existing data)
-- ============================================================

TRUNCATE campaign_recipients, campaigns, recipients, refresh_tokens, users CASCADE;

-- ============================================================
-- USERS (5 test accounts)
-- Password for all: "password123" (SHA256 hash placeholder)
-- ============================================================

INSERT INTO users (id, email, name, password_hash, created_at) VALUES
    ('11111111-1111-1111-1111-111111111111', 'john@company.com', 'John Smith', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '30 days'),
    ('22222222-2222-2222-2222-222222222222', 'sarah@company.com', 'Sarah Johnson', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '28 days'),
    ('33333333-3333-3333-3333-333333333333', 'mike@company.com', 'Mike Chen', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '25 days'),
    ('44444444-4444-4444-4444-444444444444', 'lisa@company.com', 'Lisa Wang', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '20 days'),
    ('55555555-5555-5555-5555-555555555555', 'tom@company.com', 'Tom Brown', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '15 days');

-- ============================================================
-- RECIPIENTS (20 people)
-- ============================================================

INSERT INTO recipients (id, email, name, created_at) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'alice@shop.example.com', 'Alice Brown', NOW() - INTERVAL '60 days'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'bob@shop.example.com', 'Bob Wilson', NOW() - INTERVAL '58 days'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'carol@shop.example.com', 'Carol Davis', NOW() - INTERVAL '56 days'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'david@shop.example.com', 'David Miller', NOW() - INTERVAL '54 days'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'emma@shop.example.com', 'Emma Thompson', NOW() - INTERVAL '52 days'),
    ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'frank@shop.example.com', 'Frank Garcia', NOW() - INTERVAL '50 days'),
    ('gggggggg-gggg-gggg-gggg-gggggggggggg', 'grace@shop.example.com', 'Grace Lee', NOW() - INTERVAL '48 days'),
    ('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'henry@shop.example.com', 'Henry Kim', NOW() - INTERVAL '46 days'),
    ('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'iris@shop.example.com', 'Iris Nguyen', NOW() - INTERVAL '44 days'),
    ('jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'jack@shop.example.com', 'Jack Parker', NOW() - INTERVAL '42 days'),
    ('kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'kate@shop.example.com', 'Kate Anderson', NOW() - INTERVAL '40 days'),
    ('llllllll-llll-llll-llll-llllllllllll', 'liam@shop.example.com', 'Liam Martinez', NOW() - INTERVAL '38 days'),
    ('mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'mona@shop.example.com', 'Mona Hassan', NOW() - INTERVAL '36 days'),
    ('nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'nick@shop.example.com', 'Nick Taylor', NOW() - INTERVAL '34 days'),
    ('oooooooo-oooo-oooo-oooo-oooooooooooo', 'olivia@shop.example.com', 'Olivia Clark', NOW() - INTERVAL '32 days'),
    ('pppppppp-pppp-pppp-pppp-pppppppppppp', 'paul@shop.example.com', 'Paul Robinson', NOW() - INTERVAL '30 days'),
    ('qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'quinn@shop.example.com', 'Quinn Lewis', NOW() - INTERVAL '28 days'),
    ('rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'rita@shop.example.com', 'Rita Hall', NOW() - INTERVAL '26 days'),
    ('ssssssss-ssss-ssss-ssss-ssssssssssss', 'steve@shop.example.com', 'Steve Young', NOW() - INTERVAL '24 days'),
    ('tttttttt-tttt-tttt-tttt-tttttttttttt', 'uma@shop.example.com', 'Uma Patel', NOW() - INTERVAL '22 days');

-- ============================================================
-- CAMPAIGNS (10 campaigns)
-- Using john@company.com (id: 11111111-1111-1111-1111-111111111111) as creator
-- ============================================================

-- Campaign 1: Draft
INSERT INTO campaigns (id, name, subject, body, status, created_by, created_at, updated_at) VALUES
    ('c0c0c0c0-c0c0-c0c0-c0c0-c0c0c0c0c0c0', 'New Year 2025 Collection', 'New 2025 Products', 'Hi {{name}}, welcome the new year with an exclusive collection from the Shop! Offers up to 40% for VIP customers.', 'draft', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days');

-- Campaign 2: Draft
INSERT INTO campaigns (id, name, subject, body, status, created_by, created_at, updated_at) VALUES
    ('c1c1c1c1-c1c1-c1c1-c1c1-c1c1c1c1c1c1', 'Flash Sale Weekend', 'Weekend Flash Sale!', 'Hi {{name}}, only 48 hours! 50% off all products. Code: FLASH50', 'draft', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days');

-- Campaign 3: Scheduled (2025-06-25 09:00:00)
INSERT INTO campaigns (id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at) VALUES
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'Summer Sale 2024', 'Summer Sale - 30% Off!', 'Hi {{name}}, Summer Sale is here! Get 30% off all products now. Deadline: 06/30/2024', 'scheduled', '2025-06-25 09:00:00'::TIMESTAMPTZ, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days');

-- Campaign 4: Scheduled (2025-06-01 08:00:00)
INSERT INTO campaigns (id, name, subject, body, status, scheduled_at, created_by, created_at, updated_at) VALUES
    ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'Monthly Newsletter #6', 'June 2025 Newsletter', 'Hi {{name}}, June news update: 3 new features have launched!', 'scheduled', '2025-06-01 08:00:00'::TIMESTAMPTZ, '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days');

-- Campaign 5: Sent - Spring Newsletter (15 recipients: 13 sent, 2 failed, 8 opened)
INSERT INTO campaigns (id, name, subject, body, status, created_by, created_at, updated_at) VALUES
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'Spring Newsletter', 'March Newsletter', 'Hi {{name}}, March news update: 5 new features have launched!', 'sent', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day');

-- Campaign 6: Sent - Women's Day Promotion (20 recipients: 20 sent, 0 failed, 15 opened)
INSERT INTO campaigns (id, name, subject, body, status, created_by, created_at, updated_at) VALUES
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', "Women's Day Promotion", "International Women's Day Offer", 'Hi {{name}}, happy March 8th! 20% off all orders for women.', 'sent', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 days');

-- Campaign 7: Sent - Product Launch - Series X (10 recipients: 9 sent, 1 failed, 6 opened)
INSERT INTO campaigns (id, name, subject, body, status, created_by, created_at, updated_at) VALUES
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'Product Launch - Series X', 'Official Launch of Series X', 'Hi {{name}}, Series X has officially launched! Order today to receive a special offer.', 'sent', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 days');

-- Campaign 8: Sent - Anniversary Sale (18 recipients: 16 sent, 2 failed, 10 opened)
INSERT INTO campaigns (id, name, subject, body, status, created_by, created_at, updated_at) VALUES
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'Anniversary Sale', '5th Anniversary - 25% Off', 'Hi {{name}}, the Shop turns 5 years old! Thank you for being with us. 25% off all products.', 'sent', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '15 days', NOW() - INTERVAL '4 days');

-- Campaign 9: Sent - Cyber Monday Deal (12 recipients: 11 sent, 1 failed, 7 opened)
INSERT INTO campaigns (id, name, subject, body, status, created_by, created_at, updated_at) VALUES
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'Cyber Monday Deal', 'Cyber Monday - Up to 70% Off', 'Hi {{name}}, Cyber Monday is back! Up to 70% off thousands of products. Today only!', 'sent', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days');

-- Campaign 10: Sent - VIP Exclusive Offer (8 recipients: 8 sent, 0 failed, 8 opened)
INSERT INTO campaigns (id, name, subject, body, status, created_by, created_at, updated_at) VALUES
    ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'VIP Exclusive Offer', 'Special Exclusive Offer for VIPs', 'Hi {{name}}, thank you for being a VIP customer! Here is your special offer code: VIPOFF50', 'sent', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days');

-- ============================================================
-- CAMPAIGN RECIPIENTS
-- ============================================================

-- Campaign 3: Summer Sale 2024 - 5 recipients (all pending)
INSERT INTO campaign_recipients (campaign_id, recipient_id, status) VALUES
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'pending'),
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'pending'),
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'pending'),
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'pending'),
    ('c2c2c2c2-c2c2-c2c2-c2c2-c2c2c2c2c2c2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'pending');

-- Campaign 4: Monthly Newsletter #6 - 3 recipients (all pending)
INSERT INTO campaign_recipients (campaign_id, recipient_id, status) VALUES
    ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'pending'),
    ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'pending'),
    ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'pending');

-- Campaign 5: Spring Newsletter - 15 recipients (13 sent, 2 failed, 8 opened)
-- Sent: alice, bob, carol, david, emma, frank, grace, henry, iris, jack, kate, liam, mona
-- Failed: nick, olivia
-- Opened: alice, bob, carol, david, emma, frank, grace, henry
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at) VALUES
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sent', NOW() - INTERVAL '29 days', NOW() - INTERVAL '28 days'),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sent', NOW() - INTERVAL '29 days', NOW() - INTERVAL '27 days'),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'sent', NOW() - INTERVAL '29 days', NOW() - INTERVAL '26 days'),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'sent', NOW() - INTERVAL '29 days', NOW() - INTERVAL '25 days'),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'sent', NOW() - INTERVAL '29 days', NOW() - INTERVAL '24 days'),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'sent', NOW() - INTERVAL '29 days', NOW() - INTERVAL '23 days'),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'sent', NOW() - INTERVAL '29 days', NOW() - INTERVAL '22 days'),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'sent', NOW() - INTERVAL '29 days', NOW() - INTERVAL '21 days'),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'sent', NOW() - INTERVAL '29 days', NULL),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'sent', NOW() - INTERVAL '29 days', NULL),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'sent', NOW() - INTERVAL '29 days', NULL),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'llllllll-llll-llll-llll-llllllllllll', 'sent', NOW() - INTERVAL '29 days', NULL),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'sent', NOW() - INTERVAL '29 days', NULL),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'failed', NOW() - INTERVAL '29 days', NULL),
    ('c4c4c4c4-c4c4-c4c4-c4c4-c4c4c4c4c4c4', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'failed', NOW() - INTERVAL '29 days', NULL);

-- Campaign 6: Women's Day Promotion - 20 recipients (20 sent, 0 failed, 15 opened)
-- All 20 recipients sent, 15 opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at) VALUES
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '23 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '22 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '21 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '20 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '19 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '18 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '17 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '16 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '15 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '14 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '13 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'llllllll-llll-llll-llll-llllllllllll', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '12 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '11 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '10 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'sent', NOW() - INTERVAL '24 days', NOW() - INTERVAL '9 days'),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'sent', NOW() - INTERVAL '24 days', NULL),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'sent', NOW() - INTERVAL '24 days', NULL),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'sent', NOW() - INTERVAL '24 days', NULL),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'ssssssss-ssss-ssss-ssss-ssssssssssss', 'sent', NOW() - INTERVAL '24 days', NULL),
    ('c5c5c5c5-c5c5-c5c5-c5c5-c5c5c5c5c5c5', 'tttttttt-tttt-tttt-tttt-tttttttttttt', 'sent', NOW() - INTERVAL '24 days', NULL);

-- Campaign 7: Product Launch - Series X - 10 recipients (9 sent, 1 failed, 6 opened)
-- alice, bob, carol, david, emma, frank, grace, henry, iris (sent), jack (failed)
-- opened: alice, bob, carol, david, emma, frank
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at) VALUES
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sent', NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days'),
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sent', NOW() - INTERVAL '19 days', NOW() - INTERVAL '17 days'),
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'sent', NOW() - INTERVAL '19 days', NOW() - INTERVAL '16 days'),
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'sent', NOW() - INTERVAL '19 days', NOW() - INTERVAL '15 days'),
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'sent', NOW() - INTERVAL '19 days', NOW() - INTERVAL '14 days'),
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'sent', NOW() - INTERVAL '19 days', NOW() - INTERVAL '13 days'),
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'sent', NOW() - INTERVAL '19 days', NULL),
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'sent', NOW() - INTERVAL '19 days', NULL),
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'sent', NOW() - INTERVAL '19 days', NULL),
    ('c6c6c6c6-c6c6-c6c6-c6c6-c6c6c6c6c6c6', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'failed', NOW() - INTERVAL '19 days', NULL);

-- Campaign 8: Anniversary Sale - 18 recipients (16 sent, 2 failed, 10 opened)
-- alice through rita (18 recipients, skip uma)
-- 16 sent, 2 failed (steve, rita), 10 opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at) VALUES
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '11 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '10 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '9 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '8 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '7 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '6 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '5 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '4 days'),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'sent', NOW() - INTERVAL '14 days', NULL),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'llllllll-llll-llll-llll-llllllllllll', 'sent', NOW() - INTERVAL '14 days', NULL),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'mmmmmmmm-mmmm-mmmm-mmmm-mmmmmmmmmmmm', 'sent', NOW() - INTERVAL '14 days', NULL),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'nnnnnnnn-nnnn-nnnn-nnnn-nnnnnnnnnnnn', 'sent', NOW() - INTERVAL '14 days', NULL),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'oooooooo-oooo-oooo-oooo-oooooooooooo', 'sent', NOW() - INTERVAL '14 days', NULL),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'pppppppp-pppp-pppp-pppp-pppppppppppp', 'sent', NOW() - INTERVAL '14 days', NULL),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'qqqqqqqq-qqqq-qqqq-qqqq-qqqqqqqqqqqq', 'failed', NOW() - INTERVAL '14 days', NULL),
    ('c7c7c7c7-c7c7-c7c7-c7c7-c7c7c7c7c7c7', 'rrrrrrrr-rrrr-rrrr-rrrr-rrrrrrrrrrrr', 'failed', NOW() - INTERVAL '14 days', NULL);

-- Campaign 9: Cyber Monday Deal - 12 recipients (11 sent, 1 failed, 7 opened)
-- alice through liam (12 recipients)
-- 11 sent, 1 failed (liam), 7 opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at) VALUES
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sent', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days'),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sent', NOW() - INTERVAL '9 days', NOW() - INTERVAL '7 days'),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'sent', NOW() - INTERVAL '9 days', NOW() - INTERVAL '6 days'),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'sent', NOW() - INTERVAL '9 days', NOW() - INTERVAL '5 days'),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'sent', NOW() - INTERVAL '9 days', NOW() - INTERVAL '4 days'),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'sent', NOW() - INTERVAL '9 days', NOW() - INTERVAL '3 days'),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'sent', NOW() - INTERVAL '9 days', NOW() - INTERVAL '2 days'),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'sent', NOW() - INTERVAL '9 days', NULL),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'sent', NOW() - INTERVAL '9 days', NULL),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'jjjjjjjj-jjjj-jjjj-jjjj-jjjjjjjjjjjj', 'sent', NOW() - INTERVAL '9 days', NULL),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'kkkkkkkk-kkkk-kkkk-kkkk-kkkkkkkkkkkk', 'sent', NOW() - INTERVAL '9 days', NULL),
    ('c8c8c8c8-c8c8-c8c8-c8c8-c8c8c8c8c8c8', 'llllllll-llll-llll-llll-llllllllllll', 'failed', NOW() - INTERVAL '9 days', NULL);

-- Campaign 10: VIP Exclusive Offer - 8 recipients (8 sent, 0 failed, 8 opened)
-- alice through henry (8 recipients)
-- All 8 sent, all 8 opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at) VALUES
    ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'sent', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'sent', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'sent', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'sent', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'sent', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'sent', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'sent', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
    ('c9c9c9c9-c9c9-c9c9-c9c9-c9c9c9c9c9c9', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'sent', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days');

-- Re-enable triggers
ALTER TABLE campaigns ENABLE TRIGGER trg_campaigns_updated_at;

-- ============================================================
-- Verify data with campaign_stats view
-- ============================================================

-- SELECT * FROM campaign_stats ORDER BY campaign_name;

-- ============================================================
-- Summary
-- ============================================================

-- SELECT 'Users' AS table_name, COUNT(*) AS count FROM users
-- UNION ALL
-- SELECT 'Recipients', COUNT(*) FROM recipients
-- UNION ALL
-- SELECT 'Campaigns', COUNT(*) FROM campaigns
-- UNION ALL
-- SELECT 'Campaign Recipients', COUNT(*) FROM campaign_recipients;