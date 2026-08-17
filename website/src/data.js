import Fuse from "fuse.js";

const CATEGORY_ALIASES = {
  "music-production": "music",
  "music production": "music",
  "music": "music",

  "video-creation-editing": "video",
  "video creation & editing": "video",
  "video-editing": "video",
  "video editing": "video",
  "video": "video",

  "graphic-design": "design",
  "graphic design": "design",
  "design": "design",

  "artificial-intelligence": "ai",
  "artificial intelligence": "ai",
  "ai": "ai",

  "creator-business": "business",
  "creator business": "business",
  "business": "business"
};

const PRICING_ALIASES = {
  unknown: "unknown",
  free: "free",
  freemium: "freemium",
  paid: "paid"
};

function normalize(value = "") {
  return String(value)
    .trim()
    .toLowerCase();
}

export function normalizeCategory(category) {
  const value = normalize(category);

  return (
    CATEGORY_ALIASES[value] ||
    value.replace(/[_\s]+/g, "-")
  );
}

export function normalizePricing(pricing) {
  if (!pricing) {
    return {
      type: "unknown",
      price: null,
      currency: "USD"
    };
  }

  if (typeof pricing === "string") {
    return {
      type:
        PRICING_ALIASES[
          normalize(pricing)
        ] || "unknown",
      price: null,
      currency: "USD"
    };
  }

  const type =
    PRICING_ALIASES[
      normalize(pricing.type)
    ] || "unknown";

  return {
    type,
    price:
      typeof pricing.price === "number"
        ? pricing.price
        : null,
    currency:
      pricing.currency || "USD"
  };
}

export function normalizeResource(resource, index = 0) {
  const name =
    resource.name ||
    `Resource ${index + 1}`;

  const category =
    normalizeCategory(
      resource.category
    );

  const subcategory =
    resource.subcategory ||
    "General";

  const tags = Array.isArray(
    resource.tags
  )
    ? resource.tags
        .filter(Boolean)
        .map(tag =>
          String(tag).trim()
        )
    : [];

  const platforms = Array.isArray(
    resource.platforms
  )
    ? resource.platforms
        .filter(Boolean)
        .map(platform =>
          String(platform).trim()
        )
    : [];

  return {
    ...resource,

    id:
      resource.id ||
      normalize(name)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") ||
      `resource-${index}`,

    name,

    slug:
      resource.slug ||
      normalize(name)
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),

    description:
      resource.description ||
      `${name} is a creator resource in ${subcategory}.`,

    category,

    subcategory,

    tags,

    pricing:
      normalizePricing(
        resource.pricing
      ),

    platforms,

    formats:
      Array.isArray(resource.formats)
        ? resource.formats
        : [],

    website:
      resource.website || "",

    download:
      resource.download || "",

    logo:
      resource.logo || "",

    openSource:
      resource.openSource === true,

    featured:
      resource.featured === true,

    verified:
      resource.verified === true,

    source:
      resource.source || "directory",

    lastVerified:
      resource.lastVerified || null
  };
}

export function normalizeDatabase(data) {
  const resources = Array.isArray(data)
    ? data
    : Array.isArray(data?.resources)
      ? data.resources
      : [];

  return resources
    .map(normalizeResource)
    .filter(resource =>
      resource.name &&
      resource.name !==
        "Example Resource"
    );
}

export function getCategories(resources) {
  return [
    ...new Set(
      resources
        .map(resource =>
          normalizeCategory(
            resource.category
          )
        )
        .filter(Boolean)
    )
  ].sort();
}

export function getSubcategories(
  resources,
  category = "all"
) {
  return [
    ...new Set(
      resources
        .filter(resource =>
          category === "all" ||
          normalizeCategory(
            resource.category
          ) === normalizeCategory(
            category
          )
        )
        .map(resource =>
          resource.subcategory
        )
        .filter(Boolean)
    )
  ].sort();
}

export function getPlatforms(resources) {
  return [
    ...new Set(
      resources.flatMap(resource =>
        Array.isArray(resource.platforms)
          ? resource.platforms
          : []
      )
    )
  ].sort();
}

export function getPricingTypes(resources) {
  return [
    ...new Set(
      resources
        .map(resource =>
          resource.pricing?.type
        )
        .filter(Boolean)
    )
  ].sort();
}

export function searchResources(
  resources,
  search = ""
) {
  const query =
    normalize(search);

  if (!query) {
    return resources;
  }

  return resources.filter(
    resource => {
      const searchable = [
        resource.name,
        resource.description,
        resource.category,
        resource.subcategory,
        resource.pricing?.type,
        ...(resource.tags || []),
        ...(resource.platforms || [])
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(
        query
      );
    }
  );
}

/**
 * createSearch(resources)
 * Returns a search function that mirrors the
 * searchResources signature: (resources, query) => results
 * Uses Fuse.js for fuzzy matching and weighted fields.
 * Falls back to searchResources if Fuse is not available.
 */
export function createSearch(resources = []) {
  try {
    const options = {
      keys: [
        { name: "name", weight: 0.45 },
        { name: "slug", weight: 0.15 },
        { name: "tags", weight: 0.15 },
        { name: "description", weight: 0.15 },
        { name: "category", weight: 0.06 },
        { name: "subcategory", weight: 0.04 }
      ],
      threshold: 0.35,
      includeMatches: true,
      ignoreLocation: true,
      minMatchCharLength: 2
    };

    const fuse = new Fuse(resources, options);

    return function fusedSearch(_resources, query) {
      if (!query || !String(query).trim()) return _resources;
      const results = fuse.search(String(query));
      return results.map(r => ({ ...r.item, _matches: r.matches }));
    };
  } catch (error) {
    console.warn("createSearch: Fuse not available, falling back to basic search", error);
    return searchResources;
  }
}

export function filterResources(
  resources,
  filters = {}
) {
  const {
    category = "all",
    subcategory = "all",
    pricing = "all",
    platform = "all",
    openSource = false,
    featured = false
  } = filters;

  return resources.filter(
    resource => {
      const categoryMatch =
        category === "all" ||
        normalizeCategory(
          resource.category
        ) === normalizeCategory(
          category
        );

      const subcategoryMatch =
        subcategory === "all" ||
        normalize(
          resource.subcategory
        ) === normalize(
          subcategory
        );

      const pricingMatch =
        pricing === "all" ||
        normalize(
          resource.pricing?.type
        ) === normalize(pricing);

      const platformMatch =
        platform === "all" ||
        (resource.platforms || [])
          .map(normalize)
          .includes(
            normalize(platform)
          );

      const openSourceMatch =
        !openSource ||
        resource.openSource === true;

      const featuredMatch =
        !featured ||
        resource.featured === true;

      return (
        categoryMatch &&
        subcategoryMatch &&
        pricingMatch &&
        platformMatch &&
        openSourceMatch &&
        featuredMatch
      );
    }
  );
}

export function sortResources(
  resources,
  sort = "featured"
) {
  const result = [
    ...resources
  ];

  switch (sort) {
    case "name":
      return result.sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      );

    case "free":
      return result.sort(
        (a, b) => {
          const aFree =
            a.pricing?.type === "free"
              ? 0
              : 1;

          const bFree =
            b.pricing?.type === "free"
              ? 0
              : 1;

          return aFree - bFree;
        }
      );

    case "category":
      return result.sort(
        (a, b) =>
          `${a.category}${a.name}`
            .localeCompare(
              `${b.category}${b.name}`
            )
      );

    case "featured":
    default:
      return result.sort(
        (a, b) => {
          if (
            a.featured &&
            !b.featured
          ) {
            return -1;
          }

          if (
            !a.featured &&
            b.featured
          ) {
            return 1;
          }

          return a.name.localeCompare(
            b.name
          );
        }
      );
  }
}

export function getStats(resources) {
  return {
    total: resources.length,

    categories:
      getCategories(resources)
        .length,

    free:
      resources.filter(
        resource =>
          resource.pricing?.type ===
          "free"
      ).length,

    freemium:
      resources.filter(
        resource =>
          resource.pricing?.type ===
          "freemium"
      ).length,

    paid:
      resources.filter(
        resource =>
          resource.pricing?.type ===
          "paid"
      ).length,

    openSource:
      resources.filter(
        resource =>
          resource.openSource === true
      ).length,

    featured:
      resources.filter(
        resource =>
          resource.featured === true
      ).length
  };
}
