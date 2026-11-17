# Fontshare Downloader

Bulk-download the full [Fontshare](https://www.fontshare.com/) catalog (100
free font families) and browse it in a clean web UI. Two parts:

- **Python CLI** (`cli/`) - downloads every family ZIP from Fontshare's API,
  extracts immediately, optionally installs desktop fonts.
- **Web UI** (`web/`) - Next.js catalog browser with live previews,
  per-family downloads, and a multi-select bulk queue.

## Quick start

### CLI

```bash
pip install -r cli/requirements.txt

# Download all fonts (extracted to downloads/fonts/<slug>/)
python cli/download.py

# Download + install for the current user in one step
python cli/download.py --install --install-scope user

# Install already-downloaded fonts (user or system scope)
python cli/install.py --scope user
python cli/install.py --fonts-dir ./downloads/fonts --scope system
```

Options: `--output-dir`, `--rate-limit` (default 1.0s, be respectful),
`--max-concurrent` (default 3), `--install-variants`, `--verbose`. Run
`python cli/download.py --help` for details.

### Already downloaded ZIPs in your browser?

Fontshare's site has no full-catalog download, so browser downloads are one
ZIP per family (`Author_Complete.zip`, `Satoshi_Complete.zip`, ...). Point the
importer at whatever folder they landed in - it matches each ZIP to its
catalog family, extracts it, and installs in one go. Standard library only, so
no `pip install` is needed:

```bash
python cli/import_zips.py --install                 # uses your ~/Downloads
python cli/import_zips.py --source ~/Downloads --install
python cli/import_zips.py --source ./zips --dry-run # preview, no writing
```

It is idempotent: families already on disk are skipped (`--force` re-extracts),
and archives without font files are ignored.


### Web UI

```bash
cd web
npm install
npm run dev      # local preview at http://localhost:3000
```

Deployed to Vercel for public browsing. Previews stream from Fontshare's CDN,
downloads link straight to Fontshare's API - no server storage needed.

### Refresh the catalog

Fontshare adds families over time. To update the bundled font options:

```bash
python scripts/sync_catalog.py
```

This regenerates `data/fonts.json` (full metadata) and `data/fonts.min.json`
(slim UI bundle) from the live API.

## Layout

```
cli/               # canonical downloader + installer
data/              # generated catalog (do not hand-edit)
scripts/           # sync_catalog.py + archive/ of retired scripts
web/               # Next.js + TypeScript + Tailwind UI
docs/demo/         # screenshots, demo assets
downloads/         # runtime output, gitignored, never committed
```

Legacy pre-clean-break scripts live in `scripts/archive/` (unmaintained).

## Output structure

```
downloads/
  fonts/<slug>/    # extracted family: OTF/, TTF/, WEB/ extras
  logs/download.log
  metadata/font-list.json
```

## Licensing

All fonts remain subject to Fontshare's licensing terms (per-family
`itf_ffl` or `sil_ofl`, recorded in `data/fonts.json`). Review
[Fontshare licenses](https://www.fontshare.com/licenses) before use.

## Contributing

- Bug in discovery/download? Reproduce with a single family first, then fix in
  `cli/download.py`.
- Catalog out of date? Run `python scripts/sync_catalog.py` and commit `data/`.
- UI ideas? The web app reads `data/fonts.min.json` at build time.
