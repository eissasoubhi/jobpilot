# JobPilot deployment

This directory is the deployment contract shared by the local Ubuntu staging VM and the future Oracle Ubuntu VM. Development still uses the root `docker-compose.yml`; staging and production only pull immutable images from GHCR.

## Server layout

Copy these files to `/opt/jobpilot` on every server:

```text
/opt/jobpilot/
├── .env
├── compose.yml
├── Caddyfile
├── deploy.sh
├── backup.sh
├── restore.sh
└── verify-alert-path.sh
```

Do not clone the application source on the server. Symfony, Next.js, the scheduler code, the browser worker, and the initial bootstrap data are contained in the versioned images.

## First staging setup

From a checkout of this repository:

```bash
scp deploy/compose.yml deploy/Caddyfile deploy/deploy.sh deploy/backup.sh deploy/restore.sh deploy/verify-alert-path.sh \
  aissa@VM_IP:/opt/jobpilot/
```

On the VM:

```bash
cd /opt/jobpilot
chmod +x deploy.sh backup.sh restore.sh verify-alert-path.sh
chmod 600 .env

docker compose --env-file .env -f compose.yml config --quiet
```

For local staging, configure the server `.env` with at least:

```dotenv
CADDY_SITE_ADDRESS=http://jobpilot.staging.local
WEB_URL=http://jobpilot.staging.local
DEFAULT_URI=http://jobpilot.staging.local
GOOGLE_REDIRECT_URI=http://jobpilot.staging.local/api/integrations/gmail/callback
```

On the Mac, map the staging hostname to the VM address in `/etc/hosts`:

```text
VM_IP jobpilot.staging.local
```

## Container registry

Pushes to `main` publish three multi-architecture images (`linux/amd64` and `linux/arm64`):

- `ghcr.io/eissasoubhi/jobpilot-prod-api:<git-sha>`
- `ghcr.io/eissasoubhi/jobpilot-prod-web:<git-sha>`
- `ghcr.io/eissasoubhi/jobpilot-prod-browser-worker:<git-sha>`

The deployment must use the exact 40-character merge SHA, never `latest`.

If GHCR package visibility requires authentication on a server, create a GitHub token with `read:packages` and run once:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u eissasoubhi --password-stdin
```

Do not put the GitHub token in JobPilot's `.env`.

## Deploy

```bash
cd /opt/jobpilot
./deploy.sh <40-character-main-sha>
```

The script validates Compose, pulls the exact images, starts PostgreSQL, creates a pre-migration backup, applies Doctrine migrations, bootstraps first-run data when necessary, starts the complete stack, waits for health checks, then records the deployed SHA in `.env`.

## Backup

A deployment automatically creates a backup under `/opt/jobpilot/backups/<UTC timestamp>/`. A manual backup is:

```bash
cd /opt/jobpilot
./backup.sh
```

Each backup contains PostgreSQL plus `/app/var/private` (CVs, encrypted integration configuration, Gmail tokens, AI state/cache, and related private state). Backups include checksums and the restore procedure refuses a backup without an integrity manifest.

Backups on the same VM are protection against a bad deployment, not against VM loss. Production should additionally copy them to independent storage.

## Restore

A restore is deliberately destructive and therefore requires an explicit confirmation flag. It validates both archives and their checksums before touching the running state, stops application services, creates a fresh safety backup of the current state, restores PostgreSQL and `/app/var/private`, then restarts the complete stack and waits for health checks.

```bash
cd /opt/jobpilot
./restore.sh /opt/jobpilot/backups/<UTC-timestamp> --confirm-restore
```

Never restore a production backup into development or CI. Before a production restore, copy the selected backup to independent storage when possible and record the deployed SHA, backup timestamp and reason in the incident log. After restore, verify the Offers workspace, Gmail connector status and worker health before resuming normal use.

## Rollback

To roll the application images back, deploy the previous known-good SHA:

```bash
./deploy.sh <previous-good-sha>
```

This does not automatically reverse database migrations. Schema changes must remain backward-compatible with the previous application image, or the database must be restored deliberately from the pre-migration backup with `restore.sh`.

For a staging rollback drill, deploy the current SHA, record the healthy state, deploy another known-good SHA, then deploy the previous SHA again and verify the same principal health checks. Do not claim production-readiness evidence until the drill has actually been executed and its exact SHAs/results have been recorded.

## Alert-path verification

Production readiness requires evidence that an operational connector failure can leave JobPilot and reach the configured alert receiver. Configure a **disposable HTTPS receiver** in staging with `CONNECTOR_ALERT_WEBHOOK_URL`, `CONNECTOR_ALERT_WEBHOOK_ALLOWED_HOST`, and preferably `CONNECTOR_ALERT_WEBHOOK_SECRET`. Never use a URL containing credentials or a receiver that stores private payloads indefinitely.

When staging has at least one connector in a freshness alert state, run:

```bash
cd /opt/jobpilot
./verify-alert-path.sh
```

The verifier is deliberately stricter than the normal scheduler command. It fails when the webhook is disabled, when there is no active alert, or when the current alert fingerprint was already notified. It succeeds only when JobPilot reports a **new webhook delivery**. After success, confirm the request was received by the disposable endpoint and, when signing is configured, verify `X-JobPilot-Signature` there.

Record the date, environment, exact `JOBPILOT_VERSION`, receiver type (never its secret URL/token), command result and receiver confirmation in the V1 production evidence. A unit test, a disabled-webhook success, or documentation alone is not end-to-end alert-path evidence.

## Oracle production

Use the same deployment files and the same `deploy.sh` command. Only server-specific `.env` values change. For a public hostname, for example:

```dotenv
CADDY_SITE_ADDRESS=jobpilot.example.com
WEB_URL=https://jobpilot.example.com
DEFAULT_URI=https://jobpilot.example.com
GOOGLE_REDIRECT_URI=https://jobpilot.example.com/api/integrations/gmail/callback
```

Caddy then handles public HTTPS automatically once DNS points to the Oracle VM and ports 80/443 are reachable.
