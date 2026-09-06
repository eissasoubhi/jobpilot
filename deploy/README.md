# JobPilot deployment

This directory is the deployment contract shared by local staging and the public server. Development still uses the root `docker-compose.yml` and `docker-compose.override.yml`; staging and production use the immutable images published to GHCR plus `deploy/compose.yml`.

## Server layout

Copy the contents of this directory to `/opt/jobpilot` on the target Ubuntu server. Keep the real `.env` only on the server.

```text
/opt/jobpilot/
├── .env
├── compose.yml
├── Caddyfile
├── deploy.sh
├── backup.sh
├── data/private/
└── backups/
```

The server does not need a checkout of the application source code.

## First-time setup

1. Install Docker Engine and the Docker Compose plugin.
2. Create `/opt/jobpilot` and copy `compose.yml`, `Caddyfile`, `deploy.sh`, and `backup.sh` there.
3. Start from `.env.example`, then replace every secret and environment-specific URL. Never commit the resulting `.env`.
4. Use an URL-safe PostgreSQL password, for example `openssl rand -hex 32`, because Compose derives Symfony's `DATABASE_URL` from the PostgreSQL variables.
5. Generate `APP_SECRET` and `JOBPILOT_BROWSER_WORKER_TOKEN` with `openssl rand -hex 32`. Keep `APP_ENCRYPTION_KEY` stable across redeployments because it protects persisted credentials.

The GHCR packages may require authentication depending on their package visibility. Either make the three deployment packages public after their first publication, or authenticate the server with a token that has `read:packages`:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u eissasoubhi --password-stdin
```

Do not store that token in the repository or in `compose.yml`.

## Local staging

A typical local staging `.env` uses:

```dotenv
CADDY_SITE_ADDRESS=http://jobpilot.staging.local
WEB_URL=http://jobpilot.staging.local
DEFAULT_URI=http://jobpilot.staging.local
```

On the host machine, map the VM address to the staging hostname, for example:

```text
192.168.1.50 jobpilot.staging.local
```

Google OAuth may impose stricter redirect-URI requirements than the rest of the application. If Gmail OAuth is tested in local staging, configure a redirect URI accepted by the Google OAuth client rather than assuming an arbitrary HTTP `.local` hostname will be accepted.

## Deploy a version

GitHub Actions publishes images tagged with the source commit SHA. Deploy that exact SHA:

```bash
cd /opt/jobpilot
sh deploy.sh <git-sha>
```

The script validates Compose, pulls the images, starts PostgreSQL, creates a pre-migration backup when data exists, runs Doctrine migrations and JobPilot bootstrap, starts the full stack, and waits for the web/API health check.

The deployed SHA is persisted as `JOBPILOT_VERSION` in `.env`, so a server reboot restarts the same release.

## Promote staging to production

Use the same tested SHA on the Oracle VM. Only the server `.env` changes. For a public deployment, use the real HTTPS hostname, for example:

```dotenv
CADDY_SITE_ADDRESS=jobpilot.example.com
WEB_URL=https://jobpilot.example.com
DEFAULT_URI=https://jobpilot.example.com
GOOGLE_REDIRECT_URI=https://jobpilot.example.com/api/integrations/gmail/callback
DEPLOY_HEALTHCHECK_URL=https://jobpilot.example.com/api/health
```

Caddy obtains and renews the public TLS certificate when DNS points to the server and ports 80/443 are reachable.

## Backups

Run a backup without deploying:

```bash
cd /opt/jobpilot
sh backup.sh
```

Backups are stored in `/opt/jobpilot/backups`. PostgreSQL is dumped with `pg_dump`, and `data/private` is archived separately. `BACKUP_RETENTION_DAYS` controls local retention and defaults to 14 days.

A server-local backup is not a disaster-recovery strategy by itself. Production should additionally copy backups to storage outside the VM.

## Rollback

Redeploy an earlier image SHA:

```bash
sh deploy.sh <previous-git-sha>
```

This rolls application containers back, not the database schema. Database migrations must therefore remain backward-compatible during normal releases; a destructive schema rollback requires an explicit restore or migration plan.
