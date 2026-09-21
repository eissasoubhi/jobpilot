#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
COMPOSE_FILE="$ROOT_DIR/compose.yml"
ENV_FILE="$ROOT_DIR/.env"
LOCK_DIR="$ROOT_DIR/.restore.lock"

usage() {
  echo "Usage: $0 <backup-directory> --confirm-restore" >&2
  exit 2
}

[ "$#" -eq 2 ] || usage
BACKUP_DIR=$1
[ "$2" = "--confirm-restore" ] || usage

command -v docker >/dev/null 2>&1 || { echo "docker is required." >&2; exit 1; }
command -v gzip >/dev/null 2>&1 || { echo "gzip is required." >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "docker compose is required." >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE." >&2; exit 1; }
[ -f "$COMPOSE_FILE" ] || { echo "Missing $COMPOSE_FILE." >&2; exit 1; }
[ -d "$BACKUP_DIR" ] || { echo "Backup directory does not exist: $BACKUP_DIR" >&2; exit 1; }
BACKUP_DIR=$(CDPATH= cd -- "$BACKUP_DIR" && pwd)
POSTGRES_BACKUP="$BACKUP_DIR/postgres.sql.gz"
PRIVATE_BACKUP="$BACKUP_DIR/private.tar.gz"
[ -s "$POSTGRES_BACKUP" ] || { echo "Missing PostgreSQL backup: $POSTGRES_BACKUP" >&2; exit 1; }
[ -s "$PRIVATE_BACKUP" ] || { echo "Missing private-data backup: $PRIVATE_BACKUP" >&2; exit 1; }
gzip -t "$POSTGRES_BACKUP"
gzip -t "$PRIVATE_BACKUP"

if [ -f "$BACKUP_DIR/SHA256SUMS" ]; then
  command -v sha256sum >/dev/null 2>&1 || { echo "sha256sum is required to verify this backup." >&2; exit 1; }
  (cd "$BACKUP_DIR" && sha256sum -c SHA256SUMS)
else
  echo "Refusing restore: backup has no SHA256SUMS integrity manifest." >&2
  exit 1
fi

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another JobPilot restore appears to be running ($LOCK_DIR exists)." >&2
  exit 1
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT INT TERM

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

compose config --quiet

echo "Starting PostgreSQL for restore..."
compose up -d db
attempt=0
until compose exec -T db pg_isready >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 60 ]; then
    echo "PostgreSQL did not become ready." >&2
    exit 1
  fi
  sleep 2
done

# Stop application services before replacing database/private state. PostgreSQL stays up.
echo "Stopping application services..."
compose stop web api worker scheduler browser-worker caddy 2>/dev/null || true

# Keep an emergency snapshot of the current state before destructive restore.
echo "Creating pre-restore safety backup..."
sh "$ROOT_DIR/backup.sh"

echo "Restoring PostgreSQL from $POSTGRES_BACKUP..."
gzip -dc "$POSTGRES_BACKUP" | compose exec -T db sh -c '
  set -eu
  psql -U "$POSTGRES_USER" -d postgres -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '\''$POSTGRES_DB'\'' AND pid <> pg_backend_pid();"
  dropdb -U "$POSTGRES_USER" --if-exists "$POSTGRES_DB"
  createdb -U "$POSTGRES_USER" "$POSTGRES_DB"
  psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -v ON_ERROR_STOP=1
'

echo "Restoring private JobPilot state..."
compose run --rm --no-deps --entrypoint sh api -c 'rm -rf /app/var/private/* /app/var/private/.[!.]* /app/var/private/..?* 2>/dev/null || true; tar -xzf - -C /app/var/private' < "$PRIVATE_BACKUP"

echo "Starting restored stack..."
compose up -d --remove-orphans --wait --wait-timeout 240

printf '\nJobPilot restore completed from %s.\n' "$BACKUP_DIR"
compose ps
