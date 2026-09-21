#!/usr/bin/env bash
set -euo pipefail

COMPOSE_FILE="${COMPOSE_FILE:-compose.yml}"
ENV_FILE="${ENV_FILE:-.env}"
INTERVAL="${JOB_SYNC_INTERVAL_SECONDS:-21600}"

if [[ ! -f "$COMPOSE_FILE" || ! -f "$ENV_FILE" ]]; then
  echo "Run this from the deployment directory containing $COMPOSE_FILE and $ENV_FILE." >&2
  exit 2
fi

if ! grep -Eq '^CONNECTOR_ALERT_WEBHOOK_URL=https://.+' "$ENV_FILE"; then
  echo "CONNECTOR_ALERT_WEBHOOK_URL must be configured to a disposable HTTPS verification receiver." >&2
  exit 2
fi

if ! grep -Eq '^CONNECTOR_ALERT_WEBHOOK_ALLOWED_HOST=.+' "$ENV_FILE"; then
  echo "CONNECTOR_ALERT_WEBHOOK_ALLOWED_HOST must be configured." >&2
  exit 2
fi

echo "Running connector freshness alert-path verification..."
set +e
output=$(docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T api \
  php bin/console app:connectors:notify-freshness --interval="$INTERVAL" 2>&1)
status=$?
set -e
printf '%s\n' "$output"

if (( status != 0 )); then
  echo "Alert command failed; the alert path is not verified." >&2
  exit "$status"
fi

if ! grep -Fq 'Connector freshness alert webhook sent.' <<<"$output"; then
  cat >&2 <<'EOF'
Alert path was not proven end-to-end: the command succeeded but did not deliver a new webhook.
Use a disposable HTTPS receiver and an environment with at least one connector freshness alert.
A disabled webhook, healthy connector set, or deduplicated prior alert is not release evidence.
EOF
  exit 1
fi

echo "Alert path verified: JobPilot reported a fresh webhook delivery. Confirm receipt/signature at the disposable receiver before recording release evidence."
