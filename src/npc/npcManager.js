import { DomainEvents } from '../core/eventBus.js';
import { createCharacter, applyImpact } from '../systems/character.js';
import { COUNTRIES } from '../data/catalogs.js';
import { ensureNpcMind, simulateNpcDecision } from './npcAI.js';
import { formNpcRelationship } from './npcRelationships.js';

export class NpcManager {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ state }) => this.processYear(state));
  }

  createNpc(countryId) {
    const country = this.worldProvider().countries.find((item) => item.id === countryId) || COUNTRIES[0];
    const npc = createCharacter(this.rng, { country, age: this.rng.int(0, 80) });
    ensureNpcMind(npc, this.rng);
    return npc;
  }

  processYear(state) {
    if (!state) return;
    for (const npc of state.characters.filter((c) => !c.player && c.alive)) {
      npc.age += 1;
      ensureNpcMind(npc, this.rng);
      if (this.rng.chance(0.08)) applyImpact(npc, { wealth: this.rng.int(-5000, 12000), happiness: this.rng.int(-4, 5) });
      if (this.rng.chance(0.14)) this.formRandomRelationship(npc, state.characters);
      if (this.rng.chance(0.35)) {
        const decision = simulateNpcDecision(npc, this.worldProvider(), this.rng, state.characters);
        this.eventBus.publish({ type: DomainEvents.NpcDecision, year: this.worldProvider().year, ...decision });
      }
      if (npc.age > 70 && this.rng.chance((npc.age - 65) / 900)) npc.alive = false;
    }
  }

  formRandomRelationship(npc, characters) {
    const target = this.rng.pick(characters.filter((candidate) => candidate.id !== npc.id && candidate.alive));
    if (target && !npc.relationships[target.id]) formNpcRelationship(npc, target, this.rng, this.rng.pick(['friend', 'coworker', 'neighbor', 'rival']));
  }
}
