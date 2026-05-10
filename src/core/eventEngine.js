import { LIFE_EVENT_LIBRARY } from '../data/events/lifeEvents.js';
import { CAREER_TRACKS } from '../data/catalogs.js';
import { applyImpact, addMemory } from '../systems/character.js';
import { getLifeStage } from '../systems/events.js';

export class EventEngine {
  constructor(eventBus, rng, library = LIFE_EVENT_LIBRARY) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.library = library;
  }

  generate(character, world) {
    const stage = getLifeStage(character.age);
    const weighted = this.library.filter((event) => this.matches(event, character, world, stage));
    const events = [];
    if (weighted.length) events.push(this.toRuntimeEvent(this.weightedPick(weighted), character, world, stage));

    const country = world.countries.find((item) => item.id === character.countryId);
    if (country?.news?.length && this.rng.chance(0.45)) {
      events.push(this.toRuntimeEvent({
        id: 'world_ripple', title: 'World Ripple', description: country.news[0], tags: ['world'], probabilityWeight: 45,
        conditions: {}, choices: [{ id: 'adapt', label: 'Adapt', consequences: { stress: world.global.instability > 60 ? 4 : 1 } }], persistence: false
      }, character, world, stage));
    }
    if (character.age >= 18 && !character.career.track && this.rng.chance(0.65)) {
      const track = this.rng.pick(CAREER_TRACKS);
      events.push(this.toRuntimeEvent({
        id: 'career_opening', title: 'Career Opening', description: `A path opens in ${track.name}: ${this.rng.pick(track.fields)}.`, tags: ['career'], probabilityWeight: 65,
        conditions: { minAge: 18 }, choices: [{ id: 'apply', label: 'Apply', consequences: { stress: 2, wealth: 1200 } }], persistence: true
      }, character, world, stage));
    }
    if (world.economy?.inflation > 9 && character.age >= 16 && this.rng.chance(0.45)) {
      events.push(this.toRuntimeEvent({
        id: 'inflation_pressure', title: 'Inflation Pressure', description: 'Inflation makes rent, groceries, tuition, and family planning harder to manage.', tags: ['finance', 'world'], probabilityWeight: 45,
        conditions: { minAge: 16, minInflation: 9 }, choices: [{ id: 'budget', label: 'Budget', consequences: { wealth: -1800, stress: 5 } }], persistence: false
      }, character, world, stage));
    }
    return events.slice(0, 4);
  }

  resolve(character, world, event, stance = 'balanced') {
    const choice = event.choices?.[0] || { consequences: event.consequences || event.impact || {} };
    const multiplier = stance === 'bold' ? 1.35 : stance === 'cautious' ? 0.75 : 1;
    const impact = Object.fromEntries(Object.entries(choice.consequences || {}).map(([key, value]) => [key, Math.round(value * multiplier)]));
    applyImpact(character, impact);
    addMemory(character, world.year, event.description || event.text, impact, event.tags || []);
    if (event.persistence && character.longTermMemoryGraph) {
      character.longTermMemoryGraph.edges.unshift({ from: event.id, to: character.id, type: 'persistent_event', year: world.year });
      character.longTermMemoryGraph.edges = character.longTermMemoryGraph.edges.slice(0, 160);
    }
    if (event.tags?.includes('trauma') && this.rng.chance(0.4)) character.psyche.trauma.push({ year: world.year, source: event.description || event.text, healed: false });
    return impact;
  }

  matches(event, character, world, stage) {
    const conditions = event.conditions || {};
    if (conditions.stages && !conditions.stages.includes(stage.id)) return false;
    if (conditions.minAge !== undefined && character.age < conditions.minAge) return false;
    if (conditions.maxAge !== undefined && character.age > conditions.maxAge) return false;
    if (conditions.minInflation !== undefined && (world.economy?.inflation || 0) < conditions.minInflation) return false;
    return true;
  }

  weightedPick(events) {
    const total = events.reduce((sum, event) => sum + (event.probabilityWeight || 1), 0);
    let roll = this.rng.float(0, total);
    for (const event of events) {
      roll -= event.probabilityWeight || 1;
      if (roll <= 0) return event;
    }
    return events.at(-1);
  }

  toRuntimeEvent(event, character, world, stage) {
    const primary = event.choices?.[0]?.consequences || event.consequences || {};
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      conditions: event.conditions || {},
      choices: event.choices || [{ id: 'continue', label: 'Continue', consequences: primary }],
      consequences: primary,
      probabilityWeight: event.probabilityWeight || 1,
      persistence: Boolean(event.persistence),
      tags: event.tags || [],
      stage: stage.label,
      text: event.description,
      impact: primary,
      year: world.year,
      characterId: character.id
    };
  }
}
