import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"

resources_file = DATA / "resources.json"

with resources_file.open("r", encoding="utf-8") as f:
    existing_data = json.load(f)

existing = (
    existing_data.get("resources", [])
    if isinstance(existing_data, dict)
    else existing_data
)

known_ids = {
    r["id"]
    for r in existing
    if isinstance(r, dict) and "id" in r
}

proposal_files = list((DATA / "proposals").glob("*.json"))

if not proposal_files:
    print("No AI proposals found.")
    sys.exit(0)

errors = []

for file in proposal_files:
    # Skip job metadata files, raw candidate feeds, and legacy seed files
    if file.name in ("discovery-job.json", "candidates.json", "enriched-candidates.json"):
        continue

    try:
        with file.open("r", encoding="utf-8") as f:
            proposal = json.load(f)
    except Exception as exc:
        errors.append(f"{file}: invalid JSON: {exc}")
        continue

    # Extract resource entries if wrapped in an object
    if isinstance(proposal, dict):
        if "resources" in proposal:
            resource_list = proposal["resources"]
        elif "candidates" in proposal:
            resource_list = proposal["candidates"]
        else:
            resource_list = [proposal]
    elif isinstance(proposal, list):
        resource_list = proposal
    else:
        errors.append(f"{file}: unexpected root structure")
        continue

    for resource in resource_list:
        if not isinstance(resource, dict):
            errors.append(f"{file}: item is not an object: {resource}")
            continue

        for field in [
            "id",
            "name",
            "slug",
            "description",
            "category",
            "tags",
            "pricing",
            "platforms",
            "website",
            "verified",
            "lastVerified"
        ]:
            if field not in resource:
                errors.append(
                    f"{file.name}: {resource.get('name','UNKNOWN')} "
                    f"is missing {field}"
                )

        if resource.get("id") in known_ids:
            errors.append(
                f"{file.name}: duplicate ID {resource.get('id')}"
            )

        if not resource.get("website"):
            errors.append(
                f"{file.name}: {resource.get('name','UNKNOWN')} "
                "has no official website"
            )

if errors:
    print(f"Validation failed with {len(errors)} issues:")
    print("\n".join(errors[:20]))
    if len(errors) > 20:
        print(f"... and {len(errors) - 20} more errors.")
    sys.exit(1)

print("All AI proposals passed structural validation.")
