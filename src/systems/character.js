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
    components: {
      identity: { legalNames: [], citizenships: country ? [country.id] : [], religion: country ? rng.pick(country.religions) : 'Unknown', languages: [] },
      emotions: { happinessTrend: [], current: rng.pick(['calm', 'curious', 'anxious', 'hopeful', 'lonely']), attachmentStyle: rng.pick(['secure', 'anxious', 'avoidant', 'disorganized']) },
      reputation: { public: 0, criminal: 0, academic: 0, professional: 0, family: rng.int(10, 70) },
      health: { chronicConditions: [], disabilities: [], medications: [], sleepQuality: rng.int(35, 95), fitness: 0, nutrition: rng.int(25, 90) },
      legal: { wantedLevel: 0, courtCases: [], prisonTerms: [], parole: null },
      socialMedia: { platforms: [], followers: 0, controversies: [], engagement: rng.int(0, 12) },
      legacy: { bloodlineTraits: [], inheritancePlan: null, estateTaxExposure: 0 }
    },
    education: { path: [], gradeAverage: null, studentDebt: 0, achievements: [], teachers: [], rivals: [], scholarships: [] },
    career: { track: null, title: 'Unborn', salary: 0, satisfaction: 50, years: 0, scandals: [], coworkers: [], retirement: null },
    assets: { homes: [], vehicles: [], businesses: [], investments: [], bankAccounts: [{ type: 'checking', balance: rng.int(0, 2500) }], liabilities: [] },
    memories: [],
    longTermMemoryGraph: { nodes: [], edges: [] },
    criminalRecord: [],
    descendants: [],
    legacyScore: 0
  };
  character.stats.intelligence = clamp((character.stats.intelligence + character.genome.inherited.intelligence) || character.genome.inherited.intelligence);
  character.stats.creativity = character.genome.inherited.creativity;
  character.stats.athleticism = character.genome.inherited.athleticism;
  character.components.health.fitness = clamp((character.stats.athleticism + character.genome.inherited.resilience) / 2);
  character.components.legacy.bloodlineTraits = Object.entries(character.genome.inherited).filter(([, value]) => value >= 70).map(([key]) => key);
  return character;
}

export function addMemory(character, year, title, impact = {}, tags = []) {
  const memory = { id: `mem_${year}_${character.memories.length}`, year, title, impact, tags, intensity: Math.max(1, Math.round(Object.values(impact).reduce((sum, value) => sum + Math.abs(value), 0) / 10)) };
  character.memories.unshift(memory);
  character.memories = character.memories.slice(0, 90);
  if (character.longTermMemoryGraph) {
    character.longTermMemoryGraph.nodes.unshift({ id: memory.id, label: title, year, tags, intensity: memory.intensity });
    character.longTermMemoryGraph.nodes = character.longTermMemoryGraph.nodes.slice(0, 160);
  }
}

export function applyImpact(character, impact) {
  for (const [key, value] of Object.entries(impact)) {
    if (key in character.stats) character.stats[key] = clamp(character.stats[key] + value, key === 'wealth' ? -1000000000 : 0, key === 'wealth' ? 1000000000 : 100);
  }
}
