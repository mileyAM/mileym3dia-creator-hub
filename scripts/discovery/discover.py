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

# Words that indicate a resource is relevant to MILEYM3DIA creators.
RELEVANCE = {
    "music": [
        "music", "audio", "vst", "plugin", "plugins", "instrument",
        "synth", "drum", "sample", "samples", "loop", "loops",
        "preset", "presets", "mixing", "mastering", "vocal",
        "recording", "daw", "beat", "beats", "producer",
        "production", "sound", "fx", "effect"
    ],

    "ai": [
        "ai", "artificial intelligence", "generative", "text to music",
        "music ai", "voice ai", "voice generator", "image generator",
        "video generator", "audio generator"
    ],

    "video": [
        "video", "editing", "editor", "animation", "motion",
        "subtitle", "captions", "reels", "shorts", "youtube",
        "film", "cinema"
    ],

    "design": [
        "design", "graphic", "graphics", "logo", "logos", "thumbnail",
        "photo", "photography", "image", "illustration", "font",
        "fonts", "mockup", "template", "templates"
    ],

    "creator-business": [
        "creator", "creators", "content", "social media", "marketing",
        "monetization", "affiliate", "royalty", "licensing",
        "distribution", "store", "shop", "portfolio", "website"
    ]
}

# Strong negative signals. These help eliminate developer/news noise.
REJECT = [
    "npm", "javascript", "typescript", "python library",
    "software library", "api documentation", "sdk",
    "framework", "docker", "kubernetes", "database",
    "compiler", "programming language", "leetcode",
    "algorithm", "machine learning benchmark",
    "security vulnerability", "cybersecurity"
]


def fetch(url):
    request = urllib.request.Request(
        url,
        headers={"User-Agent": USER_AGENT}
    )

    with urllib.request.urlopen(request, timeout=20) as response:
        return response.read()


def clean(text):
    text = unescape(text or "")
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def load_json(path):
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def existing_urls(resources):
    return {
        r.get("website", "").rstrip("/").lower()
        for r in resources
        if r.get("website")
    }


def score(title, description):
    text = f"{title} {description}".lower()

    scores = {}
    total = 0

    for category, words in RELEVANCE.items():
        category_score = sum(
            1 for word in words
            if word in text
        )

        if category_score:
            scores[category] = category_score
            total += category_score

    negative = sum(
        1 for word in REJECT
        if word in text
    )

    return total - (negative * 3), scores


def best_category(scores):
    if not scores:
        return "creator-tools"

    return max(scores, key=scores.get)


def valid_candidate(title, description, link):
    if not title or not link:
        return False

    parsed = urlparse(link)

    if parsed.scheme not in ("http", "https"):
        return False

    combined = f"{title} {description}".lower()

    # Reject obvious noise.
    if any(word in combined for word in REJECT):
        return False

    relevance_score, _ = score(title, description)

    # Require at least two relevant signals.
    if relevance_score < 2:
        return False

    return True


def extract_rss(data, source):
    root = ET.fromstring(data)
    candidates = []

    for item in root.findall(".//item"):
        title = clean(item.findtext("title"))
        description = clean(item.findtext("description"))
        link = clean(item.findtext("link"))

        if not valid_candidate(title, description, link):
            continue

        relevance_score, categories = score(
            title,
            description
        )

        candidates.append({
            "name": title[:150],
            "description": description[:500],
            "website": link,
            "category": best_category(categories),
            "relevanceScore": relevance_score,
            "source": source["name"]
        })

    return candidates


def main():
    resources = load_json(RESOURCES)
    config = load_json(SOURCES)

    known = existing_urls(resources)
    candidates = []
    seen = set()

    for source in config["sources"]:
        print(f"Checking: {source['name']}")

        try:
            data = fetch(source["url"])

            if "rss" in source["url"] or "feed" in source["url"]:
                found = extract_rss(data, source)
            else:
                found = []

            for item in found:
                url = item["website"].rstrip("/").lower()

                if url in known or url in seen:
                    continue

                seen.add(url)
                candidates.append(item)

        except Exception as error:
            print(f"  Source error: {error}")

    # Highest-quality candidates first.
    candidates.sort(
        key=lambda x: x.get("relevanceScore", 0),
        reverse=True
    )

    # Keep the first discovery batch intentionally small.
    candidates = candidates[:50]

    result = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(candidates),
        "status": "needs-review",
        "candidates": candidates
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    OUTPUT.write_text(
        json.dumps(result, indent=2) + "\n",
        encoding="utf-8"
    )

    print()
    print("MILEYM3DIA discovery complete.")
    print(f"Qualified candidates: {len(candidates)}")
    print(f"Saved to: {OUTPUT}")


if __name__ == "__main__":
    main()
