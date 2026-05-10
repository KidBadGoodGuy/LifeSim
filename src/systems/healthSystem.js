import { DomainEvents } from '../core/eventBus.js';
import { applyImpact, addMemory } from './character.js';

export class HealthSystem {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(character) {
    if (!character) return;
    const aging = Math.max(0, character.age - 38) / 18;
    const stressDamage = character.stats.stress / 80;
    const healthcare = this.worldProvider().countries.find((c) => c.id === character.countryId)?.healthcare || 50;
    const mentalHealth = Math.max(0, Math.min(100, (character.components.health.mentalHealth ?? character.stats.happiness) - character.stats.stress / 35 + this.rng.normal(0, 2)));
    character.components.health.mentalHealth = mentalHealth;
    applyImpact(character, { health: Math.round(-aging - stressDamage + healthcare / 120), happiness: character.stats.stress > 75 ? -2 : 0 });
    if (character.genome.medical.addictionRisk > 75 && this.rng.chance(0.02) && !character.psyche.addictions.length) character.psyche.addictions.push({ type: this.rng.pick(['alcohol', 'gambling', 'opioids', 'social media']), severity: this.rng.int(20, 80) });
    if (character.age > 45 && this.rng.chance((character.age - 40) / 900)) character.components.health.chronicConditions.push({ year: this.worldProvider().year, name: this.rng.pick(['hypertension', 'arthritis', 'anxiety disorder', 'diabetes']), managed: false });
    if (character.components.health.mentalHealth < 25 && this.rng.chance(0.25)) addMemory(character, this.worldProvider().year, 'Mental health required extra care and support.', { stress: 2, happiness: -2 }, ['health', 'mental-health']);
  }
}
