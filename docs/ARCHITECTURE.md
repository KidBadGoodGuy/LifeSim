# LifeSim: Legacy Engine Architecture

LifeSim is structured as a data-driven simulation platform rather than a one-off text game. The current implementation is a playable vertical slice that establishes expansion seams for country packs, careers, historical eras, custom scenarios, multiplayer adapters, and AI-authored story modules.

## Layers

- **Core utilities** (`src/core`): deterministic random generation, clamps, and stable IDs for replayable saves.
- **Data catalogs** (`src/data`): countries, life stages, education paths, career tracks, event tags, and future database seed data.
- **Systems** (`src/systems`): isolated simulation modules for characters, genetics, relationships, events, world evolution, and save/load orchestration.
- **UI** (`src/ui`): renderer and interaction binding. The UI consumes the simulation API and can be replaced by React, native mobile, or server-rendered clients.
- **Tests** (`tests`): Node test suite for determinism, inheritance, life progression, world evolution, and serialization.

## Entity Model

```text
World 1---* Country 1---* City
World 1---* Organization
World 1---* Character
Character *---* CharacterRelationship
Character 1---* Memory
Character 1---1 Genome
Character 1---1 EducationProfile
Character 1---1 CareerProfile
Character 1---* Asset
Character 1---* Descendant
```

## Expansion Hooks

1. Add country, state, city, government, economy, religion, and school seed data to `src/data/catalogs.js` or a future database adapter.
2. Add new event cards to `EVENT_LIBRARY` in `src/systems/events.js` with tags, life-stage gates, and stat impacts.
3. Add simulation modules by exposing a pure `advanceX(world, characters, rng)` function and invoking it from `LifeSimulation.advanceYear()`.
4. Add cloud saves by replacing `localStorage` calls in `src/ui/render.js` with an adapter that persists `LifeSimulation.serialize()`.
5. Add AI conversation/story generation as an event provider that returns the same event-card contract used by procedural events.

## Save Schema

The save payload includes the seed, current RNG state, world state, characters, active player, pending events, and activity log. This keeps saves portable and compatible with cloud synchronization.
