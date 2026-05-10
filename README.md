# LifeSim: Legacy Engine

A polished, modular, browser-playable vertical slice of a next-generation life simulator inspired by BitLife, The Sims, Crusader Kings, RimWorld, Dwarf Fortress, GTA roleplay systems, Civilization, and AI storytelling engines.

The game begins before birth, progresses year by year, evolves an independent world simulation, and is designed for infinite dynasties through descendants, legacy scoring, inherited traits, family reputation, and expandable systems.

## Implemented Systems

- Deterministic simulation engine with replayable seeded worlds.
- Prenatal-to-elder life stages and yearly aging loop.
- Domain-event bus with a replayable journal for world ticks, NPC decisions, event resolutions, family changes, career changes, economy updates, and saves.
- Dynamic event cards with cautious, balanced, and bold responses.
- Genetics engine with inherited appearance, intelligence, creativity, athleticism, resilience, empathy, medical risks, ancestry, mutation load, and blood type.
- Character model with memories, trauma, ambitions, fears, habits, addictions, relationships, education, career, assets, criminal record, descendants, and legacy score.
- Independent world evolution for technology, climate, instability, pandemics, housing, governments, religions, syndicates, economies, public health, markets, inflation, unemployment, and global news.
- Education progression from daycare through graduate school with grades, debt, and school memories.
- Career tracks for medicine, law, engineering, crime, entertainment, politics, space exploration, skilled trades, sports, military, entrepreneurship, and academia with promotions, salary, stress, fame, satisfaction, skill, and market-demand hooks.
- Relationship graph with memory-bearing interactions, trust, bond strength, attraction, rivalries, drift, and autonomous NPC relationship influence.
- Parenting and dynasty continuation hooks with biological inheritance, adoption fallback, descendants, and legacy transfer.
- Versioned snapshot persistence with schema normalization, local save/load, event-journal preservation, and future cloud-save adapters.
- Responsive, accessible, mobile-friendly UI with event cards, timelines, stats, world panels, memories, relationships, career controls, virtualized-style lists, searchable hierarchical menus, notification badges, quick actions, and simulation log.
- Developer tooling panels for event inspection, NPC inspection, relationship graph counts, economy analysis, save schema inspection, and content-editor extension points.
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
