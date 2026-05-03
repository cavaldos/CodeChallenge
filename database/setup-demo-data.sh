#!/usr/bin/env bash
set -euo pipefail

CONTAINER_NAME="${DB_CONTAINER_NAME:-postgres-db}"
DB_HOST="${DB_HOST:-}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-app_db}"
DB_USER="${DB_USER:-app_user}"
DB_PASSWORD="${DB_PASSWORD:-CodeChallenge2024}"
SCHEMA_FILE="database/schema.sql"
SEED_FILE="database/mock-data.sql"

if [[ -n "$DB_HOST" ]]; then
  printf "[1/3] Using remote PostgreSQL host: %s:%s\n" "$DB_HOST" "$DB_PORT"
  printf "[2/3] Applying schema: %s\n" "$SCHEMA_FILE"
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$SCHEMA_FILE"

  printf "[3/3] Seeding demo data: %s\n" "$SEED_FILE"
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$SEED_FILE"

  printf "\nDemo data setup completed successfully.\n"
  printf "Database: %s\nUser: %s\nHost: %s\nPort: %s\n" "$DB_NAME" "$DB_USER" "$DB_HOST" "$DB_PORT"
else
  printf "[1/3] Checking PostgreSQL container: %s\n" "$CONTAINER_NAME"
  docker ps --format '{{.Names}}' | grep -Fx "$CONTAINER_NAME" >/dev/null

  printf "[2/3] Applying schema: %s\n" "$SCHEMA_FILE"
  docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$SCHEMA_FILE"

  printf "[3/3] Seeding demo data: %s\n" "$SEED_FILE"
  docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d "$DB_NAME" < "$SEED_FILE"

  printf "\nDemo data setup completed successfully.\n"
  printf "Database: %s\nUser: %s\nContainer: %s\n" "$DB_NAME" "$DB_USER" "$CONTAINER_NAME"
fi

printf "\nDemo account:\n- email: john@company.com\n- password: password123\n"
