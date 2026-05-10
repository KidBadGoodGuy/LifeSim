export class StateManager {
  constructor(initialState = {}) {
    this.state = structuredCloneSafe(initialState);
    this.listeners = new Set();
  }

  getState() {
    return this.state;
  }

  replace(nextState, meta = {}) {
    this.state = structuredCloneSafe(nextState);
    this.notify({ type: 'state.replace', meta });
    return this.state;
  }

  update(mutator, meta = {}) {
    const draft = this.state;
    mutator(draft);
    this.notify({ type: 'state.update', meta });
    return draft;
  }

  select(selector) {
    return selector(this.state);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(change) {
    for (const listener of this.listeners) listener(this.state, change);
  }
}

export function structuredCloneSafe(value) {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
}
