import {
  decideExecutionHistoryAction,
  type ExecutionHistoryRecord,
} from './execution-history.policy';

const draft = (orderId = 7n): ExecutionHistoryRecord => ({
  orderId,
  state: 'draft',
});
const submitted = (orderId = 7n): ExecutionHistoryRecord => ({
  orderId,
  state: 'submitted',
});
const legacy = (orderId = 7n): ExecutionHistoryRecord => ({
  orderId,
  state: 'legacy-unknown',
});

describe('decideExecutionHistoryAction', () => {
  it('allows editing and submitting a draft', () => {
    expect(
      decideExecutionHistoryAction({
        kind: 'edit-draft',
        record: draft(),
        actorId: 1,
      }),
    ).toEqual({ allowed: true });
    expect(
      decideExecutionHistoryAction({
        kind: 'submit-draft',
        record: draft(),
        actorId: 1,
      }),
    ).toEqual({ allowed: true });
  });

  it.each(['edit-draft', 'submit-draft'] as const)(
    'rejects %s for submitted and legacy records',
    (kind) => {
      expect(
        decideExecutionHistoryAction({ kind, record: submitted(), actorId: 1 }),
      ).toEqual({ allowed: false, reason: 'record-is-not-draft' });
      expect(
        decideExecutionHistoryAction({ kind, record: legacy(), actorId: 1 }),
      ).toEqual({ allowed: false, reason: 'legacy-status-unknown' });
    },
  );

  it('rejects editing a submitted execution', () => {
    expect(
      decideExecutionHistoryAction({
        kind: 'edit-submitted',
        record: submitted(),
        actorId: 1,
      }),
    ).toEqual({ allowed: false, reason: 'submitted-record-immutable' });
  });

  it('allows correction from the same submitted order', () => {
    expect(
      decideExecutionHistoryAction({
        kind: 'append-correction',
        predecessor: submitted(),
        requestedOrderId: 7n,
        reason: 'Fix meter',
        actorId: 2,
      }),
    ).toEqual({ allowed: true });
  });

  it('compares distinct large bigint order identities exactly', () => {
    const first = 9007199254740992n;
    const second = 9007199254740993n;
    expect(
      decideExecutionHistoryAction({
        kind: 'append-correction',
        predecessor: submitted(first),
        requestedOrderId: second,
        reason: 'Fix',
        actorId: 2,
      }),
    ).toEqual({ allowed: false, reason: 'predecessor-order-mismatch' });
    expect(
      decideExecutionHistoryAction({
        kind: 'append-correction',
        predecessor: submitted(first),
        requestedOrderId: first,
        reason: 'Fix',
        actorId: 2,
      }),
    ).toEqual({ allowed: true });
  });

  it.each([
    [
      'different order',
      {
        predecessor: submitted(8n),
        requestedOrderId: 7n,
        reason: 'Fix',
        actorId: 2,
      },
      'predecessor-order-mismatch',
    ],
    [
      'draft predecessor',
      { predecessor: draft(), requestedOrderId: 7n, reason: 'Fix', actorId: 2 },
      'predecessor-not-submitted',
    ],
    [
      'legacy predecessor',
      {
        predecessor: legacy(),
        requestedOrderId: 7n,
        reason: 'Fix',
        actorId: 2,
      },
      'predecessor-status-unknown',
    ],
    [
      'blank reason',
      {
        predecessor: submitted(),
        requestedOrderId: 7n,
        reason: '  ',
        actorId: 2,
      },
      'reason-required',
    ],
  ] as const)('rejects correction for %s', (_label, input, reason) => {
    expect(
      decideExecutionHistoryAction({ kind: 'append-correction', ...input }),
    ).toEqual({ allowed: false, reason });
  });

  it.each([
    0,
    -1,
    1.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])('rejects invalid actor id %s', (actorId) => {
    expect(
      decideExecutionHistoryAction({
        kind: 'submit-draft',
        record: draft(),
        actorId,
      }),
    ).toEqual({ allowed: false, reason: 'invalid-actor-id' });
  });

  it('accepts positive safe integer actor boundaries', () => {
    expect(
      decideExecutionHistoryAction({
        kind: 'submit-draft',
        record: draft(),
        actorId: 1,
      }),
    ).toEqual({ allowed: true });
    expect(
      decideExecutionHistoryAction({
        kind: 'submit-draft',
        record: draft(),
        actorId: Number.MAX_SAFE_INTEGER,
      }),
    ).toEqual({ allowed: true });
  });

  it('does not mutate input records or reason whitespace', () => {
    const record = submitted();
    const input = {
      kind: 'append-correction' as const,
      predecessor: record,
      requestedOrderId: 7n,
      reason: '  Fix  ',
      actorId: 2,
    };
    expect(decideExecutionHistoryAction(input)).toEqual({ allowed: true });
    expect(input).toEqual({
      kind: 'append-correction',
      predecessor: record,
      requestedOrderId: 7n,
      reason: '  Fix  ',
      actorId: 2,
    });
  });
});
