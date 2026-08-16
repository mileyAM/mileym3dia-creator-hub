import './style.css';

const app = document.querySelector('#app');

const state = {
  resources: [],
  category: 'all',
  pricing: 'all',
  platform: 'all',
  search: ''
};

async function loadData() {
  const response = await fetch('./data/resources.json');
  state.resources = await response.json();
  render();
}

function matches(resource) {
  const search = state.search.toLowerCase();

  const searchable = [
    resource.name,
    resource.description,
    resource.category,
    resource.subcategory,
    ...(resource.tags || []),
    ...(resource.platforms || [])
  ].join(' ').toLowerCase();

  if (search && !searchable.includes(search)) return false;
  if (state.category !== 'all' && resource.category !== state.category) return false;
  if (state.pricing !== 'all' && resource.pricing?.type !== state.pricing) return false;
  if (state.platform !== 'all' && !(resource.platforms || []).includes(state.platform)) return false;

  return true;
}

function categories() {
  return [...new Set(state.resources.map(r => r.category).filter(Boolean))];
}

function card(resource) {
  return `
    <article class="resource-card">
      <div class="resource-top">
        <div class="resource-icon">${resource.logo ? `<img src="${resource.logo}" alt="">` : '✦'}</div>
        <span class="price ${resource.pricing?.type || ''}">
          ${(resource.pricing?.type || 'unknown').toUpperCase()}
        </span>
      </div>

      <h3>${escapeHtml(resource.name)}</h3>
      <p>${escapeHtml(resource.description || '')}</p>

      <div class="tags">
        ${(resource.tags || []).slice(0,4).map(tag => `<span>${escapeHtml(tag)}</span>`).join('')}
      </div>

      <div class="platforms">
        ${(resource.platforms || []).map(p => `<span>${escapeHtml(p)}</span>`).join('')}
      </div>

      <div class="actions">
        ${resource.website ? `<a href="${resource.website}" target="_blank" rel="noopener">Website ↗</a>` : ''}
        ${resource.download ? `<a class="download" href="${resource.download}" target="_blank" rel="noopener">Download ↓</a>` : ''}
      </div>
    </article>
  `;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}

function render() {
  const filtered = state.resources.filter(matches);
  const cats = categories();

  app.innerHTML = `
    <header>
      <a class="logo" href="./">MILEYM3DIA</a>
      <div class="header-label">CREATOR HUB</div>
    </header>

    <main>
      <section class="hero">
        <div class="eyebrow">MILEYM3DIA CREATOR HUB</div>
        <h1>Everything creators<br><span>need to create.</span></h1>
        <p>
          Discover music tools, plugins, AI, video, design,
          samples, business resources and more.
        </p>

        <div class="search-box">
          <span>⌕</span>
          <input
            id="search"
            value="${escapeHtml(state.search)}"
            placeholder="Search resources..."
          >
        </div>
      </section>

      <section class="controls">
        <select id="category">
          <option value="all">All categories</option>
          ${cats.map(c => `
            <option value="${escapeHtml(c)}" ${state.category === c ? 'selected' : ''}>
              ${escapeHtml(c)}
            </option>
          `).join('')}
        </select>

        <select id="pricing">
          <option value="all">Any price</option>
          <option value="free" ${state.pricing === 'free' ? 'selected' : ''}>Free</option>
          <option value="freemium" ${state.pricing === 'freemium' ? 'selected' : ''}>Freemium</option>
          <option value="paid" ${state.pricing === 'paid' ? 'selected' : ''}>Paid</option>
        </select>

        <select id="platform">
          <option value="all">Any platform</option>
          <option value="macos" ${state.platform === 'macos' ? 'selected' : ''}>macOS</option>
          <option value="windows" ${state.platform === 'windows' ? 'selected' : ''}>Windows</option>
          <option value="ios" ${state.platform === 'ios' ? 'selected' : ''}>iOS</option>
          <option value="android" ${state.platform === 'android' ? 'selected' : ''}>Android</option>
          <option value="web" ${state.platform === 'web' ? 'selected' : ''}>Web</option>
        </select>

        <button id="clear">Clear filters</button>
      </section>

      <section class="stats">
        <div><strong>${filtered.length}</strong> resources</div>
        <div><strong>${state.resources.filter(r => r.pricing?.type === 'free').length}</strong> free</div>
        <div><strong>${state.resources.length}</strong> total indexed</div>
      </section>

      <section class="results">
        ${filtered.length
          ? filtered.map(card).join('')
          : `<div class="empty">
              <div>⌕</div>
              <h2>No resources found</h2>
              <p>Try another search or clear your filters.</p>
             </div>`
        }
      </section>
    </main>

    <footer>
      <strong>MILEYM3DIA</strong>
      <span>Creator Hub</span>
      <a href="https://github.com/mileyAM/mileym3dia-creator-hub" target="_blank">GitHub ↗</a>
    </footer>
  `;

  document.querySelector('#search').addEventListener('input', e => {
    state.search = e.target.value;
    render();
    const input = document.querySelector('#search');
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });

  document.querySelector('#category').addEventListener('change', e => {
    state.category = e.target.value;
    render();
  });

  document.querySelector('#pricing').addEventListener('change', e => {
    state.pricing = e.target.value;
    render();
  });

  document.querySelector('#platform').addEventListener('change', e => {
    state.platform = e.target.value;
    render();
  });

  document.querySelector('#clear').addEventListener('click', () => {
    state.category = 'all';
    state.pricing = 'all';
    state.platform = 'all';
    state.search = '';
    render();
  });
}

loadData();
