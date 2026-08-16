import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime, timezone
from html import unescape

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"

RESOURCES = DATA / "resources.json"
SOURCES = ROOT / "scripts" / "discovery" / "sources.json"
OUTPUT = DATA / "proposals" / "candidates.json"

USER_AGENT = "MILEYM3DIA-Creator-Hub/1.0"


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


def extract_rss(data, source):
    root = ET.fromstring(data)
    candidates = []

    for item in root.findall(".//item"):
        title = clean(item.findtext("title"))
        description = clean(item.findtext("description"))
        link = clean(item.findtext("link"))

        if not title or not link:
            continue

        candidates.append({
            "name": title[:150],
            "description": description[:500],
            "website": link,
            "category": source["category"],
            "source": source["name"]
        })

    return candidates


def extract_github_trending(data, source):
    text = data.decode("utf-8", errors="ignore")
    candidates = []

    pattern = re.compile(
        r'href="(/[^"/]+/[^"/]+)"[^>]*>(.*?)</a>',
        re.S
    )

    seen = set()

    for match in pattern.finditer(text):
        path = match.group(1)

        if path in seen:
            continue

        seen.add(path)

        if path.count("/") != 2:
            continue

        name = clean(match.group(2))

        if not name or len(name) > 150:
            continue

        candidates.append({
            "name": name,
            "description": "GitHub trending project discovered by MILEYM3DIA.",
            "website": "https://github.com" + path,
            "category": source["category"],
            "source": source["name"]
        })

    return candidates


def main():
    resources = load_json(RESOURCES)
    config = load_json(SOURCES)

    known = existing_urls(resources)
    candidates = []

    for source in config["sources"]:
        print(f"Checking: {source['name']}")

        try:
            data = fetch(source["url"])

            if "rss" in source["url"] or "feed" in source["url"]:
                found = extract_rss(data, source)
            else:
                found = extract_github_trending(data, source)

            for item in found:
                url = item["website"].rstrip("/").lower()

                if url in known:
                    continue

                if any(
                    c["website"].rstrip("/").lower() == url
                    for c in candidates
                ):
                    continue

                candidates.append(item)

        except Exception as error:
            print(f"  Could not read source: {error}")

    result = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "count": len(candidates),
        "status": "needs-review",
        "candidates": candidates
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    with OUTPUT.open("w", encoding="utf-8") as f:
        json.dump(result, f, indent=2)

    print()
    print(f"Discovery complete.")
    print(f"New candidates: {len(candidates)}")
    print(f"Saved to: {OUTPUT}")


if __name__ == "__main__":
    main()
