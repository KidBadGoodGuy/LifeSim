import { CAREER_TRACKS } from '../data/catalogs.js';
import { getLifeStage } from '../systems/events.js';

const pct = (value) => `${Math.round(value)}%`;
const fmtMoney = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export function render(app, sim) {
  const player = sim.player;
  if (!player) {
    app.innerHTML = landing();
    bindStart(app, sim);
    return;
  }

  app.innerHTML = `
    <header class="hero">
      <section>
        <p class="eyebrow">LifeSim Legacy Engine • ${sim.world.era} timeline • ${sim.world.year}</p>
        <h1>${player.firstName} ${player.lastName}</h1>
        <p class="subtitle">${player.alive ? `${getLifeStage(player.age).label}, age ${player.age}` : `Deceased at ${player.age}`} in ${player.city}. Ambition: ${player.psyche.ambition}. Fear: ${player.psyche.fear}.</p>
      </section>
      <div class="hero-actions">
        <button id="age-up" class="primary">Age Up One Year</button>
        <button id="save">Save</button>
        <button id="load">Load</button>
        <button id="new-child">Have / Adopt Child</button>
        <button id="new-life">New Dynasty</button>
      </div>
    </header>
    <main class="dashboard">
      <section class="panel span-2">
        <h2>Dynamic Event Cards</h2>
        <div class="event-grid">${sim.pendingEvents.map((event, index) => eventCard(event, index)).join('') || '<p>No unresolved events. Age up to let the world move.</p>'}</div>
      </section>
      <section class="panel">
        <h2>Core Stats</h2>
        ${statBars(player)}
      </section>
      <section class="panel">
        <h2>Identity & Genetics</h2>
        <dl class="facts">
          <dt>Archetype</dt><dd>${player.psyche.archetype}</dd>
          <dt>Ancestry</dt><dd>${player.genome.ancestry.join(', ') || 'Unknown'}</dd>
          <dt>Eyes / Hair</dt><dd>${player.genome.appearance.eyeColor} / ${player.genome.appearance.hairTexture}</dd>
          <dt>Blood Type</dt><dd>${player.genome.medical.bloodType}</dd>
          <dt>Inherited Risks</dt><dd>Addiction ${pct(player.genome.medical.addictionRisk)}, heart ${pct(player.genome.medical.heartDiseaseRisk)}</dd>
        </dl>
      </section>
      <section class="panel">
        <h2>Education</h2>
        <p>${player.education.path.map((path) => path.replace('_', ' ')).join(' → ') || 'Not enrolled yet.'}</p>
        <p>Grade average: ${player.education.gradeAverage ?? 'n/a'} • Student debt: ${fmtMoney(player.education.studentDebt)}</p>
      </section>
      <section class="panel">
        <h2>Career & Economy</h2>
        <p><strong>${player.career.title}</strong>${player.career.track ? ` • ${player.career.years} years • ${fmtMoney(player.career.salary)}/yr` : ''}</p>
        <div class="career-list">${CAREER_TRACKS.map((track) => `<button class="career" data-career="${track.id}">${track.name}</button>`).join('')}</div>
      </section>
      <section class="panel span-2">
        <h2>World Simulation</h2>
        <div class="world-grid">
          <article><strong>Technology</strong><span>${pct(sim.world.global.technology)}</span></article>
          <article><strong>Climate Stress</strong><span>${pct(sim.world.global.climate)}</span></article>
          <article><strong>Instability</strong><span>${pct(sim.world.global.instability)}</span></article>
          <article><strong>Pandemic Risk</strong><span>${pct(sim.world.global.pandemicRisk)}</span></article>
        </div>
        <ul class="news">${sim.world.history.slice(0, 4).map((item) => `<li><strong>${item.year}</strong>: ${item.headlines.join(' ')}</li>`).join('') || '<li>The world is quiet for now.</li>'}</ul>
      </section>
      <section class="panel">
        <h2>Relationships</h2>
        <ul class="compact">${Object.values(player.relationships).map((rel) => `<li>${rel.name}: ${rel.type}, ${pct(rel.strength)} bond, ${pct(rel.trust)} trust</li>`).join('') || '<li>No relationships yet.</li>'}</ul>
      </section>
      <section class="panel">
        <h2>Legacy, Memories & Trauma</h2>
        <p>Legacy score: ${sim.calculateLegacy(player)} • Descendants: ${player.descendants.length} • Traumas: ${player.psyche.trauma.length}</p>
        <ul class="compact">${player.memories.slice(0, 7).map((memory) => `<li><strong>${memory.year}</strong>: ${memory.title}</li>`).join('')}</ul>
      </section>
      <section class="panel span-2">
        <h2>Simulation Log</h2>
        <ol class="log">${sim.activityLog.map((entry) => `<li><strong>${entry.year}</strong> ${entry.message}</li>`).join('')}</ol>
      </section>
    </main>`;
  bindGame(app, sim);
}

function landing() {
  return `<main class="landing"><p class="eyebrow">Next-generation life simulation platform</p><h1>LifeSim: Legacy Engine</h1><p>Begin before birth, survive complex societies, and continue through infinite descendants in a living world of families, careers, politics, disasters, technology, fame, crime, faith, economics, and emergent stories.</p><button id="start" class="primary">Start a New Dynasty</button></main>`;
}

function eventCard(event, index) {
  return `<article class="event-card"><p class="eyebrow">${event.stage} • ${event.tags.join(', ')}</p><h3>${event.text}</h3><div><button data-event="${index}" data-stance="cautious">Cautious</button><button data-event="${index}" data-stance="balanced" class="primary">Balanced</button><button data-event="${index}" data-stance="bold">Bold</button></div></article>`;
}

function statBars(player) {
  return Object.entries(player.stats).map(([key, value]) => {
    const display = key === 'wealth' ? fmtMoney(value) : pct(value);
    const width = key === 'wealth' ? Math.min(100, Math.max(0, value / 10000)) : value;
    return `<label class="stat"><span>${key}</span><strong>${display}</strong><i><b style="width:${width}%"></b></i></label>`;
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
}
