#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
COMPOSE_FILE="$ROOT_DIR/compose.yml"
ENV_FILE="$ROOT_DIR/.env"

usage() {
  echo "Usage: $0 --confirm-staging" >&2
  exit 2
}

[ "$#" -eq 1 ] || usage
[ "$1" = "--confirm-staging" ] || usage

command -v docker >/dev/null 2>&1 || { echo "docker is required." >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "docker compose is required." >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE." >&2; exit 1; }
[ -f "$COMPOSE_FILE" ] || { echo "Missing $COMPOSE_FILE." >&2; exit 1; }

if ! grep -Fxq 'JOBPILOT_DEPLOYMENT_ENV=staging' "$ENV_FILE"; then
  echo "Refusing persistence drill: JOBPILOT_DEPLOYMENT_ENV must be exactly staging." >&2
  exit 1
fi

compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

compose config --quiet
compose up -d --wait --wait-timeout 240

SENTINEL=".v1-staging-persistence-$(date -u +%Y%m%dT%H%M%SZ)-$$"
TOKEN="jobpilot-staging-persistence-$(date -u +%s)-$$"

cleanup() {
  compose exec -T api sh -c 'rm -f "/app/var/private/$1"' sh "$SENTINEL" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

echo "Writing a temporary non-user-data sentinel to the private persistent volume..."
compose exec -T api sh -c 'umask 077; printf "%s\n" "$1" > "/app/var/private/$2"' sh "$TOKEN" "$SENTINEL"

schema_count() {
  compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "SELECT count(*) FROM information_schema.tables WHERE table_schema = '\''public'\'';"'
}

migration_count() {
  compose exec -T db sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atqc "SELECT count(*) FROM doctrine_migration_versions;"'
}

SCHEMA_BEFORE=$(schema_count)
MIGRATIONS_BEFORE=$(migration_count)

echo "Force-recreating staging containers while preserving named volumes..."
compose up -d --force-recreate --wait --wait-timeout 240 db browser-worker api scheduler web caddy

SCHEMA_AFTER=$(schema_count)
MIGRATIONS_AFTER=$(migration_count)
PRIVATE_AFTER=$(compose exec -T api sh -c 'cat "/app/var/private/$1"' sh "$SENTINEL")

[ "$SCHEMA_AFTER" = "$SCHEMA_BEFORE" ] || {
  echo "PostgreSQL schema fingerprint changed across container replacement." >&2
  exit 1
}
[ "$MIGRATIONS_AFTER" = "$MIGRATIONS_BEFORE" ] || {
  echo "Doctrine migration fingerprint changed across container replacement." >&2
  exit 1
}
[ "$PRIVATE_AFTER" = "$TOKEN" ] || {
  echo "Private persistent-volume sentinel did not survive container replacement." >&2
  exit 1
}

cleanup
trap - EXIT INT TERM

printf 'Persistence verified: PostgreSQL schema/migrations and private volume survived container replacement.\n'
compose ps
