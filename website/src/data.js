/**
 * MILEYM3DIA Creator Toolbox 2.0 — Data Layer
 * Clean, reactive, separate data management & normalization logic.
 */

export const CATEGORY_DEFINITIONS = {
  all: {
    id: "all",
    label: "All Tools",
    icon: "🧰",
    color: "#EF252C",
    description: "The complete directory of creator software, utilities, and assets."
  },
  music: {
    id: "music",
    label: "Music & Audio",
    icon: "🎵",
    color: "#258DFF",
    description: "DAWs, virtual instruments, plugins, mixing tools, sample libraries, and audio post-production."
  },
  video: {
    id: "video",
    label: "Video & Motion",
    icon: "🎬",
    color: "#EF252C",
    description: "Video editing, motion graphics, screen recording, live streaming, and short-form video generation."
  },
  design: {
    id: "design",
    label: "Design & Graphics",
    icon: "🎨",
    color: "#8B38DC",
    description: "Graphic design, vector illustration, photo editing, 3D assets, UI/UX tools, and stock media."
  },
  ai: {
    id: "ai",
    label: "AI & Generative",
    icon: "🤖",
    color: "#D4F329",
    description: "Generative AI assistants, voice cloners, automated video generation, model training, and prompts."
  },
  business: {
    id: "business",
    label: "Creator Business",
    icon: "💼",
    color: "#258DFF",
    description: "Monetization platforms, newsletter distribution, analytics, marketing automation, and social scheduling."
  },
  tools: {
    id: "tools",
    label: "Creator Utilities",
    icon: "⚡",
    color: "#8B38DC",
    description: "Productivity workspaces, link-in-bio hubs, asset organizers, and automated desktop utilities."
  }
};

const CATEGORY_ALIASES = {
  "music-production": "music",
  "music production": "music",
  "audio": "music",
  "music": "music",

  "video-creation-editing": "video",
  "video creation & editing": "video",
  "video-editing": "video",
  "video editing": "video",
  "video": "video",
  "streaming": "video",

  "graphic-design": "design",
  "graphic design": "design",
  "design": "design",

  "artificial-intelligence": "ai",
  "artificial intelligence": "ai",
  "ai": "ai",

  "creator-business": "business",
  "creator business": "business",
  "business": "business",

  "creator-tools": "tools",
  "creator tools": "tools",
  "tools": "tools"
};

const FAVORITES_KEY = "m3_creator_favorites_v2";
const VIEW_MODE_KEY = "m3_view_mode_v2";

export function normalize(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function normalizeCategory(category = "") {
  const key = normalize(category);
  return CATEGORY_ALIASES[key] || "tools";
}

export function normalizePricing(pricing) {
  if (!pricing) {
    return { type: "unknown", price: null, currency: "USD" };
  }
  if (typeof pricing === "string") {
    const clean = normalize(pricing);
    return {
      type: ["free", "freemium", "paid", "subscription"].includes(clean) ? clean : "unknown",
      price: null,
      currency: "USD"
    };
  }
  const type = normalize(pricing.type);
  return {
    type: ["free", "freemium", "paid", "subscription"].includes(type) ? type : "unknown",
    price: typeof pricing.price === "number" ? pricing.price : null,
    currency: pricing.currency || "USD"
  };
}

export function normalizePlatforms(platforms = []) {
  if (!Array.isArray(platforms)) return ["web"];
  const set = new Set();
  for (const item of platforms) {
    const p = normalize(item);
    if (p.includes("mac") || p === "osx") set.add("macos");
    else if (p.includes("win")) set.add("windows");
    else if (p.includes("lin") || p === "ubuntu") set.add("linux");
    else if (p.includes("ios") || p.includes("iphone") || p.includes("ipad")) set.add("ios");
    else if (p.includes("android")) set.add("android");
    else if (p.includes("web") || p.includes("browser") || p.includes("cloud")) set.add("web");
    else if (p) set.add(p);
  }
  return set.size ? Array.from(set) : ["web"];
}

export function normalizeResource(resource, index = 0) {
  const name = resource.name || `Resource ${index + 1}`;
  const category = normalizeCategory(resource.category);
  const subcategory = resource.subcategory || "General";
  const id =
    resource.id ||
    normalize(name)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    `res-${index}`;

  const slug =
    resource.slug ||
    normalize(name)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const tags = Array.isArray(resource.tags)
    ? resource.tags.filter(Boolean).map(t => String(t).trim())
    : [];

  return {
    ...resource,
    id,
    name,
    slug,
    description:
      resource.description ||
      `${name} is a creative workflow tool for ${subcategory.toLowerCase()}.`,
    category,
    subcategory,
    tags,
    pricing: normalizePricing(resource.pricing),
    platforms: normalizePlatforms(resource.platforms),
    formats: Array.isArray(resource.formats) ? resource.formats : [],
    website: resource.website || "",
    download: resource.download || "",
    logo: resource.logo || "",
    openSource: Boolean(resource.openSource),
    featured: Boolean(resource.featured),
    verified: Boolean(resource.verified),
    source: resource.source || "directory",
    lastVerified: resource.lastVerified || null
  };
}

export function normalizeDatabase(data) {
  const rawList = Array.isArray(data)
    ? data
    : Array.isArray(data?.resources)
      ? data.resources
      : [];

  const seenIds = new Set();
  const seenUrls = new Set();
  const result = [];

  for (let i = 0; i < rawList.length; i++) {
    const raw = rawList[i];
    if (!raw || !raw.name || raw.name === "Example Resource") continue;

    const res = normalizeResource(raw, i);
    const urlKey = res.website.replace(/\/+$/, "").toLowerCase();

    if (seenIds.has(res.id)) continue;
    if (urlKey && seenUrls.has(urlKey)) continue;

    seenIds.add(res.id);
    if (urlKey) seenUrls.add(urlKey);
    result.push(res);
  }

  return result;
}

/* --------------------------------------------------
   LOCALSTORAGE FAVORITES & PREFERENCES
-------------------------------------------------- */

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function isFavorite(id) {
  return getFavorites().includes(id);
}

export function toggleFavorite(id) {
  const current = getFavorites();
  const exists = current.includes(id);
  const next = exists ? current.filter(item => item !== id) : [...current, id];
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  } catch (e) {}
  return !exists;
}

export function getViewMode() {
  try {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    return saved === "compact" ? "compact" : "grid";
  } catch (e) {
    return "grid";
  }
}

export function setViewMode(mode) {
  try {
    localStorage.setItem(VIEW_MODE_KEY, mode === "compact" ? "compact" : "grid");
  } catch (e) {}
}

/* --------------------------------------------------
   FILTERING, SEARCH & SORTING
-------------------------------------------------- */

export function getCategories(resources) {
  const found = new Set(resources.map(r => r.category));
  return Object.keys(CATEGORY_DEFINITIONS).filter(c => c === "all" || found.has(c));
}

export function getSubcategories(resources, category = "all") {
  const filtered =
    category === "all"
      ? resources
      : resources.filter(r => r.category === category);

  const subcats = new Set(filtered.map(r => r.subcategory).filter(Boolean));
  return Array.from(subcats).sort((a, b) => a.localeCompare(b));
}

export function searchResources(resources, query = "") {
  const q = normalize(query);
  if (!q) return resources;

  const terms = q.split(/\s+/).filter(Boolean);

  return resources.filter(item => {
    const textBlob = [
      item.name,
      item.description,
      item.category,
      item.subcategory,
      item.pricing?.type,
      ...(item.tags || []),
      ...(item.platforms || [])
    ]
      .join(" ")
      .toLowerCase();

    return terms.every(term => textBlob.includes(term));
  });
}

export function filterResources(resources, filters = {}) {
  const {
    category = "all",
    subcategory = "all",
    pricing = "all",
    platform = "all",
    openSourceOnly = false,
    favoritesOnly = false,
    verifiedOnly = false
  } = filters;

  const favSet = favoritesOnly ? new Set(getFavorites()) : null;

  return resources.filter(res => {
    // Favorites
    if (favoritesOnly && !favSet.has(res.id)) {
      return false;
    }

    // Category
    if (category !== "all" && res.category !== category) {
      return false;
    }

    // Subcategory
    if (subcategory !== "all" && res.subcategory !== subcategory) {
      return false;
    }

    // Pricing
    if (pricing !== "all") {
      if (pricing === "free") {
        if (res.pricing?.type !== "free") return false;
      } else if (pricing === "freemium") {
        if (res.pricing?.type !== "freemium") return false;
      } else if (pricing === "paid") {
        if (!["paid", "subscription"].includes(res.pricing?.type)) return false;
      } else if (pricing === "open-source") {
        if (!res.openSource) return false;
      }
    }

    // Platform
    if (platform !== "all") {
      if (!res.platforms.includes(platform)) {
        return false;
      }
    }

    // Flags
    if (openSourceOnly && !res.openSource) {
      return false;
    }
    if (verifiedOnly && !res.verified) {
      return false;
    }

    return true;
  });
}

export function sortResources(resources, sortKey = "featured") {
  const list = [...resources];

  switch (sortKey) {
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return list.sort((a, b) => b.name.localeCompare(a.name));
    case "newest":
      return list.sort((a, b) => {
        const dateA = a.lastVerified || "2000-01-01";
        const dateB = b.lastVerified || "2000-01-01";
        return dateB.localeCompare(dateA);
      });
    case "free":
      return list.sort((a, b) => {
        const rank = t => (t.openSource ? 0 : t.pricing?.type === "free" ? 1 : t.pricing?.type === "freemium" ? 2 : 3);
        return rank(a) - rank(b);
      });
    case "featured":
    default:
      return list.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
      });
  }
}

export function getStats(resources) {
  const favorites = getFavorites();
  return {
    total: resources.length,
    free: resources.filter(r => r.pricing?.type === "free").length,
    freemium: resources.filter(r => r.pricing?.type === "freemium").length,
    paid: resources.filter(r => ["paid", "subscription"].includes(r.pricing?.type)).length,
    openSource: resources.filter(r => r.openSource).length,
    verified: resources.filter(r => r.verified).length,
    favorites: favorites.length
  };
}
