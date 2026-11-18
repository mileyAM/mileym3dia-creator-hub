/**
 * MILEYM3DIA — Creator Toolbox 2.0
 * Modern, responsive, accessible directory frontend.
 */

import "./style.css";

import {
  CATEGORY_DEFINITIONS,
  normalizeCategory,
  normalizeDatabase,
  searchResources,
  filterResources,
  sortResources,
  getFavorites,
  isFavorite,
  toggleFavorite,
  getViewMode,
  setViewMode,
  getTheme,
  setTheme,
  getStats,
  getSubcategories
} from "./data.js";

const RESOURCES_URL = `${import.meta.env.BASE_URL}data/resources.json`;
const ORIGINALS_URL = `${import.meta.env.BASE_URL}data/m3-originals.json`;

const currentTheme = getTheme();
document.documentElement.setAttribute("data-theme", currentTheme);

const state = {
  theme: currentTheme,
  resources: [],
  originals: [],
  search: "",
  category: "all",
  subcategory: "all",
  pricing: "all",
  platform: "all",
  sort: "featured",
  viewMode: getViewMode(),
  favoritesOnly: false,
  verifiedOnly: false,
  page: 1,
  pageSize: 24,
  activeModalTool: null,
  showOriginalsSection: true
};

const app = document.querySelector("#app");

function escapeHTML(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAvatarColors(category = "tools") {
  const map = {
    music: { bg: "rgba(37, 141, 255, 0.14)", color: "#258DFF" },
    video: { bg: "rgba(239, 37, 44, 0.14)", color: "#EF252C" },
    design: { bg: "rgba(139, 56, 220, 0.16)", color: "#8B38DC" },
    ai: { bg: "rgba(212, 243, 41, 0.14)", color: "#D4F329" },
    business: { bg: "rgba(37, 141, 255, 0.14)", color: "#258DFF" },
    tools: { bg: "rgba(139, 56, 220, 0.14)", color: "#8B38DC" }
  };
  return map[category] || map.tools;
}

function getInitials(name = "") {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase() || "M3";
}

function getPricingClass(pricing, openSource) {
  if (openSource) return "pricing-opensource";
  if (pricing?.type === "free") return "pricing-free";
  if (pricing?.type === "freemium") return "pricing-freemium";
  return "pricing-paid";
}

function getPricingLabel(pricing, openSource) {
  if (openSource) return "Open Source";
  if (pricing?.type === "free") return "Free";
  if (pricing?.type === "freemium") return "Freemium";
  if (pricing?.type === "subscription") return "Subscription";
  if (pricing?.type === "paid") return "Paid";
  return "Resource";
}

/* --------------------------------------------------
   COMPONENTS
-------------------------------------------------- */

function renderHeader(stats) {
  return `
    <header class="site-header">
      <div class="container header-inner">
        <a href="#" class="brand-link" id="brandHomeBtn">
          <div class="brand-monogram">M3</div>
          <div class="brand-text">
            <span class="brand-title">MILEYM3DIA</span>
            <span class="brand-subtitle">Creator Toolbox 2.0</span>
          </div>
        </a>

        <div class="header-actions">
          <div class="badge-counter" title="Total Curated Resources">
            <span class="dot"></span>
            <span>${stats.total} Tools</span>
          </div>

          <button
            class="btn-header ${state.favoritesOnly ? 'active' : ''}"
            id="headerFavBtn"
            title="View Saved Favorites"
            aria-pressed="${state.favoritesOnly}"
          >
            <span>♥</span>
            <span class="hide-mobile">Favorites</span>
            <span class="tab-count">${stats.favorites}</span>
          </button>

          <button
            class="btn-theme-toggle"
            id="themeToggleBtn"
            title="${state.theme === 'light' ? 'Switch to Studio Dark Mode' : 'Switch to Crisp Light Mode'}"
            aria-label="Toggle visual theme"
          >
            <span>${state.theme === 'light' ? '🌙' : '☀️'}</span>
          </button>

          <a
            href="https://github.com/mileyAM/mileym3dia-creator-hub"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-header hide-mobile"
            title="View on GitHub"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
        </div>
      </div>
    </header>
  `;
}

function renderHero(stats) {
  return `
    <section class="hero-section">
      <div class="container hero-content">
        <div class="hero-pill">
          <span>⚡ Curated Creative Directory</span>
        </div>

        <h1 class="hero-title">
          Build. <span class="highlight-red">Create.</span> <br>
          <span class="highlight-purple">Scale Faster.</span>
        </h1>

        <p class="hero-desc">
          The open resource directory for music producers, video creators, digital designers, AI builders, and entrepreneurs. Instant searching, zero bloat, and verified links.
        </p>

        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-val color-lime">${stats.total}</span>
            <span class="stat-lbl">Curated Tools</span>
          </div>
          <div class="stat-item">
            <span class="stat-val color-blue">${stats.openSource}</span>
            <span class="stat-lbl">Open Source</span>
          </div>
          <div class="stat-item">
            <span class="stat-val color-purple">${stats.free + stats.freemium}</span>
            <span class="stat-lbl">Free & Freemium</span>
          </div>
          <div class="stat-item">
            <span class="stat-val">${stats.verified}</span>
            <span class="stat-lbl">Verified URLs</span>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderOriginals() {
  if (!state.originals || !state.originals.length) return "";

  return `
    <section class="originals-section" id="m3-originals">
      <div class="container">
        <div class="originals-header">
          <div class="originals-title-wrap">
            <span class="section-tag">MILEYM3DIA</span>
            <h2 class="section-title">M3 Originals & Workflows</h2>
          </div>
          <span class="badge-counter">In-house Apps & Shortcuts</span>
        </div>

        <div class="originals-grid">
          ${state.originals
            .map(item => {
              const statusClass =
                item.status === "Released"
                  ? "badge-released"
                  : item.status === "Beta"
                    ? "badge-beta"
                    : "badge-dev";

              return `
                <article class="original-card" style="--card-accent: ${item.accentColor || 'var(--m3-purple)'}">
                  <div class="original-card-top">
                    <span class="original-badge ${statusClass}">${escapeHTML(item.status)}</span>
                    <span class="original-type-chip">${escapeHTML(item.type)}</span>
                  </div>

                  <h3 class="original-name">${escapeHTML(item.name)}</h3>
                  <p class="original-tagline">${escapeHTML(item.tagline)}</p>

                  <ul class="original-highlights">
                    ${(item.highlights || [])
                      .map(h => `<li>${escapeHTML(h)}</li>`)
                      .join("")}
                  </ul>

                  <div class="original-footer">
                    <span class="original-type-chip">${(item.platforms || []).join(", ")}</span>
                    <div style="display: flex; gap: 0.4rem;">
                      ${item.website ? `
                        <a href="${escapeHTML(item.website)}" target="_blank" rel="noopener noreferrer" class="btn-card-action">
                          <span>Open</span>
                          <span>↗</span>
                        </a>
                      ` : ''}
                      ${item.downloadUrl ? `
                        <a href="${escapeHTML(item.downloadUrl)}" target="_blank" rel="noopener noreferrer" class="btn-card-action">
                          <span>Get</span>
                          <span>↓</span>
                        </a>
                      ` : ''}
                    </div>
                  </div>
                </article>
              `;
            })
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderControls(categories, subcategories) {
  const currentCategory = state.category;

  return `
    <div class="controls-sticky-wrap">
      <div class="container">
        <!-- Category Tabs -->
        <div class="category-tabs-scroll" role="tablist" aria-label="Tool Categories">
          ${categories
            .map(catKey => {
              const def = CATEGORY_DEFINITIONS[catKey];
              if (!def) return "";
              const isActive = state.category === catKey && !state.favoritesOnly;

              return `
                <button
                  class="tab-btn ${isActive ? 'active' : ''}"
                  data-cat="${catKey}"
                  role="tab"
                  aria-selected="${isActive}"
                >
                  <span>${def.icon}</span>
                  <span>${escapeHTML(def.label)}</span>
                </button>
              `;
            })
            .join("")}

          <button
            class="tab-btn ${state.favoritesOnly ? 'active' : ''}"
            id="tabFavoritesBtn"
            role="tab"
            aria-selected="${state.favoritesOnly}"
          >
            <span>♥</span>
            <span>Favorites</span>
            <span class="tab-count">${getFavorites().length}</span>
          </button>
        </div>

        <!-- Search & Dropdown Filter Bar -->
        <div class="filter-bar">
          <div class="search-input-wrap">
            <span class="search-icon">⌕</span>
            <input
              type="text"
              id="directorySearch"
              class="search-input"
              placeholder="Search 320+ tools (press '/' to focus)..."
              value="${escapeHTML(state.search)}"
              aria-label="Search creator tools"
              autocomplete="off"
            >
            ${state.search ? `
              <button class="search-clear-btn" id="clearSearchBtn" aria-label="Clear search">✕</button>
            ` : ''}
          </div>

          <div class="filter-dropdowns">
            <!-- Pricing Select -->
            <select class="custom-select" id="pricingFilter" aria-label="Filter by pricing">
              <option value="all" ${state.pricing === 'all' ? 'selected' : ''}>Pricing: All</option>
              <option value="free" ${state.pricing === 'free' ? 'selected' : ''}>100% Free</option>
              <option value="freemium" ${state.pricing === 'freemium' ? 'selected' : ''}>Freemium</option>
              <option value="paid" ${state.pricing === 'paid' ? 'selected' : ''}>Paid / Commercial</option>
              <option value="open-source" ${state.pricing === 'open-source' ? 'selected' : ''}>Open Source</option>
            </select>

            <!-- Platform Select -->
            <select class="custom-select" id="platformFilter" aria-label="Filter by platform">
              <option value="all" ${state.platform === 'all' ? 'selected' : ''}>Platform: All</option>
              <option value="macos" ${state.platform === 'macos' ? 'selected' : ''}>macOS</option>
              <option value="windows" ${state.platform === 'windows' ? 'selected' : ''}>Windows</option>
              <option value="web" ${state.platform === 'web' ? 'selected' : ''}>Web App</option>
              <option value="ios" ${state.platform === 'ios' ? 'selected' : ''}>iOS</option>
              <option value="android" ${state.platform === 'android' ? 'selected' : ''}>Android</option>
            </select>

            <!-- Sort Select -->
            <select class="custom-select" id="sortFilter" aria-label="Sort tools">
              <option value="featured" ${state.sort === 'featured' ? 'selected' : ''}>Sort: Featured</option>
              <option value="newest" ${state.sort === 'newest' ? 'selected' : ''}>Sort: Recently Verified</option>
              <option value="name-asc" ${state.sort === 'name-asc' ? 'selected' : ''}>Sort: A to Z</option>
              <option value="name-desc" ${state.sort === 'name-desc' ? 'selected' : ''}>Sort: Z to A</option>
              <option value="free" ${state.sort === 'free' ? 'selected' : ''}>Sort: Free First</option>
            </select>

            <!-- View Mode Switcher -->
            <div class="view-mode-toggle" role="radiogroup" aria-label="Layout view mode">
              <button
                class="view-btn ${state.viewMode === 'grid' ? 'active' : ''}"
                data-mode="grid"
                title="Grid Cards View"
                aria-label="Grid Cards View"
              >
                ⊞
              </button>
              <button
                class="view-btn ${state.viewMode === 'compact' ? 'active' : ''}"
                data-mode="compact"
                title="Compact List View"
                aria-label="Compact List View"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        <!-- Subcategories Pills Row (when in a specific category) -->
        ${currentCategory !== "all" && subcategories.length ? `
          <div class="subcat-pills-row">
            <button
              class="subcat-pill ${state.subcategory === 'all' ? 'active' : ''}"
              data-subcat="all"
            >
              All ${CATEGORY_DEFINITIONS[currentCategory]?.label || ''}
            </button>
            ${subcategories
              .map(sub => `
                <button
                  class="subcat-pill ${state.subcategory === sub ? 'active' : ''}"
                  data-subcat="${escapeHTML(sub)}"
                >
                  ${escapeHTML(sub)}
                </button>
              `)
              .join("")}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

function renderToolCard(tool) {
  const isFav = isFavorite(tool.id);
  const colors = getAvatarColors(tool.category);
  const pricingClass = getPricingClass(tool.pricing, tool.openSource);
  const pricingLabel = getPricingLabel(tool.pricing, tool.openSource);
  const initials = getInitials(tool.name);

  return `
    <article
      class="tool-card"
      data-tool-id="${escapeHTML(tool.id)}"
      style="--avatar-bg: ${colors.bg}; --avatar-color: ${colors.color};"
    >
      <div class="tool-card-header">
        <div class="tool-identity">
          <div class="tool-avatar" aria-hidden="true">${initials}</div>
          <div class="tool-title-wrap">
            <div class="tool-name-row">
              <h3 class="tool-name" title="${escapeHTML(tool.name)}">${escapeHTML(tool.name)}</h3>
              ${tool.verified ? `<span class="badge-verified" title="Verified official tool">✓</span>` : ''}
            </div>
            <div class="tool-subcat">${escapeHTML(tool.subcategory)}</div>
          </div>
        </div>

        <button
          class="btn-fav ${isFav ? 'favorited' : ''}"
          data-fav-id="${escapeHTML(tool.id)}"
          aria-label="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
          title="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>
      </div>

      <p class="tool-desc">${escapeHTML(tool.description)}</p>

      <div class="tool-tags-row">
        ${tool.tags.slice(0, 3).map(tag => `<span class="chip-tag">${escapeHTML(tag)}</span>`).join("")}
      </div>

      <div class="tool-card-footer">
        <div class="tool-badges">
          <span class="pricing-chip ${pricingClass}">${pricingLabel}</span>
        </div>

        <div class="card-actions">
          <button
            class="btn-icon-action"
            data-open-modal="${escapeHTML(tool.id)}"
            title="View Details"
            aria-label="View details for ${escapeHTML(tool.name)}"
          >
            ⓘ
          </button>

          ${tool.website ? `
            <a
              href="${escapeHTML(tool.website)}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-icon-action"
              title="Visit official website"
              aria-label="Visit ${escapeHTML(tool.name)} website"
            >
              ↗
            </a>
          ` : ''}
        </div>
      </div>
    </article>
  `;
}

function renderToolRow(tool) {
  const isFav = isFavorite(tool.id);
  const colors = getAvatarColors(tool.category);
  const pricingClass = getPricingClass(tool.pricing, tool.openSource);
  const pricingLabel = getPricingLabel(tool.pricing, tool.openSource);
  const initials = getInitials(tool.name);

  return `
    <div
      class="tool-row"
      data-tool-id="${escapeHTML(tool.id)}"
      style="--avatar-bg: ${colors.bg}; --avatar-color: ${colors.color};"
    >
      <div class="row-avatar" aria-hidden="true">${initials}</div>

      <div class="row-main-info">
        <div class="row-name-line">
          <span class="row-name">${escapeHTML(tool.name)}</span>
          ${tool.verified ? `<span class="badge-verified" title="Verified tool">✓</span>` : ''}
          <span class="chip-tag">${escapeHTML(tool.subcategory)}</span>
        </div>
        <p class="row-desc">${escapeHTML(tool.description)}</p>
      </div>

      <div class="row-platforms">
        ${(tool.platforms || []).join(", ")}
      </div>

      <span class="pricing-chip ${pricingClass}">${pricingLabel}</span>

      <div class="card-actions">
        <button
          class="btn-fav ${isFav ? 'favorited' : ''}"
          data-fav-id="${escapeHTML(tool.id)}"
          aria-label="${isFav ? 'Remove from favorites' : 'Save to favorites'}"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </button>

        <button
          class="btn-icon-action"
          data-open-modal="${escapeHTML(tool.id)}"
          title="Details"
        >
          ⓘ
        </button>

        ${tool.website ? `
          <a
            href="${escapeHTML(tool.website)}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-icon-action"
            title="Visit"
          >
            ↗
          </a>
        ` : ''}
      </div>
    </div>
  `;
}

function renderModal() {
  const tool = state.activeModalTool;
  if (!tool) return "";

  const isFav = isFavorite(tool.id);
  const colors = getAvatarColors(tool.category);
  const pricingLabel = getPricingLabel(tool.pricing, tool.openSource);
  const initials = getInitials(tool.name);

  return `
    <div class="modal-backdrop" id="modalBackdrop" role="presentation">
      <div
        class="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
      >
        <div class="modal-header">
          <div class="modal-identity">
            <div class="modal-avatar" style="background: ${colors.bg}; color: ${colors.color};">
              ${initials}
            </div>
            <div>
              <h2 class="modal-title" id="modalTitle">
                ${escapeHTML(tool.name)}
                ${tool.verified ? `<span class="badge-verified" title="Verified tool">✓</span>` : ''}
              </h2>
              <div class="modal-subcat">
                ${escapeHTML(CATEGORY_DEFINITIONS[tool.category]?.label || tool.category)} → ${escapeHTML(tool.subcategory)}
              </div>
            </div>
          </div>

          <button class="modal-close-btn" id="modalCloseBtn" aria-label="Close modal">✕</button>
        </div>

        <div class="modal-body">
          <div>
            <div class="modal-section-heading">Overview & Use Case</div>
            <p class="modal-desc">${escapeHTML(tool.description)}</p>
          </div>

          <div class="modal-meta-grid">
            <div class="modal-meta-cell">
              <span class="meta-lbl">Pricing Model</span>
              <span class="meta-val">${pricingLabel}</span>
            </div>
            <div class="modal-meta-cell">
              <span class="meta-lbl">Platforms</span>
              <span class="meta-val">${(tool.platforms || ["Web"]).join(", ")}</span>
            </div>
            <div class="modal-meta-cell">
              <span class="meta-lbl">License</span>
              <span class="meta-val">${tool.openSource ? 'Open Source' : 'Proprietary'}</span>
            </div>
            <div class="modal-meta-cell">
              <span class="meta-lbl">Verified</span>
              <span class="meta-val">${tool.lastVerified || 'Active'}</span>
            </div>
          </div>

          ${tool.tags && tool.tags.length ? `
            <div>
              <div class="modal-section-heading">Keywords & Capabilities</div>
              <div class="tool-tags-row" style="height: auto;">
                ${tool.tags.map(t => `<span class="chip-tag">${escapeHTML(t)}</span>`).join("")}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="modal-actions">
          <button
            class="btn-secondary-action"
            data-fav-id="${escapeHTML(tool.id)}"
          >
            <span>${isFav ? '♥ Saved' : '♡ Favorite'}</span>
          </button>

          ${tool.download ? `
            <a
              href="${escapeHTML(tool.download)}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-secondary-action"
            >
              <span>Download</span>
              <span>↓</span>
            </a>
          ` : ''}

          ${tool.website ? `
            <a
              href="${escapeHTML(tool.website)}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-primary-action"
            >
              <span>Visit Official Website</span>
              <span>↗</span>
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function renderFooter() {
  return `
    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">
          <strong style="color: var(--text-primary);">MILEYM3DIA Creator Hub</strong>
          <span class="footer-copy">Curated tool directory & creative workflow automation. Zero ads. Verified sources.</span>
        </div>

        <ul class="footer-links">
          <li><a href="https://github.com/mileyAM/mileym3dia-creator-hub" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
          <li><a href="https://github.com/mileyAM/mileym3dia-creator-hub/issues" target="_blank" rel="noopener noreferrer">Submit a Tool</a></li>
          <li><a href="#app">Back to top ↑</a></li>
        </ul>
      </div>
    </footer>
  `;
}

/* --------------------------------------------------
   MAIN RENDER CYCLE
-------------------------------------------------- */

function render() {
  const stats = getStats(state.resources);
  const categories = getCategories(state.resources);
  const subcategories = getSubcategories(state.resources, state.category);

  // Apply Search, Filters, and Sorting
  const searched = searchResources(state.resources, state.search);
  const filtered = filterResources(searched, {
    category: state.category,
    subcategory: state.subcategory,
    pricing: state.pricing,
    platform: state.platform,
    favoritesOnly: state.favoritesOnly,
    verifiedOnly: state.verifiedOnly
  });
  const sorted = sortResources(filtered, state.sort);

  // Pagination slice
  const totalMatches = sorted.length;
  const visibleCount = Math.min(state.page * state.pageSize, totalMatches);
  const visibleTools = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < totalMatches;

  app.innerHTML = `
    ${renderHeader(stats)}
    <main id="main-content">
      ${!state.search && state.category === 'all' && !state.favoritesOnly ? renderHero(stats) : ''}
      ${!state.search && state.category === 'all' && !state.favoritesOnly ? renderOriginals() : ''}

      <section class="directory-section">
        ${renderControls(categories, subcategories)}

        <div class="container">
          <div class="results-meta-bar">
            <span>
              Showing <strong>${visibleCount}</strong> of <strong>${totalMatches}</strong> matching tools
              ${state.search ? ` for "<em>${escapeHTML(state.search)}</em>"` : ''}
            </span>
            ${(state.search || state.category !== 'all' || state.subcategory !== 'all' || state.pricing !== 'all' || state.platform !== 'all' || state.favoritesOnly) ? `
              <button class="btn-reset-filters" id="resetAllFiltersBtn">Clear filters</button>
            ` : ''}
          </div>

          ${
            visibleTools.length
              ? state.viewMode === "grid"
                ? `<div class="tools-grid">${visibleTools.map(renderToolCard).join("")}</div>`
                : `<div class="tools-list">${visibleTools.map(renderToolRow).join("")}</div>`
              : `
                <div class="empty-state">
                  <div class="empty-icon">⌕</div>
                  <h3 class="empty-title">No tools match your criteria</h3>
                  <p class="empty-desc">Try clearing filters, searching different keywords, or check back after the next discovery run.</p>
                  <button class="btn-primary-action" id="emptyResetBtn" style="max-width: 200px; margin: 0 auto;">
                    Reset all filters
                  </button>
                </div>
              `
          }

          ${hasMore ? `
            <div class="pagination-wrap">
              <button class="btn-load-more" id="loadMoreBtn">
                Load More Tools (${totalMatches - visibleCount} remaining)
              </button>
              <span class="pagination-count">Viewing ${visibleCount} of ${totalMatches}</span>
            </div>
          ` : ''}
        </div>
      </section>
    </main>

    ${renderFooter()}
    ${renderModal()}
  `;

  bindEvents();
}

/* --------------------------------------------------
   EVENT BINDING & INTERACTIONS
-------------------------------------------------- */

function bindEvents() {
  // Brand Home Click
  document.querySelector("#brandHomeBtn")?.addEventListener("click", e => {
    e.preventDefault();
    resetFilters();
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Theme Toggle Button
  document.querySelector("#themeToggleBtn")?.addEventListener("click", () => {
    const nextTheme = state.theme === "light" ? "dark" : "light";
    state.theme = nextTheme;
    setTheme(nextTheme);
    render();
  });

  // Category Tab Click
  document.querySelectorAll("[data-cat]").forEach(btn => {
    btn.addEventListener("click", () => {
      const cat = btn.dataset.cat;
      state.category = cat;
      state.subcategory = "all";
      state.favoritesOnly = false;
      state.page = 1;
      render();
    });
  });

  // Favorites Tab / Header Click
  const toggleFavs = () => {
    state.favoritesOnly = !state.favoritesOnly;
    state.page = 1;
    render();
  };
  document.querySelector("#headerFavBtn")?.addEventListener("click", toggleFavs);
  document.querySelector("#tabFavoritesBtn")?.addEventListener("click", toggleFavs);

  // Subcategory Pills
  document.querySelectorAll("[data-subcat]").forEach(btn => {
    btn.addEventListener("click", () => {
      state.subcategory = btn.dataset.subcat;
      state.page = 1;
      render();
    });
  });

  // Search Input
  const searchInput = document.querySelector("#directorySearch");
  searchInput?.addEventListener("input", e => {
    state.search = e.target.value;
    state.page = 1;
    render();
    // Maintain focus & cursor position after render
    const inputNow = document.querySelector("#directorySearch");
    if (inputNow) {
      inputNow.focus();
      inputNow.setSelectionRange(inputNow.value.length, inputNow.value.length);
    }
  });

  // Clear Search Button
  document.querySelector("#clearSearchBtn")?.addEventListener("click", () => {
    state.search = "";
    state.page = 1;
    render();
  });

  // Dropdown Filters
  document.querySelector("#pricingFilter")?.addEventListener("change", e => {
    state.pricing = e.target.value;
    state.page = 1;
    render();
  });

  document.querySelector("#platformFilter")?.addEventListener("change", e => {
    state.platform = e.target.value;
    state.page = 1;
    render();
  });

  document.querySelector("#sortFilter")?.addEventListener("change", e => {
    state.sort = e.target.value;
    state.page = 1;
    render();
  });

  // View Mode Switcher
  document.querySelectorAll("[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;
      state.viewMode = mode;
      setViewMode(mode);
      render();
    });
  });

  // Reset Filters
  const resetFilters = () => {
    state.search = "";
    state.category = "all";
    state.subcategory = "all";
    state.pricing = "all";
    state.platform = "all";
    state.favoritesOnly = false;
    state.page = 1;
  };
  document.querySelector("#resetAllFiltersBtn")?.addEventListener("click", () => {
    resetFilters();
    render();
  });
  document.querySelector("#emptyResetBtn")?.addEventListener("click", () => {
    resetFilters();
    render();
  });

  // Favorite Toggle Buttons
  document.querySelectorAll("[data-fav-id]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = btn.dataset.favId;
      toggleFavorite(id);
      render();
    });
  });

  // Load More Button
  document.querySelector("#loadMoreBtn")?.addEventListener("click", () => {
    state.page += 1;
    render();
  });

  // Modal Open Buttons
  document.querySelectorAll("[data-open-modal]").forEach(btn => {
    btn.addEventListener("click", () => {
      const toolId = btn.dataset.openModal;
      openModal(toolId);
    });
  });

  // Modal Close
  document.querySelector("#modalCloseBtn")?.addEventListener("click", closeModal);
  document.querySelector("#modalBackdrop")?.addEventListener("click", e => {
    if (e.target.id === "modalBackdrop") closeModal();
  });
}

function openModal(toolId) {
  const tool = state.resources.find(r => r.id === toolId);
  if (!tool) return;
  state.activeModalTool = tool;
  history.replaceState(null, "", `#tool=${tool.id}`);
  render();
}

function closeModal() {
  state.activeModalTool = null;
  history.replaceState(null, "", window.location.pathname);
  render();
}

/* Global Keyboard Shortcuts */
window.addEventListener("keydown", e => {
  // Esc to close modal
  if (e.key === "Escape" && state.activeModalTool) {
    closeModal();
  }
  // '/' to focus search (when not already in an input)
  if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
    e.preventDefault();
    const search = document.querySelector("#directorySearch");
    search?.focus();
  }
});

/* Deep Link Routing via Hash */
function checkDeepLink() {
  const hash = window.location.hash;
  if (hash.startsWith("#tool=")) {
    const id = hash.replace("#tool=", "");
    const tool = state.resources.find(r => r.id === id);
    if (tool) {
      state.activeModalTool = tool;
    }
  }
}

/* --------------------------------------------------
   BOOTSTRAP
-------------------------------------------------- */

async function loadData() {
  try {
    const [resResponse, originalsResponse] = await Promise.all([
      fetch(RESOURCES_URL),
      fetch(ORIGINALS_URL).catch(() => ({ ok: false }))
    ]);

    if (!resResponse.ok) {
      throw new Error(`HTTP ${resResponse.status}: Failed to load resources`);
    }

    const resData = await resResponse.json();
    state.resources = normalizeDatabase(resData);

    if (originalsResponse && originalsResponse.ok) {
      const origData = await originalsResponse.json();
      state.originals = origData.items || [];
    }

    checkDeepLink();
    render();

  } catch (err) {
    console.error("Creator Toolbox error:", err);
    app.innerHTML = `
      <div class="empty-state" style="margin: 4rem auto; max-width: 500px;">
        <div class="empty-icon" style="color: var(--m3-red);">⚠</div>
        <h2 class="empty-title">Unable to Load Creator Toolbox</h2>
        <p class="empty-desc">${escapeHTML(err.message || 'Check network connection.')}</p>
        <button class="btn-primary-action" onclick="location.reload()">Retry</button>
      </div>
    `;
  }
}

loadData();
