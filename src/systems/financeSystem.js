import { DomainEvents } from '../core/eventBus.js';
import { applyImpact } from './character.js';

export class FinanceSystem {
  constructor({ eventBus, rng, worldProvider }) {
    this.eventBus = eventBus;
    this.rng = rng;
    this.worldProvider = worldProvider;
    this.eventBus.subscribe(DomainEvents.YearTickStarted, ({ player }) => this.processYear(player));
  }

  processYear(character) {
    if (!character) return;
    const economy = this.worldProvider().economy;
    const income = character.career.salary || 0;
    const taxRate = Math.max(0.05, Math.min(0.42, 0.12 + income / 500000));
    character.assets.taxLedger = character.assets.taxLedger || [];
    if (income > 0) {
      const taxes = Math.round(income * taxRate);
      character.assets.taxLedger.unshift({ year: this.worldProvider().year, income, taxes });
      applyImpact(character, { wealth: -Math.round(taxes * 0.1) });
    }
    for (const liability of character.assets.liabilities) liability.balance = Math.round(liability.balance * (1 + (economy.interestRate || 4) / 100));
    for (const investment of character.assets.investments) investment.value = Math.round(investment.value * (1 + this.rng.normal((economy.markets?.[0]?.volatility || 8) / 100, 0.08)));
    character.assets.inflationAdjustedWealth = Math.round(character.stats.wealth / (1 + (economy.inflation || 0) / 100));
  }

  takeLoan(character, amount, purpose = 'personal') {
    character.assets.liabilities.push({ id: `loan_${Date.now()}`, purpose, balance: amount, openedYear: this.worldProvider().year });
    applyImpact(character, { wealth: amount });
  }
}
