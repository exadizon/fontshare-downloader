# Fontshare Downloader

Bulk-download the full [Fontshare](https://www.fontshare.com/) catalog - 100
free font families from Indian Type Foundry - and browse it in a clean web UI.
Two parts share one generated catalog (`data/fonts.json`, 100 families):

- **Python CLI** (`cli/`) - discovers the live catalog, downloads and extracts
  every family, and installs desktop fonts on Windows, macOS, and Linux.
- **Web UI** (`web/`) - Next.js catalog browser with live previews,
  per-family downloads, and a multi-select bulk queue. Deployable to Vercel.

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

### Refresh the catalog

Fontshare adds families over time:

```bash
python scripts/sync_catalog.py
```

This regenerates `data/fonts.json` (full metadata) and `data/fonts.min.json`
(slim UI bundle) from the live API. Commit the regenerated files.

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

## Licensing

The tool is released under the MIT License (see `LICENSE`). The fonts
themselves remain subject to Fontshare's per-family licenses (`itf_ffl` or
`sil_ofl`, recorded in `data/fonts.json`). Review
[Fontshare licenses](https://www.fontshare.com/licenses) before use.

## Contributing

See `CONTRIBUTING.md`. Bug reports are most useful with a single family slug,
the log from `downloads/logs/download.log`, and your OS.

## Roadmap

- [x] Canonical CLI with live discovery, extraction, installer
- [x] Browser ZIP importer with catalog slug matching
- [x] Catalog sync script and generated 100-family data
- [x] Web UI catalog grid, family detail pages, bulk queue
- [ ] Vercel deploy and demo assets
- [ ] Update detection (download only families new since last sync)
