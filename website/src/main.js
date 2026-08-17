import "./style.css";

import {
  normalizeDatabase,
  searchResources as searchDatabase,
  filterResources as filterDatabase,
  sortResources as sortDatabase,
  getCategories as getDatabaseCategories,
  getSubcategories as getDatabaseSubcategories,
  getPlatforms as getDatabasePlatforms,
  getStats,
  createSearch
} from "./data.js";

import additions from "./resource-additions.js";

const DATA_URL = "./data/resources.json";

const state = {
  resources: [],
  view: "categories",
  category: "all",
  subcategory: "all",
  pricing: "all",
  platform: "all",
  search: "",
  openSource: false,
  sort: "featured",
  viewMode: "grid",
  perPage: "25"
};

// searchFn is a runtime search function (Fuse-backed when available)
let searchFn = searchDatabase;

const app = document.querySelector("#app");

const CATEGORY_META = {
  music: {
    icon: "🎵",
    title: "Music",
    description:
      "DAWs, recording, mixing, mastering, plugins, samples and music business."
  },

  video: {
    icon: "🎬",
    title: "Video",
    description:
      "Editing, streaming, podcasting, clips, effects and production."
  },

  design: {
    icon: "🎨",
    title: "Design",
    description:
      "Graphics, photo editing, illustration, UI/UX, branding and 3D."
  },

  ai: {
    icon: "🤖",
    title: "AI",
    description:
      "AI assistants, image, video, voice, music, coding and automation."
  },

  business: {
    icon: "💼",
    title: "Creator Business",
    description:
      "Marketing, monetization, websites, analytics, ecommerce and growth."
  },

  "creator-business": {
    icon: "💼",
    title: "Creator Business",
    description:
      "Marketing, monetization, websites, analytics, ecommerce and growth."
  }
};

const SUBCATEGORY_META = {
  "DAWs & Production": "🎹",
  "Music Production": "🎹",
  "Audio Editing & Recording": "🎙️",
  "Recording": "🎙️",
  "Mixing & Mastering": "🎚️",
  "Plugins": "🔌",
  "Samples": "🥁",
  "AI Music": "🤖",
  "Music Business": "💰",

  "Video Editing": "✂️",
  "AI Video": "🤖",
  "Streaming & Recording": "📡",
  "Screen Recording": "🖥️",
  "Motion Graphics": "✨",
  "Video Effects": "💥",
  "Stock Media": "🎞️",

  "Graphic Design": "🖌️",
  "Photo Editing": "📷",
  "Digital Art & Illustration": "🎨",
  "Vector Design": "🔷",
  "3D & Animation": "🧊",
  "UI/UX": "🧩",
  "Branding": "✦",

  "AI Assistants": "🧠",
  "Image AI": "🖼️",
  "Video AI": "🎬",
  "Voice & Audio AI": "🎙️",
  "Coding & Development": "💻",
  "Automation": "⚡",

  "Development & Collaboration": "💻",
  "Marketing": "📣",
  "SEO": "🔎",
  "Social Media": "📱",
  "Analytics": "📊",
  "Websites": "🌐",
  "Ecommerce": "🛒",
  "Monetization": "💵"
};

function normalize(value = "") {
  return String(value).toLowerCase().trim();
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCategory(category = "") {
  if (!category) return "";

  const acronyms = {
    ai: "AI",
    seo: "SEO",
    daw: "DAW",
    saas: "SaaS",
    api: "API",
    ux: "UX",
    ui: "UI",
    vr: "VR",
    ar: "AR"
  };

  const value = String(category).trim();

  return (
    acronyms[value.toLowerCase()] ||
    value
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, letter => letter.toUpperCase())
  );
}

function getCategoryMeta(category) {
  const normalized = normalize(category);

  return (
    CATEGORY_META[normalized] || {
      icon: "🧰",
      title: formatCategory(category) || "Resources",
      description:
        "Creator tools and resources."
    }
  );
}

function categoryIcon(category) {
  return getCategoryMeta(category).icon;
}

function getCategories() {
  return getDatabaseCategories(state.resources)
    .filter(Boolean)
    .sort((a, b) =>
      formatCategory(a).localeCompare(
        formatCategory(b)
      )
    );
}

function getSubcategories(category = state.category) {
  return getDatabaseSubcategories(
    state.resources,
    category
  ).filter(Boolean);
}

function getPlatforms() {
  return getDatabasePlatforms(state.resources);
}

function getPricingCounts(resources) {
  return resources.reduce(
    (counts, resource) => {
      const type = normalize(
        resource.pricing?.type
      );

      if (type === "free") counts.free++;
      if (type === "freemium") counts.freemium++;
      if (type === "paid") counts.paid++;

      return counts;
    },
    {
      free: 0,
      freemium: 0,
      paid: 0
    }
  );
}

function getCategoryCount(category) {
  return state.resources.filter(
    resource =>
      normalize(resource.category) ===
      normalize(category)
  ).length;
}

function getSubcategoryCount(
  category,
  subcategory
) {
  return state.resources.filter(resource => {
    const categoryMatch =
      normalize(resource.category) ===
      normalize(category);

    const subcategoryMatch =
      normalize(resource.subcategory) ===
      normalize(subcategory);

    return (
      categoryMatch &&
      subcategoryMatch
    );
  }).length;
}

function getCurrentResources() {
  let resources = [...state.resources];

  if (state.search) {
    resources = searchFn(
      resources,
      state.search
    );
  }

  resources = filterDatabase(
    resources,
    {
      category: state.category,
      subcategory: state.subcategory,
      pricing: state.pricing,
      platform: state.platform,
      openSource: state.openSource
    }
  );

  return sortDatabase(
    resources,
    state.sort
  );
}

function pricingIcon(type) {
  switch (normalize(type)) {
    case "free":
      return "🆓";

    case "freemium":
      return "◐";

    case "paid":
      return "💳";

    default:
      return "•";
  }
}

function resourceCard(resource) {
  const pricing =
    resource.pricing?.type ||
    "unknown";

  const platforms =
    Array.isArray(resource.platforms)
      ? resource.platforms
      : [];

  const tags =
    Array.isArray(resource.tags)
      ? resource.tags
      : [];

  const logo = resource.logo
    ? `<img class="logo" src="${escapeHTML(resource.logo)}" loading="lazy" alt="${escapeHTML(resource.name)} logo"/>`
    : "";

  const source = resource.source
    ? `<small class="source">Source: ${escapeHTML(resource.source)}</small>`
    : "";

  const lastVerified = resource.lastVerified
    ? `<small class="verified">Last verified: ${escapeHTML(resource.lastVerified)}</small>`
    : "";

  return `
    <article class="resource-card ${state.viewMode}">

      <div class="card-top">

        <span class="category-badge">
          ${categoryIcon(resource.category)}
          ${escapeHTML(
            getCategoryMeta(
              resource.category
            ).title
          )}
        </span>

        ${
          resource.openSource
            ? `
              <span class="open-badge">
                OPEN SOURCE
              </span>
            `
            : ""
        }

      </div>

      ${logo}

      <h3>
        ${escapeHTML(
          resource.name ||
          "Untitled Resource"
        )}
      </h3>

      <p class="description">
        ${escapeHTML(
          resource.description ||
          "Creator resource from the MILEYM3DIA directory."
        )}
      </p>

      <div class="metadata">

        <span>
          ${pricingIcon(pricing)}
          ${escapeHTML(
            formatCategory(pricing)
          )}
        </span>

        ${
          platforms.length
            ? `
              <span>
                💻
                ${platforms
                  .slice(0, 4)
                  .map(platform =>
                    escapeHTML(
                      formatCategory(
                        platform
                      )
                    )
                  )
                  .join(" · ")}
              </span>
            `
            : ""
        }

      </div>

      ${
        resource.subcategory
          ? `
            <div class="subcategory">
              ${escapeHTML(
                resource.subcategory
              )}
            </div>
          `
          : ""
      }

      ${
        tags.length
          ? `
            <div class="tags">
              ${tags
                .slice(0, 5)
                .map(
                  tag =>
                    `<span>#${escapeHTML(
                      tag
                    )}</span>`
                )
                .join("")}
            </div>
          `
          : ""
      }

      <div class="card-actions">

        ${
          resource.website
            ? `
              <a
                class="btn primary"
                href="${escapeHTML(
                  resource.website
                )}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Website ↗
              </a>
            `
            : ""
        }

        ${
          resource.download
            ? `
              <a
                class="btn secondary"
                href="${escapeHTML(
                  resource.download
                )}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download ↓
              </a>
            `
            : ""
        }

      </div>

      ${source}
      ${lastVerified}

    </article>
  `;
}

// Debounce helper to avoid re-rendering on every keystroke
function debounce(fn, wait = 220) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

function renderHeader() {
  return `
    <header class="site-header">

      <div class="brand">

        <div class="brand-mark">
          M3
        </div>

        <div>
          <div class="brand-name">
            MILEYM3DIA
          </div>

          <div class="brand-subtitle">
            CREATOR HUB
          </div>
        </div>

      </div>

      <nav>

        <a href="#resources">
          Resources
        </a>

        <a href="#categories">
          Categories
        </a>

        <a href="#stacks">
          Creator Stacks
        </a>

        <a
          href="https://github.com/mileyAM/mileym3dia-creator-hub"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>

      </nav>

    </header>
  `;
}

/* ... rest of main.js content unchanged ... */

function renderHero() {
  const categories = getCategories();
  const counts =
    getPricingCounts(
      state.resources
    );

  return `
    <section class="hero">

      <div class="hero-glow"></div>

      <div class="hero-content">

        <div class="eyebrow">
          THE CREATOR RESOURCE DIRECTORY
        </div>

        <h1>
          FIND THE TOOLS.
          <br>
          <span>MAKE THE CONTENT.</span>
        </h1>

        <p>
          A growing directory of tools for music,
          video, design, AI and building your creator business.
        </p>

        <div class="hero-search">

          <span>⌕</span>

          <input
            id="search"
            type="search"
            autocomplete="off"
            placeholder="Search creator tools..."
            value="${escapeHTML(
              state.search
            )}"
          />

        </div>

        <div class="hero-stats">

          <div>
            <strong>
              ${state.resources.length}
            </strong>
            <span>RESOURCES</span>
          </div>

          <div>
            <strong>
              ${categories.length}
            </strong>
            <span>CATEGORIES</span>
          </div>

          <div>
            <strong>
              ${counts.free}
            </strong>
            <span>FREE TOOLS</span>
          </div>

          <div>
            <strong>
              ${counts.freemium}
            </strong>
            <span>FREEMIUM</span>
          </div>

        </div>

      </div>

    </section>
  `;
}

/* keep other render functions unchanged; they will use searchFn where appropriate */

function renderSearchResults() {
  const resources =
    searchFn(
      state.resources,
      state.search
    );

  return `
    <section
      id="resources"
      class="resources-section"
    >

      <div class="library-header">

        <button
          class="back-button"
          id="clearSearch"
        >
          ← Browse Categories
        </button>

        <div class="library-title">

          <div class="library-icon">
            ⌕
          </div>

          <div>

            <div class="eyebrow">
              SEARCH RESULTS
            </div>

            <h2>
              ${escapeHTML(
                state.search
              )}
            </h2>

            <p>
              ${resources.length}
              results
            </p>

          </div>

        </div>

      </div>

      <div class="resource-grid">

        ${
          resources.length
            ? resources
                .map(resourceCard)
                .join("")
            : `
              <div class="empty">

                <div>⌕</div>

                <h3>
                  Nothing found
                </h3>

                <p>
                  Try another search.
                </p>

              </div>
            `
        }

      </div>

    </section>
  `;
}

/* rest of main.js continues unchanged; we only changed search usage and debounce */

function bindEvents() {
  const search =
    document.querySelector("#search");

  const pricing =
    document.querySelector("#pricing");

  const platform =
    document.querySelector("#platform");

  const sort =
    document.querySelector("#sort");

  const openSource =
    document.querySelector("#opensource");

  // Debounced handler for search input
  const onSearchInput = debounce(event => {
    state.search = event.target.value;
    render();
    focusSearch();
  }, 220);

  search?.addEventListener(
    "input",
    onSearchInput
  );

  pricing?.addEventListener(
    "change",
    event => {
      state.pricing =
        event.target.value;

      render();
    }
  );

  platform?.addEventListener(
    "change",
    event => {
      state.platform =
        event.target.value;

      render();
    }
  );

  sort?.addEventListener(
    "change",
    event => {
      state.sort =
        event.target.value;

      render();
    }
  );

  openSource?.addEventListener(
    "click",
    () => {
      state.openSource =
        !state.openSource;

      render();
    }
  );

  document
    .querySelectorAll(
      "[data-category]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          openCategory(
            button.dataset.category
          );
        }
      );
    });

  document
    .querySelectorAll(
      "[data-subcategory]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          openSubcategory(
            button.dataset.subcategory
          );
        }
      );
    });

  document
    .querySelectorAll(
      "[data-stack]"
    )
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          openStack(
            button.dataset.stack
          );
        }
      );
    });

  document
    .querySelector(
      "#backCategories"
    )
    ?.addEventListener(
      "click",
      () => {
        state.view = "categories";
        state.category = "all";
        state.subcategory = "all";
        clearFilters();

        render();
      }
    );

  document
    .querySelector(
      "#backSubcategories"
    )
    ?.addEventListener(
      "click",
      () => {
        state.view =
          "subcategories";
        state.subcategory = "all";

        clearFilters();

        render();
      }
    );

  document
    .querySelector(
      "#clearSearch"
    )
    ?.addEventListener(
      "click",
      () => {
        state.search = "";
        state.view = "categories";
        state.category = "all";
        state.subcategory = "all";

        render();
      }
    );

  document
    .querySelector(
      "#clearFilters"
    )
    ?.addEventListener(
      "click",
      () => {
        clearFilters();
        render();
      }
    );
}

async function loadResources() {
  try {
    const response =
      await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}`
      );
    }

    const data =
      await response.json();

    const rawResources =
      Array.isArray(data)
        ? data
        : data.resources || [];

    const baseResources =
      normalizeDatabase(
        rawResources
      );

    const normalizedAdditions =
      normalizeDatabase(
        additions
      );

    const existingIds =
      new Set(
        baseResources.map(
          resource => resource.id
        )
      );

    const uniqueAdditions =
      normalizedAdditions.filter(
        resource =>
          !existingIds.has(
            resource.id
          )
      );

    state.resources = [
      ...baseResources,
      ...uniqueAdditions
    ];

    // initialize the Fuse-based search function; fallback to substring search if it fails
    try {
      searchFn = createSearch(state.resources);
    } catch (err) {
      console.warn("Search index init failed, using fallback", err);
      searchFn = searchDatabase;
    }

    render();

  } catch (error) {
    console.error(
      "MILEYM3DIA Creator Hub:",
      error
    );

    app.innerHTML = `
      <main class="error-screen">

        <div class="error-mark">
          M3
        </div>

        <h1>
          MILEYM3DIA
        </h1>

        <p>
          Unable to load the creator resource database.
        </p>

        <small>
          ${escapeHTML(
            error.message ||
            "Unknown error"
          )}
        </small>

        <button
          onclick="location.reload()"
          class="btn primary"
        >
          Retry
        </button>

      </main>
    `;
  }
}

loadResources();
