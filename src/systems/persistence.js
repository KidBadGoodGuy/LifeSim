export const SAVE_SCHEMA_VERSION = 2;

export function createSaveSnapshot(simulation) {
  return {
    version: SAVE_SCHEMA_VERSION,
    createdAt: new Date().toISOString(),
    seed: simulation.seed,
    rngSeed: simulation.rng.seed,
    world: simulation.world,
    characters: simulation.characters,
    playerId: simulation.playerId,
    pendingEvents: simulation.pendingEvents,
    activityLog: simulation.activityLog,
    domainJournal: simulation.events?.journal || []
  };
}

export function serializeSnapshot(simulation) {
  return JSON.stringify(createSaveSnapshot(simulation));
}

export function normalizeLoadedSnapshot(serialized) {
  const data = typeof serialized === 'string' ? JSON.parse(serialized) : serialized;
  if (!data.version) data.version = 1;
  if (!data.domainJournal) data.domainJournal = [];
  return data;
}
