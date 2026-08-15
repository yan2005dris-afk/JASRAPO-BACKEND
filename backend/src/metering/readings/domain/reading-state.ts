import { EstadoLectura } from 'src/shared/enums';

/**
 * State machine de lecturas: define qué transiciones de estado son válidas.
 *
 * Estados terminales (sin transiciones salientes):
 *   - APROBADA
 *   - RECHAZADA_VERIFICACION
 *   - PLANILLADA (pendiente de definir transiciones)
 *
 * Estados sin transiciones definidas aún:
 *   - ESTIMADA
 *   - PLANILLADA
 *
 * Solo se agregan transiciones explícitas. La ausencia de una transición
 * implica que no está permitida y será rechazada por canTransitionReadingState().
 */
export const READING_STATE_TRANSITIONS: Record<string, string[]> = {
  [EstadoLectura.PENDIENTE]: [EstadoLectura.POR_REVISION],
  [EstadoLectura.POR_REVISION]: [
    EstadoLectura.APROBADA,
    EstadoLectura.RECHAZADA_VERIFICACION,
  ],
};

export function canTransitionReadingState(from: string, to: string): boolean {
  if (from === to) return true;
  return (READING_STATE_TRANSITIONS[from] ?? []).includes(to);
}
