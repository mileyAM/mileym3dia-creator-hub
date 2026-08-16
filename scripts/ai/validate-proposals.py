import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"

resources_file = DATA / "resources.json"

with resources_file.open("r", encoding="utf-8") as f:
    existing = json.load(f)

known_ids = {r["id"] for r in existing}

proposal_files = list((DATA / "proposals").glob("*.json"))

if not proposal_files:
    print("No AI proposals found.")
    sys.exit(0)

errors = []

for file in proposal_files:
    if file.name == "discovery-job.json":
        continue

    try:
        with file.open("r", encoding="utf-8") as f:
            proposal = json.load(f)
    except Exception as exc:
        errors.append(f"{file}: invalid JSON: {exc}")
        continue

    if not isinstance(proposal, list):
        proposal = [proposal]

    for resource in proposal:
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
                    f"{file}: {resource.get('name','UNKNOWN')} "
                    f"is missing {field}"
                )

        if resource.get("id") in known_ids:
            errors.append(
                f"{file}: duplicate ID {resource.get('id')}"
            )

        if not resource.get("website"):
            errors.append(
                f"{file}: {resource.get('name','UNKNOWN')} "
                "has no official website"
            )

if errors:
    print("\n".join(errors))
    sys.exit(1)

print("All AI proposals passed structural validation.")
