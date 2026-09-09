const EXECUTION_HISTORY_STATE = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  LEGACY_UNKNOWN: 'legacy-unknown',
} as const;

export type ExecutionHistoryState =
  (typeof EXECUTION_HISTORY_STATE)[keyof typeof EXECUTION_HISTORY_STATE];

export interface ExecutionHistoryRecord {
  readonly orderId: bigint;
  readonly state: ExecutionHistoryState;
}

const ACTION = {
  EDIT_DRAFT: 'edit-draft',
  SUBMIT_DRAFT: 'submit-draft',
  EDIT_SUBMITTED: 'edit-submitted',
  APPEND_CORRECTION: 'append-correction',
} as const;

type ExecutionHistoryActionKind = (typeof ACTION)[keyof typeof ACTION];

type DenialReason =
  | 'invalid-actor-id'
  | 'record-is-not-draft'
  | 'submitted-record-immutable'
  | 'legacy-status-unknown'
  | 'predecessor-order-mismatch'
  | 'predecessor-not-submitted'
  | 'predecessor-status-unknown'
  | 'reason-required';

interface DraftAction {
  readonly kind: 'edit-draft' | 'submit-draft';
  readonly record: ExecutionHistoryRecord;
  readonly actorId: number;
}

interface SubmittedEditAction {
  readonly kind: 'edit-submitted';
  readonly record: ExecutionHistoryRecord;
  readonly actorId: number;
}

interface CorrectionAction {
  readonly kind: 'append-correction';
  readonly predecessor: ExecutionHistoryRecord;
  readonly requestedOrderId: bigint;
  readonly reason: string;
  readonly actorId: number;
}

export type ExecutionHistoryAction =
  | DraftAction
  | SubmittedEditAction
  | CorrectionAction;

export type ExecutionHistoryDecision =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: DenialReason };

function validActorId(actorId: number): boolean {
  return Number.isSafeInteger(actorId) && actorId > 0;
}

/**
 * Pure lifecycle policy only: assignment, races/CAS, idempotency, and persistence
 * remain outside this dormant policy and it does not activate any runtime flow.
 */
export function decideExecutionHistoryAction(
  action: ExecutionHistoryAction,
): ExecutionHistoryDecision {
  if (!validActorId(action.actorId)) {
    return { allowed: false, reason: 'invalid-actor-id' };
  }

  if (action.kind === ACTION.APPEND_CORRECTION) {
    if (action.predecessor.state === EXECUTION_HISTORY_STATE.LEGACY_UNKNOWN) {
      return { allowed: false, reason: 'predecessor-status-unknown' };
    }
    if (action.predecessor.state !== EXECUTION_HISTORY_STATE.SUBMITTED) {
      return { allowed: false, reason: 'predecessor-not-submitted' };
    }
    if (action.predecessor.orderId !== action.requestedOrderId) {
      return { allowed: false, reason: 'predecessor-order-mismatch' };
    }
    if (action.reason.trim().length === 0) {
      return { allowed: false, reason: 'reason-required' };
    }
    return { allowed: true };
  }

  if (action.record.state === EXECUTION_HISTORY_STATE.LEGACY_UNKNOWN) {
    return { allowed: false, reason: 'legacy-status-unknown' };
  }
  if (action.kind === ACTION.EDIT_SUBMITTED) {
    return { allowed: false, reason: 'submitted-record-immutable' };
  }
  if (action.record.state !== EXECUTION_HISTORY_STATE.DRAFT) {
    return { allowed: false, reason: 'record-is-not-draft' };
  }
  return { allowed: true };
}
