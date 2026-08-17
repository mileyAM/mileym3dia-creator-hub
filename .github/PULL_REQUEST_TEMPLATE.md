# Add search seed and expanded tools dataset

This PR adds a seeded dataset of popular content creator tools, a Lunr-based client-side search UI, and initial import notes.

What I changed
- data/tools_seed.json — seed dataset of ~70 popular creator tools across categories
- data/tools.json — expanded dataset ingested from lucky-verma/awesome-creator-tools
- website/search-index.json — search index used by the UI
- website/search.html — Lunr.js-based search page
- docs/IMPORT.md — notes on import sources and next steps

Why
- Provides an immediate searchable index for creators and improves discoverability.
- Establishes a canonical data schema so we can systematically ingest more lists and keep the site updated.

Next steps
- Continue scraping sindresorhus/awesome and awesomelist.dev to expand the dataset and deduplicate entries.
- Add category filters and per-tool detail pages in the UI.

Signed-off-by: Copilot <copilot@github.com>