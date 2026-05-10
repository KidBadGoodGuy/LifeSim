import { CAREER_TRACKS } from '../data/catalogs.js';
import { DomainEvents } from '../core/eventBus.js';
import { addMemory, applyImpact } from './character.js';

export class CareerSystem {
  constructor({ eventBus, rng, worldProvider, playerProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.playerProvider = playerProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(character) {
    if (!character) return;
    if (character.career.track) {
      character.career.years += 1;
      character.career.performance = Math.max(0, Math.min(100, (character.career.performance ?? 50) + this.rng.normal(2, 8) - character.stats.stress / 30));
      character.career.burnout = Math.max(0, Math.min(100, (character.career.burnout ?? 0) + character.stats.stress / 25 + this.rng.normal(0, 3)));
      const track = CAREER_TRACKS.find((item) => item.id === character.career.track);
      const promotionChance = ((character.stats.discipline + character.stats.charisma + character.stats.intelligence) / 330) * ((character.career.performance || 50) / 70);
      if (track && this.rng.chance(promotionChance)) this.promote(character, track);
      if (character.career.burnout > 85 && this.rng.chance(0.2)) {
        character.career.satisfaction = Math.max(0, character.career.satisfaction - 10);
        addMemory(character, this.worldProvider().year, 'Burnout damaged work satisfaction and performance.', { happiness: -4, stress: 6 }, ['career', 'health']);
      }
      applyImpact(character, { wealth: Math.round(character.career.salary * 0.18), stress: this.rng.chance(0.3) ? 2 : 0 });
    }
  }

  acceptCareer(trackId, character = this.playerProvider()) {
    const track = CAREER_TRACKS.find((item) => item.id === trackId);
    if (!character || !track || character.age < 14) return false;
    character.career.track = track.id;
    character.career.title = track.fields[0];
    character.career.salary = Math.round(22000 + track.prestige * 600 + this.rng.normal(0, 8000));
    character.career.performance = 50;
    character.career.burnout = character.career.burnout || 0;
    character.career.skillRequirements = track.skills;
    addMemory(character, this.worldProvider().year, `Began a career in ${track.name} as ${character.career.title}.`, { wealth: 1500, stress: 3 }, ['career']);
    this.eventBus.publish({ type: DomainEvents.CareerChanged, year: this.worldProvider().year, characterId: character.id, trackId: track.id, title: character.career.title });
    return true;
  }

  promote(character, track) {
    const current = track.fields.indexOf(character.career.title);
    character.career.title = track.fields[Math.min(track.fields.length - 1, current + 1)] || track.fields[0];
    character.career.salary = Math.round(character.career.salary * this.rng.float(1.08, 1.45) + 3000);
    character.career.performance = Math.max(45, character.career.performance - 8);
    addMemory(character, this.worldProvider().year, `Promoted to ${character.career.title}.`, { wealth: character.career.salary / 10, happiness: 3 }, ['career']);
  }
}
