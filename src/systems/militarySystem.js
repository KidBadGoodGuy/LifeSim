import { DomainEvents } from '../core/eventBus.js';

export class MilitarySystem {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(player) {
    if (!player) return;
    if (player.career.track === 'military') player.stats.discipline = Math.min(100, player.stats.discipline + 1);
  }
}
