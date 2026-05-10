import { CAREER_TRACKS, MENU_DEFINITIONS } from '../data/catalogs.js';

const REQUIRED_MENUS = ['activities', 'relationships', 'career', 'education', 'crime', 'health', 'finance', 'assets', 'fame', 'politics', 'military', 'travel', 'social', 'legacy', 'settings'];
const escape = (value) => String(value ?? '').replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value || 0);

export function visibleMenus(player) {
  return REQUIRED_MENUS.map((id) => MENU_DEFINITIONS.find((menu) => menu.id === id) || fallbackMenu(id))
    .map((menu) => ({ ...menu, locked: player.age < menu.unlockAge }));
}

export function renderMenuButtons(player) {
  return `<section class="menu-dock" aria-label="Life menus">
    ${visibleMenus(player).map((menu) => `<button class="menu-button" data-menu="${menu.id}" ${menu.locked ? 'disabled' : ''}><span>${menu.icon}</span>${escape(menu.label)}${menu.locked ? `<small>Age ${menu.unlockAge}+</small>` : ''}</button>`).join('')}
  </section>`;
}

export function renderPanel(sim, panelId = 'activities', filter = '', sort = 'relevance') {
  const player = sim.player;
  const menu = visibleMenus(player).find((item) => item.id === panelId) || visibleMenus(player)[0];
  const rows = panelRows(sim, menu.id)
    .filter((row) => !filter || `${row.label} ${row.detail}`.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => sort === 'az' ? a.label.localeCompare(b.label) : (b.priority || 0) - (a.priority || 0));
  return `<aside class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="panel-title">
    <div class="modal-header"><div><p class="eyebrow">${escape(menu.label)} Menu</p><h2 id="panel-title">${menu.icon} ${escape(menu.label)}</h2></div><button id="close-panel" aria-label="Close menu">×</button></div>
    <div class="panel-controls"><input id="panel-filter" value="${escape(filter)}" placeholder="Filter options" /><select id="panel-sort"><option value="relevance" ${sort === 'relevance' ? 'selected' : ''}>Sort: relevance</option><option value="az" ${sort === 'az' ? 'selected' : ''}>Sort: A-Z</option></select></div>
    <div class="submenu-list">${rows.map((row) => `<article class="submenu-card"><strong>${escape(row.label)}</strong><p>${escape(row.detail)}</p>${row.action ? `<button data-action="${row.action}" data-value="${escape(row.value || '')}">${escape(row.cta || 'Choose')}</button>` : ''}</article>`).join('') || '<p>No relevant options at this age or state.</p>'}</div>
  </aside>`;
}

function panelRows(sim, id) {
  const p = sim.player;
  const relationshipRows = Object.values(p.relationships).map((rel) => ({ label: rel.name, detail: `${rel.type}: ${Math.round(rel.strength)} bond, ${Math.round(rel.trust)} trust, ${Math.round(rel.love || 0)} love`, priority: rel.strength }));
  const rows = {
    activities: [
      { label: 'Mind & Body', detail: 'Meditate, exercise, clubs, hobbies, pets, vacations, and chance encounters.', priority: 90 },
      { label: 'Have or Adopt Child', detail: p.age >= 16 ? 'Expand the legacy with biological or adopted children.' : 'Unlocks when old enough to parent.', action: p.age >= 16 ? 'child' : null, cta: 'Add child', priority: 70 }
    ],
    relationships: relationshipRows,
    career: CAREER_TRACKS.map((track) => ({ label: track.name, detail: `${track.fields.join(' → ')}. Skills: ${track.skills.join(', ')}. Demand ${track.demand}%.`, action: p.age >= 14 ? 'career' : null, value: track.id, cta: p.career.track === track.id ? 'Current' : 'Apply', priority: track.demand })),
    education: p.education.path.map((path, index) => ({ label: path.replaceAll('_', ' '), detail: `Grade average ${p.education.gradeAverage ?? 'n/a'}, student debt ${money(p.education.studentDebt)}.`, priority: 100 - index })).concat([{ label: 'School Options', detail: 'Clubs, scholarships, studying, exchange programs, and graduate paths unlock by age.' }]),
    crime: [{ label: 'Petty Crime', detail: `Wanted level ${p.components.legal.wantedLevel}. Criminal reputation ${p.components.reputation.criminal}.`, action: p.age >= 12 ? 'crime' : null, cta: 'Attempt' }],
    health: [{ label: 'Physical Health', detail: `${Math.round(p.stats.health)} health, fitness ${Math.round(p.components.health.fitness)}, conditions ${p.components.health.chronicConditions.length}.` }, { label: 'Mental Health', detail: `${Math.round(p.components.health.mentalHealth ?? p.stats.happiness)} mental health, trauma ${p.psyche.trauma.length}, addictions ${p.psyche.addictions.length}.` }],
    finance: [{ label: 'Cashflow', detail: `${money(p.stats.wealth)} cash, ${money(p.career.salary)} salary, adjusted wealth ${money(p.assets.inflationAdjustedWealth ?? p.stats.wealth)}.` }, { label: 'Loans & Debt', detail: `${p.assets.liabilities.length} liabilities, student debt ${money(p.education.studentDebt)}.` }],
    assets: [{ label: 'Homes', detail: `${p.assets.homes.length} properties owned.` }, { label: 'Investments', detail: `${p.assets.investments.length} positions.` }],
    fame: [{ label: 'Public Image', detail: `${Math.round(p.stats.fame)} fame, ${p.components.socialMedia.followers || 0} followers.` }],
    politics: [{ label: 'Public Service', detail: `Public reputation ${p.components.reputation.public}. Run campaigns through politics careers.` }],
    military: [{ label: 'Service', detail: p.career.track === 'military' ? `${p.career.title}, discipline ${Math.round(p.stats.discipline)}.` : 'Enlist through the Military career track.' }],
    travel: [{ label: 'Travel History', detail: `${p.components.identity.travelHistory?.length || 0} moves or trips recorded. Citizenship: ${p.components.identity.citizenships.join(', ')}.` }],
    social: [{ label: 'Platforms', detail: `${p.components.socialMedia.platforms.length} platforms, engagement ${p.components.socialMedia.engagement}.` }],
    legacy: [{ label: 'Bloodline', detail: `${p.descendants.length} descendants, legacy score ${sim.calculateLegacy(p)}.` }],
    settings: [{ label: 'Manual Save', detail: 'Write a version-safe save slot including NPCs and world state.', action: 'save', cta: 'Save' }, { label: 'Manual Load', detail: 'Load the manual save slot if it exists.', action: 'load', cta: 'Load' }]
  };
  return rows[id] || [];
}

function fallbackMenu(id) {
  return { id, label: id[0].toUpperCase() + id.slice(1), icon: '•', unlockAge: 0, children: [] };
}
