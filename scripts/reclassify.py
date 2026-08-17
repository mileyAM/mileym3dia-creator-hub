#!/usr/bin/env python3
"""
Simple reclassification script for mileym3dia-creator-hub dataset.

Reads: data/tools.json
Writes: data/tools_reclassified.json

Usage: python3 scripts/reclassify.py
"""
import json
import re
from collections import Counter, defaultdict

# Keywords mapping to pillars and subcategories
PILLAR_DEFS = {
    "Music": {
        "keywords": ["music", "midi", "daw", "audio", "mix", "master", "plugin", "sample", "sfx", "sound", "distribution"],
        "subcats": {
            "DAWs": ["daw", "ableton", "logic", "protools", "fl studio"],
            "Recording": ["record", "recording", "multitrack", "remote recording"],
            "Mixing / Mastering": ["mix", "master", "mixing", "mastering"],
            "Samples": ["sample", "sfx", "loop"],
            "Plugins": ["plugin", "vst", "au"],
            "Music AI": ["music generation", "music ai", "suno", "audio generation"],
            "Distribution": ["distribution", "distro", "distribute"],
            "Collaboration": ["collab", "collaboration"]
        }
    },
    "Video": {
        "keywords": ["video", "editor", "stream", "streaming", "screen", "caption", "subtitle", "clip", "motion", "ffmpeg", "transcode"],
        "subcats": {
            "Editors": ["editor", "davinci", "final cut", "premiere", "shotcut", "kdenlive", "openshot"],
            "Screen recording": ["screen", "screen capture", "sharex", "loom", "cap"],
            "Streaming": ["obs", "stream", "streamlabs", "streamelements", "vdo.ninja", "owncast"],
            "Podcasting": ["podcast", "riverside", "zencastr"],
            "Captions": ["subtitle", "whisper", "caption", "srt", "vtt"],
            "Short-form clipping": ["clip", "short", "reels", "tiktok", "opus"],
            "Stock video": ["stock", "footage"],
            "Motion graphics": ["motion", "after effects", "remotion", "lottie"]
        }
    },
    "Design": {
        "keywords": ["design", "photo", "image", "graphic", "illustration", "3d", "figma", "canva", "font", "unsplash", "stock"],
        "subcats": {
            "Graphic design": ["canva", "photoshop", "illustrator"],
            "Photo editing": ["gimp", "photopea", "pixlr"],
            "Illustration": ["illustration", "procreate"],
            "3D": ["3d", "blender"],
            "UI/UX": ["figma", "ux", "ui"],
            "Fonts": ["font", "typograph"],
            "Stock imagery": ["unsplash", "pexels", "shutterstock"]
        }
    },
    "AI": {
        "keywords": ["ai", "artificial", "gpt", "whisper", "synthesia", "midjourney", "runway", "elevenlabs", "voice", "generation", "automation"],
        "subcats": {
            "AI assistants": ["assistant", "copilot", "chat"],
            "Image generation": ["image generation", "midjourney", "stable diffusion", "ideogram"],
            "Video generation": ["video generation", "runway", "synthesia", "kling"],
            "Voice": ["voice", "tts", "elevenlabs", "murf", "whisper"],
            "Music": ["music generation", "suno"],
            "Writing": ["writing", "copy", "descript"],
            "Research": ["research", "answersocrates", "explodingtopics"],
            "Automation": ["automation", "zapier", "ifttt", "streamer.bot"]
        }
    },
    "Creator Business": {
        "keywords": ["seo", "analytics", "email", "newsletter", "monetiz", "membership", "patreon", "buy me a coffee", "gumroad", "course", "payments", "shop", "ecommerce", "project", "management", "schedule", "scheduling"],
        "subcats": {
            "Websites": ["ghost", "website", "site"],
            "SEO": ["seo", "keyword", "semrush", "surfer"],
            "Analytics": ["analytics", "socialblade", "matomo", "umami"],
            "Email": ["email", "mailchimp", "convertkit", "beehiiv"],
            "Social scheduling": ["schedule", "buffer", "later", "loomly"],
            "Monetization": ["patreon", "buymeacoffee", "ko-fi", "whop"],
            "Digital products": ["gumroad", "payhip", "lemonsqueezy", "courses"],
            "Payments": ["stripe", "payments", "lemonsqueezy"],
            "Automation": ["zapier", "ifttt"],
            "Project management": ["notion", "trello", "clickup", "airtable"]
        }
    }
}

# Fallback pillar
FALLBACK = "Creator Business"


def norm_text(s):
    if not s:
        return ""
    return re.sub(r"[^0-9a-z ]+", " ", s.lower())


def match_pillar(item):
    text = " ".join([
        item.get("name", ""),
        item.get("short_description", ""),
        item.get("category", ""),
        " ".join(item.get("tags", [])) if item.get("tags") else ""
    ])
    text_n = norm_text(text)

    scores = Counter()
    subcats = set()
    for pillar, defn in PILLAR_DEFS.items():
        for kw in defn["keywords"]:
            if kw in text_n:
                scores[pillar] += 1
        # subcategory matching
        for subcat, s_keywords in defn.get("subcats", {}).items():
            for sk in s_keywords:
                if sk in text_n:
                    subcats.add(subcat)
    if not scores:
        return FALLBACK, sorted(list(subcats))
    best = scores.most_common(1)[0][0]
    return best, sorted(list(subcats))


def reclassify():
    with open('data/tools.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    out = []
    ambiguous = []
    counts = Counter()

    for item in data:
        pillar, subcats = match_pillar(item)
        item_out = dict(item)
        item_out['pillar'] = pillar
        item_out['subcategories'] = subcats
        item_out.setdefault('categories_original', [])
        item_out['categories_original'].append(item.get('category'))

        # ambiguous detection: if text matched multiple pillar keywords
        # crude heuristic: check all pillars for any match
        matches = []
        text_n = norm_text(" ".join([item.get('name',''), item.get('short_description',''), item.get('category',''), ' '.join(item.get('tags',[]))]))
        for p, defn in PILLAR_DEFS.items():
            for kw in defn['keywords']:
                if kw in text_n:
                    matches.append(p)
                    break
        if len(set(matches)) > 1:
            item_out['ambiguous'] = sorted(list(set(matches)))
            ambiguous.append(item_out['name'])

        counts[pillar] += 1
        out.append(item_out)

    with open('data/tools_reclassified.json', 'w', encoding='utf-8') as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

    print(f"Reclassified {len(out)} items")
    print("Counts by pillar:")
    for k, v in counts.most_common():
        print(f"  {k}: {v}")
    if ambiguous:
        print(f"Ambiguous items ({len(ambiguous)}):")
        for name in ambiguous[:50]:
            print(" - ", name)


if __name__ == '__main__':
    reclassify()
