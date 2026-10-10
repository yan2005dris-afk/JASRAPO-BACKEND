import { EstadoNovedad } from 'src/shared/enums';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';

const ALLOWED_TRANSITIONS: Record<EstadoNovedad, readonly EstadoNovedad[]> = {
  [EstadoNovedad.OPEN]: [
    EstadoNovedad.IN_PROGRESS,
    EstadoNovedad.RESOLVED,
    EstadoNovedad.CANCELLED,
  ],
  [EstadoNovedad.IN_PROGRESS]: [
    EstadoNovedad.RESOLVED,
    EstadoNovedad.CANCELLED,
  ],
  [EstadoNovedad.RESOLVED]: [],
  [EstadoNovedad.CANCELLED]: [],
};

export class NoveltyLifecyclePolicy {
  static assertCanTransition(
    currentState: EstadoNovedad,
    nextState: EstadoNovedad,
  ): void {
    if (currentState === nextState) return;
    const allowed = ALLOWED_TRANSITIONS[currentState] ?? [];
    if (!allowed.includes(nextState)) {
      throw new InvalidDomainOperationException(
        `Transición de estado no permitida de ${currentState} a ${nextState}. Estados permitidos: [${allowed.join(', ')}]`,
      );
    }
  }

  static isTerminal(state: EstadoNovedad): boolean {
    return (
      state === EstadoNovedad.RESOLVED || state === EstadoNovedad.CANCELLED
    );
  }
}
