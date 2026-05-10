import { clamp, id } from '../core/random.js';
import { inheritGenome, randomGenome } from './genetics.js';

const FIRST_NAMES = ['Avery', 'Maya', 'Elijah', 'Sofia', 'Noah', 'Amara', 'Kai', 'Lina', 'Mateo', 'Zara', 'Hiro', 'Nia'];
const LAST_NAMES = ['Rivers', 'Okafor', 'Tanaka', 'Patel', 'Silva', 'Morgan', 'Chen', 'Garcia', 'Khan', 'Novak'];

export function createCharacter(rng, { parents = [], country, player = false, age = -1 } = {}) {
  const genome = parents.length === 2
    ? inheritGenome(parents[0].genome, parents[1].genome, rng)
    : randomGenome(rng, country ? [country.name] : []);
  const character = {
    id: id('char', rng),
    player,
    firstName: rng.pick(FIRST_NAMES),
    lastName: parents[0]?.lastName || rng.pick(LAST_NAMES),
    age,
    alive: true,
    causeOfDeath: null,
    countryId: country?.id,
    city: country ? rng.pick(country.cities) : 'Unknown',
    genome,
    stats: {
      health: clamp(rng.normal(82, 11)), happiness: clamp(rng.normal(62, 18)), stress: clamp(rng.normal(26, 14)),
      intelligence: 0, creativity: 0, looks: clamp(rng.normal(55, 18)), athleticism: 0,
      discipline: clamp(rng.normal(47, 18)), charisma: clamp(rng.normal(50, 18)), morality: clamp(rng.normal(52, 22)), wealth: rng.int(0, 4000), fame: 0
    },
    psyche: {
      archetype: rng.pick(['dreamer', 'strategist', 'rebel', 'caretaker', 'survivor', 'performer', 'scholar']),
      ambition: rng.pick(['security', 'fame', 'love', 'power', 'knowledge', 'freedom', 'legacy']),
      fear: rng.pick(['abandonment', 'failure', 'poverty', 'illness', 'irrelevance', 'betrayal']),
      trauma: [], habits: [], addictions: [], beliefs: [], emotionalMemory: [], selfEsteem: clamp(rng.normal(54, 20))
    },
    relationships: {},
    education: { path: [], gradeAverage: null, studentDebt: 0, achievements: [] },
    career: { track: null, title: 'Unborn', salary: 0, satisfaction: 50, years: 0, scandals: [] },
    assets: { homes: [], vehicles: [], businesses: [], investments: [] },
    memories: [],
    criminalRecord: [],
    descendants: [],
    legacyScore: 0
  };
  character.stats.intelligence = clamp((character.stats.intelligence + character.genome.inherited.intelligence) || character.genome.inherited.intelligence);
  character.stats.creativity = character.genome.inherited.creativity;
  character.stats.athleticism = character.genome.inherited.athleticism;
  return character;
}

export function addMemory(character, year, title, impact = {}, tags = []) {
  character.memories.unshift({ year, title, impact, tags, intensity: Math.max(1, Math.round(Object.values(impact).reduce((sum, value) => sum + Math.abs(value), 0) / 10)) });
  character.memories = character.memories.slice(0, 90);
}

export function applyImpact(character, impact) {
  for (const [key, value] of Object.entries(impact)) {
    if (key in character.stats) character.stats[key] = clamp(character.stats[key] + value, key === 'wealth' ? -1000000000 : 0, key === 'wealth' ? 1000000000 : 100);
  }
}
