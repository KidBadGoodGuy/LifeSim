import { RNG } from '../core/random.js';
import { COUNTRIES, CAREER_TRACKS, EDUCATION_PATHS } from '../data/catalogs.js';
import { createCharacter, addMemory, applyImpact } from './character.js';
import { createWorld, advanceWorld } from './world.js';
import { generatePersonalEvents, resolveEvent, getLifeStage } from './events.js';
import { relationshipDrift, connect } from './relationships.js';

export class LifeSimulation {
  constructor(seed = Date.now()) {
    this.rng = new RNG(seed);
    this.seed = seed;
    this.world = createWorld(this.rng);
    this.characters = [];
    this.playerId = null;
    this.pendingEvents = [];
    this.activityLog = [];
  }

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
    this.pendingEvents = generatePersonalEvents(player, this.world, this.rng);
    addMemory(player, this.world.year, `Conceived in ${player.city}, ${country.name}. Your legacy begins before birth.`, { health: 1 }, ['family', 'prenatal']);
    this.log(`A new bloodline begins in ${player.city}, ${country.name}.`);
    return player;
  }

  get player() {
    return this.characters.find((character) => character.id === this.playerId);
  }

  chooseEvent(index, stance = 'balanced') {
    const event = this.pendingEvents[index];
    if (!event || !this.player?.alive) return null;
    const impact = resolveEvent(this.player, this.world, this.rng, event, stance);
    this.log(`${event.text} (${Object.entries(impact).map(([k, v]) => `${k} ${v >= 0 ? '+' : ''}${v}`).join(', ')})`);
    this.pendingEvents.splice(index, 1);
    return impact;
  }

  advanceYear() {
    const player = this.player;
    if (!player) return;
    if (!player.alive) return this.continueLegacy();

    const headlines = advanceWorld(this.world, this.rng);
    if (headlines.length) this.log(headlines[0]);
    player.age += 1;
    relationshipDrift(player, this.rng);
    this.progressEducation(player);
    this.progressCareer(player);
    this.progressHealth(player);
    this.simulateNpcSociety();
    this.pendingEvents = generatePersonalEvents(player, this.world, this.rng);
    this.checkMortality(player);
    this.log(`Age ${player.age}: entered ${getLifeStage(player.age).label}.`);
    return player;
  }

  progressEducation(character) {
    const agePath = new Map([[0, 'daycare'], [3, 'preschool'], [6, 'elementary'], [11, 'middle_school'], [14, 'high_school'], [18, 'university'], [22, 'graduate_school']]);
    if (agePath.has(character.age)) {
      const path = agePath.get(character.age);
      character.education.path.push(path);
      character.education.gradeAverage = Math.round((character.stats.intelligence * 0.55 + character.stats.discipline * 0.35 + this.rng.normal(8, 10)));
      if (path === 'university') character.education.studentDebt += this.rng.int(0, 65000);
      addMemory(character, this.world.year, `Started ${path.replace('_', ' ')}.`, { intelligence: 1, stress: 1 }, ['school']);
    }
    if (character.age >= 6 && character.age <= 24) applyImpact(character, { intelligence: this.rng.chance(0.6) ? 1 : 0, stress: this.rng.chance(0.25) ? 1 : 0 });
  }

  progressCareer(character) {
    if (character.age === 18 && !character.education.path.includes('university') && this.rng.chance(0.35)) this.acceptCareer(this.rng.pick(CAREER_TRACKS).id);
    if (character.player && character.age >= 20 && character.age <= 42 && this.rng.chance(0.045)) this.haveChild();
    if (character.career.track) {
      character.career.years += 1;
      const track = CAREER_TRACKS.find((item) => item.id === character.career.track);
      const promotionChance = (character.stats.discipline + character.stats.charisma + character.stats.intelligence) / 330;
      if (track && this.rng.chance(promotionChance)) {
        const current = track.fields.indexOf(character.career.title);
        character.career.title = track.fields[Math.min(track.fields.length - 1, current + 1)] || track.fields[0];
        character.career.salary = Math.round(character.career.salary * this.rng.float(1.08, 1.45) + 3000);
        addMemory(character, this.world.year, `Promoted to ${character.career.title}.`, { wealth: character.career.salary / 10, happiness: 3 }, ['career']);
      }
      applyImpact(character, { wealth: Math.round(character.career.salary * 0.18), stress: this.rng.chance(0.3) ? 2 : 0 });
    }
  }

  acceptCareer(trackId) {
    const character = this.player;
    const track = CAREER_TRACKS.find((item) => item.id === trackId);
    if (!character || !track || character.age < 14) {
      this.log('Career paths unlock when the character is old enough to work.');
      return;
    }
    character.career.track = track.id;
    character.career.title = track.fields[0];
    character.career.salary = Math.round(22000 + track.prestige * 600 + this.rng.normal(0, 8000));
    addMemory(character, this.world.year, `Began a career in ${track.name} as ${character.career.title}.`, { wealth: 1500, stress: 3 }, ['career']);
    this.log(`Career selected: ${track.name}.`);
  }

  progressHealth(character) {
    const aging = Math.max(0, character.age - 38) / 18;
    const stressDamage = character.stats.stress / 80;
    const healthcare = this.world.countries.find((c) => c.id === character.countryId)?.healthcare || 50;
    applyImpact(character, { health: Math.round(-aging - stressDamage + healthcare / 120), happiness: character.stats.stress > 75 ? -2 : 0 });
    if (character.genome.medical.addictionRisk > 75 && this.rng.chance(0.02)) character.psyche.addictions.push({ type: this.rng.pick(['alcohol', 'gambling', 'opioids', 'social media']), severity: this.rng.int(20, 80) });
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
    const descendants = this.player.descendants.map((id) => this.characters.find((c) => c.id === id)).filter(Boolean);
    const heir = descendants.find((child) => child.alive);
    if (heir) {
      this.playerId = heir.id;
      heir.player = true;
      this.pendingEvents = generatePersonalEvents(heir, this.world, this.rng);
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
    this.characters.push(coParent, child);
    addMemory(parent, this.world.year, adopted ? `Adopted ${child.firstName} ${child.lastName}.` : `${child.firstName} ${child.lastName} was born, extending the bloodline.`, { happiness: 9, stress: 4 }, ['family', 'legacy', 'parenting']);
    this.log(`${parent.firstName}'s legacy expanded with ${child.firstName} ${child.lastName}.`);
    return child;
  }

  calculateLegacy(character) {
    return Math.round(character.stats.wealth / 10000 + character.stats.fame * 4 + character.memories.length + Object.keys(character.relationships).length * 2 + character.descendants.length * 25);
  }

  simulateNpcSociety() {
    for (const npc of this.characters.filter((c) => !c.player && c.alive)) {
      npc.age += 1;
      if (this.rng.chance(0.08)) applyImpact(npc, { wealth: this.rng.int(-5000, 12000), happiness: this.rng.int(-4, 5) });
      if (npc.age > 70 && this.rng.chance((npc.age - 65) / 900)) npc.alive = false;
    }
  }

  log(message) {
    this.activityLog.unshift({ year: this.world.year, message });
    this.activityLog = this.activityLog.slice(0, 80);
  }

  serialize() {
    return JSON.stringify({ seed: this.seed, rngSeed: this.rng.seed, world: this.world, characters: this.characters, playerId: this.playerId, pendingEvents: this.pendingEvents, activityLog: this.activityLog });
  }

  static load(serialized) {
    const data = JSON.parse(serialized);
    const sim = new LifeSimulation(data.seed);
    sim.rng.seed = data.rngSeed;
    sim.world = data.world;
    sim.characters = data.characters;
    sim.playerId = data.playerId;
    sim.pendingEvents = data.pendingEvents;
    sim.activityLog = data.activityLog;
    return sim;
  }
}

export { EDUCATION_PATHS, CAREER_TRACKS };
