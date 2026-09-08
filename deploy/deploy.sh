#!/bin/sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
COMPOSE_FILE="$ROOT_DIR/compose.yml"
ENV_FILE="$ROOT_DIR/.env"
LOCK_DIR="$ROOT_DIR/.deploy.lock"

usage() {
  echo "Usage: $0 <40-character-git-sha>" >&2
  exit 2
}

[ "$#" -eq 1 ] || usage
VERSION=$1
printf '%s' "$VERSION" | grep -Eq '^[0-9a-f]{40}$' || usage

command -v docker >/dev/null 2>&1 || { echo "docker is required." >&2; exit 1; }
docker compose version >/dev/null 2>&1 || { echo "docker compose is required." >&2; exit 1; }
[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE. Copy .env.example and fill the real secrets first." >&2; exit 1; }
[ -f "$COMPOSE_FILE" ] || { echo "Missing $COMPOSE_FILE." >&2; exit 1; }

if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  echo "Another JobPilot deployment appears to be running ($LOCK_DIR exists)." >&2
  exit 1
fi
trap 'rmdir "$LOCK_DIR" 2>/dev/null || true' EXIT INT TERM

export JOBPILOT_VERSION="$VERSION"
compose() {
  docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
}

# Fail before touching containers if required variables or Compose syntax are invalid.
compose config --quiet

echo "Pulling JobPilot $VERSION..."
compose pull

echo "Starting PostgreSQL..."
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

# A pre-migration backup is intentionally taken on every deployment, including the
# first one. An empty first backup is harmless and keeps the procedure identical.
echo "Creating pre-migration backup..."
JOBPILOT_VERSION="$VERSION" sh "$ROOT_DIR/backup.sh"

echo "Running database migrations..."
compose run --rm --no-deps api \
  php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "Bootstrapping first-run data if needed..."
compose run --rm --no-deps api \
  php bin/console app:bootstrap --no-interaction

echo "Starting the complete stack..."
compose up -d --remove-orphans --wait --wait-timeout 240

TMP_ENV="$ENV_FILE.tmp.$$"
awk -v version="$VERSION" '
  BEGIN { replaced = 0 }
  /^JOBPILOT_VERSION=/ {
    print "JOBPILOT_VERSION=" version
    replaced = 1
    next
  }
  { print }
  END {
    if (!replaced) print "JOBPILOT_VERSION=" version
  }
' "$ENV_FILE" > "$TMP_ENV"
chmod --reference="$ENV_FILE" "$TMP_ENV" 2>/dev/null || chmod 600 "$TMP_ENV"
mv "$TMP_ENV" "$ENV_FILE"

printf '\nJobPilot %s is deployed.\n' "$VERSION"
compose ps
