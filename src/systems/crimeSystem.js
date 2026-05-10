import { DomainEvents } from '../core/eventBus.js';

export class CrimeSystem {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(player) {
    if (!player) return;
    player.components.legal.wantedLevel = Math.max(0, player.components.legal.wantedLevel - 1);
  }

  commitCrime(player, crime = 'petty theft') {
    player.criminalRecord.push({ year: this.worldProvider().year, crime, detected: this.rng.chance(0.35) });
    if (player.criminalRecord.at(-1).detected) player.components.legal.wantedLevel += 1;
  }
}
