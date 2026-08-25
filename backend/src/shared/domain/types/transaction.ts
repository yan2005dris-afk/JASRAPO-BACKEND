/**
 * Contexto transaccional genérico.
 *
 * Los puertos de dominio exponen operaciones que pueden correr dentro
 * de una transacción de base de datos. Para no filtrar el tipo concreto
 * de Prisma (`Prisma.TransactionClient`) al dominio, declaramos este
 * alias como `unknown` y la implementación en `infrastructure/` se
 * encarga del type-narrowing interno.
 *
 * Es deliberadamente minimalista: la regla hexagonal es que el dominio
 * no debe conocer la tecnología de persistencia. Diseñar una interface
 * `UnitOfWork` más rica es un trabajo aparte (candidato natural para
 * SC-188, que ataca el aislamiento application/infra).
 */
export type TransactionContext = unknown;
