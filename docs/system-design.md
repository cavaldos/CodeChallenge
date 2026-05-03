# System Design — Mini Campaign Manager

## 1. Technology Stack

### Backend
| Category | Technology |
|----------|------------|
| Runtime | Node.js 18+ |
| Framework | Express 5.x |
| Database | PostgreSQL |
| ORM | Sequelize 6.x |
| Authentication | JWT (jsonwebtoken) |
| Validation | Zod 3.x |
| Testing | Jest + ts-jest |
| Dev Tools | TypeScript, ts-node-dev |

### Frontend
| Category | Technology |
|----------|------------|
| Framework | React 19.x |
| Build Tool | Vite 8.x |
| Language | TypeScript |
| State Management | Redux Toolkit + Redux Persist |
| Data Fetching | SWR 2.x |
| Routing | React Router DOM 7.x |
| UI Components | shadcn/ui + Tailwind CSS 4.x |
| Icons | Lucide React |

### Infrastructure
| Component | Details |
|-----------|---------|
| Container | Docker + Docker Compose |
| Database | PostgreSQL (hosted or local) |

---

## 2. Project Structure

```
CodeChallenge/
├── backend/                    # Express API
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/   # Route handlers
│   │   │   ├── middleware/    # Auth, validation
│   │   │   ├── repository/    # Database queries
│   │   │   ├── routes/        # API route definitions
│   │   │   └── utils/         # Helpers, validators
│   │   ├── config/            # App configuration
│   │   ├── app.ts             # Express app setup
│   │   └── server.ts          # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── components/        # UI components (shadcn)
│   │   ├── pages/             # Page components
│   │   ├── services/          # API calls
│   │   ├── redux/             # State management
│   │   ├── lib/               # Utilities
│   │   ├── App.tsx            # Root component
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── database/                  # DB scripts & schema
│   ├── schema.sql            # Table definitions
│   ├── mock-data.sql         # Seed data
│   └── setup-demo-data.sh   # Demo setup script
│
├── docs/                      # Documentation
│   ├── requiment.md          # Challenge requirements
│   └── system-design.md      # This file
│
├── docker-compose.yml         # Docker setup
└── README.md                  # Project overview
```

---

## 3. Database Schema

### Tables

#### 3.1 Users
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | User ID |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email |
| name | VARCHAR(255) | NOT NULL | Display name |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes:** `email` (unique)

#### 3.2 Campaigns
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Campaign ID |
| name | VARCHAR(255) | NOT NULL | Campaign name |
| subject | VARCHAR(500) | NOT NULL | Email subject |
| body | TEXT | NOT NULL | Email body content |
| status | ENUM | `draft`, `sending`, `scheduled`, `sent` | Current state |
| scheduled_at | TIMESTAMP | NULLABLE | Future scheduled time |
| created_by | UUID | FK → users.id | Creator user |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |
| updated_at | TIMESTAMP | AUTO UPDATE | Last update |

**Indexes:** `created_by`, `status`, `scheduled_at`

#### 3.3 Recipients
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Recipient ID |
| email | VARCHAR(255) | NOT NULL | Email address |
| name | VARCHAR(255) | NULLABLE | Display name |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation time |

**Indexes:** `email`

#### 3.4 CampaignRecipients
| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Junction ID |
| campaign_id | UUID | FK → campaigns.id | Campaign reference |
| recipient_id | UUID | FK → recipients.id | Recipient reference |
| sent_at | TIMESTAMP | NULLABLE | When email was sent |
| opened_at | TIMESTAMP | NULLABLE | When email was opened |
| status | ENUM | `pending`, `sent`, `failed` | Delivery status |

**Indexes:** `campaign_id`, `recipient_id`, (campaign_id, recipient_id) UNIQUE

### ERD Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │       │   Campaign   │       │ Recipient   │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │──┐    │ id (PK)      │    ┌──│ id (PK)     │
│ email       │  │    │ name         │    │  │ email       │
│ name        │  └───►│ subject      │    │  │ name        │
│ password    │       │ body         │    │  │ created_at  │
│ created_at  │       │ status       │    │  └─────────────┘
└─────────────┘       │ scheduled_at │    │
                      │ created_by ──┘    │
                      │ created_at  │    │
                      │ updated_at  │    │
                      └──────────────┘    │
                             │           │
                             ▼           │
                    ┌────────────────┐   │
                    │CampaignRecipient│◄──┘
                    ├────────────────┤
                    │ id (PK)        │
                    │ campaign_id (FK)│
                    │ recipient_id (FK)│
                    │ sent_at        │
                    │ opened_at      │
                    │ status         │
                    └────────────────┘
```

---

## 4. API Endpoints

### 4.1 Authentication

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "string (valid email)",
  "name": "string (min 1 char)",
  "password": "string (min 6 chars)"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": { "id": "uuid", "email": "...", "name": "..." }
}
```

---

#### POST /auth/login
Login and receive JWT token.

**Request Body:**
```json
{
  "email": "string (valid email)",
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "uuid", "email": "...", "name": "..." }
}
```

**Errors:** 401 (Invalid credentials)

---

### 4.2 Campaigns

#### GET /campaigns
List all campaigns for authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:** None

**Response (200):**
```json
{
  "campaigns": [
    {
      "id": "uuid",
      "name": "...",
      "subject": "...",
      "status": "draft|scheduled|sent",
      "scheduled_at": "ISO8601 or null",
      "created_at": "ISO8601",
      "created_by": "uuid"
    }
  ]
}
```

---

#### POST /campaigns
Create a new campaign.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "string (required)",
  "subject": "string (required)",
  "body": "string (required)",
  "recipientIds": ["uuid"] (optional, array of recipient IDs)
}
```

**Response (201):**
```json
{
  "campaign": { "id": "uuid", "name": "...", "status": "draft", ... }
}
```

**Validation Rules:**
- `name`, `subject`, `body` are required
- All fields are strings

---

#### GET /campaigns/:id
Get campaign details with recipient stats.

**Headers:** `Authorization: Bearer <token>`

**Parameters:** `id` (UUID, campaign ID)

**Response (200):**
```json
{
  "campaign": {
    "id": "uuid",
    "name": "...",
    "subject": "...",
    "body": "...",
    "status": "...",
    "scheduled_at": "...",
    "created_at": "...",
    "stats": {
      "total": 10,
      "sent": 8,
      "failed": 2,
      "opened": 5,
      "open_rate": 62.5,
      "send_rate": 80
    }
  }
}
```

**Errors:** 404 (Campaign not found)

---

#### PATCH /campaigns/:id
Update campaign (draft only).

**Headers:** `Authorization: Bearer <token>`

**Parameters:** `id` (UUID, campaign ID)

**Request Body:**
```json
{
  "name": "string (optional)",
  "subject": "string (optional)",
  "body": "string (optional)"
}
```

**Response (200):**
```json
{
  "campaign": { "id": "...", "name": "...", ... }
}
```

**Business Rules:**
- Only allowed when `status === 'draft'`
- Returns 400 if campaign is not in draft status

---

#### DELETE /campaigns/:id
Delete a campaign (draft only).

**Headers:** `Authorization: Bearer <token>`

**Parameters:** `id` (UUID, campaign ID)

**Response:** 204 No Content

**Business Rules:**
- Only allowed when `status === 'draft'`
- Returns 400 if campaign is not in draft status

---

#### POST /campaigns/:id/schedule
Schedule campaign for future sending.

**Headers:** `Authorization: Bearer <token>`

**Parameters:** `id` (UUID, campaign ID)

**Request Body:**
```json
{
  "scheduled_at": "ISO8601 timestamp (future)"
}
```

**Response (200):**
```json
{
  "campaign": { "id": "...", "status": "scheduled", "scheduled_at": "..." }
}
```

**Business Rules:**
- `scheduled_at` must be in the future
- Campaign must be in `draft` status
- Status changes to `scheduled`

---

#### POST /campaigns/:id/send
Simulate async sending of campaign.

**Headers:** `Authorization: Bearer <token>`

**Parameters:** `id` (UUID, campaign ID)

**Request Body:** Empty

**Response (200):**
```json
{
  "message": "Campaign sending initiated",
  "campaign": { "id": "...", "status": "sent" }
}
```

**Business Rules:**
- Campaign must have at least one recipient
- Status changes to `sent` (cannot be undone)
- Recipients are randomly marked as `sent` or `failed`

---

### 4.3 Recipients

#### GET /recipients
List all recipients.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "recipients": [
    { "id": "uuid", "email": "...", "name": "...", "created_at": "..." }
  ]
}
```

---

#### POST /recipient
Create a new recipient.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "string (valid email)",
  "name": "string (optional)"
}
```

**Response (201):**
```json
{
  "recipient": { "id": "uuid", "email": "...", "name": "..." }
}
```

**Validation:**
- `email` must be unique
- `email` must be valid format

---

## 5. Business Rules Summary

| Rule | Description |
|------|-------------|
| Draft-only edit | Campaign can only be edited/deleted when status is `draft` |
| Future schedule | `scheduled_at` must be a future timestamp |
| Irreversible send | Sending changes status to `sent` and cannot be undone |
| Stats calculation | Returns total, sent, failed, opened, open_rate, send_rate |
| Auth required | All campaign/recipient endpoints require JWT token |

---

## 6. Frontend Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Login form, JWT storage |
| `/campaigns` | Campaigns List | List all campaigns with status badges |
| `/campaigns/new` | Create Campaign | Form to create new campaign |
| `/campaigns/:id` | Campaign Detail | Stats, recipients, action buttons |

---

## 7. Deployment

- **Backend:** Express server on port 5001
- **Frontend:** Vite dev server on port 5173
- **Database:** PostgreSQL on port 5432
- **Live URL:** http://113.173.72.198:5173

---

*Document generated for Mini Campaign Manager code challenge.*