import type { Prisma } from 'src/generated/prisma/client';

/**
 * Handle opaco a una transacción de base de datos compartida entre repositorios.
 *
 * VIVE en `shared/domain/types/` por ser el único punto canónico donde el
 * tipo transaccional existe. El import es `type-only`, así que el dominio no
 * ejecuta nada de Prisma: solo conoce la *forma* del handle que pasa entre
 * repositorios al operar en una transacción compartida.
 *
 * Los repositorios (en `infrastructure/`) son la *única* capa que sabe cómo
 * construir y consumir este handle. Cuando llega un `TransactionContext` al
 * dominio, este lo trata como opaco y lo reenvía.
 *
 * Si en el futuro se cambia el ORM (ej. Drizzle), este es el único archivo
 * a migrar: cambiar la implementación subyacente y mantener el alias.
 *
 * @see SC-188 — especificación pendiente de un UnitOfWork más rico, que
 *      complementará este handle con un mecanismo explícito begin/commit/rollback.
 */
export type TransactionContext = Prisma.TransactionClient;
