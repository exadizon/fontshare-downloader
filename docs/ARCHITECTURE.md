# Fontshare Downloader - Architecture and design

## Problem

Fontshare.com offers high-quality free fonts but no bulk download: users must
download families one by one. This project automates full-catalog access and
adds a clean browser UI for previewing and picking fonts.

## Solution (clean-break era, Sept 2026)

Two parts sharing one generated catalog (`data/fonts.json`, 100 families):

1. **Python CLI** (`cli/download.py`, `cli/install.py`, `cli/import_zips.py`)
   - Live discovery: `GET https://api.fontshare.com/v2/fonts`
     (`offset`/`limit` pagination, `has_more` loop), fallback to
     `data/fonts.min.json`, then a minimal hardcoded list.
   - Download: `GET https://api.fontshare.com/v2/fonts/download/<slug>`,
     chunked streaming, 3 retries with backoff, rate limit 1.0s, max 3
     concurrent, skip-if-extracted, legacy-ZIP migration, zip-slip-safe
     extraction into `downloads/fonts/<slug>/`.
   - Install: cross-platform (Windows registry + GDI refresh, macOS
     `Library/Fonts`, Linux fontconfig), `--scope user|system`, skips
     web-only assets, `--variants all|static|variable`.
   - Import: `cli/import_zips.py` ingests browser-downloaded family ZIPs
     (stdlib only), matching each archive to its catalog slug by filename,
     archive folder, or font stems, then optionally installs.
2. **Web UI** (`web/`, Next.js + TypeScript + Tailwind)
   - Static catalog browser copying Fontshare aesthetics: paper background,
     ink text, grotesk display type, minimal grid.
   - Catalog grid: search, category/license filter, sort. Detail page per
     family: editable live preview (CDN CSS API), weights table from
     `styles[]`, tags, license, per-family direct download.
   - Bulk queue: multi-select triggers staggered individual ZIP downloads
     (no server-side merge; avoids function timeouts). Script export
     (`.bat`/`.sh`) for true one-shot bulk via the CLI.

## Status

- [x] Canonical CLI with live discovery, extraction, installer
- [x] Browser ZIP importer with catalog slug matching (`cli/import_zips.py`)
- [x] Catalog sync script + generated 100-family data with rich metadata
- [x] Legacy scripts archived, binaries untracked, docs refreshed
- [x] Web UI catalog grid, family detail pages, bulk queue (verified:
  `npm run lint`, `tsc --noEmit`, `npm run build` 104 static pages,
  dev-server SSR smoke test on `/` and `/satoshi`)
- [ ] Vercel deploy + demo assets (`docs/demo/` still empty)
- [ ] Update detection (download only families new since last sync)

## Requirements for remaining work

- UI reads `data/fonts.min.json` at build time; no backend storage.
- Previews: `https://api.fontshare.com/v2/css?f[]=<slug>@<weights>&display=swap`.
- Downloads: direct links to `/v2/fonts/download/<slug>`.
- Must pass `npm run lint`, `tsc --noEmit`, `npm run build` before commit.
- Catalog changes: regenerate via `scripts/sync_catalog.py`, never hand-edit.

## Success criteria

1. CLI downloads all catalog families at 95%+ success with retries.
2. Full run completes without hammering Fontshare (defaults respected).
3. UI lets a visitor preview, select, and download any subset in under a
   minute, deployed publicly and runnable locally.
4. Repo is publicly presentable: no binaries, one canonical CLI, clear docs.
