-- ============================================================
-- Mock Data Insert - Mini Campaign Manager
-- Run this AFTER schema.sql
-- Uses gen_random_uuid() for valid UUIDs - simple approach
-- ============================================================

-- Disable triggers temporarily for bulk insert
ALTER TABLE campaigns DISABLE TRIGGER trg_campaigns_updated_at;

-- ============================================================
-- STEP 1: Insert USERS (5 test accounts)
-- Password for all: "password123"
-- ============================================================

INSERT INTO users (email, name, password_hash, created_at)
SELECT 'john@company.com', 'John Smith', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

INSERT INTO users (email, name, password_hash, created_at)
SELECT 'sarah@company.com', 'Sarah Johnson', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '28 days'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'sarah@company.com');

INSERT INTO users (email, name, password_hash, created_at)
SELECT 'mike@company.com', 'Mike Chen', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '25 days'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mike@company.com');

INSERT INTO users (email, name, password_hash, created_at)
SELECT 'lisa@company.com', 'Lisa Wang', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '20 days'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'lisa@company.com');

INSERT INTO users (email, name, password_hash, created_at)
SELECT 'tom@company.com', 'Tom Brown', '5664c225788e8379968d8568357ee5c87756f5f664e664007b952a7e3776a9fa', NOW() - INTERVAL '15 days'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'tom@company.com');

-- ============================================================
-- STEP 2: Insert RECIPIENTS (20 people)
-- ============================================================

INSERT INTO recipients (email, name, created_at)
SELECT 'alice@shop.example.com', 'Alice Brown', NOW() - INTERVAL '60 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'alice@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'bob@shop.example.com', 'Bob Wilson', NOW() - INTERVAL '58 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'bob@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'carol@shop.example.com', 'Carol Davis', NOW() - INTERVAL '56 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'carol@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'david@shop.example.com', 'David Miller', NOW() - INTERVAL '54 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'david@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'emma@shop.example.com', 'Emma Thompson', NOW() - INTERVAL '52 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'emma@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'frank@shop.example.com', 'Frank Garcia', NOW() - INTERVAL '50 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'frank@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'grace@shop.example.com', 'Grace Lee', NOW() - INTERVAL '48 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'grace@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'henry@shop.example.com', 'Henry Kim', NOW() - INTERVAL '46 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'henry@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'iris@shop.example.com', 'Iris Nguyen', NOW() - INTERVAL '44 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'iris@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'jack@shop.example.com', 'Jack Parker', NOW() - INTERVAL '42 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'jack@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'kate@shop.example.com', 'Kate Anderson', NOW() - INTERVAL '40 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'kate@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'liam@shop.example.com', 'Liam Martinez', NOW() - INTERVAL '38 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'liam@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'mona@shop.example.com', 'Mona Hassan', NOW() - INTERVAL '36 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'mona@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'nick@shop.example.com', 'Nick Taylor', NOW() - INTERVAL '34 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'nick@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'olivia@shop.example.com', 'Olivia Clark', NOW() - INTERVAL '32 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'olivia@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'paul@shop.example.com', 'Paul Robinson', NOW() - INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'paul@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'quinn@shop.example.com', 'Quinn Lewis', NOW() - INTERVAL '28 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'quinn@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'rita@shop.example.com', 'Rita Hall', NOW() - INTERVAL '26 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'rita@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'steve@shop.example.com', 'Steve Young', NOW() - INTERVAL '24 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'steve@shop.example.com');

INSERT INTO recipients (email, name, created_at)
SELECT 'uma@shop.example.com', 'Uma Patel', NOW() - INTERVAL '22 days'
WHERE NOT EXISTS (SELECT 1 FROM recipients WHERE email = 'uma@shop.example.com');

-- ============================================================
-- STEP 3: Insert CAMPAIGNS (10 campaigns)
-- ============================================================

-- Get john's user_id first
-- Campaign 1: Draft
INSERT INTO campaigns (name, subject, body, status, created_by, created_at, updated_at)
SELECT 'New Year 2025 Collection', 'New 2025 Products', 'Hi {{name}}, welcome the new year with an exclusive collection!', 'draft', 
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'New Year 2025 Collection')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- Campaign 2: Draft
INSERT INTO campaigns (name, subject, body, status, created_by, created_at, updated_at)
SELECT 'Flash Sale Weekend', 'Weekend Flash Sale!', 'Hi {{name}}, only 48 hours! 50% off!', 'draft',
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'Flash Sale Weekend')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- Campaign 3: Scheduled
INSERT INTO campaigns (name, subject, body, status, scheduled_at, created_by, created_at, updated_at)
SELECT 'Summer Sale 2024', 'Summer Sale - 30% Off!', 'Hi {{name}}, Summer Sale is here!', 'scheduled',
    '2025-06-25 09:00:00'::TIMESTAMPTZ,
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'Summer Sale 2024')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- Campaign 4: Scheduled
INSERT INTO campaigns (name, subject, body, status, scheduled_at, created_by, created_at, updated_at)
SELECT 'Monthly Newsletter #6', 'June 2025 Newsletter', 'Hi {{name}}, June news update!', 'scheduled',
    '2025-06-01 08:00:00'::TIMESTAMPTZ,
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'Monthly Newsletter #6')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- Campaign 5: Sent
INSERT INTO campaigns (name, subject, body, status, created_by, created_at, updated_at)
SELECT 'Spring Newsletter', 'March Newsletter', 'Hi {{name}}, March news update!', 'sent',
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '30 days', NOW() - INTERVAL '1 day'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'Spring Newsletter')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- Campaign 6: Sent
INSERT INTO campaigns (name, subject, body, status, created_by, created_at, updated_at)
SELECT 'Womens Day Promotion', 'International Womens Day Offer', 'Hi {{name}}, happy March 8th!', 'sent',
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '25 days', NOW() - INTERVAL '2 days'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'Womens Day Promotion')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- Campaign 7: Sent
INSERT INTO campaigns (name, subject, body, status, created_by, created_at, updated_at)
SELECT 'Product Launch - Series X', 'Official Launch of Series X', 'Hi {{name}}, Series X has launched!', 'sent',
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 days'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'Product Launch - Series X')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- Campaign 8: Sent
INSERT INTO campaigns (name, subject, body, status, created_by, created_at, updated_at)
SELECT 'Anniversary Sale', '5th Anniversary - 25% Off', 'Hi {{name}}, the Shop turns 5 years old!', 'sent',
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '15 days', NOW() - INTERVAL '4 days'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'Anniversary Sale')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- Campaign 9: Sent
INSERT INTO campaigns (name, subject, body, status, created_by, created_at, updated_at)
SELECT 'Cyber Monday Deal', 'Cyber Monday - Up to 70% Off', 'Hi {{name}}, Cyber Monday is back!', 'sent',
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'Cyber Monday Deal')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- Campaign 10: Sent
INSERT INTO campaigns (name, subject, body, status, created_by, created_at, updated_at)
SELECT 'VIP Exclusive Offer', 'Special Exclusive Offer for VIPs', 'Hi {{name}}, thank you for being a VIP!', 'sent',
    (SELECT id FROM users WHERE email = 'john@company.com' LIMIT 1),
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days'
WHERE NOT EXISTS (SELECT 1 FROM campaigns WHERE name = 'VIP Exclusive Offer')
AND EXISTS (SELECT 1 FROM users WHERE email = 'john@company.com');

-- ============================================================
-- STEP 4: Insert CAMPAIGN RECIPIENTS
-- ============================================================

-- Campaign 3: Summer Sale - 5 recipients (pending)
INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
SELECT c.id, r.id, 'pending'
FROM campaigns c, recipients r
WHERE c.name = 'Summer Sale 2024'
AND r.email IN ('alice@shop.example.com', 'bob@shop.example.com', 'carol@shop.example.com', 'david@shop.example.com', 'emma@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Campaign 4: Monthly Newsletter - 3 recipients (pending)
INSERT INTO campaign_recipients (campaign_id, recipient_id, status)
SELECT c.id, r.id, 'pending'
FROM campaigns c, recipients r
WHERE c.name = 'Monthly Newsletter #6'
AND r.email IN ('frank@shop.example.com', 'grace@shop.example.com', 'henry@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Campaign 5: Spring Newsletter - 15 recipients (13 sent, 2 failed, 8 opened)
-- Sent + opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '29 days', NOW() - INTERVAL '28 days'
FROM campaigns c, recipients r
WHERE c.name = 'Spring Newsletter'
AND r.email IN ('alice@shop.example.com', 'bob@shop.example.com', 'carol@shop.example.com', 'david@shop.example.com', 'emma@shop.example.com', 'frank@shop.example.com', 'grace@shop.example.com', 'henry@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Sent, not opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '29 days', NULL
FROM campaigns c, recipients r
WHERE c.name = 'Spring Newsletter'
AND r.email IN ('iris@shop.example.com', 'jack@shop.example.com', 'kate@shop.example.com', 'liam@shop.example.com', 'mona@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Failed
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'failed', NOW() - INTERVAL '29 days', NULL
FROM campaigns c, recipients r
WHERE c.name = 'Spring Newsletter'
AND r.email IN ('nick@shop.example.com', 'olivia@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Campaign 6: Womens Day - ALL 20 recipients (ALL sent, first 15 opened)
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '24 days', 
    CASE WHEN r.email IN ('alice@shop.example.com', 'bob@shop.example.com', 'carol@shop.example.com', 'david@shop.example.com', 
                      'emma@shop.example.com', 'frank@shop.example.com', 'grace@shop.example.com', 'henry@shop.example.com', 
                      'iris@shop.example.com', 'jack@shop.example.com', 'kate@shop.example.com', 'liam@shop.example.com', 
                      'mona@shop.example.com', 'nick@shop.example.com', 'olivia@shop.example.com')
         THEN NOW() - INTERVAL '23 days'
    END
FROM campaigns c, recipients r
WHERE c.name = 'Womens Day Promotion'
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Campaign 7: Product Launch - 10 recipients (9 sent, 1 failed, 6 opened)
-- First 6 sent + opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '19 days', NOW() - INTERVAL '18 days'
FROM campaigns c, recipients r
WHERE c.name = 'Product Launch - Series X'
AND r.email IN ('alice@shop.example.com', 'bob@shop.example.com', 'carol@shop.example.com', 'david@shop.example.com', 'emma@shop.example.com', 'frank@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Last 3 sent, not opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '19 days', NULL
FROM campaigns c, recipients r
WHERE c.name = 'Product Launch - Series X'
AND r.email IN ('grace@shop.example.com', 'henry@shop.example.com', 'iris@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- 1 failed
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'failed', NOW() - INTERVAL '19 days', NULL
FROM campaigns c, recipients r
WHERE c.name = 'Product Launch - Series X'
AND r.email = 'jack@shop.example.com'
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Campaign 8: Anniversary Sale - 16 sent, 2 failed
-- First 10 sent + opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '14 days', NOW() - INTERVAL '13 days'
FROM campaigns c, recipients r
WHERE c.name = 'Anniversary Sale'
AND r.email IN ('alice@shop.example.com', 'bob@shop.example.com', 'carol@shop.example.com', 'david@shop.example.com', 
              'emma@shop.example.com', 'frank@shop.example.com', 'grace@shop.example.com', 'henry@shop.example.com', 
              'iris@shop.example.com', 'jack@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Last 6 sent, not opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '14 days', NULL
FROM campaigns c, recipients r
WHERE c.name = 'Anniversary Sale'
AND r.email IN ('kate@shop.example.com', 'liam@shop.example.com', 'mona@shop.example.com', 'nick@shop.example.com', 'olivia@shop.example.com', 'paul@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- 2 failed
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'failed', NOW() - INTERVAL '14 days', NULL
FROM campaigns c, recipients r
WHERE c.name = 'Anniversary Sale'
AND r.email IN ('quinn@shop.example.com', 'rita@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Campaign 9: Cyber Monday - 11 sent, 1 failed
-- First 7 sent + opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '9 days', NOW() - INTERVAL '8 days'
FROM campaigns c, recipients r
WHERE c.name = 'Cyber Monday Deal'
AND r.email IN ('alice@shop.example.com', 'bob@shop.example.com', 'carol@shop.example.com', 'david@shop.example.com', 
              'emma@shop.example.com', 'frank@shop.example.com', 'grace@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Next 4 sent, not opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '9 days', NULL
FROM campaigns c, recipients r
WHERE c.name = 'Cyber Monday Deal'
AND r.email IN ('henry@shop.example.com', 'iris@shop.example.com', 'jack@shop.example.com', 'kate@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- 1 failed
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'failed', NOW() - INTERVAL '9 days', NULL
FROM campaigns c, recipients r
WHERE c.name = 'Cyber Monday Deal'
AND r.email = 'liam@shop.example.com'
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Campaign 10: VIP - 8 sent, all opened
INSERT INTO campaign_recipients (campaign_id, recipient_id, status, sent_at, opened_at)
SELECT c.id, r.id, 'sent', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'
FROM campaigns c, recipients r
WHERE c.name = 'VIP Exclusive Offer'
AND r.email IN ('alice@shop.example.com', 'bob@shop.example.com', 'carol@shop.example.com', 'david@shop.example.com', 
              'emma@shop.example.com', 'frank@shop.example.com', 'grace@shop.example.com', 'henry@shop.example.com')
AND NOT EXISTS (SELECT 1 FROM campaign_recipients WHERE campaign_id = c.id AND recipient_id = r.id);

-- Re-enable triggers
ALTER TABLE campaigns ENABLE TRIGGER trg_campaigns_updated_at;

-- ============================================================
-- STEP 5: Show Results
-- ============================================================

SELECT 'Users' AS table_name, COUNT(*) AS count FROM users
UNION ALL
SELECT 'Recipients', COUNT(*) FROM recipients
UNION ALL
SELECT 'Campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'Campaign Recipients', COUNT(*) FROM campaign_recipients;

-- Show campaign stats
SELECT campaign_name, campaign_status, total, sent, failed, opened, open_rate, send_rate
FROM campaign_stats
ORDER BY campaign_name;

-- ============================================================
-- Insert Complete!
-- ============================================================