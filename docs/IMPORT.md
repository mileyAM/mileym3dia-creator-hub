# IMPORTING EXTERNAL LISTS

This document describes how the seed dataset was produced and how to expand it.

What I added
- data/tools_seed.json — a seeded JSON list (~50 popular creator tools) used to populate the initial index.
- website/search-index.json — a small index (subset) used by the search page for quick results.
- website/search.html — a lightweight Lunr-based search UI that loads the index and allows free-text search.

How to expand
1. Add new entries to data/tools_seed.json with fields: id, name, url, short_description, category, tags, source, license, self_hosted, github_repo.
2. Regenerate website/search-index.json (a subset of fields: id, name, url, category, tags) from the full data file.
3. Commit changes to feature/search-index and open a PR — or let the maintainer review before merging.

Notes
- The seed data was curated from public, well-known creator tools to provide an initial browse/search experience.
- Next steps: automated scraping from awesome-lists (sindresorhus/awesome, lucky-verma/awesome-creator-tools) to expand the dataset, deduplicate, and add source attribution.
