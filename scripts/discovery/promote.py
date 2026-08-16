import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"

RESOURCES = DATA / "resources.json"
CANDIDATES = DATA / "proposals" / "candidates.json"

resources = json.loads(RESOURCES.read_text())
proposal = json.loads(CANDIDATES.read_text())

existing = {
    r.get("website", "").rstrip("/").lower()
    for r in resources
}

added = 0

for item in proposal.get("candidates", []):

    url = item.get("website", "").rstrip("/").lower()

    if not url or url in existing:
        continue

    slug = (
        item["name"]
        .lower()
        .replace(" ", "-")
    )

    resource = {
        "id": "discovered-" + str(abs(hash(url))),
        "name": item["name"],
        "slug": slug,
        "description": item.get(
            "description",
            "Resource discovered by MILEYM3DIA Creator Hub."
        ),
        "category": item.get(
            "category",
            "creator-tools"
        ),
        "subcategory": "",
        "tags": ["discovered"],
        "pricing": {
            "type": "unknown",
            "price": 0,
            "currency": "USD"
        },
        "platforms": ["web"],
        "formats": [],
        "website": item["website"],
        "download": "",
        "logo": "",
        "featured": False,
        "verified": False,
        "source": item.get("source", "discovery"),
        "lastVerified": None
    }

    resources.append(resource)
    existing.add(url)
    added += 1

RESOURCES.write_text(
    json.dumps(resources, indent=2) + "\n"
)

print(f"Promoted {added} resources.")
print("These entries still require verification before publication.")
