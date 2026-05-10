import { DomainEvents } from '../core/eventBus.js';

export class AssetsSystem {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(player) {
    if (!player) return;
    for (const home of player.assets.homes) home.value = Math.round(home.value * (1 + (this.worldProvider().economy.inflation || 3) / 200));
  }

  buyHome(player, home) {
    player.assets.homes.push({ id: `home_${Date.now()}`, ...home });
  }
}
