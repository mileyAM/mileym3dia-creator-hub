"""
MILEYM3DIA Creator Hub — AI Discovery Engine

This script is intentionally provider-neutral.
It prepares a discovery job and validates AI-generated
resource records before they can be proposed to GitHub.

The actual AI provider will be connected through GitHub
Actions Secrets in the next phase.
"""

import json
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data"
PROPOSALS = DATA / "proposals"

RESOURCE_FILE = DATA / "resources.json"

REQUIRED_FIELDS = [
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
]


def load_resources():
    with RESOURCE_FILE.open("r", encoding="utf-8") as f:
        return json.load(f)


def existing_ids(resources):
    if isinstance(resources, dict):
        resources = resources.get("resources", [])

    return {
        resource["id"]
        for resource in resources
        if isinstance(resource, dict) and "id" in resource
    }


def validate_resource(resource, known_ids):
    errors = []

    for field in REQUIRED_FIELDS:
        if field not in resource:
            errors.append(f"Missing required field: {field}")

    if resource.get("id") in known_ids:
        errors.append(f"Duplicate resource ID: {resource.get('id')}")

    if not isinstance(resource.get("tags", []), list):
        errors.append("tags must be an array")

    if not isinstance(resource.get("platforms", []), list):
        errors.append("platforms must be an array")

    pricing = resource.get("pricing", {})
    if not isinstance(pricing, dict):
        errors.append("pricing must be an object")

    if not resource.get("website"):
        errors.append("Official website is required")

    return errors


def create_job():
    resources = load_resources()

    job = {
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "existingResourceCount": len(resources),
        "existingResourceIds": sorted(existing_ids(resources)),
        "instructions": {
            "goal": "Discover useful creator resources for MILEYM3DIA Creator Hub.",
            "priority": [
                "music production",
                "plugins",
                "samples",
                "AI creator tools",
                "video creation",
                "graphic design",
                "creator business"
            ],
            "rules": [
                "Prefer official websites.",
                "Do not invent URLs.",
                "Do not duplicate existing resources.",
                "Clearly distinguish free, freemium and paid resources.",
                "Do not claim verification unless the source supports it.",
                "Return structured JSON matching the resource schema."
            ]
        }
    }

    PROPOSALS.mkdir(parents=True, exist_ok=True)

    output = PROPOSALS / "discovery-job.json"

    with output.open("w", encoding="utf-8") as f:
        json.dump(job, f, indent=2)

    print(f"Discovery job created: {output}")
    print(f"Existing resources: {len(resources)}")


if __name__ == "__main__":
    create_job()
