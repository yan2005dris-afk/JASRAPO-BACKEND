export const ROUTE_STATE_TRANSITIONS: Record<string, string[]> = {
  PENDIENTE: ['EN_PROGRESO', 'CANCELADA'],
  EN_PROGRESO: ['COMPLETADA', 'PARCIAL', 'PENDIENTE', 'CANCELADA'],
  COMPLETADA: ['EN_PROGRESO'],
  PARCIAL: ['EN_PROGRESO'],
  CANCELADA: ['PENDIENTE'],
};

export function canTransitionRouteState(from: string, to: string): boolean {
  if (from === to) return true;
  return (ROUTE_STATE_TRANSITIONS[from] ?? []).includes(to);
}
