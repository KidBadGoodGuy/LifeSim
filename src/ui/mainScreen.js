import { renderMenuButtons, renderPanel } from './menuSystem.js';

const pct = (value) => `${Math.round(value)}%`;
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);
const escape = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

export function mainScreen(sim, ui = {}) {
  const p = sim.player;
  const status = p.career.track ? `${p.career.title} (${money(p.career.salary)}/yr)` : (p.education.path.at(-1)?.replaceAll('_', ' ') || (p.age < 0 ? 'Unborn' : 'Unemployed'));
  return `<main class="life-screen">
    <section class="summary-card">
      <div><p class="eyebrow">${escape(p.city)} • ${escape(p.psyche.archetype)}</p><h1>${escape(p.firstName)} ${escape(p.lastName)}</h1></div>
      <dl class="vitals"><div><dt>Age</dt><dd>${p.age < 0 ? 'Prenatal' : p.age}</dd></div><div><dt>Health</dt><dd>${pct(p.stats.health)}</dd></div><div><dt>Happiness</dt><dd>${pct(p.stats.happiness)}</dd></div><div><dt>Money</dt><dd>${money(p.stats.wealth)}</dd></div><div><dt>Status</dt><dd>${escape(status)}</dd></div></dl>
      <button id="age-up" class="primary age-button">Age Up</button>
    </section>
    <section class="feed-card"><h2>Event Feed</h2>${eventFeed(sim)}</section>
    ${renderMenuButtons(p)}
    ${ui.openPanel ? renderPanel(sim, ui.openPanel, ui.filter, ui.sort) : ''}
  </main>`;
}

function eventFeed(sim) {
  const pending = sim.pendingEvents.map((event, index) => `<article class="event-card"><p class="eyebrow">${escape(event.stage)} • ${escape(event.tags.join(', '))}</p><h3>${escape(event.title || event.id)}</h3><p>${escape(event.description || event.text)}</p><div><button data-event="${index}" data-stance="cautious">Cautious</button><button class="primary" data-event="${index}" data-stance="balanced">Balanced</button><button data-event="${index}" data-stance="bold">Bold</button></div></article>`).join('');
  const logs = sim.activityLog.slice(0, 6).map((entry) => `<li><strong>${entry.year}</strong> ${escape(entry.message)}</li>`).join('');
  return `${pending || '<p>No urgent decisions. Age up to simulate the next year.</p>'}<ol class="log">${logs}</ol>`;
}
