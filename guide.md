# 📧 Mini Campaign Manager

A full-stack MarTech tool that lets marketers create, manage, and track email campaigns.

---

## Database Schema

### Relationship diagram

```
User ──< Campaign ──< CampaignRecipient >── Recipient
```

---

### `users` table

Stores marketer account information registered in the system.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login email |
| `name` | VARCHAR(255) | NOT NULL | Display name |
| `password_hash` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | Account creation time |

**Indexes:**
- `idx_users_email` on `email` — fast lookup for login and JWT authentication

---

### `campaigns` table

Core entity representing an email campaign.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Campaign name (internal) |
| `subject` | VARCHAR(500) | NOT NULL | Email subject line |
| `body` | TEXT | NOT NULL | Email content (HTML) |
| `status` | ENUM | NOT NULL, default `draft` | Status: `draft` \| `sending` \| `scheduled` \| `sent` |
| `scheduled_at` | TIMESTAMPTZ | nullable | Scheduled send time (if any) |
| `created_by` | UUID | NOT NULL, FK → `users.id` | Campaign creator |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | Creation time |
| `updated_at` | TIMESTAMPTZ | NOT NULL, default NOW() | Last update time |

**Indexes:**
- `idx_campaigns_created_by` on `created_by` — list campaigns by user
- `idx_campaigns_status` on `status` — filter campaigns by status
- `idx_campaigns_scheduled_at` on `scheduled_at` — scheduler polls campaigns due to send

---

### `recipients` table

Stores all email recipients in the system.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Recipient email address |
| `name` | VARCHAR(255) | NOT NULL | Recipient name |
| `created_at` | TIMESTAMPTZ | NOT NULL, default NOW() | Time added to system |

**Indexes:**
- `idx_recipients_email` on `email` — duplicate check when adding new recipients

---

### `campaign_recipients` table

Join table tracking the send status of each recipient for each campaign.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `campaign_id` | UUID | NOT NULL, FK → `campaigns.id` ON DELETE CASCADE | Campaign ID |
| `recipient_id` | UUID | NOT NULL, FK → `recipients.id` | Recipient ID |
| `status` | ENUM | NOT NULL, default `pending` | Status: `pending` \| `sent` \| `failed` |
| `sent_at` | TIMESTAMPTZ | nullable | Time sent successfully |
| `opened_at` | TIMESTAMPTZ | nullable | Time the recipient opened the email |

**Primary Key:** `(campaign_id, recipient_id)` — composite key prevents duplicate recipients in the same campaign

**Indexes:**
- `idx_cr_campaign_id` on `campaign_id` — fetch all recipients for a campaign
- `idx_cr_campaign_status` on `(campaign_id, status)` — compute status-grouped stats (COUNT GROUP BY) without scanning the whole table

---

## API Reference

Base URL: `http://localhost:3000`

All responses return JSON. Endpoints marked with 🔒 require the header:
```
Authorization: Bearer <token>
```

---

### Auth

#### `POST /auth/register` — Register a new account

Creates a marketer account. Email must be unique in the system.

```json
// Request
{
  "email": "jane@company.com",
  "name": "Jane Doe",
  "password": "secret123"
}

// Response 201
{
  "id": "uuid",
  "email": "jane@company.com",
  "name": "Jane Doe",
  "created_at": "2025-01-01T00:00:00Z"
}
```

| Error | Status | Description |
|---|---|---|
| Email already exists | 409 | `CONFLICT` |
| Invalid data | 400 | `VALIDATION_ERROR` |

---

#### `POST /auth/login` — Log in

Authenticates the account and returns a JWT token for subsequent requests. Token expires in 24 hours.

```json
// Request
{
  "email": "jane@company.com",
  "password": "secret123"
}

// Response 200
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "jane@company.com",
    "name": "Jane Doe"
  }
}
```

| Error | Status | Description |
|---|---|---|
| Wrong email/password | 401 | `INVALID_CREDENTIALS` |

---

### Campaigns

#### `GET /campaigns` 🔒 — Campaign list

Returns all campaigns belonging to the logged-in user, with summary stats. Supports pagination and filtering by status.

```
GET /campaigns?page=1&limit=20&status=draft
```

```json
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "name": "Summer Sale",
      "subject": "Don't miss out!",
      "status": "draft",
      "scheduled_at": null,
      "created_at": "2025-01-01T00:00:00Z",
      "stats": {
        "total": 150,
        "sent": 0,
        "failed": 0,
        "opened": 0
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

#### `POST /campaigns` 🔒 — Create a new campaign

Creates a new campaign with a default status of `draft`. Recipient IDs can be attached at creation time.

```json
// Request
{
  "name": "Summer Sale",
  "subject": "Don't miss out this summer!",
  "body": "<h1>Hello</h1><p>Check out our latest deals...</p>",
  "recipient_ids": ["uuid1", "uuid2", "uuid3"]
}

// Response 201
{
  "id": "uuid",
  "name": "Summer Sale",
  "subject": "Don't miss out this summer!",
  "status": "draft",
  "scheduled_at": null,
  "created_at": "2025-01-01T00:00:00Z"
}
```

| Error | Status | Description |
|---|---|---|
| Missing required field | 400 | `VALIDATION_ERROR` |
| `recipient_ids` not found | 404 | `RECIPIENT_NOT_FOUND` |

---

#### `GET /campaigns/:id` 🔒 — Campaign details

Returns full campaign information, including complete stats and recipient list with each send status.

```json
// Response 200
{
  "id": "uuid",
  "name": "Summer Sale",
  "subject": "Don't miss out this summer!",
  "body": "<h1>Hello</h1>...",
  "status": "sent",
  "scheduled_at": null,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-02T10:00:00Z",
  "stats": {
    "total": 200,
    "sent": 190,
    "failed": 10,
    "opened": 78,
    "open_rate": 0.41,
    "send_rate": 0.95
  },
  "recipients": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John",
      "status": "sent",
      "sent_at": "2025-01-02T10:00:00Z",
      "opened_at": null
    }
  ]
}
```

> `open_rate` = `opened / sent` — open rate among successfully sent emails
>
> `send_rate` = `sent / total` — successful send rate across all recipients

---

#### `PATCH /campaigns/:id` 🔒 — Update a campaign

Updates campaign data. **Only works when status is `draft`.** Supports partial updates, so send only the fields you want to change.

```json
// Request (partial update)
{
  "name": "Summer Sale 2025",
  "subject": "Updated subject line"
}

// Response 200
{
  "id": "uuid",
  "name": "Summer Sale 2025",
  "subject": "Updated subject line",
  "status": "draft",
  "updated_at": "2025-01-01T12:00:00Z"
}
```

| Error | Status | Description |
|---|---|---|
| Campaign is not `draft` | 422 | `CAMPAIGN_NOT_DRAFT` |
| Campaign not found | 404 | `NOT_FOUND` |
| Not the owner | 403 | `FORBIDDEN` |

---

#### `DELETE /campaigns/:id` 🔒 — Delete a campaign

Permanently deletes the campaign and all related `campaign_recipients` data (CASCADE). **Only campaigns with status `draft` can be deleted.**

```json
// Response 200
{
  "message": "Campaign deleted successfully"
}
```

| Error | Status | Description |
|---|---|---|
| Campaign is not `draft` | 422 | `CAMPAIGN_NOT_DRAFT` |
| Not the owner | 403 | `FORBIDDEN` |

---

#### `POST /campaigns/:id/schedule` 🔒 — Schedule a send

Sets a future send time for the campaign. Changes status from `draft` to `scheduled`.

```json
// Request
{
  "scheduled_at": "2025-12-25T09:00:00Z"
}

// Response 200
{
  "id": "uuid",
  "status": "scheduled",
  "scheduled_at": "2025-12-25T09:00:00Z"
}
```

| Error | Status | Description |
|---|---|---|
| `scheduled_at` is in the past | 422 | `SCHEDULED_AT_PAST` |
| Campaign is not `draft` | 422 | `CAMPAIGN_NOT_DRAFT` |

---

#### `POST /campaigns/:id/send` 🔒 — Send a campaign

Triggers an asynchronous email send process (simulated). Status immediately changes to `sending`, and after all recipients are processed it changes to `sent`. This action is irreversible.

**Simulation behavior:**
- Each `campaign_recipient` is processed with a 90% chance of `sent`, 10% chance of `failed`
- `sent_at` is updated for successful records
- After all recipients are processed, campaign status becomes `sent`

```json
// Response 200
{
  "message": "Campaign sent successfully",
  "stats": {
    "total": 200,
    "sent": 183,
    "failed": 17,
    "opened": 0,
    "open_rate": 0,
    "send_rate": 0.915
  }
}
```

| Error | Status | Description |
|---|---|---|
| Campaign already sent | 422 | `CAMPAIGN_ALREADY_SENT` |
| Campaign has no recipients | 422 | `NO_RECIPIENTS` |

---

### Recipients

#### `GET /recipients` 🔒 — Recipient list

Returns all recipients in the system. Used to select recipients when creating or editing a campaign.

```json
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "email": "john@example.com",
      "name": "John Doe",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 120
  }
}
```

---

#### `POST /recipients` 🔒 — Thêm người nhận mới

Tạo một recipient mới vào hệ thống. Email phải là duy nhất.

```json
// Request
{
  "email": "john@example.com",
  "name": "John Doe"
}

// Response 201
{
  "id": "uuid",
  "email": "john@example.com",
  "name": "John Doe",
  "created_at": "2025-01-01T00:00:00Z"
}
```

| Lỗi | Status | Mô tả |
|---|---|---|
| Email đã tồn tại | 409 | `CONFLICT` |

---

### Error Response Format

Tất cả lỗi đều trả về cùng một cấu trúc:

```json
{
  "error": "CAMPAIGN_NOT_DRAFT",
  "message": "Campaign can only be edited when status is draft"
}
```

| HTTP Status | Error Code | Tình huống |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Request body không hợp lệ |
| 401 | `UNAUTHORIZED` | Thiếu hoặc JWT hết hạn |
| 401 | `INVALID_CREDENTIALS` | Sai email/password |
| 403 | `FORBIDDEN` | Không có quyền thao tác resource |
| 404 | `NOT_FOUND` | Resource không tồn tại |
| 409 | `CONFLICT` | Email đã được đăng ký |
| 422 | `CAMPAIGN_NOT_DRAFT` | Thao tác chỉ cho phép trên campaign `draft` |
| 422 | `CAMPAIGN_ALREADY_SENT` | Campaign đã gửi, không thể gửi lại |
| 422 | `SCHEDULED_AT_PAST` | `scheduled_at` không được là thời điểm quá khứ |
| 422 | `NO_RECIPIENTS` | Campaign chưa có người nhận |

---

## Business Rules

| Rule | Mô tả |
|---|---|
| Chỉ sửa/xóa `draft` | `PATCH` và `DELETE` trả về 422 nếu status khác `draft` |
| `scheduled_at` phải là tương lai | Validate `scheduled_at > NOW()` ở server, không tin client |
| Gửi là hành động một chiều | Sau khi gọi `/send`, status không thể quay lại `draft` hay `scheduled` |
| Ownership | User chỉ xem và thao tác được campaign của chính mình |
| Cascade xóa | Xóa campaign sẽ xóa toàn bộ `campaign_recipients` liên quan |