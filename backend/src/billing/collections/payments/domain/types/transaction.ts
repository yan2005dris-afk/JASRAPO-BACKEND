/**
 * Domain-level transaction client type.
 *
 * The use case never accesses `tx` directly — it only passes it through
 * to repository methods. The actual runtime implementation is Prisma's
 * TransactionClient, but the domain layer must not depend on Prisma.
 *
 * @remarks
 * We explicitly allow `any` here because the domain treats `tx` as an
 * opaque handle — the repository implementation casts it to the correct
 * Prisma type internally.
 */

export type TransactionClient = any;
