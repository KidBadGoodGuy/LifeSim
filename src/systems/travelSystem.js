import { DomainEvents } from '../core/eventBus.js';

export class TravelSystem {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(player) {
    if (!player) return;
    player.components.identity.travelHistory = player.components.identity.travelHistory || [];
  }

  relocate(player, countryId, city) {
    player.countryId = countryId;
    player.city = city || player.city;
    player.components.identity.travelHistory.push({ year: this.worldProvider().year, countryId, city });
  }
}
