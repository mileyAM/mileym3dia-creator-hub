# Creator Hub Category Mapping

This file captures the pillar taxonomy you provided and the mapping rules used by the automated reclassifier.

Pillars and subcategories

Music
- DAWs
- Recording
- Mixing / Mastering
- Samples
- Plugins
- Music AI
- Distribution
- Collaboration

Video
- Editors
- Screen recording
- Streaming
- Podcasting
- Captions
- Short-form clipping
- Stock video
- Motion graphics

Design
- Graphic design
- Photo editing
- Illustration
- 3D
- UI/UX
- Fonts
- Stock imagery

AI
- AI assistants
- Image generation
- Video generation
- Voice
- Music
- Writing
- Research
- Automation

Creator Business
- Websites
- SEO
- Analytics
- Email
- Social scheduling
- Monetization
- Digital products
- Payments
- Automation
- Project management

Mapping heuristics (used by the reclassifier)

- Use existing `category` and `tags` fields as the primary signals.
- Match keywords (case-insensitive) inside the `name`, `short_description`, `category`, and `tags` fields to assign a pillar and 0..N subcategories.
- Assign a single primary `pillar` and populate `subcategories` with one or more entries from the lists above.
- Preserve the original category lines in `categories_original` for traceability.
- Mark items that matched multiple pillars or matched none as `ambiguous` for manual review.

Examples
- "DaVinci Resolve" => pillar: Video, subcategories: ["Editors"]
- "OBS Studio" => pillar: Video, subcategories: ["Streaming"]
- "Ableton Live" => pillar: Music, subcategories: ["DAWs","Recording","Mixing / Mastering"]
- "Midjourney" => pillar: AI, subcategories: ["Image generation"]
- "TubeBuddy" => pillar: Creator Business, subcategories: ["SEO","Analytics"]

Run notes
- Run `python3 scripts/reclassify.py` from the repository root. The script reads `data/tools.json` and writes `data/tools_reclassified.json` plus a summary report.

If you'd like edits to these pillar names or subcategories, tell me and I'll update the mapping and re-run the automated pass.
