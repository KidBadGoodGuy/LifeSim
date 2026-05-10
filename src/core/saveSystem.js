export const SAVE_SCHEMA_VERSION = 2;
const SLOT_PREFIX = 'lifesim.save.slot.';

export class SaveSystem {
  constructor(storage = safeStorage()) {
    this.storage = storage;
  }

  createSnapshot(state, { seed, rngSeed, domainJournal = [] } = {}) {
    return {
      version: SAVE_SCHEMA_VERSION,
      createdAt: new Date().toISOString(),
      seed,
      rngSeed,
      world: state.world,
      characters: state.characters,
      playerId: state.playerId,
      pendingEvents: state.pendingEvents,
      activityLog: state.activityLog,
      domainJournal
    };
  }

  serialize(state, options = {}) {
    return JSON.stringify(this.createSnapshot(state, options));
  }

  normalize(serialized) {
    const data = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
    const version = data.version || 1;
    return {
      version,
      createdAt: data.createdAt || new Date(0).toISOString(),
      seed: data.seed,
      rngSeed: data.rngSeed ?? data.seed,
      world: data.world,
      characters: data.characters || [],
      playerId: data.playerId,
      pendingEvents: data.pendingEvents || [],
      activityLog: data.activityLog || [],
      domainJournal: data.domainJournal || []
    };
  }

  saveSlot(slot, payload) {
    this.storage?.setItem(`${SLOT_PREFIX}${slot}`, payload);
    return payload;
  }

  loadSlot(slot) {
    const payload = this.storage?.getItem(`${SLOT_PREFIX}${slot}`);
    return payload ? this.normalize(payload) : null;
  }

  listSlots() {
    if (!this.storage) return [];
    return Object.keys(this.storage).filter((key) => key.startsWith(SLOT_PREFIX)).map((key) => key.replace(SLOT_PREFIX, ''));
  }
}

export function safeStorage() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}
