import { clamp } from '../core/random.js';

export function connect(a, b, type, rng, strength = rng.int(25, 85)) {
  a.relationships[b.id] = a.relationships[b.id] || { id: b.id, name: `${b.firstName} ${b.lastName}`, type, strength, trust: strength, attraction: rng.int(0, 100), history: [] };
  b.relationships[a.id] = b.relationships[a.id] || { id: a.id, name: `${a.firstName} ${a.lastName}`, type, strength, trust: strength, attraction: rng.int(0, 100), history: [] };
}

export function rememberInteraction(a, b, year, summary, delta = 0) {
  const rel = a.relationships[b.id];
  if (!rel) return;
  rel.strength = clamp(rel.strength + delta);
  rel.trust = clamp(rel.trust + delta / 2);
  rel.history.unshift({ year, summary, delta });
  rel.history = rel.history.slice(0, 30);
}

export function relationshipDrift(character, rng) {
  for (const rel of Object.values(character.relationships)) {
    const drift = rng.normal(rel.type === 'rival' ? -1 : 0.2, 2.2);
    rel.strength = clamp(rel.strength + drift);
    if (rel.strength < 15 && rel.type === 'friend') rel.type = 'estranged friend';
    if (rel.strength > 84 && rel.type === 'rival') rel.type = 'complicated rival';
  }
}
