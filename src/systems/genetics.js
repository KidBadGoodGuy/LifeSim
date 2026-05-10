import { clamp } from '../core/random.js';

const TRAITS = {
  eyeColor: { brown: 0.45, blue: 0.22, green: 0.13, hazel: 0.16, amber: 0.04 },
  hairTexture: { straight: 0.38, wavy: 0.34, curly: 0.2, coily: 0.08 },
  bloodType: { 'O+': 0.38, 'A+': 0.34, 'B+': 0.09, 'AB+': 0.03, 'O-': 0.07, 'A-': 0.06, 'B-': 0.02, 'AB-': 0.01 }
};

export function randomGenome(rng, ancestry = []) {
  const pickWeighted = (table) => rng.weighted(Object.entries(table).map(([value, weight]) => ({ value, weight })));
  return {
    ancestry,
    appearance: {
      eyeColor: pickWeighted(TRAITS.eyeColor),
      hairTexture: pickWeighted(TRAITS.hairTexture),
      heightPotential: clamp(rng.normal(50, 17)),
      bodyType: clamp(rng.normal(50, 18))
    },
    inherited: {
      intelligence: clamp(rng.normal(50, 16)),
      creativity: clamp(rng.normal(50, 17)),
      athleticism: clamp(rng.normal(50, 18)),
      resilience: clamp(rng.normal(50, 15)),
      empathy: clamp(rng.normal(50, 16))
    },
    medical: {
      bloodType: pickWeighted(TRAITS.bloodType),
      addictionRisk: clamp(rng.normal(35, 18)),
      heartDiseaseRisk: clamp(rng.normal(30, 17)),
      neurodivergenceChance: clamp(rng.normal(13, 8), 0, 65),
      mutationLoad: clamp(rng.normal(3, 2), 0, 20)
    }
  };
}

export function inheritGenome(parentA, parentB, rng) {
  const blend = (a, b, mutation = 4) => clamp((a + b) / 2 + rng.normal(0, mutation));
  const choose = (a, b, mutationChance = 0.02, fallbackTable) => {
    if (rng.chance(mutationChance)) return rng.weighted(Object.entries(fallbackTable).map(([value, weight]) => ({ value, weight })));
    return rng.chance(0.5) ? a : b;
  };
  const ancestry = [...new Set([...(parentA.ancestry || []), ...(parentB.ancestry || [])])];
  return {
    ancestry,
    appearance: {
      eyeColor: choose(parentA.appearance.eyeColor, parentB.appearance.eyeColor, 0.01, TRAITS.eyeColor),
      hairTexture: choose(parentA.appearance.hairTexture, parentB.appearance.hairTexture, 0.015, TRAITS.hairTexture),
      heightPotential: blend(parentA.appearance.heightPotential, parentB.appearance.heightPotential, 6),
      bodyType: blend(parentA.appearance.bodyType, parentB.appearance.bodyType, 6)
    },
    inherited: Object.fromEntries(Object.keys(parentA.inherited).map((key) => [key, blend(parentA.inherited[key], parentB.inherited[key], 5)])),
    medical: {
      bloodType: choose(parentA.medical.bloodType, parentB.medical.bloodType, 0.005, TRAITS.bloodType),
      addictionRisk: blend(parentA.medical.addictionRisk, parentB.medical.addictionRisk, 7),
      heartDiseaseRisk: blend(parentA.medical.heartDiseaseRisk, parentB.medical.heartDiseaseRisk, 7),
      neurodivergenceChance: blend(parentA.medical.neurodivergenceChance, parentB.medical.neurodivergenceChance, 4),
      mutationLoad: clamp((parentA.medical.mutationLoad + parentB.medical.mutationLoad) / 2 + (rng.chance(0.03) ? rng.float(2, 12) : rng.normal(0, 1)), 0, 30)
    }
  };
}
