# Database Setup Guide

This folder contains everything needed to run and seed the PostgreSQL database for the Mini Campaign Manager.

## File Structure

```
database/
├── schema.sql       # Creates tables, indexes, constraints, views
├── insert-data.sql   # Inserts demo data (users, recipients, campaigns)
├── setup-complete.sql # Combined schema + data (run once)
├── postgreSQL.yaml  # Docker Compose for PostgreSQL
└── setup-demo-data.sh # Helper script
```

## Option 1: Use the pre-deployed database

You can use the existing deployed database server at:

- host: `113.173.72.198`

Configure your backend `.env` to point to that database.

## Option 2: Deploy PostgreSQL locally with Docker

### Start PostgreSQL

```bash
docker compose -f database/postgreSQL.yaml up -d
```

This starts PostgreSQL with:
- database: `app_db`
- user: `app_user`
- password: `CodeChallenge2024`
- port: `5432`

## Quick Start (3 ways)

### Option A: Run schema + data separately

```bash
# 1. Create tables
docker exec -i postgres-db psql -U app_user -d app_db < database/schema.sql

# 2. Insert demo data
docker exec -i postgres-db psql -U app_user -d app_db < database/insert-data.sql
```

### Option B: Run combined file (one command)

```bash
docker exec -i postgres-db psql -U app_user -d app_db < database/setup-complete.sql
```

### Option C: Use helper script

```bash
bash database/setup-demo-data.sh
```

Or with specific database:

```bash
DB_HOST=113.173.72.198 DB_PORT=5432 DB_NAME=app_db DB_USER=app_user DB_PASSWORD=CodeChallenge2024 bash database/setup-demo-data.sh
```

## Verify the data

```bash
docker exec -it postgres-db psql -U app_user -d app_db
```

Example checks:

```sql
-- Check record counts
SELECT 'Users' AS table_name, COUNT(*) AS count FROM users
UNION ALL SELECT 'Recipients', COUNT(*) FROM recipients
UNION ALL SELECT 'Campaigns', COUNT(*) FROM campaigns
UNION ALL SELECT 'Campaign Recipients', COUNT(*) FROM campaign_recipients;

-- View campaign stats
SELECT campaign_name, campaign_status, total, sent, failed, opened, open_rate, send_rate
FROM campaign_stats
ORDER BY campaign_name;
```

## Demo account

The seed file includes demo users. One example is:

- email: `john@company.com`
- password: `password123`

Note: The password is stored as a SHA256 hash placeholder. For testing only - do not use in production!