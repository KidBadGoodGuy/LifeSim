import { DomainEvents } from './eventBus.js';

export class TimeManager {
  constructor(eventBus) {
    this.eventBus = eventBus;
  }

  ageOneYear(state) {
    const player = state.characters.find((character) => character.id === state.playerId);
    if (player?.alive) {
      player.age += 1;
      this.eventBus.publish({ type: DomainEvents.CharacterAged, year: state.world.year, characterId: player.id, age: player.age });
    }
    this.eventBus.publish({ type: DomainEvents.YearTickStarted, year: state.world.year, characterId: state.playerId });
    return player;
  }
}
