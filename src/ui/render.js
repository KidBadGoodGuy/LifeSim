import { mainScreen } from './mainScreen.js';

export function render(app, sim, ui = {}) {
  app.innerHTML = sim.player ? mainScreen(sim, ui) : landing();
  sim.player ? bindGame(app, sim, ui) : bindStart(app, sim);
}

function landing() {
  return `<main class="landing"><p class="eyebrow">LifeSim Engine</p><h1>LifeSim</h1><p>A modular, event-driven life simulation with persistent NPCs, relationships, careers, health, finance, legacy, and a menu-driven interface.</p><button id="start" class="primary">Start a New Life</button></main>`;
}

function bindStart(app, sim) {
  app.querySelector('#start')?.addEventListener('click', () => { sim.startNewLife(); render(app, sim); });
}

function bindGame(app, sim, ui) {
  const rerender = (next = ui) => render(app, sim, next);
  app.querySelector('#age-up')?.addEventListener('click', () => { sim.advanceYear(); rerender({}); });
  app.querySelectorAll('[data-event]').forEach((button) => button.addEventListener('click', () => { sim.chooseEvent(Number(button.dataset.event), button.dataset.stance); rerender(ui); }));
  app.querySelectorAll('[data-menu]').forEach((button) => button.addEventListener('click', () => rerender({ openPanel: button.dataset.menu, filter: '', sort: 'relevance' })));
  app.querySelector('#close-panel')?.addEventListener('click', () => rerender({}));
  app.querySelector('#panel-filter')?.addEventListener('input', (event) => rerender({ ...ui, filter: event.target.value }));
  app.querySelector('#panel-sort')?.addEventListener('change', (event) => rerender({ ...ui, sort: event.target.value }));
  app.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.action === 'career') sim.acceptCareer(button.dataset.value);
    if (button.dataset.action === 'child') sim.haveChild({ adopted: sim.player?.age > 45 });
    if (button.dataset.action === 'crime') sim.systems.crime.commitCrime(sim.player);
    if (button.dataset.action === 'save') sim.saveSlot('manual');
    if (button.dataset.action === 'load') sim.loadSlot('manual');
    rerender(ui);
  }));
}
