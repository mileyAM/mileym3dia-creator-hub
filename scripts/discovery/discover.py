import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timezone
from html import unescape
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"

RESOURCES = DATA / "resources.json"
SOURCES = ROOT / "scripts" / "discovery" / "sources.json"
OUTPUT = DATA / "proposals" / "candidates.json"

USER_AGENT = "MILEYM3DIA-Creator-Hub/1.0"

KEYWORDS = {
    "music": [
        "music", "audio", "vst", "plugin", "plugins",
        "synth", "drum", "sample", "samples", "loops",
        "preset", "presets", "mixing", "mastering",
        "vocal", "recording", "daw", "beat", "beats",
        "producer", "production", "sound", "fx"
    ],
    "ai": [
        "ai", "artificial intelligence", "generative",
        "voice generator", "music ai", "image generator",
        "video generator", "audio generator", "text to video"
    ],
    "video": [
        "video", "video editor", "editing", "animation",
        "motion", "subtitle", "captions", "youtube",
        "reels", "shorts", "film"
    ],
    "design": [
        "design", "graphic", "logo", "thumbnail", "photo",
        "photography", "image", "illustration", "font",
        "fonts", "template", "templates", "mockup"
    ],
    "business": [
        "creator", "content creator", "social media",
        "marketing", "monetization", "royalty",
        "licensing", "distribution", "store", "shop",
        "portfolio", "website", "newsletter"
    ]
}

REJECT = [
    "malware", "exploit", "vulnerability", "crypto",
    "cryptocurrency", "casino", "gambling", "betting",
    "political campaign", "obituary", "dies at", "died at",
    "killed", "shooting", "lawsuit", "arrested",
    "earthquake", "data breach", "data leak", "election"
]


def fetch(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT}
    )

    with urllib.request.urlopen(req, timeout=20) as response:
        return response.read()


def clean(value):
    value = unescape(value or "")
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def load(path):
    return json.loads(path.read_text(encoding="utf-8"))


def score(title, description):
    text = f"{title} {description}".lower()

    category_scores = {}

    for category, words in KEYWORDS.items():
        category_scores[category] = sum(
            1 for word in words
            if re.search(r"\b" + re.escape(word) + r"\b", text)
        )

    positive = sum(category_scores.values())

    negative = sum(
        1 for word in REJECT
        if re.search(r"\b" + re.escape(word) + r"\b", text)
    )

    return positive - (negative * 5), category_scores


def extract_rss(data, source):
    root = ET.fromstring(data)
    results = []

    for item in root.findall(".//item"):
        title = clean(item.findtext("title"))
        description = clean(item.findtext("description"))
        link = clean(item.findtext("link"))

        if not title or not link:
            continue

        parsed = urlparse(link)

        if parsed.scheme not in ("http", "https"):
            continue

        score_value, categories = score(title, description)

        # Require a real creator signal: at least two keyword hits
        # overall and at least two in the winning category. One stray
        # keyword (the old >= 1 rule) let news and obituaries through.
        if score_value < 2:
            continue

        category = max(
            categories,
            key=categories.get
        )

        if categories[category] < 2:
            continue

        results.append({
            "name": title[:160],
            "description": description[:600],
            "website": link,
            "category": category,
            "relevanceScore": score_value,
            "source": source["name"]
        })

    return results


ATOM = "{http://www.w3.org/2005/Atom}"


def extract_atom(data, source):
    root = ET.fromstring(data)
    results = []

    for entry in root.findall(f".//{ATOM}entry"):
        title = clean(entry.findtext(f"{ATOM}title"))
        description = clean(
            entry.findtext(f"{ATOM}summary")
            or entry.findtext(f"{ATOM}content")
        )

        link = ""
        for link_el in entry.findall(f"{ATOM}link"):
            if link_el.get("rel") in (None, "alternate"):
                link = link_el.get("href") or ""
                break

        if not title or not link:
            continue

        parsed = urlparse(link)

        if parsed.scheme not in ("http", "https"):
            continue

        score_value, categories = score(title, description)

        if score_value < 2:
            continue

        category = max(
            categories,
            key=categories.get
        )

        if categories[category] < 2:
            continue

        results.append({
            "name": title[:160],
            "description": description[:600],
            "website": link,
            "category": category,
            "relevanceScore": score_value,
            "source": source["name"]
        })

    return results


def main():
    resources = load(RESOURCES)
    # data/resources.json wraps the list under a "resources" key; iterating
    # the raw dict yields key strings and crashes on r.get(...).
    if isinstance(resources, dict):
        resources = resources.get("resources", [])
    sources = load(SOURCES)

    existing = {
        r.get("website", "").rstrip("/").lower()
        for r in resources
        if r.get("website")
    }

    candidates = []
    seen = set()

    for source in sources["sources"]:
        print(f"Checking {source['name']}...")

        try:
            data = fetch(source["url"])
            found = extract_rss(data, source)

            if not found:
                found = extract_atom(data, source)

            for item in found:
                url = item["website"].rstrip("/").lower()

                if url in existing:
                    continue

                if url in seen:
                    continue

                seen.add(url)
                candidates.append(item)

        except Exception as error:
            print(f"Source failed: {error}")

    candidates.sort(
        key=lambda x: x["relevanceScore"],
        reverse=True
    )

    candidates = candidates[:25]

    result = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "status": "needs-review",
        "count": len(candidates),
        "candidates": candidates
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    OUTPUT.write_text(
        json.dumps(result, indent=2) + "\n",
        encoding="utf-8"
    )

    print()
    print("======================================")
    print("MILEYM3DIA DISCOVERY COMPLETE")
    print("======================================")
    print(f"Qualified candidates: {len(candidates)}")
    print(f"Saved to: {OUTPUT}")
    print()

    for number, item in enumerate(candidates, 1):
        print(
            f"{number}. "
            f"[{item['category']}] "
            f"{item['name']} "
            f"(score {item['relevanceScore']})"
        )


if __name__ == "__main__":
    main()
