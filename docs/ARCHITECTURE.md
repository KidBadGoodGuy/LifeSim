# LifeSim: Legacy Engine Architecture

LifeSim is now structured as an event-driven life-simulation platform rather than a one-off text game. The browser build is a playable vertical slice, but the code is organized around production expansion seams: deterministic world simulation, autonomous NPCs, modular domain systems, normalized save snapshots, configurable content catalogs, and UI menus that can be replaced by React Native, a backend API, web workers, or cloud persistence adapters.

## Design Principles

- **Domain-driven modules:** characters, genetics, world, economy, AI, relationships, events, persistence, and UI are isolated behind small APIs.
- **Event-driven simulation:** `EventBus` publishes domain events for age advancement, world ticks, NPC decisions, career changes, family expansion, resolved story events, economy updates, and saves.
- **Component-style entities:** characters contain identity, emotions, reputation, health, legal, social-media, and legacy components alongside stats and relationships.
- **Config-driven content:** countries, careers, education, menu definitions, business sectors, asset classes, event tags, and modding metadata live in catalogs.
- **Deterministic replayability:** all simulation decisions use the seeded `RNG`; save files preserve RNG state.
- **UI/simulation separation:** `src/ui/render.js` consumes the simulation API and contains no simulation rules.

## Runtime Layers

```text
src/core
  random.js       seeded RNG, clamps, stable IDs
  eventBus.js     synchronous deterministic domain-event journal

src/data
  catalogs.js     countries, life stages, careers, menus, markets, mod API

src/systems
  simulation.js   application service/orchestrator
  character.js    entity factory, stat impacts, memory graph writes
  genetics.js     inheritance, mutation, medical risk, ancestry
  relationships.js weighted graph relationships and interaction memory
  events.js       procedural event generation and branching outcomes
  world.js        countries, governments, religions, syndicates, macro ticks
  economy.js      inflation, rates, unemployment, markets, sectors, banks
  ai.js           utility-AI goals, NPC decisions, emotional/social memory
  persistence.js  snapshot schema, serialization, migration normalization

src/ui
  render.js       mobile-first component renderer, menus, debug surfaces
```

## Simulation Tick Pipeline

Every `advanceYear()` call follows a deterministic pipeline:

1. Advance macro world year.
2. Update climate, technology, instability, pandemic risk, politics, housing, and country news.
3. Advance economy: inflation, interest rates, unemployment, markets, banks, and sectors.
4. Publish world/economy domain events.
5. Age the player and run education, career, health, mortality, and relationship drift systems.
6. Simulate autonomous NPC aging and utility-AI decisions.
7. Generate context-sensitive personal events.
8. Persist memory graph nodes and append domain events for tooling.

## Entity Relationship Model

```text
World 1---* Country 1---* City
World 1---* Government
World 1---* CriminalSyndicate
World 1---* Religion
World 1---1 Economy 1---* Market
World 1---* Bank
World 1---* Character
Character *---* RelationshipEdge
Character 1---* MemoryGraphNode
Character 1---1 Genome
Character 1---1 EducationProfile
Character 1---1 CareerProfile
Character 1---1 AssetPortfolio
Character 1---1 ReputationComponent
Character 1---1 HealthComponent
Character 1---1 LegalComponent
Character 1---1 SocialMediaComponent
Character 1---* Descendant
```

## Database Schema Blueprint

The current build stores snapshots in local storage; a production backend can normalize the same structure into these tables:

```sql
worlds(id, seed, year, era, global_json, created_at, updated_at)
countries(id, world_id, name, economy, stability, healthcare, housing_index, climate_stress, news_json)
organizations(id, world_id, country_id, type, name, stats_json)
economy_ticks(id, world_id, year, inflation, interest_rate, unemployment, markets_json)
characters(id, world_id, player_flag, first_name, last_name, age, alive, country_id, city, stats_json, components_json)
genomes(character_id, ancestry_json, appearance_json, inherited_json, medical_json)
relationships(character_id, related_character_id, type, strength, trust, attraction, history_json)
memories(id, character_id, year, title, impact_json, tags_json, intensity)
education_profiles(character_id, path_json, grade_average, student_debt, achievements_json)
career_profiles(character_id, track, title, salary, satisfaction, years, coworkers_json, scandals_json)
assets(character_id, homes_json, vehicles_json, businesses_json, investments_json, liabilities_json)
domain_events(id, world_id, sequence, year, type, payload_json)
save_slots(id, account_id, world_id, schema_version, snapshot_json, checksum, created_at)
mods(id, name, version, extension_point, manifest_json, enabled)
```

## API Surface

The browser UI currently calls methods directly, but the same service can be exposed as HTTP or RPC:

- `POST /worlds` → create seeded world/dynasty.
- `POST /worlds/:id/advance-year` → run the tick pipeline.
- `POST /characters/:id/events/:index/resolve` → resolve a choice stance.
- `POST /characters/:id/careers` → accept career track.
- `POST /characters/:id/children` → biological or adoption path.
- `GET /worlds/:id/events` → domain event journal for inspectors/workers.
- `GET /characters/:id/graph` → relationship and memory graph.
- `PUT /save-slots/:id` → snapshot save with checksum and migration version.

## UI Architecture

The main screen keeps BitLife-like readability: overview, stats, age button, major event feed, and notifications. Secondary mechanics live in hierarchical menu definitions with unlock ages and badges:

- Activities, Relationships, Career, Finance, Education, Crime, Health, Fame, Assets, Travel, Politics, Military, Business, Social Media, Legacy, Religion, Creativity, Sports, and Settings.
- Menus support nested children, search filtering, quick actions, tooltips, conditional locks, and notification badges.
- Debug panels expose the event inspector, NPC inspector, relationship graph counts, economy analyzer, save schema, and content-editor extension points.

## Modding and DLC Strategy

`MODDING_API.extensionPoints` defines deterministic content-pack contracts. Mods should export serializable factories that accept `{ world, character, rng }` and return data for one extension point:

- `eventProvider`
- `careerPack`
- `countryPack`
- `npcBehavior`
- `economyModel`
- `uiMenu`
- `saveAdapter`

## Testing Strategy

- Unit tests cover RNG determinism, genetics, world/economy progression, NPC autonomy, event bus journaling, save/load, and dynasty inheritance.
- Integration tests should exercise 100+ year deterministic replays and snapshot migration.
- Future performance tests should batch NPC decisions in workers and validate memory ceilings with large generated populations.

## Security and Operations

- Save snapshots should be checksummed and schema-versioned before cloud upload.
- User-generated mod packs must be manifest-validated and sandboxed; never execute remote content without signing and permissions.
- Multiplayer/cloud endpoints should isolate account IDs, rate-limit simulation ticks, and validate all action commands server-side.
- Telemetry should record aggregate simulation performance without uploading private story text unless explicitly opted in.
