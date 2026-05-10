import { addMemory, applyImpact } from './character.js';
import { DomainEvents } from '../core/eventBus.js';

export class EducationSystem {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(character) {
    if (!character) return;
    const agePath = new Map([[0, 'daycare'], [3, 'preschool'], [6, 'elementary'], [11, 'middle_school'], [14, 'high_school'], [18, 'university'], [22, 'graduate_school']]);
    if (agePath.has(character.age) && !character.education.path.includes(agePath.get(character.age))) {
      const path = agePath.get(character.age);
      character.education.path.push(path);
      character.education.gradeAverage = Math.round(character.stats.intelligence * 0.55 + character.stats.discipline * 0.35 + this.rng.normal(8, 10));
      if (path === 'university') character.education.studentDebt += this.rng.int(0, 65000);
      addMemory(character, this.worldProvider().year, `Started ${path.replace('_', ' ')}.`, { intelligence: 1, stress: 1 }, ['school']);
    }
    if (character.age >= 6 && character.age <= 24) applyImpact(character, { intelligence: this.rng.chance(0.6) ? 1 : 0, stress: this.rng.chance(0.25) ? 1 : 0 });
  }
}
