import { CAREER_TRACKS, MENU_DEFINITIONS, MODDING_API } from '../data/catalogs.js';

const pct = (value) => `${Math.round(value)}%`;
const fmtMoney = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
const escape = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

export function render(app, sim) {
  const player = sim.player;
  app.innerHTML = player ? game(sim, player) : landing();
  player ? bindGame(app, sim) : bindStart(app, sim);
}

function game(sim, player) {
  const stage = player.age < 0 ? 'Prenatal' : `Age ${player.age}`;
  return `<header class="hero">
      <div><p class="eyebrow">${escape(stage)} • ${escape(player.city)} • ${escape(player.psyche.archetype)}</p><h1>${escape(player.firstName)} ${escape(player.lastName)}</h1><p class="subtitle">A persistent, event-driven dynasty in ${sim.world.year}: autonomous NPCs, world economies, relationships, genetics, careers, politics, health, fame, crime, and legacy all evolve on each age tick.</p></div>
      <nav class="hero-actions" aria-label="Primary actions"><button id="age-up" class="primary">Age +1 Year</button><button id="new-child">Add Child</button><button id="save">Save</button><button id="load">Load</button><button id="new-life">New Dynasty</button></nav>
    </header>
    <main class="dashboard">
      <section class="panel command-center span-2"><h2>Major Event Feed</h2><div class="event-grid">${sim.pendingEvents.map(eventCard).join('') || '<p>No urgent events. Age up to advance personal, NPC, and world systems.</p>'}</div></section>
      <section class="panel"><h2>Core Stats</h2>${statBars(player)}</section>
      <section class="panel"><h2>Character Overview</h2>${overview(player, sim)}</section>
      <section class="panel span-2"><h2>Expandable Action Menus</h2><input class="menu-search" type="search" placeholder="Search activities, careers, finance, crime, legacy..." aria-label="Search menus" />${menuTree(player)}</section>
      <section class="panel"><h2>Career Marketplace</h2><p><strong>${escape(player.career.title)}</strong>${player.career.track ? ` • ${player.career.years} years • ${fmtMoney(player.career.salary)}/yr` : ''}</p><div class="career-list">${CAREER_TRACKS.map((track) => `<button class="career" title="Skills: ${track.skills.join(', ')} • Demand ${track.demand}%" data-career="${track.id}">${track.name}<small>${track.demand}% demand</small></button>`).join('')}</div></section>
      <section class="panel span-2"><h2>World, Economy & Politics</h2>${worldPanel(sim)}</section>
      <section class="panel"><h2>Relationships</h2><ul class="compact virtual-list">${Object.values(player.relationships).sort((a, b) => b.strength - a.strength).map((rel) => `<li><strong>${escape(rel.name)}</strong>: ${escape(rel.type)}, ${pct(rel.strength)} bond, ${pct(rel.trust)} trust</li>`).join('') || '<li>No relationships yet.</li>'}</ul></section>
      <section class="panel"><h2>Genetics & Health</h2>${genetics(player)}</section>
      <section class="panel span-2"><h2>Developer Tooling</h2>${debugTools(sim, player)}</section>
      <section class="panel span-2"><h2>Legacy, Memory Graph & Log</h2><p>Legacy score: ${sim.calculateLegacy(player)} • Descendants: ${player.descendants.length} • Domain events: ${sim.events.journal.length} • Mod API ${MODDING_API.version}</p><ul class="compact virtual-list">${player.memories.slice(0, 10).map((memory) => `<li><strong>${memory.year}</strong>: ${escape(memory.title)}</li>`).join('')}</ul><ol class="log">${sim.activityLog.slice(0, 10).map((entry) => `<li><strong>${entry.year}</strong> ${escape(entry.message)}</li>`).join('')}</ol></section>
    </main>`;
}

function overview(player, sim) {
  return `<dl class="facts">
    <dt>Life stage</dt><dd>${player.age < 0 ? 'Prenatal' : player.age}</dd>
    <dt>Career</dt><dd>${escape(player.career.title)}</dd>
    <dt>Cash</dt><dd>${fmtMoney(player.stats.wealth)}</dd>
    <dt>Education</dt><dd>${player.education.path.map((path) => path.replace('_', ' ')).join(' → ') || 'Not enrolled'}</dd>
    <dt>Debt</dt><dd>${fmtMoney(player.education.studentDebt)}</dd>
    <dt>World seed</dt><dd>${sim.seed}</dd>
  </dl>`;
}

function menuTree(player) {
  return `<div class="menu-grid">${MENU_DEFINITIONS.map((menu) => {
    const locked = player.age < menu.unlockAge;
    const badge = notificationBadge(menu, player);
    return `<details class="menu-card" ${locked ? '' : 'open'}><summary><span>${menu.icon}</span><strong>${menu.label}</strong>${badge ? `<b>${badge}</b>` : ''}${locked ? `<em>Unlocks at ${menu.unlockAge}</em>` : ''}</summary><div>${menu.children.map((child) => `<button class="quick-action" title="Context-sensitive ${child.replace('-', ' ')} action">${child.replaceAll('-', ' ')}</button>`).join('')}</div></details>`;
  }).join('')}</div>`;
}

function notificationBadge(menu, player) {
  if (menu.id === 'relationships') return Object.keys(player.relationships).length;
  if (menu.id === 'legacy') return player.descendants.length;
  if (menu.id === 'health') return player.psyche.trauma.length + player.psyche.addictions.length;
  if (menu.id === 'finance') return player.assets.investments.length + player.assets.liabilities.length;
  return 0;
}

function worldPanel(sim) {
  const economy = sim.world.economy;
  return `<div class="world-grid">
    <article><strong>Technology</strong><span>${pct(sim.world.global.technology)}</span></article>
    <article><strong>Climate Stress</strong><span>${pct(sim.world.global.climate)}</span></article>
    <article><strong>Instability</strong><span>${pct(sim.world.global.instability)}</span></article>
    <article><strong>Inflation</strong><span>${pct(economy.inflation)}</span></article>
    <article><strong>Interest Rate</strong><span>${pct(economy.interestRate)}</span></article>
    <article><strong>Unemployment</strong><span>${pct(economy.unemployment)}</span></article>
  </div><ul class="news">${sim.world.history.slice(0, 4).map((item) => `<li><strong>${item.year}</strong>: ${item.headlines.map(escape).join(' ')}</li>`).join('') || '<li>The world is quiet for now.</li>'}</ul>`;
}

function genetics(player) {
  return `<dl class="facts">
    <dt>Ancestry</dt><dd>${escape(player.genome.ancestry.join(', ') || 'Unknown')}</dd>
    <dt>Eyes / Hair</dt><dd>${escape(player.genome.appearance.eyeColor)} / ${escape(player.genome.appearance.hairTexture)}</dd>
    <dt>Blood</dt><dd>${escape(player.genome.medical.bloodType)}</dd>
    <dt>Risks</dt><dd>Addiction ${pct(player.genome.medical.addictionRisk)}, heart ${pct(player.genome.medical.heartDiseaseRisk)}</dd>
    <dt>Emotion</dt><dd>${escape(player.components.emotions.current)} • ${escape(player.components.emotions.attachmentStyle)}</dd>
  </dl>`;
}

function debugTools(sim, player) {
  const latestNpc = sim.events.journal.find((event) => event.type === 'npc.decision');
  return `<div class="tool-grid">
    <article><strong>Event Inspector</strong><code>${escape(sim.events.journal[0]?.type || 'none')}</code></article>
    <article><strong>NPC Inspector</strong><code>${escape(latestNpc ? `${latestNpc.npcId} → ${latestNpc.goal.label}` : 'waiting')}</code></article>
    <article><strong>Relationship Graph</strong><code>${Object.keys(player.relationships).length} edges</code></article>
    <article><strong>Economy Analyzer</strong><code>${sim.world.economy.markets.map((m) => `${m.label}:${m.index}`).join(' • ')}</code></article>
    <article><strong>Save Schema</strong><code>snapshot-v2, local/cloud adapter ready</code></article>
    <article><strong>Content Editor</strong><code>${MODDING_API.extensionPoints.length} extension points</code></article>
  </div>`;
}

function landing() {
  return `<main class="landing"><p class="eyebrow">Enterprise-scale life simulation platform</p><h1>LifeSim: Legacy Engine</h1><p>Begin before birth, survive complex societies, and continue through infinite descendants in a persistent event-driven world of autonomous NPCs, dynamic economies, politics, health, crime, fame, genetics, faith, business, sports, creativity, and emergent stories.</p><button id="start" class="primary">Start a New Dynasty</button></main>`;
}

function eventCard(event, index) {
  return `<article class="event-card"><p class="eyebrow">${escape(event.stage)} • ${event.tags.map(escape).join(', ')}</p><h3>${escape(event.text)}</h3><div><button data-event="${index}" data-stance="cautious">Cautious</button><button data-event="${index}" data-stance="balanced" class="primary">Balanced</button><button data-event="${index}" data-stance="bold">Bold</button></div></article>`;
}

function statBars(player) {
  return Object.entries(player.stats).map(([key, value]) => {
    const display = key === 'wealth' ? fmtMoney(value) : pct(value);
    const width = key === 'wealth' ? Math.min(100, Math.max(0, value / 10000)) : value;
    return `<label class="stat"><span>${escape(key)}</span><strong>${display}</strong><i><b style="width:${width}%"></b></i></label>`;
  }).join('');
}

function bindStart(app, sim) {
  app.querySelector('#start')?.addEventListener('click', () => { sim.startNewLife(); render(app, sim); });
}

function bindGame(app, sim) {
  app.querySelector('#age-up')?.addEventListener('click', () => { sim.advanceYear(); render(app, sim); });
  app.querySelector('#new-life')?.addEventListener('click', () => { sim.startNewLife(); render(app, sim); });
  app.querySelector('#new-child')?.addEventListener('click', () => { sim.haveChild({ adopted: sim.player?.age > 45 }); render(app, sim); });
  app.querySelector('#save')?.addEventListener('click', () => { localStorage.setItem('lifesim.save', sim.serialize()); sim.log('Saved dynasty locally for cloud-save compatibility adapters.'); render(app, sim); });
  app.querySelector('#load')?.addEventListener('click', async () => { const { LifeSimulation } = await import('../systems/simulation.js'); const saved = localStorage.getItem('lifesim.save'); if (saved) Object.assign(sim, LifeSimulation.load(saved)); render(app, sim); });
  app.querySelectorAll('[data-event]').forEach((button) => button.addEventListener('click', () => { sim.chooseEvent(Number(button.dataset.event), button.dataset.stance); render(app, sim); }));
  app.querySelectorAll('[data-career]').forEach((button) => button.addEventListener('click', () => { sim.acceptCareer(button.dataset.career); render(app, sim); }));
  app.querySelector('.menu-search')?.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    app.querySelectorAll('.menu-card').forEach((card) => { card.hidden = query && !card.textContent.toLowerCase().includes(query); });
  });
}
