# Feature: Issue #366 — Eliminar triple modelado ceremonial

**Issue tracker**: https://github.com/yan2005dris-afk/JASRAPO-BACKEND/issues/366
**Branch base**: `develop`
**Estrategia**: 3 Niveles independientes, atacables por separado. Cada nivel = 1 o más PRs con commits work-unit.

## Mirror Engram

Este mirror se mantiene sincronizado con `eliminar-triple-modelado.md`. Actualizado tras cada cierre de tarea.

## Estado por tarea

### Nivel 1 — Branch: `feature/issue-366-nivel-1-transaction-context`

| Tarea | Estado | Commit | Notas |
|---|---|---|---|
| T-N1-1 | done | 6c8031c3 | shared/domain/types/transaction.ts: `TransactionContext = Prisma.TransactionClient` (type-only) |
| T-N1-2 | done | 6c8031c3 | billing/.../types/transaction.ts eliminado (duplicaba) |
| T-N1-3 | done | 6c8031c3 | 14 firmas abstractas migradas a `TransactionContext` |
| T-N1-4 | done | 6c8031c3 | `getClient` sin casteo inseguro; 22 firmas impl migradas |
| T-N1-5 | done | 6c8031c3 | spec no requería cambios (mockea PrismaService, no usa tx) |
| T-N1-6 | done | 6c8031c3 | pnpm build + lint + format:check + 1914 tests verdes |
| T-N1-7 | done | 6c8031c3 | Work-unit commit `6c8031c3` con conventional commit |

### Hallazgo colateral durante la implementación

TS atrapó **9 errores silenciosos** que pasaban antes en:
- `create-payment.use-case.ts:171,176,188,217,247,278,297` — pasaban `tx: unknown` a métodos que esperan `TransactionContext`.
- `annul-payment.use-case.ts:119,139` — mismo caso.

Esto es exactamente el bug runtime que el cast `(tx as Prisma.TransactionClient)` permitía silenciar. La validación de tipos en tiempo de compilación los expone.

### Contrato público preservado

- Firmas runtime idénticas.
- Comportamiento de queries idéntico.
- Ningún cambio en HTTP API ni DB schema.

### Pendiente

- Push de la rama (a decisión del usuario, no automático).
- PR contra `develop` (a decisión del usuario).
- Nivel 2 (PR piloto `sectors`/`communities`): siguiente branch.

### Nivel 2 — Branch: pendiente

(Próximo paso. Candidato piloto: `sectors`.)
(Próximo paso. Candidato piloto: `sectors`.)

### Nivel 3 — Branch: pendiente

(Próximo paso. Aplicar `ClassSerializerInterceptor` global + eliminar `fromEntity` en 6 DTOs response.)
