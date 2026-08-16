import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "data/proposals/focused-candidates.json"

SOURCES = [
    {
        "repo": "ad-si/awesome-music-production",
        "url": "https://raw.githubusercontent.com/ad-si/awesome-music-production/master/readme.md",
        "allowed": [
            "Audio Workstations",
            "Synthesizers",
            "Apps",
            "Webapps",
            "SaaS",
            "AI Music Creation",
            "Music Distribution",
            "Music Promotion",
            "Sound / Sample Providers",
            "Guitar, Ukulele, …",
            "MIDI Controllers"
        ]
    },
    {
        "repo": "spnw/free-music-plugins",
        "url": "https://raw.githubusercontent.com/spnw/free-music-plugins/master/README.md",
        "allowed": [
            "Instruments",
            "Synthesizers",
            "Samplers",
            "Effects",
            "Reverb",
            "Delay / Modulation",
            "EQ",
            "Compressors / Limiters",
            "Distortion / Saturation",
            "Vocoder",
            "MIDI",
            "Utilities"
        ]
    },
    {
        "repo": "lucky-verma/awesome-creator-tools",
        "url": "https://raw.githubusercontent.com/lucky-verma/awesome-creator-tools/main/README.md",
        "allowed": [
            "Video Creation & Editing",
            "Thumbnail & Graphics",
            "Audio & Podcasting",
            "Live Streaming",
            "Social Media Management",
            "Analytics & Insights",
            "Monetization",
            "Link in Bio",
            "Newsletter & Email",
            "AI Content Tools",
            "Community & Engagement",
            "SEO & Discovery",
            "Productivity"
        ]
    },
    {
        "repo": "JuneYaooo/awesome-ai-media",
        "url": "https://raw.githubusercontent.com/JuneYaooo/awesome-ai-media/main/README.md",
        "allowed": [
            "One-Click Video Generation",
            "AI Text-to-Video Models",
            "Social Media Automation",
            "Social Media Crawlers",
            "Subtitle and Localization",
            "AI Short Drama Generation",
            "AI Video Analysis and Notes",
            "AI Digital Human",
            "Programmatic Video Creation",
            "Video Editing Libraries"
        ]
    }
]

CATEGORY_MAP = {
    "music": [
        "audio", "music", "daw", "synth", "plugin", "sample",
        "midi", "recording", "mixing", "mastering", "vocal",
        "distribution", "promotion"
    ],
    "video": [
        "video", "streaming", "animation", "subtitle",
        "editing", "film", "youtube"
    ],
    "design": [
        "thumbnail", "graphics", "design", "photo", "image",
        "logo", "font"
    ],
    "ai": [
        "ai", "artificial intelligence", "generative"
    ],
    "creator-business": [
        "creator", "social media", "marketing", "monetization",
        "newsletter", "seo", "analytics", "community"
    ]
}


def fetch(url):
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "MILEYM3DIA-Creator-Hub/1.0"}
    )
    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")


def category_for(section):
    text = section.lower()

    scores = {
        category: sum(term in text for term in terms)
        for category, terms in CATEGORY_MAP.items()
    }

    best = max(scores, key=scores.get)

    return best if scores[best] else "creator-tools"


def parse_sections(markdown):
    lines = markdown.splitlines()
    sections = []

    current = "General"
    body = []

    for line in lines:
        heading = re.match(r"^#{1,6}\s+(.+?)\s*$", line)

        if heading:
            if body:
                sections.append((current, "\n".join(body)))

            current = heading.group(1).strip()
            body = []
        else:
            body.append(line)

    if body:
        sections.append((current, "\n".join(body)))

    return sections


def parse_links(text):
    # Standard markdown links
    pattern = re.compile(
        r"\[([^\]]+)\]\((https?://[^)\s]+)\)"
    )

    return pattern.findall(text)


def parse_reference_links(markdown):
    refs = {}

    pattern = re.compile(
        r"^\[([^\]]+)\]:\s*(https?://\S+)",
        re.MULTILINE
    )

    for name, url in pattern.findall(markdown):
        refs[name.lower()] = url.rstrip(".,)")

    return refs


def clean_name(name):
    name = re.sub(r"\s+", " ", name)
    return name.strip(" *`")


def main():
    candidates = []
    seen = set()

    for source in SOURCES:
        print(f"\nScanning {source['repo']}...")

        try:
            markdown = fetch(source["url"])
        except Exception as e:
            print("ERROR:", e)
            continue

        references = parse_reference_links(markdown)

        for heading, body in parse_sections(markdown):

            if heading not in source["allowed"]:
                continue

            category = category_for(heading)

            for name, url in parse_links(body):

                name = clean_name(name)
                url = url.rstrip(".,)")

                if name.lower() in references:
                    url = references[name.lower()]

                if url.lower() in seen:
                    continue

                if not name or len(name) > 150:
                    continue

                seen.add(url.lower())

                candidates.append({
                    "id": "",
                    "name": name,
                    "description": f"{name} — discovered in {heading}.",
                    "category": category,
                    "subcategory": heading,
                    "tags": [],
                    "pricing": {
                        "type": "unknown",
                        "price": None,
                        "currency": None
                    },
                    "platforms": [],
                    "formats": [],
                    "website": url,
                    "download": "",
                    "openSource": "github.com" in url.lower(),
                    "verified": False,
                    "featured": False,
                    "source": f"GitHub:{source['repo']}",
                    "lastVerified": None
                })

    for i, item in enumerate(candidates, 1):
        item["id"] = f"seed-{i:04d}"

    result = {
        "status": "test-only",
        "count": len(candidates),
        "candidates": candidates
    }

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    OUTPUT.write_text(
        json.dumps(result, indent=2) + "\n",
        encoding="utf-8"
    )

    print("\n======================================")
    print("MILEYM3DIA FOCUSED IMPORT")
    print("======================================")
    print(f"Candidates: {len(candidates)}")
    print(f"Saved: {OUTPUT}\n")

    for i, item in enumerate(candidates[:40], 1):
        print(
            f"{i}. [{item['category']}] "
            f"{item['name']} → {item['website']}"
        )


if __name__ == "__main__":
    main()
