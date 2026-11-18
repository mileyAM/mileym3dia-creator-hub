import json
import re
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"

RESOURCES = DATA / "resources.json"
CANDIDATES = DATA / "proposals" / "candidates.json"

db = json.loads(RESOURCES.read_text(encoding="utf-8"))
resource_list = db.get("resources", []) if isinstance(db, dict) else db
proposal = json.loads(CANDIDATES.read_text(encoding="utf-8"))

existing = {
    r.get("website", "").rstrip("/").lower()
    for r in resource_list
    if isinstance(r, dict) and r.get("website")
}

existing_ids = {
    r.get("id")
    for r in resource_list
    if isinstance(r, dict) and r.get("id")
}

added = 0
retained_candidates = []

for item in proposal.get("candidates", []):
    url = item.get("website", "").rstrip("/").lower()

    if not url or url in existing:
        continue

    # Clean display name from Show HN prefixes if present
    raw_name = item.get("name", "").strip()
    clean_name = re.sub(r"^Show HN:\s*", "", raw_name)
    # If there's an em-dash/dash separator, use the tool name
    parts = re.split(r"\s+[-–—,]\s+", clean_name)
    base_name = parts[0].strip() if parts else clean_name

    slug = re.sub(r"[^a-z0-9]+", "-", base_name.lower()).strip("-")
    resource_id = slug if slug and slug not in existing_ids else f"discovered-{abs(hash(url))}"

    resource = {
        "id": resource_id,
        "name": base_name,
        "slug": slug,
        "description": item.get(
            "description",
            f"{base_name} — creator resource."
        ),
        "category": item.get(
            "category",
            "creator-tools"
        ),
        "subcategory": item.get(
            "subcategory",
            "General"
        ),
        "tags": ["discovered"],
        "pricing": {
            "type": "unknown",
            "price": None,
            "currency": "USD"
        },
        "platforms": ["web"],
        "formats": [],
        "website": item["website"],
        "download": "",
        "openSource": "github.com" in url,
        "featured": False,
        "verified": False,
        "source": item.get("source", "discovery"),
        "lastVerified": datetime.now(timezone.utc).strftime("%Y-%m-%d")
    }

    resource_list.append(resource)
    existing.add(url)
    existing_ids.add(resource_id)
    added += 1

if isinstance(db, dict):
    db["resources"] = resource_list
    db["count"] = len(resource_list)
    db["updatedAt"] = datetime.now(timezone.utc).isoformat()
    output_data = db
else:
    output_data = resource_list

RESOURCES.write_text(
    json.dumps(output_data, indent=2) + "\n",
    encoding="utf-8"
)

# Clear promoted candidates from proposals/candidates.json
proposal["candidates"] = retained_candidates
proposal["count"] = len(retained_candidates)
proposal["status"] = "reviewed"
CANDIDATES.write_text(
    json.dumps(proposal, indent=2) + "\n",
    encoding="utf-8"
)

print(f"Promoted {added} resources.")
print(f"Total database count: {len(resource_list)}")
