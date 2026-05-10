import { LIFE_STAGES, CAREER_TRACKS } from '../data/catalogs.js';
import { applyImpact, addMemory } from './character.js';

export function getLifeStage(age) {
  return LIFE_STAGES.find((stage) => age >= stage.min && age <= stage.max) || LIFE_STAGES.at(-1);
}

const EVENT_LIBRARY = [
  { id: 'prenatal_care', stages: ['prenatal'], tags: ['health', 'family'], text: 'Prenatal conditions shape early development.', impact: { health: 4, happiness: 1 } },
  { id: 'first_words', stages: ['toddler'], tags: ['family'], text: 'You start forming words and emotional bonds.', impact: { intelligence: 2, happiness: 4 } },
  { id: 'bullying', stages: ['childhood', 'preteen', 'teenage'], tags: ['school', 'trauma'], text: 'A bullying incident tests your confidence and support network.', impact: { happiness: -8, stress: 9 } },
  { id: 'gifted_program', stages: ['childhood', 'preteen'], tags: ['school'], text: 'Teachers notice unusual aptitude and offer advanced classes.', impact: { intelligence: 5, stress: 3 } },
  { id: 'prom_drama', stages: ['teenage'], tags: ['school', 'relationship'], text: 'Prom season becomes a swirl of crushes, rumors, and social risk.', impact: { charisma: 3, happiness: 2, stress: 4 } },
  { id: 'startup_pitch', stages: ['young_adult', 'adulthood'], tags: ['business'], text: 'A startup idea attracts mentors, skeptics, and possible investors.', impact: { wealth: 2500, stress: 6, charisma: 3 } },
  { id: 'workplace_scandal', stages: ['adulthood', 'middle_age'], tags: ['career', 'fame'], text: 'Office politics erupt into a reputational scandal.', impact: { fame: 5, happiness: -6, stress: 12 } },
  { id: 'chronic_condition', stages: ['middle_age', 'elder'], tags: ['health'], text: 'A chronic health issue requires treatment, lifestyle changes, and resilience.', impact: { health: -10, stress: 8 } },
  { id: 'legacy_reflection', stages: ['elder'], tags: ['legacy'], text: 'You reflect on descendants, reputation, regrets, and the mark you leave behind.', impact: { happiness: 5, stress: -4 } },
  { id: 'pet_adoption', stages: ['childhood', 'preteen', 'teenage', 'young_adult', 'adulthood'], tags: ['pets', 'family'], text: 'A pet enters your household, changing routines and emotional support.', impact: { happiness: 6, stress: -2 } },
  { id: 'juvenile_mischief', stages: ['preteen', 'teenage'], tags: ['crime', 'school'], text: 'Friends dare you into a risky rule-breaking scheme with possible legal consequences.', impact: { charisma: 2, morality: -4, stress: 5 } },
  { id: 'viral_post', stages: ['teenage', 'young_adult', 'adulthood'], tags: ['social media', 'fame'], text: 'A social post goes unexpectedly viral and attracts followers, trolls, and sponsors.', impact: { fame: 7, happiness: 2, stress: 4 } },
  { id: 'inheritance_conflict', stages: ['adulthood', 'middle_age', 'elder'], tags: ['legacy', 'family', 'finance'], text: 'An inheritance dispute forces the family to negotiate loyalty, law, and money.', impact: { wealth: 3500, happiness: -5, stress: 8 } },
  { id: 'campaign_invite', stages: ['young_adult', 'adulthood', 'middle_age'], tags: ['politics'], text: 'Local organizers ask you to join a campaign shaped by scandals and policy promises.', impact: { charisma: 4, fame: 3, stress: 5 } },
  { id: 'startup_crunch', stages: ['young_adult', 'adulthood', 'middle_age'], tags: ['business', 'technology'], text: 'A business opportunity demands capital, hiring choices, and a high-pressure launch window.', impact: { wealth: 5000, stress: 9, discipline: 2 } },
  { id: 'military_recruiter', stages: ['teenage', 'young_adult'], tags: ['military'], text: 'A military recruiter offers training, travel, risk, and long-term benefits.', impact: { discipline: 5, athleticism: 3, stress: 4 } },
  { id: 'faith_crisis', stages: ['teenage', 'young_adult', 'adulthood', 'middle_age'], tags: ['religion', 'identity'], text: 'A crisis of belief reshapes your community ties and personal identity.', impact: { happiness: -1, intelligence: 2, stress: 3 } },
  { id: 'sports_breakout', stages: ['teenage', 'young_adult'], tags: ['sports', 'fame'], text: 'A standout athletic performance attracts scouts, rivals, and injury risk.', impact: { athleticism: 5, fame: 4, stress: 3 } },
  { id: 'investment_boom', stages: ['young_adult', 'adulthood', 'middle_age', 'elder'], tags: ['finance', 'investments'], text: 'A market boom tempts you to rebalance savings, debt, and speculative investments.', impact: { wealth: 4200, stress: 2 } }
];

export function generatePersonalEvents(character, world, rng) {
  const stage = getLifeStage(character.age);
  const candidates = EVENT_LIBRARY.filter((event) => event.stages.includes(stage.id));
  const events = [];
  if (candidates.length) events.push({ ...rng.pick(candidates), stage: stage.label });

  const country = world.countries.find((item) => item.id === character.countryId);
  if (country?.news?.length && rng.chance(0.45)) {
    events.push({ id: 'world_ripple', stage: stage.label, tags: ['world'], text: country.news[0], impact: { stress: world.global.instability > 60 ? 4 : 1 } });
  }
  if (character.age >= 18 && !character.career.track && rng.chance(0.65)) {
    const track = rng.pick(CAREER_TRACKS);
    events.push({ id: 'career_opening', stage: stage.label, tags: ['career'], text: `A path opens in ${track.name}: ${rng.pick(track.fields)}.`, impact: { stress: 2, wealth: 1200 } });
  }
  if (world.economy?.inflation > 9 && character.age >= 16 && rng.chance(0.45)) {
    events.push({ id: 'inflation_pressure', stage: stage.label, tags: ['finance', 'world'], text: 'Inflation makes rent, groceries, tuition, and family planning harder to manage.', impact: { wealth: -1800, stress: 5 } });
  }
  return events.slice(0, 4);
}

export function resolveEvent(character, world, rng, event, stance = 'balanced') {
  const multiplier = stance === 'bold' ? 1.35 : stance === 'cautious' ? 0.75 : 1;
  const impact = Object.fromEntries(Object.entries(event.impact || {}).map(([key, value]) => [key, Math.round(value * multiplier)]));
  applyImpact(character, impact);
  addMemory(character, world.year, event.text, impact, event.tags);
  if (event.tags?.includes('trauma') && rng.chance(0.4)) character.psyche.trauma.push({ year: world.year, source: event.text, healed: false });
  return impact;
}
