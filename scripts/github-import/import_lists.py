import json
import re
import urllib.request
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
OUTPUT = DATA / "proposals" / "github-candidates.json"

UA = "MILEYM3DIA-Creator-Hub/1.0"

# These are intentionally creator-focused.
SOURCE_REPOS = [
    "awesome-selfhosted/awesome-selfhosted",
    "sindresorhus/awesome",
]

CATEGORY_RULES = {
    "music": [
        "music", "audio", "daw", "vst", "au plugin",
        "plugin", "plugins", "synth", "sampler",
        "sample", "samples", "loops", "drum",
        "recording", "mixing", "mastering",
        "beat", "beats", "vocal", "podcast"
    ],

    "video": [
        "video editor", "video editing", "video",
        "animation", "motion graphics", "subtitle",
        "captions", "screen recorder", "streaming"
    ],

    "design": [
        "graphic design", "design tool", "illustration",
        "photo editor", "image editor", "photography",
        "logo", "thumbnail", "fonts", "font",
        "mockup", "templates"
    ],

    "ai": [
        "ai tool", "ai tools", "generative ai",
        "ai image", "ai video", "ai music",
        "ai audio", "ai voice", "text to image",
        "text to video", "text to music"
    ],

    "creator-business": [
        "creator", "content creator", "social media",
        "newsletter", "marketing", "monetization",
        "affiliate", "royalty", "licensing",
        "music distribution", "creator platform"
    ]
}

# Hard exclusions for infrastructure/developer noise.
EXCLUDED_TERMS = [
    "c++ library",
    "c library",
    "python library",
    "javascript library",
    "typescript library",
    "compiler",
    "database",
    "networking library",
    "http library",
    "web framework",
    "testing framework",
    "sdk",
    "api client",
    "operating system",
    "kernel",
    "container",
    "kubernetes",
    "docker",
    "cryptography",
    "encryption library"
]


def fetch(url):
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": UA,
            "Accept": "text/plain"
        }
    )

    with urllib.request.urlopen(req, timeout=30) as r:
        return r.read().decode("utf-8", errors="ignore")


def get_readme(repo):
    return fetch(
        f"https://raw.githubusercontent.com/{repo}/HEAD/README.md"
    )


def normalize_url(url):
    url = url.strip()

    if url.startswith("<") and url.endswith(">"):
        url = url[1:-1]

    return url.rstrip(".,;)")


def extract_sections(markdown):
    """
    Split README into heading-based sections.

    Returns:
        [(heading, section_text), ...]
    """

    lines = markdown.splitlines()
    sections = []

    current_heading = "General"
    current_lines = []

    for line in lines:
        heading = re.match(r"^\s{0,3}#{1,6}\s+(.+?)\s*$", line)

        if heading:
            if current_lines:
                sections.append(
                    (
                        current_heading,
                        "\n".join(current_lines)
                    )
                )

            current_heading = heading.group(1).strip()
            current_lines = []
        else:
            current_lines.append(line)

    if current_lines:
        sections.append(
            (
                current_heading,
                "\n".join(current_lines)
            )
        )

    return sections


def extract_links(text):
    """
    Extract markdown links while preserving the text immediately
    surrounding each link.
    """

    pattern = re.compile(
        r"\[([^\]]+)\]\((https?://[^)\s]+)\)"
    )

    return pattern.findall(text)


def categorize(text):
    lower = text.lower()

    scores = {}

    for category, words in CATEGORY_RULES.items():
        score = 0

        for word in words:
            if word in lower:
                score += 1

        if score:
            scores[category] = score

    if not scores:
        return None, 0

    category = max(scores, key=scores.get)

    return category, scores[category]


def is_excluded(text):
    lower = text.lower()

    return any(
        term in lower
        for term in EXCLUDED_TERMS
    )


def candidate_from_link(
    link_text,
    url,
    heading,
    section,
    repo
):
    context = (
        f"{heading}\n"
        f"{link_text}\n"
        f"{section[:1500]}"
    )

    if is_excluded(context):
        return None

    category, score = categorize(context)

    # Require TWO strong creator signals,
    # OR a very specific heading.
    heading_category, heading_score = categorize(heading)

    if heading_score >= 1:
        score += 2

        if not category:
            category = heading_category

    if score < 2 or not category:
        return None

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        return None

    # Skip obvious social/profile links.
    host = parsed.netloc.lower()

    blocked_hosts = {
        "twitter.com",
        "x.com",
        "facebook.com",
        "instagram.com",
        "linkedin.com",
        "youtube.com"
    }

    if host in blocked_hosts:
        return None

    name = link_text.strip()

    if not name or len(name) > 160:
        name = host

    description = (
        f"{name} — discovered in the "
        f"{heading} section of {repo}."
    )

    return {
        "id": "",
        "name": name,
        "description": description,
        "category": category,
        "subcategory": heading[:100],
        "tags": [],
        "pricing": {
            "type": "unknown",
            "price": None,
            "currency": None
        },
        "platforms": [],
        "formats": [],
        "website": normalize_url(url),
        "download": "",
        "openSource": "github.com" in host,
        "verified": False,
        "featured": False,
        "source": f"GitHub:{repo}",
        "lastVerified": None,
        "discoveryScore": score
    }


def main():
    candidates = []
    seen = set()

    for repo in SOURCE_REPOS:
        print(f"\nScanning {repo}...")

        try:
            readme = get_readme(repo)
        except Exception as e:
            print(f"  ERROR: {e}")
            continue

        sections = extract_sections(readme)

        repo_count = 0

        for heading, section in sections:

            for link_text, url in extract_links(section):

                url = normalize_url(url)

                key = url.lower()

                if key in seen:
                    continue

                candidate = candidate_from_link(
                    link_text,
                    url,
                    heading,
                    section,
                    repo
                )

                if not candidate:
                    continue

                seen.add(key)
                candidates.append(candidate)
                repo_count += 1

        print(
            f"  Creator candidates found: {repo_count}"
        )

    candidates.sort(
        key=lambda x: x["discoveryScore"],
        reverse=True
    )

    # Controlled test batch.
    candidates = candidates[:25]

    # Give each candidate a stable ID.
    for index, item in enumerate(candidates, 1):
        item["id"] = (
            "github-discovery-"
            + str(index)
        )

    result = {
        "status": "test-only",
        "count": len(candidates),
        "candidates": candidates
    }

    OUTPUT.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    OUTPUT.write_text(
        json.dumps(
            result,
            indent=2
        ) + "\n",
        encoding="utf-8"
    )

    print("\n======================================")
    print("MILEYM3DIA CREATOR IMPORT TEST")
    print("======================================")
    print(f"Candidates: {len(candidates)}")
    print(f"Saved: {OUTPUT}")
    print()

    for number, item in enumerate(candidates, 1):
        print(
            f"{number}. "
            f"[{item['category']}] "
            f"{item['name']} "
            f"(score {item['discoveryScore']})"
        )
        print(
            f"   {item['website']}"
        )


if __name__ == "__main__":
    main()
