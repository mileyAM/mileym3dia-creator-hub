import "./style.css";

import {
  normalizeDatabase,
  searchResources as searchDatabase,
  filterResources as filterDatabase,
  sortResources as sortDatabase,
  getCategories as getDatabaseCategories,
  getSubcategories as getDatabaseSubcategories,
  getPlatforms as getDatabasePlatforms,
  getStats
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
  sort: "featured"
};

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
    resources = searchDatabase(
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

  return `
    <article class="resource-card">

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

    </article>
  `;
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

function renderCategoryFolders() {
  const categories = getCategories();

  return `
    <section
      id="categories"
      class="category-section"
    >

      <div class="section-heading">

        <span>01</span>

        <div>
          <h2>
            CREATOR LIBRARY
          </h2>

          <p>
            Choose a category to open its tool library.
          </p>
        </div>

      </div>

      <div class="category-grid">

        ${categories
          .map(category => {
            const meta =
              getCategoryMeta(category);

            const count =
              getCategoryCount(category);

            return `
              <button
                class="category-tile"
                data-category="${escapeHTML(
                  category
                )}"
              >

                <b>
                  ${meta.icon}
                </b>

                <strong>
                  ${escapeHTML(
                    meta.title
                  )}
                </strong>

                <span>
                  ${count} resources →
                </span>

              </button>
            `;
          })
          .join("")}

      </div>

    </section>
  `;
}

function renderSubcategoryFolders() {
  const meta =
    getCategoryMeta(
      state.category
    );

  const subcategories =
    getSubcategories();

  return `
    <section
      id="categories"
      class="category-section library-view"
    >

      <div class="library-header">

        <button
          class="back-button"
          id="backCategories"
        >
          ← All Categories
        </button>

        <div class="library-title">

          <div class="library-icon">
            ${meta.icon}
          </div>

          <div>
            <div class="eyebrow">
              CATEGORY
            </div>

            <h2>
              ${escapeHTML(meta.title)}
            </h2>

            <p>
              ${escapeHTML(
                meta.description
              )}
            </p>
          </div>

        </div>

      </div>

      <div class="subcategory-grid">

        ${subcategories
          .map(subcategory => {
            const count =
              getSubcategoryCount(
                state.category,
                subcategory
              );

            const icon =
              SUBCATEGORY_META[
                subcategory
              ] || "🧰";

            return `
              <button
                class="subcategory-folder"
                data-subcategory="${escapeHTML(
                  subcategory
                )}"
              >

                <span class="folder-icon">
                  ${icon}
                </span>

                <span class="folder-content">

                  <strong>
                    ${escapeHTML(
                      subcategory
                    )}
                  </strong>

                  <small>
                    ${count}
                    ${
                      count === 1
                        ? "tool"
                        : "tools"
                    }
                  </small>

                </span>

                <span class="folder-arrow">
                  →
                </span>

              </button>
            `;
          })
          .join("")}

      </div>

    </section>
  `;
}

function renderResourceLibrary() {
  const meta =
    getCategoryMeta(
      state.category
    );

  const resources =
    getCurrentResources();

  return `
    <section
      id="resources"
      class="resources-section"
    >

      <div class="library-header">

        <button
          class="back-button"
          id="backSubcategories"
        >
          ← ${escapeHTML(
            meta.title
          )}
        </button>

        <div class="library-title">

          <div class="library-icon">
            ${SUBCATEGORY_META[
              state.subcategory
            ] || "🧰"}
          </div>

          <div>
            <div class="eyebrow">
              TOOL COLLECTION
            </div>

            <h2>
              ${escapeHTML(
                state.subcategory
              )}
            </h2>

            <p>
              ${resources.length}
              ${
                resources.length === 1
                  ? "resource"
                  : "resources"
              }
            </p>
          </div>

        </div>

      </div>

      <div class="filters">

        <select id="pricing">

          <option value="all">
            All pricing
          </option>

          <option
            value="free"
            ${
              state.pricing === "free"
                ? "selected"
                : ""
            }
          >
            Free
          </option>

          <option
            value="freemium"
            ${
              state.pricing === "freemium"
                ? "selected"
                : ""
            }
          >
            Freemium
          </option>

          <option
            value="paid"
            ${
              state.pricing === "paid"
                ? "selected"
                : ""
            }
          >
            Paid
          </option>

        </select>

        <select id="platform">

          <option value="all">
            All platforms
          </option>

          ${getPlatforms()
            .map(
              platform => `
                <option
                  value="${escapeHTML(
                    platform
                  )}"
                  ${
                    state.platform ===
                    platform
                      ? "selected"
                      : ""
                  }
                >
                  ${escapeHTML(
                    formatCategory(
                      platform
                    )
                  )}
                </option>
              `
            )
            .join("")}

        </select>

        <select id="sort">

          <option
            value="featured"
            ${
              state.sort === "featured"
                ? "selected"
                : ""
            }
          >
            Featured
          </option>

          <option
            value="name"
            ${
              state.sort === "name"
                ? "selected"
                : ""
            }
          >
            A–Z
          </option>

          <option
            value="category"
            ${
              state.sort === "category"
                ? "selected"
                : ""
            }
          >
            Category
          </option>

          <option
            value="free"
            ${
              state.sort === "free"
                ? "selected"
                : ""
            }
          >
            Free First
          </option>

        </select>

        <button
          id="opensource"
          class="filter-toggle ${
            state.openSource
              ? "active"
              : ""
          }"
        >
          Open Source
        </button>

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
                  No resources found
                </h3>

                <p>
                  Try another filter.
                </p>

                <button
                  id="clearFilters"
                  class="btn primary"
                >
                  Clear Filters
                </button>

              </div>
            `
        }

      </div>

    </section>
  `;
}

function renderSearchResults() {
  const resources =
    searchDatabase(
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

function renderStacks() {
  return `
    <section
      id="stacks"
      class="stacks-section"
    >

      <div class="section-heading">

        <span>02</span>

        <div>
          <h2>
            CREATOR STACKS
          </h2>

          <p>
            Jump directly into a creator workflow.
          </p>
        </div>

      </div>

      <div class="stack-grid">

        <button
          class="stack-card"
          data-stack="music"
        >
          <b>🎵</b>
          <strong>Music Creator</strong>
          <span>
            Production → recording → mixing → release
          </span>
        </button>

        <button
          class="stack-card"
          data-stack="video"
        >
          <b>🎬</b>
          <strong>Video Creator</strong>
          <span>
            Record → edit → clip → publish
          </span>
        </button>

        <button
          class="stack-card"
          data-stack="ai"
        >
          <b>🤖</b>
          <strong>AI Creator</strong>
          <span>
            Research → create → automate → publish
          </span>
        </button>

        <button
          class="stack-card"
          data-stack="design"
        >
          <b>🎨</b>
          <strong>Design Creator</strong>
          <span>
            Brand → graphics → thumbnails → content
          </span>
        </button>

        <button
          class="stack-card"
          data-stack="business"
        >
          <b>💰</b>
          <strong>Creator Business</strong>
          <span>
            Website → audience → sales → analytics
          </span>
        </button>

      </div>

    </section>
  `;
}

function renderCTA() {
  return `
    <section class="cta">

      <div>

        <div class="eyebrow">
          MILEYM3DIA CREATOR HUB
        </div>

        <h2>
          BUILD.
          <span>CREATE.</span>
          <br>
          REPEAT.
        </h2>

        <p>
          A growing creator toolkit built around
          music, video, design, AI and business.
        </p>

      </div>

      <a
        class="btn primary large"
        href="https://github.com/mileyAM/mileym3dia-creator-hub"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on GitHub ↗
      </a>

    </section>
  `;
}

function renderFooter() {
  return `
    <footer>

      <div>

        <strong>
          MILEYM3DIA
        </strong>

        <span>
          CREATOR HUB
        </span>

      </div>

      <p>
        Music · Video · Design · AI · Business
      </p>

      <a
        href="https://github.com/mileyAM/mileym3dia-creator-hub"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open Source on GitHub ↗
      </a>

    </footer>
  `;
}

function render() {
  if (!app) return;

  let content = "";

  if (state.search) {
    content = renderSearchResults();
  } else if (
    state.view === "resources"
  ) {
    content = renderResourceLibrary();
  } else if (
    state.view === "subcategories"
  ) {
    content = renderSubcategoryFolders();
  } else {
    content =
      renderCategoryFolders();
  }

  app.innerHTML = `
    ${renderHeader()}

    <main>

      ${renderHero()}

      ${content}

      ${
        !state.search &&
        state.view === "categories"
          ? renderStacks()
          : ""
      }

      ${renderCTA()}

    </main>

    ${renderFooter()}
  `;

  bindEvents();
}

function focusSearch() {
  const input =
    document.querySelector("#search");

  if (!input) return;

  input.focus();

  input.setSelectionRange(
    input.value.length,
    input.value.length
  );
}

function clearFilters() {
  state.subcategory = "all";
  state.pricing = "all";
  state.platform = "all";
  state.openSource = false;
  state.sort = "featured";
}

function openCategory(category) {
  state.category = category;
  state.subcategory = "all";
  state.view = "subcategories";
  clearFilters();

  render();

  document
    .querySelector("#categories")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}

function openSubcategory(
  subcategory
) {
  state.subcategory =
    subcategory;

  state.view = "resources";

  render();

  document
    .querySelector("#resources")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}

function openStack(stack) {
  state.category =
    stack === "business"
      ? "business"
      : stack;

  state.subcategory = "all";
  state.search = "";
  state.view = "subcategories";

  clearFilters();

  render();

  document
    .querySelector("#categories")
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
}

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

  search?.addEventListener(
    "input",
    event => {
      state.search =
        event.target.value;

      render();

      focusSearch();
    }
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
