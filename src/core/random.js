/** Deterministic pseudo-random utilities for replayable worlds, saves, and tests. */
export class RNG {
  constructor(seed = Date.now()) {
    this.seed = seed >>> 0;
  }

  next() {
    this.seed = (1664525 * this.seed + 1013904223) >>> 0;
    return this.seed / 0x100000000;
  }

  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  float(min, max) {
    return this.next() * (max - min) + min;
  }

  chance(probability) {
    return this.next() < probability;
  }

  pick(items) {
    return items[this.int(0, items.length - 1)];
  }

  weighted(entries) {
    const total = entries.reduce((sum, item) => sum + item.weight, 0);
    let roll = this.float(0, total);
    for (const entry of entries) {
      roll -= entry.weight;
      if (roll <= 0) return entry.value;
    }
    return entries.at(-1).value;
  }

  normal(mean = 0, deviation = 1) {
    const u = 1 - this.next();
    const v = this.next();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return mean + z * deviation;
  }
}

export const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, value));
export const id = (prefix, rng) => `${prefix}_${Math.floor(rng.next() * 36 ** 8).toString(36).padStart(8, '0')}`;
