import { COUNTRIES } from '../data/catalogs.js';
import { id, clamp } from '../core/random.js';

export function createWorld(rng, { startYear = 2026, era = 'modern' } = {}) {
  return {
    id: id('world', rng),
    year: startYear,
    era,
    countries: COUNTRIES.map((country) => ({
      ...country,
      technology: era === 'future' ? 82 : era === 'medieval' ? 12 : 58,
      climateStress: rng.int(10, 52),
      publicHealth: country.healthcare,
      warFatigue: rng.int(0, 20),
      housingIndex: rng.int(45, 130),
      news: []
    })),
    global: { climate: 41, technology: era === 'future' ? 85 : 58, instability: 26, internetCulture: 66, pandemicRisk: 8 },
    organizations: {
      businesses: [], governments: [], criminalSyndicates: [], religions: [], sportsLeagues: [], entertainmentStudios: []
    },
    history: []
  };
}

export function advanceWorld(world, rng) {
  world.year += 1;
  world.global.technology = clamp(world.global.technology + rng.float(0.15, 1.35), 0, 100);
  world.global.climate = clamp(world.global.climate + rng.float(0.05, 0.8), 0, 100);
  world.global.instability = clamp(world.global.instability + rng.normal(0, 3), 0, 100);
  world.global.pandemicRisk = clamp(world.global.pandemicRisk + rng.normal(0, 2.5), 0, 100);

  const headlines = [];
  if (rng.chance(world.global.climate / 250)) headlines.push('Extreme weather disrupts housing, migration, and insurance markets.');
  if (rng.chance(world.global.pandemicRisk / 350)) headlines.push('A contagious outbreak pressures hospitals and remote work systems.');
  if (rng.chance(world.global.instability / 300)) headlines.push('A regional conflict reshapes trade routes and military recruitment.');
  if (rng.chance(world.global.technology / 260)) headlines.push('A breakthrough in AI, robotics, or medicine creates new careers.');

  for (const country of world.countries) {
    country.economy = clamp(country.economy + rng.normal(0.3, 4), 0, 100);
    country.stability = clamp(country.stability + rng.normal(0, 3.5) - world.global.instability / 80, 0, 100);
    country.technology = clamp((country.technology + world.global.technology) / 2 + rng.normal(0, 2), 0, 100);
    country.climateStress = clamp(country.climateStress + rng.normal(world.global.climate / 160, 2), 0, 100);
    country.housingIndex = Math.max(10, Math.round(country.housingIndex * (1 + rng.normal(country.economy - 50, 18) / 1000)));
    country.news = headlines.slice(-3);
  }

  if (headlines.length) world.history.unshift({ year: world.year, headlines });
  world.history = world.history.slice(0, 150);
  return headlines;
}
