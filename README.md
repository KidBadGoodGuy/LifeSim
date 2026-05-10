# LifeSim: Legacy Engine

A polished, modular, browser-playable vertical slice of a next-generation life simulator inspired by BitLife, The Sims, Crusader Kings, RimWorld, Dwarf Fortress, GTA roleplay systems, Civilization, and AI storytelling engines.

The game begins before birth, progresses year by year, evolves an independent world simulation, and is designed for infinite dynasties through descendants, legacy scoring, inherited traits, family reputation, and expandable systems.

## Implemented Systems

- Deterministic simulation engine with replayable seeded worlds.
- Prenatal-to-elder life stages and yearly aging loop.
- Dynamic event cards with cautious, balanced, and bold responses.
- Genetics engine with inherited appearance, intelligence, creativity, athleticism, resilience, empathy, medical risks, ancestry, mutation load, and blood type.
- Character model with memories, trauma, ambitions, fears, habits, addictions, relationships, education, career, assets, criminal record, descendants, and legacy score.
- Independent world evolution for technology, climate, instability, pandemics, housing, economies, public health, and global news.
- Education progression from daycare through graduate school with grades, debt, and school memories.
- Career tracks for medicine, law, engineering, crime, entertainment, politics, space exploration, and skilled trades with promotions, salary, stress, fame, and satisfaction hooks.
- Relationship graph with memory-bearing interactions, trust, bond strength, attraction, rivalries, and drift.
- Parenting and dynasty continuation hooks with biological inheritance, adoption fallback, descendants, and legacy transfer.
- Local save/load serialization compatible with future cloud-save adapters.
- Responsive, accessible, mobile-friendly UI with event cards, timelines, stats, world panels, memories, relationships, career controls, and simulation log.
- Node test suite covering determinism, genetics, simulation progression, world changes, and save/load.

## Run

```bash
npm start
```

Then open <http://localhost:4173>.

## Test

```bash
npm test
```

## Architecture

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the module map, entity relationship model, save schema, and expansion hooks.
