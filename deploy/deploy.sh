#!/bin/sh
set -eu

cd "$(dirname "$0")"

for required_file in .env compose.yml Caddyfile; do
    if [ ! -f "$required_file" ]; then
        echo "Missing ${required_file} in $(pwd)" >&2
        exit 1
    fi
done

compose() {
    docker compose --env-file .env -f compose.yml "$@"
}

set_version() {
    version="$1"

    case "$version" in
        ''|*[!A-Za-z0-9._-]*)
            echo "Invalid deployment version: ${version}" >&2
            exit 1
            ;;
    esac

    if grep -q '^JOBPILOT_VERSION=' .env; then
        sed -i "s/^JOBPILOT_VERSION=.*/JOBPILOT_VERSION=${version}/" .env
    else
        printf '\nJOBPILOT_VERSION=%s\n' "$version" >> .env
    fi
}

if [ "$#" -gt 1 ]; then
    echo "Usage: sh deploy.sh [image-version]" >&2
    exit 1
fi

if [ "$#" -eq 1 ]; then
    set_version "$1"
fi

version="$(grep '^JOBPILOT_VERSION=' .env | tail -n 1 | cut -d= -f2- || true)"
if [ -z "$version" ]; then
    echo "JOBPILOT_VERSION is missing from .env" >&2
    exit 1
fi

mkdir -p data/private/cvs backups
chmod 700 data/private backups 2>/dev/null || true

echo "Validating deployment configuration..."
compose config --quiet

echo "Pulling JobPilot ${version}..."
compose pull

echo "Starting PostgreSQL..."
compose up -d db

attempt=0
until compose exec -T db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"' >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 60 ]; then
        echo "PostgreSQL did not become ready in time." >&2
        compose logs --tail=100 db >&2 || true
        exit 1
    fi
    sleep 2
done

sh ./backup.sh

echo "Running database migrations..."
compose run --rm --no-deps api \
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

echo "Bootstrapping application data..."
compose run --rm --no-deps api \
    php bin/console app:bootstrap --no-interaction

echo "Starting JobPilot services..."
compose up -d --remove-orphans

attempt=0
until compose exec -T web node -e \
    "fetch('http://127.0.0.1:3000/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))" \
    >/dev/null 2>&1; do
    attempt=$((attempt + 1))
    if [ "$attempt" -ge 60 ]; then
        echo "JobPilot did not become healthy in time." >&2
        compose ps >&2 || true
        compose logs --tail=150 api web caddy browser-worker >&2 || true
        exit 1
    fi
    sleep 2
done

external_health_url="$(grep '^DEPLOY_HEALTHCHECK_URL=' .env | tail -n 1 | cut -d= -f2- || true)"
if [ -n "$external_health_url" ]; then
    if ! command -v curl >/dev/null 2>&1; then
        echo "curl is required when DEPLOY_HEALTHCHECK_URL is configured." >&2
        exit 1
    fi

    echo "Checking ${external_health_url}..."
    curl --fail --silent --show-error --retry 5 --retry-delay 2 "$external_health_url" >/dev/null
fi

compose ps
docker image prune --force >/dev/null 2>&1 || true

echo "JobPilot ${version} deployed successfully."
