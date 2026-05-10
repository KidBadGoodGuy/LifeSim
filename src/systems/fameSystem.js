import { DomainEvents } from '../core/eventBus.js';

export class FameSystem {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(player) {
    if (!player) return;
    const followers = player.components.socialMedia.followers || 0;
    if (player.stats.fame > 0) player.components.socialMedia.followers = Math.round(followers * 1.08 + player.stats.fame * 25);
  }
}
