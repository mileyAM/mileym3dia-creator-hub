import './style.css';

const categories = [
  ['🎚️','Music Production'],
  ['🎛️','Plugins & Effects'],
  ['🎹','DAWs'],
  ['🥁','Samples & Drum Kits'],
  ['🎤','Vocals & Recording'],
  ['🎧','Mixing & Mastering'],
  ['🤖','AI Creator Tools'],
  ['🎬','Video Creation'],
  ['🎨','Graphic Design'],
  ['📱','Social Media'],
  ['💿','Music Distribution'],
  ['💰','Creator Business']
];

document.querySelector('#app').innerHTML = `
<header>
  <div class="brand">MILEYM3DIA</div>
  <nav>CREATOR HUB</nav>
</header>

<main>
  <section class="hero">
    <div class="eyebrow">THE CREATOR RESOURCE HUB</div>
    <h1>Tools for creators.<br><span>All in one place.</span></h1>
    <p>Discover music, AI, video, design and creator resources curated by MILEYM3DIA.</p>
    <div class="search">
      <span>⌕</span>
      <input placeholder="Search thousands of creator resources..." />
    </div>
  </section>

  <section>
    <div class="section-title">EXPLORE CATEGORIES</div>
    <div class="grid">
      ${categories.map(([icon,name]) => `
        <article class="card">
          <div class="icon">${icon}</div>
          <h2>${name}</h2>
          <p>Explore resources →</p>
        </article>
      `).join('')}
    </div>
  </section>
</main>

<footer>
  <strong>MILEYM3DIA</strong> Creator Hub · Built for creators.
</footer>
`;
