/**
 * Lightweight domain-event bus used by the simulation layer.
 * Handlers are deterministic and synchronous by default so seeded simulations
 * stay replayable; infrastructure adapters can mirror events to workers later.
 */
export class EventBus {
  constructor() {
    this.handlers = new Map();
    this.journal = [];
  }

  subscribe(type, handler) {
    const handlers = this.handlers.get(type) || [];
    handlers.push(handler);
    this.handlers.set(type, handlers);
    return () => this.handlers.set(type, (this.handlers.get(type) || []).filter((item) => item !== handler));
  }

  publish(event) {
    const stamped = { ...event, sequence: this.journal.length + 1 };
    this.journal.unshift(stamped);
    this.journal = this.journal.slice(0, 500);
    for (const handler of this.handlers.get(stamped.type) || []) handler(stamped);
    for (const handler of this.handlers.get('*') || []) handler(stamped);
    return stamped;
  }
}

export const DomainEvents = Object.freeze({
  LifeStarted: 'life.started',
  YearAdvanced: 'time.yearAdvanced',
  WorldAdvanced: 'world.advanced',
  CharacterAged: 'character.aged',
  EventResolved: 'event.resolved',
  CareerChanged: 'career.changed',
  ChildAdded: 'family.childAdded',
  NpcDecision: 'npc.decision',
  EconomyUpdated: 'economy.updated',
  SaveCreated: 'persistence.saveCreated'
});
