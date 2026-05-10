import { addMemory, applyImpact } from './character.js';
import { rememberInteraction } from './relationships.js';

const GOALS = [
  { id: 'stability', label: 'Build stability', stats: ['wealth', 'health'], weight: (npc) => 100 - npc.stats.wealth / 10000 + npc.stats.stress / 2 },
  { id: 'connection', label: 'Deepen relationships', stats: ['happiness', 'charisma'], weight: (npc) => 100 - Object.keys(npc.relationships).length * 12 },
  { id: 'status', label: 'Gain status', stats: ['fame', 'charisma'], weight: (npc) => npc.stats.charisma + npc.stats.ambition || 45 },
  { id: 'recovery', label: 'Recover wellbeing', stats: ['health', 'happiness'], weight: (npc) => 120 - npc.stats.health + npc.stats.stress }
];

export function ensureNpcMind(npc, rng) {
  npc.ai = npc.ai || {
    goals: [],
    currentGoal: null,
    decisionHistory: [],
    utilityBias: rng.float(0.85, 1.2),
    socialInfluence: rng.int(5, 95),
    riskTolerance: rng.int(5, 95)
  };
  if (!npc.ai.goals.length) npc.ai.goals = GOALS.map((goal) => ({ id: goal.id, label: goal.label, priority: Math.round(goal.weight(npc) * npc.ai.utilityBias) }));
  return npc.ai;
}

export function simulateNpcDecision(npc, world, rng, network = []) {
  const mind = ensureNpcMind(npc, rng);
  mind.goals = GOALS.map((goal) => ({ id: goal.id, label: goal.label, priority: Math.round(goal.weight(npc) * mind.utilityBias + rng.normal(0, 8)) }))
    .sort((a, b) => b.priority - a.priority);
  mind.currentGoal = mind.goals[0];
  const action = selectAction(npc, mind.currentGoal.id, rng);
  applyImpact(npc, action.impact);
  addMemory(npc, world.year, action.memory, action.impact, ['npc', 'autonomy', mind.currentGoal.id]);
  mind.decisionHistory.unshift({ year: world.year, goal: mind.currentGoal.id, action: action.id, utility: mind.currentGoal.priority });
  mind.decisionHistory = mind.decisionHistory.slice(0, 20);

  const target = network.find((candidate) => candidate.id !== npc.id && candidate.alive && npc.relationships[candidate.id]);
  if (target && rng.chance(0.18)) rememberInteraction(npc, target, world.year, `${npc.firstName} acted on ${mind.currentGoal.label.toLowerCase()}.`, rng.int(-3, 5));
  return { npcId: npc.id, goal: mind.currentGoal, action };
}

function selectAction(npc, goal, rng) {
  const actions = {
    stability: [
      { id: 'overtime', memory: 'Worked extra hours to build financial security.', impact: { wealth: rng.int(900, 6500), stress: rng.int(1, 5) } },
      { id: 'budget', memory: 'Reorganized household finances and reduced unnecessary spending.', impact: { wealth: rng.int(200, 1600), stress: -1 } }
    ],
    connection: [
      { id: 'reconcile', memory: 'Reached out to repair an important relationship.', impact: { happiness: rng.int(1, 6), stress: -1 } },
      { id: 'community', memory: 'Joined a community circle and expanded social belonging.', impact: { charisma: 1, happiness: rng.int(1, 5) } }
    ],
    status: [
      { id: 'publicity', memory: 'Chased a public reputation opportunity.', impact: { fame: rng.int(1, 5), stress: rng.int(0, 4) } },
      { id: 'credential', memory: 'Invested in credentials to improve long-term status.', impact: { intelligence: 1, wealth: -rng.int(200, 1800) } }
    ],
    recovery: [
      { id: 'therapy', memory: 'Prioritized therapy and emotional recovery.', impact: { happiness: rng.int(1, 5), stress: -rng.int(2, 7) } },
      { id: 'checkup', memory: 'Scheduled preventative care and lifestyle changes.', impact: { health: rng.int(1, 5), stress: -1 } }
    ]
  };
  return rng.pick(actions[goal] || actions.connection);
}
