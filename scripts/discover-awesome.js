/*
scripts/discover-awesome.js

Lightweight discovery script that:
- Fetches raw Markdown from a list of public "Awesome" GitHub READMEs (raw.githubusercontent.com URLs)
- Parses section headings and link items to extract candidate resources
- Fetches each candidate target page (or GitHub repo page) and extracts simple metadata heuristics
- Deduplicates candidates by canonical domain or GitHub repo URL
- Writes scripts/candidates.json with normalized, reviewable candidates

Notes:
- Designed to run without API keys (unauthenticated HTTP only). Rate limits and site politeness apply.
- Run locally with Node 18+ (has global fetch). Example: node scripts/discover-awesome.js
- The list of SOURCES below can be edited to add/remove Awesome lists.
*/

import fs from "fs";
import path from "path";

// Node 18+ has global fetch and URL available.
// Helper: simple markdown link regex and heading capture.

const SOURCES = [
  // Default curated Awesome lists (raw README.md URLs)
  // You can add or remove raw GitHub README URLs here.
  "https://raw.githubusercontent.com/lucky-verma/awesome-creator-tools/main/README.md",
  "https://raw.githubusercontent.com/awesome-selfhosted/awesome-selfhosted/master/README.md",
  "https://raw.githubusercontent.com/sindresorhus/awesome/main/readme.md",
  // Add more raw README URLs as desired
];

const OUT_FILE = path.resolve(process.cwd(), "scripts/candidates.json");

function extractMarkdownSections(md) {
  // Return array of { heading, items: [{text, url}] }
  const lines = md.split(/\r?\n/);
  let currentHeading = "";
  const sections = [];

  for (const line of lines) {
    const h = line.match(/^#{1,6}\s*(.+)/);
    if (h) {
      currentHeading = h[1].trim();
      sections.push({ heading: currentHeading, items: [] });
      continue;
    }

    // match markdown links in list items: - [Name](https://...)
    const m = line.match(/^-\s+\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
    if (m) {
      const text = m[1].trim();
      const url = m[2].trim();
      if (!sections.length) sections.push({ heading: "Uncategorized", items: [] });
      sections[sections.length - 1].items.push({ text, url });
    }

    // also match plain link lines like [Name](url) without leading -
    const m2 = line.match(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/);
    if (m2 && !/^#{1,6}\s*/.test(line)) {
      const text = m2[1].trim();
      const url = m2[2].trim();
      if (!sections.length) sections.push({ heading: "Uncategorized", items: [] });
      sections[sections.length - 1].items.push({ text, url });
    }
  }

  return sections.filter(s => s.items && s.items.length);
}

function canonicalDomain(raw) {
  try {
    const u = new URL(raw);
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch (e) {
    return raw.toLowerCase();
  }
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { headers: { "user-agent": "mileym3dia-discovery/1.0" } });
    if (!res.ok) return null;
    return await res.text();
  } catch (e) {
    console.warn("fetch failed", url, e.message);
    return null;
  }
}

function guessFromHtml(html, url) {
  const meta = { description: null, image: null, hasGithub: false, firstParagraph: null };

  if (!html) return meta;

  // meta description
  const descMatch = html.match(/<meta[^>]*name=(?:"|')description(?:"|')[^>]*content=(?:"|')([^"']+)(?:"|')[^>]*>/i)
    || html.match(/<meta[^>]*property=(?:"|')og:description(?:"|')[^>]*content=(?:"|')([^"']+)(?:"|')[^>]*>/i);
  if (descMatch) meta.description = descMatch[1].trim();

  const imgMatch = html.match(/<meta[^>]*property=(?:"|')og:image(?:"|')[^>]*content=(?:"|')([^"']+)(?:"|')[^>]*>/i)
    || html.match(/<meta[^>]*name=(?:"|')twitter:image(?:"|')[^>]*content=(?:"|')([^"']+)(?:"|')[^>]*>/i);
  if (imgMatch) meta.image = imgMatch[1].trim();

  // detect github link
  if (/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/i.test(html) || url.includes("github.com")) {
    meta.hasGithub = true;
  }

  // find first <p>...</p>
  const p = html.match(/<p[^>]*>([^<]{20,}?)<\//i);
  if (p) meta.firstParagraph = p[1].replace(/<[^>]+>/g, "").trim();

  return meta;
}

function inferPricingFromText(text) {
  if (!text) return { type: "unknown", confidence: "low" };
  const t = text.toLowerCase();
  if (t.includes("open source") || t.includes("github.com") || t.includes("license")) return { type: "free", confidence: "medium" };
  if (t.includes("pricing") || t.includes("paid") || t.includes("subscription") || t.includes("price")) return { type: "paid", confidence: "low" };
  if (t.includes("free") && t.includes("paid")) return { type: "freemium", confidence: "low" };
  if (t.includes("free")) return { type: "free", confidence: "low" };
  return { type: "unknown", confidence: "low" };
}

async function discover() {
  const candidates = [];
  const seen = new Map(); // key -> candidate (domain or github repo)

  for (const src of SOURCES) {
    console.log("Fetching source:", src);
    const md = await fetchText(src);
    if (!md) continue;

    const sections = extractMarkdownSections(md);
    for (const section of sections) {
      for (const item of section.items) {
        // basic normalization
        const name = item.text;
        const url = item.url;
        const domain = canonicalDomain(url);
        const key = url.includes("github.com") ? url.split("#")[0] : domain;

        if (seen.has(key)) {
          // merge source context
          const existing = seen.get(key);
          existing.sources = existing.sources || [];
          existing.sources.push({ from: src, section: section.heading });
          continue;
        }

        // fetch target page for heuristics
        console.log("  Inspecting:", url);
        const pageText = await fetchText(url);
        const heur = guessFromHtml(pageText, url);

        const desc = item.text || heur.description || heur.firstParagraph || "";
        const pricing = inferPricingFromText((heur.description || "") + " " + (heur.firstParagraph || ""));

        const candidate = {
          id: name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
          name: name,
          website: url,
          description: desc,
          source: `${src}#${section.heading}`,
          inferredCategory: section.heading || null,
          tags: [],
          platforms: [],
          pricing,
          openSource: { value: heur.hasGithub === true, confidence: heur.hasGithub ? "medium" : "low" },
          logo: heur.image || null,
          lastSeen: new Date().toISOString(),
          confidence: "low"
        };

        seen.set(key, candidate);
        candidates.push(candidate);
      }
    }
  }

  // dedupe by domain: map already used.
  const out = [...seen.values()];

  // write output
  fs.writeFileSync(OUT_FILE, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${out.length} candidate(s) to ${OUT_FILE}`);
}

// Run if executed directly
if (import.meta.url === `file://${process.cwd()}/scripts/discover-awesome.js`) {
  discover().catch(err => {
    console.error(err);
    process.exit(1);
  });
}

export default { discover };
