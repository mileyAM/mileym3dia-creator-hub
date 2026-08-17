import "./style.css";

import {
  normalizeDatabase,
  searchResources,
  filterResources,
  sortResources,
  getCategories,
  getSubcategories,
  getPlatforms,
  getStats
} from "./data.js";

const DATA_URL = "./data/resources.json";
import additions from "./resource-additions.js";

const state = {
  resources: [],
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
    description: "DAWs, recording, mixing, mastering, samples and music business."
  },
  video: {
    icon: "🎬",
    title: "Video",
    description: "Editing, streaming, podcasting, clips, effects and production."
  },
  design: {
    icon: "🎨",
    title: "Design",
    description: "Graphics, photo editing, illustration, UI/UX and 3D."
  },
  ai: {
    icon: "🤖",
    title: "AI",
    description: "AI assistants, image, video, voice, music and creator automation."
  },
  "creator-business": {
    icon: "💼",
    title: "Creator Business",
    description: "Marketing, monetization, websites, analytics and business tools."
  },
  business: {
    icon: "💼",
    title: "Creator Business",
    description: "Marketing, monetization, websites, analytics and business tools."
  }
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

function formatCategory(category) {
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

function categoryIcon(category) {
  return CATEGORY_META[normalize(category)]?.icon || "🧰";
}

function getCategories() {
  return [
    ...new Set(
      state.resources
        .map(resource => resource.category)
        .filter(Boolean)
        .map(normalize)
    )
  ].sort();
}

function getSubcategories() {
  const resources =
    state.category === "all"
      ? state.resources
      : state.resources.filter(
          resource =>
            normalize(resource.category) === normalize(state.category)
        );

  return [
    ...new Set(
      resources
        .map(resource => resource.subcategory)
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b));
}

function getPlatforms() {
  return [
    ...new Set(
      state.resources.flatMap(resource =>
        Array.isArray(resource.platforms)
          ? resource.platforms
          : []
      )
    )
  ].sort();
}

function getPricingCounts(resources) {
  return resources.reduce(
    (counts, resource) => {
      const type = normalize(resource.pricing?.type);

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

function searchableText(resource) {
  return normalize(
    [
      resource.name,
      resource.description,
      resource.category,
      resource.subcategory,
      ...(resource.tags || [])
    ].join(" ")
  );
}

function matches(resource) {
  const search = normalize(state.search);

  const categoryMatch =
    state.category === "all" ||
    normalize(resource.category) === normalize(state.category);

  const subcategoryMatch =
    state.subcategory === "all" ||
    normalize(resource.subcategory) === normalize(state.subcategory);

  const pricingMatch =
    state.pricing === "all" ||
    normalize(resource.pricing?.type) === normalize(state.pricing);

  const platformMatch =
    state.platform === "all" ||
    (resource.platforms || [])
      .map(normalize)
      .includes(normalize(state.platform));

  const openSourceMatch =
    !state.openSource ||
    resource.openSource === true;

  const searchMatch =
    !search ||
    searchableText(resource).includes(search);

  return (
    categoryMatch &&
    subcategoryMatch &&
    pricingMatch &&
    platformMatch &&
    openSourceMatch &&
    searchMatch
  );
}

function sortResources(resources) {
  const sorted = [...resources];

  if (state.sort === "name") {
    return sorted.sort((a, b) =>
      String(a.name || "").localeCompare(
        String(b.name || "")
      )
    );
  }

  if (state.sort === "free") {
    return sorted.sort((a, b) => {
      const aFree =
        normalize(a.pricing?.type) === "free" ? 0 : 1;

      const bFree =
        normalize(b.pricing?.type) === "free" ? 0 : 1;

      return aFree - bFree;
    });
  }

  if (state.sort === "category") {
    return sorted.sort((a, b) =>
      `${a.category}-${a.name}`.localeCompare(
        `${b.category}-${b.name}`
      )
    );
  }

  if (state.sort === "newest") {
    return sorted.reverse();
  }

  return sorted;
}

function resourceCard(resource) {
  const pricing =
    resource.pricing?.type || "unknown";

  const platforms =
    Array.isArray(resource.platforms)
      ? resource.platforms
      : [];

  const tags =
    Array.isArray(resource.tags)
      ? resource.tags
      : [];

  const meta =
    CATEGORY_META[normalize(resource.category)];

  return `
    <article class="resource-card">

      <div class="card-top">

        <span class="category-badge">
          ${categoryIcon(resource.category)}
          ${escapeHTML(
            meta?.title ||
            formatCategory(resource.category) ||
            "Resource"
          )}
        </span>

        ${
          resource.openSource
            ? `<span class="open-badge">OPEN SOURCE</span>`
            : ""
        }

      </div>

      <h3>
        ${escapeHTML(resource.name || "Untitled Resource")}
      </h3>

      <p class="description">
        ${escapeHTML(
          resource.description ||
          "Creator resource from the MILEYM3DIA directory."
        )}
      </p>

      <div class="metadata">

        <span>
          ${
            pricing === "free"
              ? "🆓"
              : pricing === "freemium"
                ? "◐"
                : "💳"
          }

          ${escapeHTML(formatCategory(pricing))}
        </span>

        ${
          platforms.length
            ? `
              <span>
                💻
                ${platforms
                  .map(platform =>
                    escapeHTML(formatCategory(platform))
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
              ${escapeHTML(resource.subcategory)}
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
                    `<span>#${escapeHTML(tag)}</span>`
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
                href="${escapeHTML(resource.website)}"
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
                href="${escapeHTML(resource.download)}"
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

function renderCategoryTiles(categories) {
  return `
    <button
      class="category-tile ${
        state.category === "all" ? "active" : ""
      }"
      data-category="all"
    >
      <b>✦</b>
      <strong>Everything</strong>
      <span>
        ${state.resources.length} resources →
      </span>
    </button>

    ${categories
      .map(category => {
        const count =
          state.resources.filter(
            resource =>
              normalize(resource.category) ===
              normalize(category)
          ).length;

        const meta =
          CATEGORY_META[normalize(category)];

        return `
          <button
            class="category-tile ${
              normalize(state.category) ===
              normalize(category)
                ? "active"
                : ""
            }"
            data-category="${escapeHTML(category)}"
          >

            <b>
              ${meta?.icon || "🧰"}
            </b>

            <strong>
              ${escapeHTML(
                meta?.title ||
                formatCategory(category)
              )}
            </strong>

            <span>
              ${count} resources →
            </span>

          </button>
        `;
      })
      .join("")}
  `;
}

function render() {
  const categories = getCategories();

  const filtered =
    sortResources(
      state.resources.filter(matches)
    );

  const pricingCounts =
    getPricingCounts(state.resources);

  const subcategories =
    getSubcategories();

  const platforms =
    getPlatforms();

  app.innerHTML = `

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


    <main>

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
              value="${escapeHTML(state.search)}"
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
                ${pricingCounts.free}
              </strong>
              <span>FREE TOOLS</span>
            </div>

            <div>
              <strong>
                ${pricingCounts.freemium}
              </strong>
              <span>FREEMIUM</span>
            </div>

          </div>

        </div>

      </section>


      <section
        id="categories"
        class="category-section"
      >

        <div class="section-heading">

          <span>01</span>

          <div>
            <h2>
              EXPLORE BY CATEGORY
            </h2>

            <p>
              Find the right tools for the job.
            </p>
          </div>

        </div>

        <div class="category-grid">
          ${renderCategoryTiles(categories)}
        </div>

      </section>


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
              Start with a ready-made collection.
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


      <section
        id="resources"
        class="resources-section"
      >

        <div class="resource-heading">

          <div>

            <div class="section-heading">

              <span>03</span>

              <div>
                <h2>
                  CREATOR RESOURCES
                </h2>

                <p>
                  ${filtered.length}
                  resources found
                </p>
              </div>

            </div>

          </div>


          <div class="filters">

            <select id="subcategory">

              <option value="all">
                All types
              </option>

              ${subcategories
                .map(
                  subcategory => `
                    <option
                      value="${escapeHTML(subcategory)}"
                      ${
                        state.subcategory ===
                        subcategory
                          ? "selected"
                          : ""
                      }
                    >
                      ${escapeHTML(subcategory)}
                    </option>
                  `
                )
                .join("")}

            </select>


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

              ${platforms
                .map(
                  platform => `
                    <option
                      value="${escapeHTML(platform)}"
                      ${
                        state.platform ===
                        platform
                          ? "selected"
                          : ""
                      }
                    >
                      ${escapeHTML(
                        formatCategory(platform)
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

        </div>


        <div class="resource-grid">

          ${
            filtered.length
              ? filtered
                  .map(resourceCard)
                  .join("")
              : `
                <div class="empty">

                  <div>⌕</div>

                  <h3>
                    No resources found
                  </h3>

                  <p>
                    Try another search or remove a filter.
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
            The directory is designed to keep growing
            with new tools, categories and creator workflows.
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

    </main>


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

  bindEvents();
}

function bindEvents() {
  const search =
    document.querySelector("#search");

  const subcategory =
    document.querySelector("#subcategory");

  const pricing =
    document.querySelector("#pricing");

  const platform =
    document.querySelector("#platform");

  const sort =
    document.querySelector("#sort");

  const openSource =
    document.querySelector("#opensource");

  const clearFilters =
    document.querySelector("#clearFilters");

  search?.addEventListener(
    "input",
    event => {
      state.search = event.target.value;
      render();

      const newSearch =
        document.querySelector("#search");

      newSearch?.focus();

      if (newSearch) {
        newSearch.setSelectionRange(
          newSearch.value.length,
          newSearch.value.length
        );
      }
    }
  );

  subcategory?.addEventListener(
    "change",
    event => {
      state.subcategory =
        event.target.value;

      render();
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

  clearFilters?.addEventListener(
    "click",
    () => {
      state.category = "all";
      state.subcategory = "all";
      state.pricing = "all";
      state.platform = "all";
      state.search = "";
      state.openSource = false;
      state.sort = "featured";

      render();
    }
  );

  document
    .querySelectorAll("[data-category]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          state.category =
            button.dataset.category;

          state.subcategory = "all";

          render();

          document
            .querySelector("#resources")
            ?.scrollIntoView({
              behavior: "smooth"
            });
        }
      );
    });

  document
    .querySelectorAll("[data-stack]")
    .forEach(button => {
      button.addEventListener(
        "click",
        () => {
          const stack =
            button.dataset.stack;

          state.category =
            stack === "business"
              ? "business"
              : stack;

          state.subcategory = "all";
          state.search = "";

          render();

          document
            .querySelector("#resources")
            ?.scrollIntoView({
              behavior: "smooth"
            });
        }
      );
    });
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

    const baseResources =
  Array.isArray(data)
    ? data
    : data.resources || [];

const existingIds = new Set(
  baseResources.map(resource => resource.id)
);

const uniqueAdditions =
  additions.filter(
    resource => !existingIds.has(resource.id)
  );

state.resources = [
  ...baseResources,
  ...uniqueAdditions
];
    render();

  } catch (error) {
    console.error(error);

    app.innerHTML = `
      <main class="error-screen">

        <h1>
          MILEYM3DIA
        </h1>

        <p>
          Unable to load the resource database.
        </p>

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
