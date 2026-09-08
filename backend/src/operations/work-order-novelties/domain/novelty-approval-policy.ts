const NOVELTY_KIND = {
  FUGA: 'FUGA',
  MEDIDOR_DAÑADO: 'MEDIDOR_DAÑADO',
  LECTURA_ERRONEA: 'LECTURA_ERRONEA',
  OTRO: 'OTRO',
} as const;

export type NoveltyKind = (typeof NOVELTY_KIND)[keyof typeof NOVELTY_KIND];

const NOVELTY_STATE = {
  PENDIENTE: 'PENDIENTE',
  EN_SEGUIMIENTO: 'EN_SEGUIMIENTO',
  RESUELTA: 'RESUELTA',
} as const;

export type NoveltyState = (typeof NOVELTY_STATE)[keyof typeof NOVELTY_STATE];

export interface NoveltyApprovalInput {
  readonly id: bigint;
  readonly readingId?: bigint | null;
  readonly kind: NoveltyKind;
  readonly state: NoveltyState;
}

const BLOCKING_KINDS: ReadonlySet<NoveltyKind> = new Set([
  NOVELTY_KIND.FUGA,
  NOVELTY_KIND.MEDIDOR_DAÑADO,
  NOVELTY_KIND.LECTURA_ERRONEA,
]);

export function unresolvedNoveltyIdsBlockingReadingApproval(
  affectedReadingId: bigint,
  novelties: readonly NoveltyApprovalInput[],
): bigint[] {
  return novelties
    .filter(
      (novelty) =>
        novelty.readingId === affectedReadingId &&
        BLOCKING_KINDS.has(novelty.kind) &&
        novelty.state !== NOVELTY_STATE.RESUELTA,
    )
    .map((novelty) => novelty.id);
}
