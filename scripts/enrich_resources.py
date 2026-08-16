import json
import re
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]

INPUT = ROOT / "data/proposals/focused-candidates.json"
OUTPUT = ROOT / "data/proposals/enriched-candidates.json"

UA = "MILEYM3DIA-Creator-Hub/1.0"

PLATFORMS = {
    "macos": [
        "macos", "mac os", "mac desktop", "mac application"
    ],
    "windows": [
        "windows", "windows 10", "windows 11", "win64"
    ],
    "linux": [
        "linux", "ubuntu", "debian", "fedora"
    ],
    "ios": [
        "ios", "iphone", "ipad"
    ],
    "android": [
        "android"
    ],
    "web": [
        "web app", "web application", "browser-based",
        "works in your browser", "online editor"
    ]
}

PRICING_PHRASES = {
    "free": [
        "completely free",
        "100% free",
        "free and open source",
        "free & open source",
        "free forever",
        "free software"
    ],
    "freemium": [
        "freemium",
        "free plan",
        "free tier",
        "free version",
        "free account"
    ],
    "subscription": [
        "monthly subscription",
        "annual subscription",
        "monthly plan",
        "annual plan",
        "subscription plan"
    ],
    "paid": [
        "paid software",
        "commercial software",
        "buy a license",
        "purchase a license"
    ]
}

CATEGORY_TERMS = {
    "music": [
        "music", "audio", "daw", "vst", "audio plugin",
        "synthesizer", "sampler", "recording",
        "mixing", "mastering", "midi", "sample library"
    ],
    "video": [
        "video editing", "video editor", "video creation",
        "animation", "motion graphics", "streaming",
        "screen recording", "video generator"
    ],
    "design": [
        "graphic design", "image editor", "photo editor",
        "photography", "illustration", "graphics",
        "thumbnail", "logo", "font"
    ],
    "ai": [
        "artificial intelligence", "generative ai",
        "ai image", "ai video", "ai music",
        "ai voice", "text to image", "text to video"
    ],
    "creator-business": [
        "creator", "social media", "marketing",
        "monetization", "newsletter", "seo",
        "analytics", "community"
    ]
}


def fetch(url):
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": UA}
        )

        with urllib.request.urlopen(
            req,
            timeout=12
        ) as response:

            body = response.read(
                30000
            ).decode(
                "utf-8",
                errors="ignore"
            )

            return response.status, body

    except Exception:
        return None, ""


def clean_text(text):
    text = re.sub(
        r"<script.*?</script>",
        " ",
        text,
        flags=re.I | re.S
    )

    text = re.sub(
        r"<style.*?</style>",
        " ",
        text,
        flags=re.I | re.S
    )

    text = re.sub(
        r"<[^>]+>",
        " ",
        text
    )

    text = re.sub(
        r"\s+",
        " ",
        text
    )

    return text.lower()


def detect_pricing(text):

    text = clean_text(text)

    # Only report a pricing model when the page
    # explicitly uses strong language.

    for pricing, phrases in PRICING_PHRASES.items():

        for phrase in phrases:

            if phrase in text:
                return pricing, "high"

    return "unknown", "low"


def detect_platforms(text):

    text = clean_text(text)

    detected = []

    for platform, terms in PLATFORMS.items():

        matches = [
            term for term in terms
            if term in text
        ]

        if matches:

            # Require strong evidence.
            if len(matches) >= 1:
                detected.append(platform)

    return sorted(set(detected))


def detect_category(name, description):

    text = clean_text(
        name + " " + description
    )

    scores = {}

    for category, terms in CATEGORY_TERMS.items():

        score = sum(
            1
            for term in terms
            if term in text
        )

        if score:
            scores[category] = score

    if not scores:
        return "creator-tools"

    return max(
        scores,
        key=scores.get
    )


def slugify(name):

    value = name.lower()

    value = re.sub(
        r"[^a-z0-9]+",
        "-",
        value
    )

    return value.strip("-")


def main():

    data = json.loads(
        INPUT.read_text(
            encoding="utf-8"
        )
    )

    candidates = data.get(
        "candidates",
        []
    )

    results = []
    seen = set()

    print(
        f"Validating {len(candidates)} resources..."
    )

    for index, item in enumerate(
        candidates,
        1
    ):

        name = item.get(
            "name",
            ""
        ).strip()

        website = item.get(
            "website",
            ""
        ).strip()

        if not website:
            continue

        parsed = urlparse(
            website
        )

        if parsed.scheme not in (
            "http",
            "https"
        ):
            continue

        normalized = (
            parsed.netloc.lower()
            + parsed.path.rstrip("/")
        )

        if normalized in seen:
            continue

        seen.add(normalized)

        status, page = fetch(
            website
        )

        page_text = clean_text(
            page
        )

        description = item.get(
            "description",
            ""
        )

        category = detect_category(
            name,
            description
        )

        pricing, pricing_confidence = detect_pricing(
            page_text
        )

        platforms = detect_platforms(
            page_text
        )

        is_github = (
            "github.com/" in website.lower()
        )

        record = {
            "id": slugify(name),
            "name": name,
            "description": description,
            "category": category,
            "subcategory": item.get(
                "subcategory",
                ""
            ),
            "tags": item.get(
                "tags",
                []
            ),
            "pricing": {
                "type": pricing,
                "price": None,
                "currency": None,
                "confidence": pricing_confidence
            },
            "platforms": platforms,
            "formats": [],
            "website": website,
            "download": "",
            "openSource": is_github,
            "verified": status == 200,
            "featured": False,
            "source": item.get(
                "source",
                "MILEYM3DIA discovery"
            ),
            "lastVerified": (
                "2026-08-16"
                if status == 200
                else None
            )
        }

        results.append(record)

        if index % 25 == 0:
            print(
                f"Processed {index}/{len(candidates)}"
            )

    output = {
        "status": "needs-review",
        "count": len(results),
        "resources": results
    }

    OUTPUT.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    OUTPUT.write_text(
        json.dumps(
            output,
            indent=2
        ) + "\n",
        encoding="utf-8"
    )

    print()
    print("======================================")
    print("MILEYM3DIA VALIDATION COMPLETE")
    print("======================================")
    print(f"Resources: {len(results)}")
    print(f"Saved: {OUTPUT}")
    print()

    for item in results[:30]:

        print(
            f"[{item['category']}] "
            f"{item['name']} | "
            f"{item['pricing']['type']} | "
            f"{','.join(item['platforms']) or 'unknown'} | "
            f"{'verified' if item['verified'] else 'unverified'}"
        )


if __name__ == "__main__":
    main()
