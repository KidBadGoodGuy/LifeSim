import { DomainEvents } from '../core/eventBus.js';
import { clamp } from '../core/random.js';
import { relationshipDrift, rememberInteraction } from './relationships.js';

export class RelationshipsSystem {
  constructor({ eventBus, rng }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ state, player }) => this.processYear(state, player));
  }

  processYear(_state, player) {
    if (!player) return;
    relationshipDrift(player, this.rng);
    for (const rel of Object.values(player.relationships)) {
      rel.friendship = clamp(rel.friendship ?? rel.strength);
      rel.love = clamp(rel.love ?? (rel.type.includes('partner') || rel.type.includes('romance') ? rel.strength : 0));
      rel.trust = clamp(rel.trust ?? rel.strength);
      rel.betrayals = rel.betrayals || 0;
      rel.emotionalHistory = rel.emotionalHistory || rel.history || [];
      if (rel.trust < 20 && rel.strength < 25) rel.type = rel.type.includes('family') ? rel.type : 'estranged contact';
      if (rel.betrayals > 0 && rel.trust > 65) rel.reconciled = true;
    }
  }

  interact(actor, target, summary, delta = 0, { betrayal = false, love = 0 } = {}) {
    rememberInteraction(actor, target, summary.year || 0, summary.text || summary, delta);
    const rel = actor.relationships[target.id];
    if (!rel) return null;
    rel.friendship = clamp((rel.friendship ?? rel.strength) + delta);
    rel.love = clamp((rel.love ?? 0) + love);
    rel.trust = clamp((rel.trust ?? rel.strength) + delta / 2 - (betrayal ? 18 : 0));
    rel.betrayals = (rel.betrayals || 0) + (betrayal ? 1 : 0);
    return rel;
  }
}
