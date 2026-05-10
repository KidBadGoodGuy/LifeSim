import { clamp, id } from '../core/random.js';
import { ASSET_CLASSES, BUSINESS_SECTORS } from '../data/catalogs.js';

export function seedEconomy(rng, countries) {
  return {
    inflation: clamp(rng.normal(3, 1.8), -5, 35),
    interestRate: clamp(rng.normal(4, 1.5), 0, 30),
    unemployment: clamp(rng.normal(6, 2), 1, 35),
    markets: ASSET_CLASSES.map((asset) => ({ ...asset, index: rng.int(65, 145), volatility: rng.float(0.01, 0.16), history: [] })),
    sectors: BUSINESS_SECTORS.map((sector) => ({ ...sector, demand: rng.int(35, 90), margin: rng.float(0.06, 0.32), regulation: rng.int(10, 80) })),
    banks: countries.map((country) => ({ id: id('bank', rng), countryId: country.id, liquidity: rng.int(40, 95), creditTightness: rng.int(10, 70) }))
  };
}

export function advanceEconomy(world, rng) {
  const shock = rng.normal(0, 1);
  world.economy.inflation = clamp(world.economy.inflation + rng.normal(0, 0.9) + world.global.instability / 180, -8, 45);
  world.economy.interestRate = clamp(world.economy.interestRate + rng.normal(0, 0.5) + (world.economy.inflation - 3) / 20, 0, 35);
  world.economy.unemployment = clamp(world.economy.unemployment + rng.normal(0, 0.8) - world.global.technology / 300 + world.global.instability / 220, 1, 45);

  const headlines = [];
  if (world.economy.inflation > 10 && rng.chance(0.28)) headlines.push('High inflation squeezes households, wages, savings, and mortgage approvals.');
  if (world.economy.unemployment > 12 && rng.chance(0.22)) headlines.push('A labor-market downturn changes career openings and criminal opportunity.');

  for (const market of world.economy.markets) {
    const countryMomentum = world.countries.reduce((sum, country) => sum + country.economy, 0) / world.countries.length - 50;
    const returnRate = rng.normal(countryMomentum / 900 - world.economy.interestRate / 900 + shock / 100, market.volatility);
    market.index = Math.max(1, Math.round(market.index * (1 + returnRate)));
    market.history.unshift({ year: world.year, index: market.index });
    market.history = market.history.slice(0, 60);
  }

  for (const sector of world.economy.sectors) {
    sector.demand = clamp(sector.demand + rng.normal(0, 5) + (world.global.technology - 50) / 70, 0, 100);
    sector.margin = clamp(sector.margin + rng.normal(0, 0.02), 0.01, 0.55);
  }
  return headlines;
}
