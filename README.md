# Fontshare Downloader

Bulk-download the full [Fontshare](https://www.fontshare.com/) catalog - 100
free font families from Indian Type Foundry - and browse it in a clean web UI.
Two parts share one generated catalog (`data/fonts.json`, 100 families):

- **Python CLI** (`cli/`) - discovers the live catalog, downloads and extracts
  every family, and installs desktop fonts on Windows, macOS, and Linux.
- **Web UI** (`web/`) - Next.js catalog browser with live previews,
  per-family downloads, and a multi-select bulk queue. Deployable to Vercel.

## Why this exists

Fontshare publishes excellent free fonts, but only one family at a time and
with no bulk option. This tool is a personal convenience for people who use
Fontshare heavily and want to (re)install the whole catalog on a new machine
without clicking through 100 download pages. It is not affiliated with
Fontshare or Indian Type Foundry.

## Features

- Live discovery from `https://api.fontshare.com/v2/fonts` with pagination,
  retry, and a local fallback.
- Every family is extracted on arrival into `downloads/fonts/<slug>/` (OTF,
  TTF, variable fonts, and WEB assets), never left as a ZIP.
- Cross-platform installer with `--scope user|system` and
  `--variants all|static|variable`.
- Browser-ZIP importer (`cli/import_zips.py`, standard library only) for the
  one-ZIP-per-family downloads that Fontshare's site produces.
- Zip-slip-safe extraction, atomic replacement, idempotent runs.
- Rich metadata: category, designers, tags, styles and weights, variable
  axes, OpenType features, license (`itf_ffl` or `sil_ofl`).

## Quick start

### CLI: download everything

```bash
pip install -r cli/requirements.txt

# Download all 100 families, extracted to downloads/fonts/<slug>/
python cli/download.py

# Download and install for the current user in one step
python cli/download.py --install --install-scope user

# Install already-downloaded fonts
python cli/install.py --scope user
python cli/install.py --fonts-dir ./downloads/fonts --scope system
```

Options: `--output-dir`, `--rate-limit` (default 1.0s - be respectful),
`--max-concurrent` (default 3), `--install-variants`, `--verbose`.
Run `python cli/download.py --help` for details.

### Already downloaded ZIPs in your browser?

Fontshare has no full-catalog download, so browser downloads are one ZIP per
family (`Author_Complete.zip`, `Satoshi_Complete.zip`, ...). Point the
importer at whatever folder they landed in - it matches each ZIP to its
catalog family, extracts it, and installs in one go. No dependencies needed:

```bash
python cli/import_zips.py --install                 # scans ~/Downloads
python cli/import_zips.py --source ./zips --dry-run # preview, no writing
```

Idempotent: families already on disk are skipped (`--force` re-extracts), and
archives without font files are ignored.

### Web UI

```bash
cd web
npm install
npm run dev      # local preview at http://localhost:3000
```

Previews stream from Fontshare's CDN, downloads link straight to Fontshare's
API - no server storage needed.

### Catalog freshness

Two different data sources are involved, and only one needs manual syncing:

- **CLI** (`cli/download.py`, `cli/import_zips.py`) discovers the catalog
  live from `https://api.fontshare.com/v2/fonts` on every run, so it always
  sees whatever Fontshare publishes today. No sync step is needed for
  downloading or installing.
- **Web UI** reads the committed `data/fonts.min.json` at build time, so new
  families only appear after `python scripts/sync_catalog.py` plus a rebuild
  and redeploy.

If Fontshare changes its API or download URL shape, the CLI will fail loudly
rather than silently; check `downloads/logs/download.log` and open an issue.

## Commands

| Command | Purpose |
|---|---|
| `python cli/download.py` | Download and extract the full catalog |
| `python cli/download.py --install` | Download, extract, and install |
| `python cli/install.py --scope user` | Install already-downloaded fonts |
| `python cli/import_zips.py --install` | Import browser ZIPs and install |
| `python scripts/sync_catalog.py` | Refresh catalog data |
| `cd web && npm run dev` | Run the web UI locally |
| `cd web && npm run build` | Production build |

## Output structure

```
downloads/
  fonts/<slug>/    # extracted family: OTF/, TTF/, WEB/, License/
  logs/download.log
  metadata/font-list.json
```

## Architecture

See `docs/ARCHITECTURE.md` for discovery, download, extraction, and install
details. Retired pre-clean-break scripts live in `scripts/archive/`.

## Legal and licensing

This project is a convenience tool. It is not affiliated with, endorsed by,
or sponsored by Fontshare or Indian Type Foundry.

- **The tool** is released under the MIT License (see `LICENSE`).
- **The fonts** are not part of this repository and are not redistributed by
  it. They are downloaded directly from Fontshare's own API, the same endpoint
  their website uses. Each family carries its own license (`itf_ffl` or
  `sil_ofl`), recorded in `data/fonts.json`. Review
  [Fontshare's licenses](https://www.fontshare.com/licenses) and comply with
  the terms of any family you use, especially for commercial work.
- **No font files are committed.** `downloads/` is gitignored, and the
  catalog data contains metadata only.
- **Be respectful** of Fontshare's service: the defaults (1.0s rate limit,
  3 concurrent) are deliberately conservative. Do not raise them to hammer
  the API.

## Contributing

See `CONTRIBUTING.md`. Bug reports are most useful with a single family slug,
the log from `downloads/logs/download.log`, and your OS.

## Live demo

https://fontshare-bulk-downloader.vercel.app



- [x] Canonical CLI with live discovery, extraction, installer
- [x] Browser ZIP importer with catalog slug matching
- [x] Catalog sync script and generated 100-family data
- [x] Web UI catalog grid, family detail pages, bulk queue
- [ ] Vercel deploy and demo assets
- [ ] Update detection (download only families new since last sync)
