# Contributing

Thanks for your interest. This repo has two parts: the Python CLI (`cli/`)
and the Next.js web UI (`web/`). They share one generated catalog
(`data/fonts.json`, `data/fonts.min.json`).

## Setup

```bash
git clone https://github.com/<you>/fontshare-downloader
cd fontshare-downloader

# CLI
python -m venv .venv
.venv/bin/pip install -r cli/requirements.txt

# Web UI
cd web && npm install
```

## Running

```bash
# Download + install the full catalog
python cli/download.py --install --install-scope user

# Import browser-downloaded family ZIPs
python cli/import_zips.py --install

# Install already-downloaded fonts
python cli/install.py --scope user

# Web UI
cd web && npm run dev
```

## Tests

```bash
python -m unittest discover -s tests
```

The CLI tests use only the standard library so they run without installing
dependencies.

## Catalog changes

Never hand-edit `data/fonts.json` or `data/fonts.min.json`. Regenerate:

```bash
python scripts/sync_catalog.py
```

Commit the regenerated files.

## Code conventions

- Never use the em dash; use a plain dash `-`.
- Keep `downloads/`, `.venv/`, `__pycache__/` and build artifacts out of
  commits (see `.gitignore`).
- Prefer the canonical CLI in `cli/`; do not add new root-level scripts.
  Retired scripts live in `scripts/archive/`.
- Run `npm run lint` and `npm run build` in `web/` before committing UI
  changes.
- Commit incrementally: inspect `git status` and `git diff` first, stage only
  intended files.
- Do not add agent names as co-authors or mention AI authorship.

## Reporting bugs

Reproduce with a single family first (e.g. `python cli/download.py` then
inspect `downloads/fonts/<slug>/`), then file an issue with the family slug,
the log from `downloads/logs/download.log`, and your OS.
