# Mini Campaign Manager

A full-stack Mini Campaign Manager built for a code challenge. It allows marketers to create, schedule, send, and track email campaigns.

## Overview

**Live Demo:** The application is deployed at **http://113.173.72.198:5173** — you can try it right now!

This project includes:
- **Backend:** Node.js, Express, PostgreSQL, Sequelize, JWT auth, input validation
- **Frontend:** React, TypeScript, Vite, state management, data fetching
- **Monorepo:** backend and frontend in one workspace

## Core Features

### Backend
- User registration and login with JWT
- Campaign CRUD with server-side business rules
- Recipient management
- Campaign scheduling with future timestamp validation
- Simulated async sending with random `sent` / `failed` results
- Campaign stats: total, sent, failed, opened, open rate, send rate

### Frontend
- Login page
- Campaign list with status badges
- Create campaign form
- Campaign detail page with stats, recipients, and actions
- Loading and error states

## System Design

For detailed technical documentation, see [System Design Document](./docs/system-design.md).

### Technology Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express 5.x, PostgreSQL, Sequelize, JWT, Zod |
| Frontend | React 19, TypeScript, Vite, Redux Toolkit, SWR, Tailwind CSS |
| DevOps | Docker, Docker Compose |

### Project Structure

```
CodeChallenge/
├── backend/           # Express API (port 3000)
│   └── src/api/       # controllers, routes, repositories
├── frontend/          # React SPA (port 5173)
│   └── src/           # pages, components, services, redux
├── database/          # PostgreSQL schema & seed data
└── docs/              # system-design.md, requiment.md
```

### Database Schema

- **User** — id, email, name, password, created_at
- **Campaign** — id, name, subject, body, status, scheduled_at, created_by
- **Recipient** — id, email, name, created_at
- **CampaignRecipient** — campaign_id, recipient_id, sent_at, opened_at, status

### API Endpoints Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new user |
| POST | `/auth/login` | No | Login & get JWT |
| GET | `/campaigns` | Yes | List campaigns |
| POST | `/campaigns` | Yes | Create campaign |
| GET | `/recipients` | Yes | List recipients |
| POST | `/recipient` | Yes | Create recipient |
| GET | `/campaigns/:id` | Yes | Get campaign + stats |
| PATCH | `/campaigns/:id` | Yes | Update (draft only) |
| DELETE | `/campaigns/:id` | Yes | Delete (draft only) |
| POST | `/campaigns/:id/schedule` | Yes | Schedule campaign |
| POST | `/campaigns/:id/send` | Yes | Send campaign |

For complete endpoint documentation with request/response formats, see [System Design Document](./docs/system-design.md).

## Business Rules

- A campaign can only be edited or deleted when its status is `draft`
- `scheduled_at` must be in the future
- Sending changes status to `sent` and cannot be undone
- Stats include:

```json
{ "total": 0, "sent": 0, "failed": 0, "opened": 0, "open_rate": 0, "send_rate": 0 }
```

## API Endpoints

Full endpoint documentation with request/response formats available in [System Design Document](./docs/system-design.md).

## Local Setup

### With Docker

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
docker compose up --build
```

### Without Docker

```bash
yarn install
cd backend
cp .env.example .env
yarn dev

cd ../frontend
cp .env.example .env
yarn dev
```

## Seed / Demo

You can either:
- use the pre-deployed database at `113.173.72.198`, or
- create your own local PostgreSQL database and seed it with the files in `./database`

For the full database setup guide, see:
- [Database setup README](./database/README.md)

### Demo account

One seeded account is:
- email: `john@company.com`
- password: `password123`

## Testing

Run the backend tests for critical business logic:

```bash
yarn workspace backend test
```

## How I Used Claude Code

### Tasks delegated to Claude Code
- Drafting project structure
- Reviewing API and validation rules
- Suggesting test cases and README wording

### Real prompts I used
1. "Review my CampaignController business rules and suggest test cases for draft-only updates, past `scheduledAt`, already-sent campaigns, and campaigns with no recipients."
2. "Rewrite these frontend prompts so they match my current React pages exactly, including `useCampaigns`, `useCampaign`, `useCampaignStats`, `createRecipient`, `createCampaign`, and the current status badge mappings."
3. "Translate my auth cross-IP migration plan to English and turn it into a short implementation plan with expected files to change and validation steps."

### Detailed prompt files
- [Project prompts](./promt/project-prompts.md)
- [Auth cross-IP migration plan](./promt/auth-cross-ip-migration-plan.md)
- [UI loading and error states plan](./promt/ui-loading-and-error-states-plan.md)
- [UI campaign flow polish plan](./promt/ui-campaign-flow-polish-plan.md)

### Where Claude Code was wrong
- It may suggest flows that are broader than the challenge scope
- Some generated wording or implementation ideas needed simplification

### What I would not let Claude Code do
- Make final security decisions alone
- Decide business rules without manual review
- Ship code without testing and verification
