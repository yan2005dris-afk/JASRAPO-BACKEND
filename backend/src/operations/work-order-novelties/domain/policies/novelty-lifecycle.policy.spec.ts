import { EstadoNovedad } from 'src/shared/enums';
import { NoveltyLifecyclePolicy } from './novelty-lifecycle.policy';

describe('NoveltyLifecyclePolicy', () => {
  it('allows valid forward transitions and rejects invalid/backward transitions', () => {
    expect(() =>
      NoveltyLifecyclePolicy.assertCanTransition(
        EstadoNovedad.OPEN,
        EstadoNovedad.IN_PROGRESS,
      ),
    ).not.toThrow();
    expect(() =>
      NoveltyLifecyclePolicy.assertCanTransition(
        EstadoNovedad.OPEN,
        EstadoNovedad.RESOLVED,
      ),
    ).not.toThrow();
    expect(() =>
      NoveltyLifecyclePolicy.assertCanTransition(
        EstadoNovedad.OPEN,
        EstadoNovedad.CANCELLED,
      ),
    ).not.toThrow();
    expect(() =>
      NoveltyLifecyclePolicy.assertCanTransition(
        EstadoNovedad.IN_PROGRESS,
        EstadoNovedad.RESOLVED,
      ),
    ).not.toThrow();
    expect(() =>
      NoveltyLifecyclePolicy.assertCanTransition(
        EstadoNovedad.IN_PROGRESS,
        EstadoNovedad.CANCELLED,
      ),
    ).not.toThrow();
    expect(() =>
      NoveltyLifecyclePolicy.assertCanTransition(
        EstadoNovedad.IN_PROGRESS,
        EstadoNovedad.OPEN,
      ),
    ).toThrow();
  });

  it('rejects transitions from terminal states', () => {
    expect(() =>
      NoveltyLifecyclePolicy.assertCanTransition(
        EstadoNovedad.RESOLVED,
        EstadoNovedad.OPEN,
      ),
    ).toThrow();
    expect(() =>
      NoveltyLifecyclePolicy.assertCanTransition(
        EstadoNovedad.CANCELLED,
        EstadoNovedad.RESOLVED,
      ),
    ).toThrow();
    expect(NoveltyLifecyclePolicy.isTerminal(EstadoNovedad.OPEN)).toBe(false);
    expect(NoveltyLifecyclePolicy.isTerminal(EstadoNovedad.RESOLVED)).toBe(
      true,
    );
    expect(NoveltyLifecyclePolicy.isTerminal(EstadoNovedad.CANCELLED)).toBe(
      true,
    );
  });
});
