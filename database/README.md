# Database Setup Guide

This folder contains everything needed to run and seed the PostgreSQL database for the Mini Campaign Manager.

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

### Run the schema

```bash
docker exec -i postgres-db psql -U app_user -d app_db < database/schema.sql
```

### Seed demo data

```bash
docker exec -i postgres-db psql -U app_user -d app_db < database/mock-data.sql
```

### One-command setup

You can apply the schema and seed demo data in one step.

For a local Docker container:

```bash
bash database/setup-demo-data.sh
```

For a specific database host or IP:

```bash
DB_HOST=113.173.72.198 DB_PORT=5432 DB_NAME=app_db DB_USER=app_user DB_PASSWORD=CodeChallenge2024 bash database/setup-demo-data.sh
```

### Verify the data

```bash
docker exec -it postgres-db psql -U app_user -d app_db
```

Example checks:

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM recipients;
SELECT COUNT(*) FROM campaigns;
SELECT COUNT(*) FROM campaign_recipients;
```

## Demo account

The seed file includes demo users. One example is:
- email: `john@company.com`
- password: `password123`

You can inspect the full dataset in `mock-data.sql`.
