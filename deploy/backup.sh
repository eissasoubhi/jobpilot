#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
COMPOSE_FILE="$ROOT_DIR/compose.yml"
ENV_FILE="$ROOT_DIR/.env"
BACKUP_ROOT=${JOBPILOT_BACKUP_DIR:-$ROOT_DIR/backups}
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
DEST="$BACKUP_ROOT/$TIMESTAMP"

command -v docker >/dev/null 2>&1 || { echo "docker is required." >&2; exit 1; }
command -v gzip >/dev/null 2>&1 || { echo "gzip is required." >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE." >&2; exit 1; }

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

mkdir -p "$DEST"
chmod 700 "$BACKUP_ROOT" "$DEST" 2>/dev/null || true

echo "Backing up PostgreSQL to $DEST/postgres.sql.gz..."
compose exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' \
  | gzip -9 > "$DEST/postgres.sql.gz"
gzip -t "$DEST/postgres.sql.gz"

echo "Backing up private JobPilot data to $DEST/private.tar.gz..."
compose run --rm --no-deps --entrypoint sh api \
  -c 'tar -czf - -C /app/var/private .' > "$DEST/private.tar.gz"
gzip -t "$DEST/private.tar.gz"

if command -v sha256sum >/dev/null 2>&1; then
  (
    cd "$DEST"
    sha256sum postgres.sql.gz private.tar.gz > SHA256SUMS
  )
fi

chmod 600 "$DEST"/* 2>/dev/null || true
printf 'Backup created: %s\n' "$DEST"
