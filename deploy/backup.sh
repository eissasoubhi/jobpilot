#!/bin/sh
set -eu

cd "$(dirname "$0")"

if [ ! -f .env ]; then
    echo "Missing .env in $(pwd)" >&2
    exit 1
fi

compose() {
    docker compose --env-file .env -f compose.yml "$@"
}

mkdir -p backups
chmod 700 backups 2>/dev/null || true

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"

table_count="$(
    compose exec -T db sh -c \
        'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "select count(*) from pg_tables where schemaname = '\''public'\'';"' \
        2>/dev/null || printf '0'
)"

case "$table_count" in
    ''|*[!0-9]*) table_count=0 ;;
esac

if [ "$table_count" -gt 0 ]; then
    database_backup="backups/postgres-${timestamp}.sql.gz"
    echo "Backing up PostgreSQL to ${database_backup}"
    compose exec -T db sh -c \
        'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --no-privileges' \
        | gzip -9 > "$database_backup"
else
    echo "PostgreSQL has no application tables yet; database backup skipped."
fi

if [ -d data/private ] && [ -n "$(find data/private -type f -print -quit 2>/dev/null)" ]; then
    private_backup="backups/private-${timestamp}.tar.gz"
    echo "Backing up private files to ${private_backup}"
    tar -czf "$private_backup" data/private
else
    echo "No private files to back up."
fi

retention_days="$(grep '^BACKUP_RETENTION_DAYS=' .env | tail -n 1 | cut -d= -f2- || true)"
case "$retention_days" in
    ''|*[!0-9]*) retention_days=14 ;;
esac

find backups -type f -mtime "+${retention_days}" -delete 2>/dev/null || true

echo "Backup complete."
