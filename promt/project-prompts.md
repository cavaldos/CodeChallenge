# Prompt Suggestions Based on Current Project Logic

## 1. Frontend — Login Page
```text
Create a React + TypeScript login page that matches this logic exactly.

Requirements:
- Use local component state for `email`, `password`, `error`, and `isSubmitting`
- Submit with `login({ email, password })`
- After success, call `mutateAuth()`
- Then navigate to `/campaigns` with `replace: true`
- Show an error alert when login fails
- Disable the submit button while submitting
- Include a Back button that navigates to `/`
```

## 2. Frontend — Campaign List Page
```text
Create a React + TypeScript `/campaigns` page that matches this logic exactly.

Requirements:
- Fetch campaigns with `useCampaigns()`
- Read the list from `data?.data ?? []`
- Show a skeleton card while loading
- Show a destructive alert when the request fails
- Show an empty-state card when there are no campaigns
- Otherwise render a table with these columns:
  - `Name`
  - `Subject`
  - `Recipients`
  - `Opened`
  - `Status`
  - `Action`

Use these exact status mappings:
- `draft -> muted / Draft`
- `scheduled -> secondary / Scheduled`
- `sending -> warning / Sending`
- `sent -> success / Sent`

Navigation:
- The action button should navigate to `/campaigns/:id`
- The top button should navigate to `/campaigns/new`
```

## 3. Frontend — Create Campaign Page
```text
Create a React + TypeScript `/campaigns/new` page that matches this logic exactly.

Requirements:
- Manage `name`, `subject`, `body`, `recipientEmails`, `error`, and `isSubmitting` in local state
- Load existing recipients with `useRecipients()`
- Read recipients from `data?.data ?? []`
- Parse recipient emails by:
  - splitting the textarea value on commas or new lines
  - trimming each value
  - removing empty items

Recipient handling logic:
- For each parsed email, reuse an existing recipient if `recipient.email === email`
- Otherwise create one with:
  `createRecipient({ email, name: email.split('@')[0] ?? 'Recipient' })`
- Collect all recipient ids
- Submit with:
  `createCampaign({ name, subject, body, recipient_ids: recipientIds })`

After success:
- Call `mutate()`
- Navigate to `/campaigns`

UI behavior:
- Show recipient loading text while recipients are loading
- Show recipient error text if recipient loading fails
- Show a destructive alert if campaign creation fails
- Disable the submit button while submitting
```

## 4. Frontend — Campaign Detail Page
```text
Create a React + TypeScript `/campaigns/:id` page that matches this logic exactly.

Data loading:
- Get `id` from `useParams`
- Load the campaign with `useCampaign(campaignId)`
- Load stats with `useCampaignStats(campaignId)`
- Use local state for `error` and `isSubmitting`

Loading and error states:
- Show a skeleton card while loading
- Show a destructive alert when the campaign cannot be loaded

Display:
- Campaign name
- Subject
- Body
- Status badge
- Stats card
- Recipients table

Use these exact campaign status mappings:
- `draft -> muted / Draft`
- `scheduled -> secondary / Scheduled`
- `sending -> warning / Sending`
- `sent -> success / Sent`

Use these exact recipient badge mappings:
- `pending -> muted`
- `sent -> success`
- `failed -> destructive`
- `sending -> warning`

Action rules:
- Only when `campaign.status === 'draft'`, show three action buttons:
  - `Schedule`
  - `Send now`
  - `Delete draft`
- `Schedule` must call:
  `scheduleCampaign(campaignId, { scheduledAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() })`
- `Send now` must call:
  `sendCampaign(campaignId)`
- `Delete draft` must call:
  `deleteCampaign(campaignId)`
  and then navigate to `/campaigns`
- After schedule or send, call `mutate()`
- When status is not `draft`, show one disabled button with text:
  `Action locked`

Stats calculation:
- Calculate open progress as `(stats?.open_rate ?? 0) * 100`
- Calculate send progress as `(stats?.send_rate ?? 0) * 100`
- Clamp both values between 0 and 100
```

## 5. Backend — Campaign Controller Unit Tests
```text
Write Jest unit tests for `CampaignController` that match this implemented business logic exactly.

Test 1:
- `update` returns status `422`
- Response body:
  `{ error: 'CAMPAIGN_NOT_DRAFT', message: 'Campaign can only be edited when status is draft' }`
- `CampaignRepository.updateDraftById` must not be called
- This happens when `CampaignRepository.findById` returns a campaign with status `scheduled`

Test 2:
- `schedule` returns status `422`
- Response body:
  `{ error: 'SCHEDULED_AT_PAST', message: 'scheduled_at must be in the future' }`
- `CampaignRepository.scheduleById` must not be called
- This happens when `scheduledAt` is in the past

Test 3:
- `send` must call these methods in this exact order:
  1. `CampaignRepository.markAsSending`
  2. `CampaignRepository.simulateSend`
  3. `CampaignRepository.completeSend`
- It must return status `200`
- Response body:
  `{ message: 'Campaign sent successfully', stats: { total: 2, sent: 2, failed: 0, opened: 1, open_rate: 0.5, send_rate: 1 } }`

Test 4:
- `send` returns status `422`
- Response body:
  `{ error: 'CAMPAIGN_ALREADY_SENT', message: 'Campaign already sent' }`
- This happens when the campaign status is already `sent`

Test 5:
- `send` returns status `422`
- Response body:
  `{ error: 'NO_RECIPIENTS', message: 'Campaign has no recipients' }`
- `CampaignRepository.markAsSending` must not be called
- This happens when `CampaignRepository.countRecipients` returns `0`
```

## 6. Backend — Recipient and User Controller Unit Tests
```text
Write Jest unit tests for `RecipientController` and `UserController` that match this implemented logic exactly.

RecipientController.list:
- When `request.query.campaignId` is provided:
  - call `RecipientRepository.findByCampaignId(campaignId)`
  - do not call `RecipientRepository.findAll()`
  - return status `200`

RecipientController.create conflict case:
- Return status `409`
- Response body:
  `{ error: 'CONFLICT', message: 'Recipient email already exists' }`
- This happens when `RecipientRepository.findByEmail` finds an existing recipient

RecipientController.create normalization case:
- Normalize uppercase email to lowercase
- Trim extra spaces from the name
- Call:
  `RecipientRepository.create({ email: 'recipient@example.com', name: 'Recipient Name' })`

UserController.register:
- Return status `409`
- Response body:
  `{ error: 'CONFLICT', message: 'Email already exists' }`
- This happens when `UserRepository.findByEmail` finds an existing user

UserController.login:
- Return status `401`
- Response body:
  `{ error: 'INVALID_CREDENTIALS', message: 'Wrong email or password' }`
- This happens when `comparePassword` returns `false`

UserController.me:
- Return status `401`
- Response body:
  `{ error: 'UNAUTHORIZED', message: 'Missing authenticated user context' }`
- This happens when `request.user` is missing
```
