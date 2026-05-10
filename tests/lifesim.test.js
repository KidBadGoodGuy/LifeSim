import test from 'node:test';
import assert from 'node:assert/strict';
import { RNG } from '../src/core/random.js';
import { randomGenome, inheritGenome } from '../src/systems/genetics.js';
import { LifeSimulation } from '../src/systems/simulation.js';

test('RNG is deterministic for replayable simulations', () => {
  const a = new RNG(42);
  const b = new RNG(42);
  assert.deepEqual([a.next(), a.int(1, 10), a.chance(0.5)], [b.next(), b.int(1, 10), b.chance(0.5)]);
});

test('genetics blends parent traits and preserves ancestry', () => {
  const rng = new RNG(7);
  const parentA = randomGenome(rng, ['Japan']);
  const parentB = randomGenome(rng, ['Brazil']);
  const child = inheritGenome(parentA, parentB, rng);
  assert(child.ancestry.includes('Japan'));
  assert(child.ancestry.includes('Brazil'));
  assert(child.inherited.intelligence >= 0 && child.inherited.intelligence <= 100);
  assert(child.medical.mutationLoad >= 0 && child.medical.mutationLoad <= 30);
});

test('simulation starts before birth and advances through early life', () => {
  const sim = new LifeSimulation(1234);
  const player = sim.startNewLife({ countryId: 'usa' });
  assert.equal(player.age, -1);
  assert(sim.pendingEvents.length > 0);
  sim.chooseEvent(0, 'balanced');
  sim.advanceYear();
  assert.equal(sim.player.age, 0);
  assert(sim.player.memories.length >= 2);
});

test('world evolves independently while NPCs age', () => {
  const sim = new LifeSimulation(99);
  sim.startNewLife({ countryId: 'india' });
  const initialYear = sim.world.year;
  const initialTech = sim.world.global.technology;
  const parentAge = sim.characters.find((c) => !c.player).age;
  sim.advanceYear();
  assert.equal(sim.world.year, initialYear + 1);
  assert.notEqual(sim.world.global.technology, initialTech);
  assert.equal(sim.characters.find((c) => !c.player).age, parentAge + 1);
});

test('save and load preserves player, world, and pending events', () => {
  const sim = new LifeSimulation(2026);
  sim.startNewLife({ countryId: 'japan', era: 'future' });
  sim.advanceYear();
  const loaded = LifeSimulation.load(sim.serialize());
  assert.equal(loaded.player.id, sim.player.id);
  assert.equal(loaded.world.year, sim.world.year);
  assert.deepEqual(loaded.pendingEvents, sim.pendingEvents);
});

test('descendants can be created and inherit the active bloodline', () => {
  const sim = new LifeSimulation(555);
  sim.startNewLife({ countryId: 'brazil' });
  sim.player.age = 30;
  const child = sim.haveChild();
  assert(child);
  assert(sim.player.descendants.includes(child.id));
  assert.equal(child.lastName, sim.player.lastName);
  assert(child.genome.ancestry.length > 0);
});

test('event journal records domain events and versioned saves', () => {
  const sim = new LifeSimulation(8080);
  sim.startNewLife({ countryId: 'usa' });
  sim.advanceYear();
  const payload = JSON.parse(sim.serialize());
  assert.equal(payload.version, 2);
  assert(sim.events.journal.some((event) => event.type === 'time.yearAdvanced'));
  assert(payload.domainJournal.some((event) => event.type === 'time.yearAdvanced'));
});

test('economy and autonomous NPC decisions evolve during yearly ticks', () => {
  const sim = new LifeSimulation(9090);
  sim.startNewLife({ countryId: 'india' });
  const initialInflation = sim.world.economy.inflation;
  for (let i = 0; i < 4; i += 1) sim.advanceYear();
  assert.notEqual(sim.world.economy.inflation, initialInflation);
  assert(sim.characters.filter((character) => !character.player).some((npc) => npc.ai?.decisionHistory?.length > 0));
});
