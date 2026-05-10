import { DomainEvents } from '../core/eventBus.js';

export class PoliticsSystem {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(player) {
    if (!player) return;
    if (player.career.track === 'politics') player.components.reputation.public = Math.min(100, player.components.reputation.public + this.rng.int(0, 3));
  }
}
