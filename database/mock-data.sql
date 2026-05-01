-- ============================================================
-- Mock data / seed data
-- ============================================================

-- Demo user  (password: "password123" — bcrypt hash placeholder)
INSERT INTO
    users (
        id,
        email,
        name,
        password_hash
    )
VALUES (
        '11111111-1111-1111-1111-111111111111',
        'demo@example.com',
        'Demo User',
        '$2b$10$PLACEHOLDER_HASH_REPLACE_ME'
    );

-- Demo recipients
INSERT INTO
    recipients (id, email, name)
VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'alice@example.com',
        'Alice'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'bob@example.com',
        'Bob'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'carol@example.com',
        'Carol'
    );

-- Demo campaigns
INSERT INTO
    campaigns (
        id,
        name,
        subject,
        body,
        status,
        created_by
    )
VALUES (
        '22222222-2222-2222-2222-222222222222',
        'Welcome Campaign',
        'Welcome to our platform!',
        'Hi {{name}}, thanks for joining us.',
        'draft',
        '11111111-1111-1111-1111-111111111111'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'May Newsletter',
        'What''s new in May',
        'Here''s everything happening this month...',
        'sent',
        '11111111-1111-1111-1111-111111111111'
    );

-- Link recipients to campaigns
INSERT INTO
    campaign_recipients (
        campaign_id,
        recipient_id,
        status,
        sent_at
    )
VALUES (
        '33333333-3333-3333-3333-333333333333',
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'sent',
        NOW() - INTERVAL '1 day'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'sent',
        NOW() - INTERVAL '1 day'
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'failed',
        NULL
    );
