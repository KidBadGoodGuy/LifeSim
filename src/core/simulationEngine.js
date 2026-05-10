import { RNG } from './random.js';
import { EventBus, DomainEvents } from './eventBus.js';
import { StateManager } from './stateManager.js';
import { TimeManager } from './timeManager.js';
import { SaveSystem } from './saveSystem.js';
import { EventEngine } from './eventEngine.js';
import { COUNTRIES, CAREER_TRACKS } from '../data/catalogs.js';
import { createCharacter, addMemory } from '../systems/character.js';
import { createWorld, advanceWorld } from '../systems/world.js';
import { connect } from '../systems/relationships.js';
import { getLifeStage } from '../systems/events.js';
import { RelationshipsSystem } from '../systems/relationshipsSystem.js';
import { EducationSystem } from '../systems/educationSystem.js';
import { CareerSystem } from '../systems/careerSystem.js';
import { HealthSystem } from '../systems/healthSystem.js';
import { FinanceSystem } from '../systems/financeSystem.js';
import { CrimeSystem } from '../systems/crimeSystem.js';
import { FameSystem } from '../systems/fameSystem.js';
import { AssetsSystem } from '../systems/assetsSystem.js';
import { PoliticsSystem } from '../systems/politicsSystem.js';
import { MilitarySystem } from '../systems/militarySystem.js';
import { TravelSystem } from '../systems/travelSystem.js';
import { NpcManager } from '../npc/npcManager.js';
import { ensureNpcMind } from '../npc/npcAI.js';

export class SimulationEngine {
  constructor(seed = Date.now(), { storage = undefined } = {}) {
    this.rng = new RNG(seed);
    this.seed = seed;
    this.events = new EventBus();
    this.stateManager = new StateManager(this.emptyState());
    this.time = new TimeManager(this.events);
    this.saveSystem = new SaveSystem(storage);
    this.eventEngine = new EventEngine(this.events, this.rng);
    this.installSystems();
  }

  emptyState() {
    return { world: createWorld(this.rng), characters: [], playerId: null, pendingEvents: [], activityLog: [], autosave: null };
  }

  installSystems() {
    const ctx = { eventBus: this.events, rng: this.rng, worldProvider: () => this.world, playerProvider: () => this.player };
    this.systems = {
      relationships: new RelationshipsSystem(ctx),
      education: new EducationSystem(ctx),
      career: new CareerSystem(ctx),
      health: new HealthSystem(ctx),
      finance: new FinanceSystem(ctx),
      crime: new CrimeSystem(ctx),
      fame: new FameSystem(ctx),
      assets: new AssetsSystem(ctx),
      politics: new PoliticsSystem(ctx),
      military: new MilitarySystem(ctx),
      travel: new TravelSystem(ctx),
      npc: new NpcManager(ctx)
    };
  }

  get state() { return this.stateManager.getState(); }
  get world() { return this.state.world; }
  set world(value) { this.state.world = value; }
  get characters() { return this.state.characters; }
  set characters(value) { this.state.characters = value; }
  get playerId() { return this.state.playerId; }
  set playerId(value) { this.state.playerId = value; }
  get pendingEvents() { return this.state.pendingEvents; }
  set pendingEvents(value) { this.state.pendingEvents = value; }
  get activityLog() { return this.state.activityLog; }
  set activityLog(value) { this.state.activityLog = value; }
  get player() { return this.characters.find((character) => character.id === this.playerId); }

  startNewLife({ countryId = 'usa', era = 'modern' } = {}) {
    this.world = createWorld(this.rng, { era, startYear: era === 'medieval' ? 1200 : era === 'future' ? 2150 : 2026 });
    const country = COUNTRIES.find((item) => item.id === countryId) || this.rng.pick(COUNTRIES);
    const parentA = createCharacter(this.rng, { country, age: this.rng.int(18, 45) });
    const parentB = createCharacter(this.rng, { country, age: this.rng.int(18, 45) });
    const player = createCharacter(this.rng, { country, parents: [parentA, parentB], player: true, age: -1 });
    connect(player, parentA, 'parent', this.rng, this.rng.int(45, 95));
    connect(player, parentB, 'parent', this.rng, this.rng.int(45, 95));
    this.characters = [player, parentA, parentB];
    this.playerId = player.id;
    for (const character of this.characters) ensureNpcMind(character, this.rng);
    this.pendingEvents = this.eventEngine.generate(player, this.world);
    this.activityLog = [];
    addMemory(player, this.world.year, `Conceived in ${player.city}, ${country.name}. Your legacy begins before birth.`, { health: 1 }, ['family', 'prenatal']);
    this.log(`A new bloodline begins in ${player.city}, ${country.name}.`);
    this.events.publish({ type: DomainEvents.LifeStarted, year: this.world.year, characterId: player.id, countryId: country.id });
    return player;
  }

  chooseEvent(index, stance = 'balanced') {
    const event = this.pendingEvents[index];
    if (!event || !this.player?.alive) return null;
    const impact = this.eventEngine.resolve(this.player, this.world, event, stance);
    this.log(`${event.description || event.text} (${Object.entries(impact).map(([k, v]) => `${k} ${v >= 0 ? '+' : ''}${v}`).join(', ')})`);
    this.events.publish({ type: DomainEvents.EventResolved, year: this.world.year, characterId: this.player.id, eventId: event.id, stance, impact });
    this.pendingEvents.splice(index, 1);
    return impact;
  }

  advanceYear() {
    const player = this.player;
    if (!player) return null;
    if (!player.alive) return this.continueLegacy();

    const headlines = advanceWorld(this.world, this.rng);
    if (headlines.length) this.log(headlines[0]);
    this.events.publish({ type: DomainEvents.WorldAdvanced, year: this.world.year, headlines });
    this.events.publish({ type: DomainEvents.EconomyUpdated, year: this.world.year, economy: this.world.economy });

    const agedPlayer = this.time.ageOneYear(this.state);
    this.events.publish({ type: DomainEvents.YearTickStarted, year: this.world.year, state: this.state, player: agedPlayer });
    if (agedPlayer.age === 18 && !agedPlayer.education.path.includes('university') && this.rng.chance(0.35)) this.acceptCareer(this.rng.pick(CAREER_TRACKS).id);
    if (agedPlayer.player && agedPlayer.age >= 20 && agedPlayer.age <= 42 && this.rng.chance(0.045)) this.haveChild();
    this.pendingEvents = this.eventEngine.generate(agedPlayer, this.world);
    this.checkMortality(agedPlayer);
    this.log(`Age ${agedPlayer.age}: entered ${getLifeStage(agedPlayer.age).label}.`);
    this.autosave('autosave');
    this.events.publish({ type: DomainEvents.YearAdvanced, year: this.world.year, characterId: agedPlayer.id, age: agedPlayer.age, lifeStage: getLifeStage(agedPlayer.age).id });
    this.events.publish({ type: DomainEvents.UiUpdated, year: this.world.year });
    return agedPlayer;
  }

  acceptCareer(trackId) {
    const ok = this.systems.career.acceptCareer(trackId, this.player);
    this.log(ok ? `Career selected: ${CAREER_TRACKS.find((track) => track.id === trackId)?.name}.` : 'Career paths unlock when the character is old enough to work.');
    return ok;
  }

  checkMortality(character) {
    if (character.age < 50) return;
    const mortality = Math.max(0, (character.age - 65) / 550 + (50 - character.stats.health) / 1000 + character.genome.medical.heartDiseaseRisk / 5000);
    if (this.rng.chance(mortality)) {
      character.alive = false;
      character.causeOfDeath = character.stats.health < 30 ? 'complications from declining health' : 'natural causes';
      character.legacyScore = this.calculateLegacy(character);
      addMemory(character, this.world.year, `Died from ${character.causeOfDeath}.`, {}, ['death', 'legacy']);
      this.log(`${character.firstName} died at ${character.age}. Legacy score: ${character.legacyScore}.`);
    }
  }

  continueLegacy() {
    const current = this.player;
    const descendants = current.descendants.map((id) => this.characters.find((c) => c.id === id)).filter(Boolean);
    const heir = descendants.find((child) => child.alive);
    if (heir) {
      current.player = false;
      this.playerId = heir.id;
      heir.player = true;
      this.pendingEvents = this.eventEngine.generate(heir, this.world);
      this.log(`Legacy continues through ${heir.firstName} ${heir.lastName}.`);
    }
    return heir;
  }

  haveChild({ adopted = false } = {}) {
    const parent = this.player;
    if (!parent || !parent.alive || parent.age < 16) return null;
    const country = COUNTRIES.find((item) => item.id === parent.countryId) || COUNTRIES[0];
    const coParent = createCharacter(this.rng, { country, age: Math.max(16, parent.age + this.rng.int(-5, 5)) });
    const child = createCharacter(this.rng, { country, parents: adopted ? [] : [parent, coParent], age: 0 });
    if (adopted) child.lastName = parent.lastName;
    connect(parent, child, adopted ? 'adopted child' : 'child', this.rng, this.rng.int(65, 100));
    connect(coParent, child, adopted ? 'guardian' : 'parent', this.rng, this.rng.int(35, 90));
    parent.descendants.push(child.id);
    ensureNpcMind(coParent, this.rng);
    ensureNpcMind(child, this.rng);
    this.characters.push(coParent, child);
    addMemory(parent, this.world.year, adopted ? `Adopted ${child.firstName} ${child.lastName}.` : `${child.firstName} ${child.lastName} was born, extending the bloodline.`, { happiness: 9, stress: 4 }, ['family', 'legacy', 'parenting']);
    this.log(`${parent.firstName}'s legacy expanded with ${child.firstName} ${child.lastName}.`);
    this.events.publish({ type: DomainEvents.ChildAdded, year: this.world.year, parentId: parent.id, childId: child.id, adopted });
    return child;
  }

  calculateLegacy(character) {
    return Math.round(character.stats.wealth / 10000 + character.stats.fame * 4 + character.memories.length + Object.keys(character.relationships).length * 2 + character.descendants.length * 25);
  }

  log(message) {
    this.activityLog.unshift({ year: this.world.year, message });
    this.activityLog = this.activityLog.slice(0, 80);
  }

  serialize() {
    const serialized = this.saveSystem.serialize(this.state, { seed: this.seed, rngSeed: this.rng.seed, domainJournal: this.events.journal });
    this.events.publish({ type: DomainEvents.SaveCreated, year: this.world.year, characterId: this.playerId });
    return serialized;
  }

  saveSlot(slot = 'manual') {
    return this.saveSystem.saveSlot(slot, this.serialize());
  }

  loadSlot(slot = 'manual') {
    const data = this.saveSystem.loadSlot(slot);
    if (!data) return false;
    this.loadData(data);
    return true;
  }

  autosave(slot = 'autosave') {
    this.state.autosave = { slot, year: this.world.year, createdAt: new Date().toISOString() };
    const payload = this.saveSystem.serialize(this.state, { seed: this.seed, rngSeed: this.rng.seed, domainJournal: this.events.journal });
    this.saveSystem.saveSlot(slot, payload);
    this.events.publish({ type: DomainEvents.AutoSaveCreated, year: this.world.year, characterId: this.playerId, slot });
    return payload;
  }

  loadData(data) {
    const normalized = this.saveSystem.normalize(data);
    this.seed = normalized.seed;
    this.rng.seed = normalized.rngSeed;
    this.stateManager.replace({
      world: normalized.world,
      characters: normalized.characters,
      playerId: normalized.playerId,
      pendingEvents: normalized.pendingEvents,
      activityLog: normalized.activityLog,
      autosave: null
    }, { source: 'saveSystem' });
    this.events.journal = normalized.domainJournal || [];
    return this;
  }

  static load(serialized) {
    const engine = new SimulationEngine(1);
    return engine.loadData(serialized);
  }
}
