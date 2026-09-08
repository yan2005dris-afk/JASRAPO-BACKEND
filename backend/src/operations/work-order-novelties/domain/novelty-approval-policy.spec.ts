import {
  NoveltyApprovalInput,
  NoveltyKind,
  NoveltyState,
  unresolvedNoveltyIdsBlockingReadingApproval,
} from './novelty-approval-policy';

const blockingKinds: NoveltyKind[] = [
  'FUGA',
  'MEDIDOR_DAÑADO',
  'LECTURA_ERRONEA',
];

const states: NoveltyState[] = ['PENDIENTE', 'EN_SEGUIMIENTO', 'RESUELTA'];
const blockingCases: [NoveltyKind, NoveltyState][] = blockingKinds.flatMap(
  (kind) => states.map((state) => [kind, state] as [NoveltyKind, NoveltyState]),
);

describe('unresolvedNoveltyIdsBlockingReadingApproval', () => {
  it.each(blockingCases)(
    'applies the blocking matrix for %s/%s',
    (kind, state) => {
      const novelty: NoveltyApprovalInput = {
        id: 10n,
        readingId: 7n,
        kind,
        state,
      };

      expect(
        unresolvedNoveltyIdsBlockingReadingApproval(7n, [novelty]),
      ).toEqual(state === 'RESUELTA' ? [] : [10n]);
    },
  );

  it('treats OTRO as informational in every state', () => {
    expect(
      states.map((state) =>
        unresolvedNoveltyIdsBlockingReadingApproval(7n, [
          { id: 1n, readingId: 7n, kind: 'OTRO', state },
        ]),
      ),
    ).toEqual([[], [], []]);
  });

  it('ignores novelties attached to another reading and order-only novelties', () => {
    expect(
      unresolvedNoveltyIdsBlockingReadingApproval(7n, [
        { id: 1n, readingId: 8n, kind: 'FUGA', state: 'PENDIENTE' },
        { id: 2n, readingId: null, kind: 'FUGA', state: 'PENDIENTE' },
        { id: 3n, kind: 'FUGA', state: 'PENDIENTE' },
      ]),
    ).toEqual([]);
  });

  it('keeps unresolved sibling identities in deterministic source order', () => {
    expect(
      unresolvedNoveltyIdsBlockingReadingApproval(7n, [
        { id: 0n, readingId: 7n, kind: 'FUGA', state: 'PENDIENTE' },
        { id: 2n, readingId: 7n, kind: 'MEDIDOR_DAÑADO', state: 'RESUELTA' },
        {
          id: 1n,
          readingId: 7n,
          kind: 'LECTURA_ERRONEA',
          state: 'EN_SEGUIMIENTO',
        },
      ]),
    ).toEqual([0n, 1n]);
  });

  it('does not mutate readonly input', () => {
    const novelties: readonly NoveltyApprovalInput[] = [
      { id: 4n, readingId: 7n, kind: 'FUGA', state: 'PENDIENTE' },
    ];

    expect(unresolvedNoveltyIdsBlockingReadingApproval(7n, novelties)).toEqual([
      4n,
    ]);
    expect(novelties).toEqual([
      { id: 4n, readingId: 7n, kind: 'FUGA', state: 'PENDIENTE' },
    ]);
  });

  it('returns no blockers for empty input', () => {
    expect(unresolvedNoveltyIdsBlockingReadingApproval(7n, [])).toEqual([]);
  });
});
