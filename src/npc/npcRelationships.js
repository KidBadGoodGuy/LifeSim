import { connect } from '../systems/relationships.js';

export function formNpcRelationship(a, b, rng, type = 'friend') {
  connect(a, b, type, rng, rng.int(20, 85));
  return a.relationships[b.id];
}
