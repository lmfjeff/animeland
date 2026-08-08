# Deployment Guide

## Architecture

```
AWS (ap-northeast-1 / Tokyo)
├── NextjsSite (CloudFront + Lambda)   → Next.js app
├── Lambda: anilist-sync (15min max)   → AniList GraphQL ingest
├── Lambda: jikan-sync  (15min max)    → MAL/Jikan broadcast & scores
├── Lambda: wiki-sync   (15min max)    → Wikipedia Traditional Chinese titles
├── EventBridge bus (jobEventBus)      → self-chaining triggers for paginated syncs
└── Cron schedules
    ├── anilist: daily 16:00 UTC
    ├── jikan:   daily 22:00 UTC
    └── wiki:    daily 23:00 UTC

Database: Supabase PostgreSQL (external, ap-northeast-1)
```

---

## Prerequisites

- **Node.js 20+** (Node 18 minimum, 20 recommended)
- **AWS credentials** configured (`aws configure` or env vars)
- **Supabase project** with PostgreSQL connection strings (direct + pooler)
- **Google OAuth 2.0** Client ID + Secret (for Google login)

---

## Environment Variables

Create a `.env` file (for local) or `.env.prod` (for production):

```env
DATABASE_URL=postgresql://...        # Supabase pooler connection (for Prisma queries)
DIRECT_URL=postgresql://...          # Supabase direct connection (for migrations)
NEXTAUTH_URL=https://your-domain     # Full URL of deployed site
NEXTAUTH_SECRET=...                  # Random secret string
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
ADMIN_EMAIL=...
NODE_ENV=production
```

---

## Local Development

```bash
npm install
npm run dev
# → http://localhost:3000
```

---

## Deploying to AWS

### ⚠️ Important: Must deploy from WSL on Windows

SST v2 uses OpenNext to package Next.js for Lambda. OpenNext is **not compatible with Windows paths** — it uses ESM `import()` internally which cannot handle `C:\...` drive-letter paths.

**Error you'll see if you run from PowerShell/CMD:**
```
Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data,
and node are supported by the default ESM loader. On Windows, absolute paths
must be valid file:// URLs. Received protocol 'c:'
```

**Solution: always deploy from WSL.**

---

### Step 1 — Install Node in WSL (first time only)

```bash
# Install fnm (fast Node manager)
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc

# Install and use Node 20
fnm install 20
fnm use 20

# Verify
node -v   # → v20.x.x
npm -v
```

### Step 2 — Verify AWS credentials in WSL

```bash
aws sts get-caller-identity
```

If credentials aren't present in WSL, copy from Windows:
```bash
mkdir -p ~/.aws
cp /mnt/c/<username>/.aws/credentials ~/.aws/credentials
cp /mnt/c/<username>/.aws/config ~/.aws/config
```

### Step 3 — Run DB migrations (first deploy or after schema changes)

```bash
# Run from Windows PowerShell or WSL — either works
# Make sure DATABASE_URL and DIRECT_URL are set in your .env
npx prisma migrate deploy
```

### Step 4 — Sync repo to WSL native filesystem and deploy

> ⚠️ **Do NOT run `npm install` on `/mnt/c/...`** — the NTFS→WSL filesystem bridge
> is extremely slow for `node_modules` (can hang for 10+ minutes with no output).
> Always copy to the Linux-native filesystem first.

Use the provided helper script from PowerShell (pass the Windows path as an argument):

```powershell
wsl bash /mnt/c/<username>/path/to/animeland/deploy-wsl.sh /mnt/c/<username>/path/to/animeland
```

Or manually in WSL:

```bash
# Sync repo to Linux filesystem (fast — excludes node_modules)
rsync -a --delete \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='.sst' \
  /mnt/c/<username>/path/to/animeland/ \
  ~/animeland/

cd ~/animeland

# Install dependencies on native Linux fs (fast)
npm install

# Deploy
npx sst deploy --stage prod
```

### Step 5 — Confirm deployment

Successful output looks like:
```
✔  Deployed:
   Site
   SiteUrl: https://<your-cloudfront-id>.cloudfront.net
   Jobs
```

All CloudFormation resources will show `UPDATE_COMPLETE`.

---

## Deployment Script

[`deploy-wsl.sh`](./deploy-wsl.sh) automates Steps 1–4 above. Pass the repo path as an argument:
```bash
bash deploy-wsl.sh /mnt/c/<username>/path/to/animeland
```
- Sets up fnm + Node 20 if not present
- Rsyncs the repo (excluding `node_modules`, `.next`, `.sst`) to `~/animeland`
- Runs `npm install` on native Linux filesystem
- Runs `npx sst deploy --stage prod`

---

## Sync Jobs (Manual Run)

To manually trigger a sync job outside of the cron schedule:

```bash
# From repo root (Windows or WSL, with .env configured)
npx tsx jobs/anilist-sync-job.ts    # Ingest AniList seasonal data
npx tsx jobs/jikan-sync-job.ts      # Sync MAL broadcast times & scores
npx tsx jobs/wiki-sync-job.ts       # Sync Wikipedia Traditional Chinese titles
```

---

## Tear Down

```bash
npx sst remove --stage prod
```

---

## Known Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| `ERR_UNSUPPORTED_ESM_URL_SCHEME` on deploy | OpenNext incompatible with Windows paths | Deploy from WSL |
| `npm install` hangs on `/mnt/c/...` in WSL | NTFS→WSL filesystem bridge very slow for `node_modules` | Rsync to `~/` first, install there |
| Google Fonts fetch failures during build | WSL network restriction on some setups | Safe to ignore — fonts fall back gracefully |
| `gyp ERR! find VS` during `npm i` on Windows | Missing C++ build tools | Install "Desktop development with C++" via Visual Studio Installer + Windows 10 SDK |
