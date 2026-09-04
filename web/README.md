# Fontshare Bulk - Web UI

Next.js + TypeScript + Tailwind catalog browser for the Fontshare catalog.
Paper background, ink text, grotesk display type - matching Fontshare's
minimal aesthetic.

## Run

```bash
npm install
npm run dev      # http://localhost:3000
```

Deploys to Vercel as-is (project root directory: `web/`).

## How it works

- Catalog data is the committed bundle `lib/fonts.min.json`, mirrored from
  the repo-root `data/fonts.min.json` by `python scripts/sync_catalog.py`.
  Never hand-edit it - re-run the sync script.
- Previews stream live from Fontshare's CDN CSS API
  (`api.fontshare.com/v2/css?f[]=<slug>@<weights>`). Grid cards lazy-load
  their stylesheet on scroll into view.
- Downloads link directly to `api.fontshare.com/v2/fonts/download/<slug>`.
  The bulk queue staggers individual downloads and can export a `.sh`/`.bat`
  script for true one-shot bulk via the Python CLI.

## Verify

```bash
npm run lint
npx tsc --noEmit
npm run build
```
