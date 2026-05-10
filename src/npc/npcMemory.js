export function rememberNpc(npc, memory) {
  npc.memoryLog = npc.memoryLog || [];
  npc.memoryLog.unshift(memory);
  npc.memoryLog = npc.memoryLog.slice(0, 80);
}
