# Backend & Database Todo Plan — Mini Campaign Manager

## Goal
Build the backend and database for Mini Campaign Manager according to `guide.md` and `requiment.md`, prioritizing:
- Node.js + Express
- PostgreSQL + Sequelize
- Validate input with Zod
- Enforce business rules server-side
- Include migrations, tests, and local run documentation

---

## Phase 0 — Initialize and standardize the foundation

### 0.1 Verify and standardize backend structure
- [ ] Define a standard backend folder structure:
  - `src/config`
  - `src/modules`
  - `src/middlewares`
  - `src/lib`
  - `src/types`
  - `src/utils`
  - `src/db/models`
  - `src/db/migrations`
  - `src/db/seeders` (if needed)
- [ ] Review existing dependencies in `backend/package.json`
- [ ] Add missing dependencies:
  - `zod`
  - `bcrypt` / `bcryptjs`
  - `sequelize-cli` or equivalent migration solution
  - test framework (`vitest` or `jest` + `supertest`)
- [ ] Standardize scripts in `package.json`:
  - `dev`
  - `build`
  - `start`
  - `test`
  - `test:watch`
  - `lint` (if present)
  - `db:migrate`
  - `db:migrate:undo`
  - `db:seed` (optional)
- [ ] Enable TypeScript strict mode in `tsconfig.json`
- [ ] Remove or minimize `any`, replacing with `unknown` + type guards where needed

### 0.2 Set up environment and config
- [ ] Define required environment variables:
  - `PORT`
  - `NODE_ENV`
  - `DATABASE_URL` or separate Postgres variables
  - `JWT_SECRET`
  - `JWT_EXPIRES_IN`
  - `BCRYPT_SALT_ROUNDS`
- [ ] Update `.env.example` fully without including real secrets
- [ ] Create a safe env loader module that fail-fast when required config is missing
- [ ] Standardize config for development/test/production environments

---

## Phase 1 — Database design with Sequelize

### 1.1 Finalize schema and enums
- [ ] Declare business enums:
  - `CampaignStatus = draft | sending | scheduled | sent`
  - `CampaignRecipientStatus = pending | sent | failed`
- [ ] Confirm column naming mapping according to spec:
  - `password_hash`
  - `created_at`
  - `updated_at`
  - `scheduled_at`
  - `created_by`
- [ ] Decide on model name vs table name convention to avoid mismatches

### 1.2 Create Sequelize models
- [ ] Create `User` model
  - fields: `id`, `email`, `name`, `password_hash`, `created_at`
  - unique email
- [ ] Create `Campaign` model
  - fields: `id`, `name`, `subject`, `body`, `status`, `scheduled_at`, `created_by`, `created_at`, `updated_at`
- [ ] Create `Recipient` model
  - fields: `id`, `email`, `name`, `created_at`
- [ ] Create `CampaignRecipient` model
  - fields: `campaign_id`, `recipient_id`, `status`, `sent_at`, `opened_at`
  - composite primary key `(campaign_id, recipient_id)`
- [ ] Add clear typing for attributes, creation attributes, and return types for each model

### 1.3 Define associations
- [ ] `User.hasMany(Campaign, { foreignKey: created_by })`
- [ ] `Campaign.belongsTo(User, { foreignKey: created_by })`
- [ ] `Campaign.belongsToMany(Recipient, through: CampaignRecipient)`
- [ ] `Recipient.belongsToMany(Campaign, through: CampaignRecipient)`
- [ ] `Campaign.hasMany(CampaignRecipient)`
- [ ] `Recipient.hasMany(CampaignRecipient)`
- [ ] Verify eager loading for campaign detail and stats

### 1.4 Write migrations
- [ ] Create migration for `users` table
- [ ] Create migration for `campaigns` table
- [ ] Create migration for `recipients` table
- [ ] Create migration for `campaign_recipients` table
- [ ] Add foreign key constraints according to spec
- [ ] Set `ON DELETE CASCADE` for `campaign_recipients.campaign_id`
- [ ] Ensure timestamps use a PostgreSQL-compatible timezone strategy

### 1.5 Create required indexes
- [ ] `idx_users_email` on `users.email`
- [ ] `idx_campaigns_created_by` on `campaigns.created_by`
- [ ] `idx_campaigns_status` on `campaigns.status`
- [ ] `idx_campaigns_scheduled_at` on `campaigns.scheduled_at`
- [ ] `idx_recipients_email` on `recipients.email`
- [ ] `idx_cr_campaign_id` on `campaign_recipients.campaign_id`
- [ ] `idx_cr_campaign_status` on `(campaign_id, status)`
- [ ] Document the reason for each index to explain during review

### 1.6 Minimum seed data (recommended)
- [ ] Create a sample seed user
- [ ] Create several sample recipients
- [ ] Create 1–2 demo campaigns for local testing

---

## Phase 2 — Backend architecture and shared utilities

### 2.1 Connect the database
- [ ] Create Sequelize instance/config for development and test
- [ ] Create DB bootstrap logic when app starts
- [ ] Add a simple health check for database connectivity

### 2.2 Standardize API foundation
- [ ] Create Express app with base middleware:
  - `express.json()`
  - `cors`
  - `helmet`
  - request logger
- [ ] Create a route versioning structure if needed (`/api` or `/api/v1`)
- [ ] Standardize success and error response shapes
- [ ] Create a global error handler with format:
  - `error`
  - `message`

### 2.3 Shared helpers
- [ ] Create a helper to hash passwords
- [ ] Create a helper to compare passwords
- [ ] Create a helper to sign JWTs
- [ ] Create a helper to verify JWTs
- [ ] Create a pagination parser helper (`page`, `limit`)
- [ ] Create a campaign stats helper
- [ ] Create custom error classes or an error map for business codes

---

## Phase 3 — Validation with Zod

### 3.1 Auth schemas
- [ ] Zod schema for `POST /auth/register`
- [ ] Zod schema for `POST /auth/login`
- [ ] Validate email format, password length, and required fields

### 3.2 Campaign schemas
- [ ] Zod schema for `GET /campaigns` query params (`page`, `limit`, `status`)
- [ ] Zod schema for `POST /campaigns`
- [ ] Zod schema for `PATCH /campaigns/:id`
- [ ] Zod schema for `POST /campaigns/:id/schedule`
- [ ] Zod schema for route params (`id` is UUID)
- [ ] Validate `recipient_ids` as a deduplicated array of UUIDs
- [ ] Ensure partial update semantics are correct for PATCH

### 3.3 Recipient schemas
- [ ] Zod schema for `GET /recipients` query params
- [ ] Zod schema for `POST /recipients`

### 3.4 Validation middleware
- [ ] Create middleware to validate `body`
- [ ] Create middleware to validate `query`
- [ ] Create middleware to validate `params`
- [ ] Map Zod errors to HTTP 400 + `VALIDATION_ERROR`

---

## Phase 4 — Authentication & authorization

### 4.1 Auth module
- [ ] Implement `POST /auth/register`
- [ ] Hash passwords before saving to the DB
- [ ] Block duplicate emails, return `409 CONFLICT`
- [ ] Return the correct response shape according to spec
- [ ] Implement `POST /auth/login`
- [ ] Verify email/password
- [ ] Return a JWT that expires in 24h or equivalent config

### 4.2 Auth middleware
- [ ] Create middleware to read `Authorization: Bearer <token>` header
- [ ] Reject when token is missing or invalid/expired
- [ ] Attach the authenticated `user` to the request context with typing

### 4.3 Ownership guard
- [ ] Create a helper/middleware that checks campaign ownership for the current user
- [ ] Return `403 FORBIDDEN` when the owner does not match

---

## Phase 5 — Recipient module

### 5.1 `GET /recipients`
- [ ] Implement recipient listing with pagination
- [ ] Return `data` + `pagination` in the correct format

### 5.2 `POST /recipients`
- [ ] Implement recipient creation
- [ ] Block duplicate recipient emails, return `409 CONFLICT`
- [ ] Return a `201` response in the correct format

---

## Phase 6 — Campaign module

### 6.1 `GET /campaigns`
- [ ] Implement listing campaigns for the authenticated user
- [ ] Support filtering by `status`
- [ ] Support `page` and `limit`
- [ ] Return summary stats for each campaign:
  - `total`
  - `sent`
  - `failed`
  - `opened`
- [ ] Optimize queries to avoid N+1 when loading stats

### 6.2 `POST /campaigns`
- [ ] Implement campaign creation with default status `draft`
- [ ] Allow attaching `recipient_ids` during creation
- [ ] Verify all `recipient_ids` exist
- [ ] If a recipient is missing, return `404 RECIPIENT_NOT_FOUND`
- [ ] Use a transaction for campaign creation + recipient attachment

### 6.3 `GET /campaigns/:id`
- [ ] Implement campaign detail
- [ ] Verify ownership
- [ ] Return full campaign info + recipients + stats
- [ ] Calculate:
  - `open_rate = opened / sent`
  - `send_rate = sent / total`
- [ ] Handle divide-by-zero safely

### 6.4 `PATCH /campaigns/:id`
- [ ] Allow updates only when status is `draft`
- [ ] Support partial updates
- [ ] Update `updated_at`
- [ ] Return `422 CAMPAIGN_NOT_DRAFT` when status is not `draft`

### 6.5 `DELETE /campaigns/:id`
- [ ] Allow delete only when status is `draft`
- [ ] Verify ownership before deleting
- [ ] Delete the campaign and cascade `campaign_recipients`
- [ ] Return a success message in the correct spec

### 6.6 `POST /campaigns/:id/schedule`
- [ ] Allow scheduling only when status is `draft`
- [ ] Validate `scheduled_at` is a future timestamp
- [ ] Update status to `scheduled`
- [ ] Return `422 SCHEDULED_AT_PAST` if the schedule is in the past

### 6.7 `POST /campaigns/:id/send`
- [ ] Block sending a campaign that has already been `sent`
- [ ] Block sending when the campaign has no recipients
- [ ] Update status to `sending` before processing
- [ ] Mock asynchronous or pseudo-async sending as required
- [ ] For each recipient:
  - 90% `sent`
  - 10% `failed`
  - set `sent_at` if sending succeeds
- [ ] After processing all recipients, update campaign status to `sent`
- [ ] Return the final stats in the correct format
- [ ] Consider transactions or a consistent data strategy as appropriate

---

## Phase 7 — Business rules & domain integrity

- [ ] Ensure all business rules are enforced on the server, not trusted to the client
- [ ] Ensure only the owner can view/edit/delete/send/schedule their campaign
- [ ] Ensure a campaign cannot return to `draft` after being sent
- [ ] Ensure errors return the correct HTTP status and error code per spec
- [ ] Review the difference between `POST /recipient` and `POST /recipients`, choose one consistent convention, and document it in the README if needed

---

## Phase 8 — Testing (at least 3 meaningful tests)

### 8.1 Setup test environment
- [ ] Choose a test framework (`vitest` is recommended)
- [ ] Configure a separate test database
- [ ] Configure database reset between tests
- [ ] Add `supertest` for API integration testing

### 8.2 Required test cases
- [ ] Test successful registration and block duplicate emails
- [ ] Test login returns a JWT when credentials are correct
- [ ] Test that campaign updates are rejected when status is not `draft`
- [ ] Test schedule rejects when `scheduled_at` is in the past
- [ ] Test send campaign returns `NO_RECIPIENTS` when there are no recipients
- [ ] Test ownership: user A cannot view/edit/delete user B's campaign

### 8.3 Test stats/business logic
- [ ] Test the stats helper for cases with `0 recipients`, `all sent`, and `mixed sent/failed/opened`
- [ ] Test that `open_rate` and `send_rate` are calculated correctly

---

## Phase 9 — Documentation and local operation

- [ ] Write instructions for running the backend locally in `backend/README.md`
- [ ] Document env configuration
- [ ] Document database migration steps
- [ ] Document how to run tests
- [ ] Document endpoint base URL and a short auth flow
- [ ] Prepare seed/demo scripts if applicable

---

## Phase 10 — Final verification checklist

- [ ] Run migrations from scratch on a clean database
- [ ] Run all tests and ensure they pass
- [ ] Build TypeScript without errors
- [ ] Verify strict typing in key modules
- [ ] Manually test auth/campaign/recipient endpoints
- [ ] Verify response shapes match `guide.md`
- [ ] Verify `.env` or real secrets are not committed
- [ ] Prepare a conventional commit message, for example:
  - `feat(backend): implement campaign manager api with sequelize and zod`

---

## Suggested implementation priorities
1. Setup backend foundation
2. Database models + migrations + indexes
3. Auth + JWT
4. Recipient APIs
5. Campaign APIs
6. Business rules
7. Tests
8. README + polish

### 6.7 `POST /campaigns/:id/send`
- [ ] Chặn gửi lại campaign đã `sent`
- [ ] Chặn gửi khi campaign không có recipient
- [ ] Update status sang `sending` trước khi xử lý
- [ ] Mô phỏng gửi bất đồng bộ hoặc pseudo-async theo yêu cầu
- [ ] Với từng recipient:
  - 90% `sent`
  - 10% `failed`
  - set `sent_at` nếu gửi thành công
- [ ] Sau khi xử lý xong toàn bộ recipients, update campaign thành `sent`
- [ ] Trả stats cuối cùng đúng format
- [ ] Cân nhắc transaction hoặc chiến lược nhất quán dữ liệu phù hợp

---

## Phase 7 — Business rules & domain integrity

- [ ] Đảm bảo tất cả business rules đều enforce ở server, không tin client
- [ ] Đảm bảo chỉ owner mới xem/sửa/xóa/gửi/schedule campaign của mình
- [ ] Đảm bảo campaign không thể quay lại `draft` sau khi gửi
- [ ] Đảm bảo lỗi trả đúng HTTP status và error code theo spec
- [ ] Rà soát sự khác nhau giữa `POST /recipient` và `POST /recipients`, chọn một convention nhất quán và ghi rõ trong README nếu cần

---

## Phase 8 — Testing (ít nhất 3 test meaningful)

### 8.1 Setup test environment
- [ ] Chọn framework test (`vitest` khuyến nghị)
- [ ] Cấu hình test DB riêng
- [ ] Cấu hình reset database giữa các test
- [ ] Thêm `supertest` để test API integration

### 8.2 Test cases bắt buộc
- [ ] Test register thành công và chặn email trùng
- [ ] Test login trả JWT khi credentials đúng
- [ ] Test không cho update campaign khi status khác `draft`
- [ ] Test schedule reject khi `scheduled_at` ở quá khứ
- [ ] Test send campaign trả `NO_RECIPIENTS` khi chưa có recipient
- [ ] Test ownership: user A không xem/sửa/xóa campaign của user B

### 8.3 Test stats/business logic
- [ ] Test hàm tính stats với các case `0 recipients`, `all sent`, `mixed sent/failed/opened`
- [ ] Test tỉ lệ `open_rate` và `send_rate` chính xác

---

## Phase 9 — Tài liệu và vận hành local

- [ ] Viết hướng dẫn chạy backend local trong `backend/README.md`
- [ ] Ghi rõ cách cấu hình env
- [ ] Ghi rõ cách migrate database
- [ ] Ghi rõ cách chạy test
- [ ] Ghi rõ endpoint base URL và auth flow ngắn gọn
- [ ] Chuẩn bị seed/demo script nếu có

---

## Phase 10 — Final verification checklist

- [ ] Chạy migration từ đầu trên database sạch
- [ ] Chạy toàn bộ test và đảm bảo pass
- [ ] Build TypeScript không lỗi
- [ ] Kiểm tra strict typing ở các module chính
- [ ] Test thủ công các endpoint auth/campaign/recipient
- [ ] Kiểm tra response shape khớp `guide.md`
- [ ] Kiểm tra không commit `.env` hoặc secrets thật
- [ ] Chuẩn bị commit message theo conventional commits, ví dụ:
  - `feat(backend): implement campaign manager api with sequelize and zod`

---

## Ưu tiên triển khai đề xuất
1. Setup backend foundation
2. Database models + migrations + indexes
3. Auth + JWT
4. Recipient APIs
5. Campaign APIs
6. Business rules
7. Tests
8. README + polish
