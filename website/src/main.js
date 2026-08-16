import "./style.css";

const DATA_URL = "./data/resources.json";

const state = {
  resources: [],
  category: "all",
  pricing: "all",
  platform: "all",
  search: "",
  openSource: false
};

const app = document.querySelector("#app");

async function loadResources() {
  try {
    const response = await fetch(DATA_URL);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    state.resources = Array.isArray(data)
      ? data
      : data.resources || [];

    render();
  } catch (error) {
    console.error(error);

    app.innerHTML = `
      <main class="error-screen">
        <h1>MILEYM3DIA</h1>
        <p>Unable to load the resource database.</p>
        <button onclick="location.reload()">Retry</button>
      </main>
    `;
  }
}

function normalize(value = "") {
  return String(value).toLowerCase().trim();
}

function getCategories() {
  return [...new Set(
    state.resources
      .map(r => r.category)
      .filter(Boolean)
  )].sort();
}

function matches(resource) {
  const search = normalize(state.search);

  const searchable = normalize([
    resource.name,
    resource.description,
    resource.category,
    resource.subcategory,
    ...(resource.tags || [])
  ].join(" "));

  const categoryMatch =
    state.category === "all" ||
    normalize(resource.category) === normalize(state.category);

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
    searchable.includes(search);

  return (
    categoryMatch &&
    pricingMatch &&
    platformMatch &&
    openSourceMatch &&
    searchMatch
  );
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function categoryIcon(category) {
  const icons = {
    music: "🎵",
    video: "🎬",
    design: "🎨",
    ai: "🤖",
    "creator-business": "💼"
  };

  return icons[category] || "🧰";
}

function resourceCard(resource) {
  const pricing =
    resource.pricing?.type || "unknown";

  const platforms =
    resource.platforms || [];

  const tags =
    resource.tags || [];

  const download =
    resource.download || "";

  return `
    <article class="resource-card">

      <div class="card-top">
        <span class="category-badge">
          ${categoryIcon(resource.category)}
          ${escapeHTML(resource.category || "Resource")}
        </span>

        ${
          resource.openSource
            ? `<span class="open-badge">OPEN SOURCE</span>`
            : ""
        }
      </div>

      <h3>${escapeHTML(resource.name)}</h3>

      <p class="description">
        ${escapeHTML(
          resource.description ||
          "Creator resource from the MILEYM3DIA directory."
        )}
      </p>

      <div class="metadata">

        <span>
          ${pricing === "free" ? "🆓" : "💳"}
          ${escapeHTML(pricing)}
        </span>

        ${
          platforms.length
            ? `<span>💻 ${platforms
                .map(escapeHTML)
                .join(" · ")}</span>`
            : ""
        }

      </div>

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
          download
            ? `
              <a
                class="btn secondary"
                href="${escapeHTML(download)}"
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

function render() {

  const filtered =
    state.resources.filter(matches);

  const categories =
    getCategories();

  app.innerHTML = `

    <header class="site-header">

      <div class="brand">
        <div class="brand-mark">M3</div>

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
        <a href="#resources">Resources</a>
        <a href="#categories">Categories</a>
        <a
          href="https://github.com/mileyAM/mileym3dia-creator-hub"
          target="_blank"
          rel="noopener"
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
            Discover tools for music, video, design,
            AI and building your creator business.
          </p>

          <div class="hero-search">

            <span>⌕</span>

            <input
              id="search"
              type="search"
              placeholder="Search 248+ creator resources..."
              value="${escapeHTML(state.search)}"
            />

          </div>

          <div class="hero-stats">

            <div>
              <strong>${state.resources.length}</strong>
              <span>RESOURCES</span>
            </div>

            <div>
              <strong>${categories.length}</strong>
              <span>CATEGORIES</span>
            </div>

            <div>
              <strong>FREE</strong>
              <span>TO EXPLORE</span>
            </div>

          </div>

        </div>

      </section>


      <section id="categories" class="category-section">

        <div class="section-heading">
          <span>01</span>
          <h2>EXPLORE BY CATEGORY</h2>
        </div>

        <div class="category-grid">

          <button
            class="category-tile"
            data-category="all"
          >
            <b>✦</b>
            <strong>Everything</strong>
            <span>${state.resources.length} resources</span>
          </button>

          ${categories.map(category => `
            <button
              class="category-tile"
              data-category="${escapeHTML(category)}"
            >
              <b>${categoryIcon(category)}</b>
              <strong>${escapeHTML(category)}</strong>
              <span>
                ${
                  state.resources.filter(
                    r => r.category === category
                  ).length
                } resources
              </span>
            </button>
          `).join("")}

        </div>

      </section>


      <section id="resources" class="resources-section">

        <div class="resource-heading">

          <div>
            <div class="section-heading">
              <span>02</span>
              <h2>CREATOR RESOURCES</h2>
            </div>

            <p>
              ${filtered.length} resources found
            </p>
          </div>

          <div class="filters">

            <select id="pricing">

              <option value="all">
                All pricing
              </option>

              <option value="free">
                Free
              </option>

              <option value="freemium">
                Freemium
              </option>

              <option value="paid">
                Paid
              </option>

            </select>

            <select id="platform">

              <option value="all">
                All platforms
              </option>

              <option value="macos">
                macOS
              </option>

              <option value="windows">
                Windows
              </option>

              <option value="linux">
                Linux
              </option>

              <option value="ios">
                iOS
              </option>

              <option value="android">
                Android
              </option>

              <option value="web">
                Web
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
                  <h3>No resources found</h3>
                  <p>
                    Try another search or remove a filter.
                  </p>
                </div>
              `
          }

        </div>

      </section>


      <section class="cta">

        <div>

          <div class="eyebrow">
            HELP BUILD THE DIRECTORY
          </div>

          <h2>
            KNOW A GREAT
            <span>CREATOR TOOL?</span>
          </h2>

          <p>
            MILEYM3DIA Creator Hub is designed to grow
            continuously through community submissions
            and automated discovery.
          </p>

        </div>

        <a
          class="btn primary large"
          href="https://github.com/mileyAM/mileym3dia-creator-hub"
          target="_blank"
          rel="noopener"
        >
          View on GitHub ↗
        </a>

      </section>

    </main>


    <footer>

      <div>
        <strong>MILEYM3DIA</strong>
        <span>CREATOR HUB</span>
      </div>

      <p>
        Creator resources for music, video,
        design, AI and building online.
      </p>

      <a
        href="https://github.com/mileyAM/mileym3dia-creator-hub"
        target="_blank"
        rel="noopener"
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

  const pricing =
    document.querySelector("#pricing");

  const platform =
    document.querySelector("#platform");

  const openSource =
    document.querySelector("#opensource");

  search?.addEventListener(
    "input",
    event => {
      state.search = event.target.value;
      render();
      document
        .querySelector("#search")
        ?.focus();
    }
  );

  pricing?.addEventListener(
    "change",
    event => {
      state.pricing = event.target.value;
      render();
    }
  );

  platform?.addEventListener(
    "change",
    event => {
      state.platform = event.target.value;
      render();
    }
  );

  openSource?.addEventListener(
    "click",
    () => {
      state.openSource = !state.openSource;
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

loadResources();