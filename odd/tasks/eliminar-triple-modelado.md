# Feature: Issue #366 — Eliminar triple modelado ceremonial

**Issue tracker**: https://github.com/yan2005dris-afk/JASRAPO-BACKEND/issues/366
**Branch base**: `develop`
**Estrategia**: 3 Niveles independientes, atacables por separado. Cada nivel = 1 o más PRs con commits work-unit.

---

## Nivel 1 — Tipar `TransactionContext` (esfuerzo: 1 PR chico, 1 día)

**Por qué primero**: antipatrón `tx?: unknown` con casteo `(tx as Prisma.TransactionClient)` es un **bug real** (no estilo). Cualquier caller que pase un tx mal formado explota en runtime sin detección estática. Resolver esto es la mayor relación valor/esfuerzo.

**Estado actual (problemático)**:

```typescript
// src/shared/domain/types/transaction.ts — YA EXISTE, usa unknown
export type TransactionContext = unknown;

// src/billing/collections/payments/domain/types/transaction.ts — DUPLICA con any
export type TransactionClient = any;

// src/billing/collections/payments/domain/repositories/payment.repository.ts
abstract findById(id: bigint, tx?: unknown): Promise<PaymentEntity | null>;
// ...12 firmas más con tx?: unknown | tx: unknown

// src/billing/collections/payments/infrastructure/repositories/prisma-payment.repository.ts:84
private getClient(tx?: unknown): Prisma.TransactionClient | PrismaService {
  return (tx as Prisma.TransactionClient) ?? this.prisma;
}
```

**Decisión arquitectónica**: el `TransactionContext` vive en `shared/domain/types/` (que es la "zona gris" consensual) pero está tipado como `Prisma.TransactionClient`. Esto sacrifica la hexagonal purity mínima (shared importa Prisma vía `type-only`) y gana type-safety total. Si en el futuro se cambia a otro ORM, este archivo shared es el único a migrar.

### Tareas Nivel 1

- [ ] **T-N1-1**: Reescribir `src/shared/domain/types/transaction.ts` para que `TransactionContext = Prisma.TransactionClient` (import type-only). Actualizar jsdoc justificando la decisión.
- [ ] **T-N1-2**: Eliminar `src/billing/collections/payments/domain/types/transaction.ts` (duplica).
- [ ] **T-N1-3**: En `src/billing/collections/payments/domain/repositories/payment.repository.ts`:
  - Reemplazar 6 firmas `tx?: unknown` → `tx?: TransactionContext`.
  - Reemplazar 8 firmas `tx: unknown` → `tx: TransactionContext`.
  - Importar `TransactionContext` desde `shared/domain/types/transaction`.
- [ ] **T-N1-4**: En `src/billing/collections/payments/infrastructure/repositories/prisma-payment.repository.ts`:
  - Cambiar firma `getClient(tx?: unknown)` → `getClient(tx?: TransactionContext)`.
  - Eliminar el casteo `(tx as Prisma.TransactionClient)`. Devolver `TransactionContext` directo cuando hay tx, sino `PrismaService`.
  - Cambiar firmas restantes del archivo (6 firmas con `tx?: unknown` o `tx: unknown`).
- [ ] **T-N1-5**: Actualizar `src/billing/collections/payments/infrastructure/repositories/prisma-payment.repository.spec.ts` — referencias a `tx` deben ser `TransactionContext` o `Prisma.TransactionClient` (lo que use el código bajo test).
- [ ] **T-N1-6**: Correr `pnpm ci` en `backend/`. Lint + format + build + test verde.
- [ ] **T-N1-7**: Work-unit commit:
  ```
  fix(billing): reemplazar tx?: unknown por TransactionContext tipado (#366 Nivel 1)

  - src/shared/domain/types/transaction.ts: tipado Prisma.TransactionClient via type-only import
  - billing/collections/payments: eliminar archivo duplicado de tipo + actualizar 14 firmas
  - prisma-payment.repository.ts: remover casteo inseguro (tx as Prisma.TransactionClient)
  - spec actualizado para usar el tipo tipado
  ```

### Contrato público a preservar
- Firmas en runtime idénticas (mismo `tx` opcional).
- Comportamiento de queries idéntico.
- Ningún cambio en HTTP API ni en DB schema.

---

## Nivel 2 — Eliminar entities anémicas + mappers ceremoniales BC por BC (esfuerzo: 5-10 PRs, 2-3 semanas)

**Estado actual (problemático)**: 38 entities anémicas + 19 mappers ceremonia + 6 DTOs response duplicados.

**Estrategia**: arrancar con un BC piloto (el más chiquito) para validar el patrón end-to-end, después escalar.

### Tarea piloto (Nivel 2.0)

- [ ] **T-N2-0**: Elegir BC piloto y validar refactor end-to-end.
  - **Candidatos**: `operations/sectors` (4 líneas entity, readonly fields) o `operations/communities` (8 líneas, Object.assign).
  - **Recomendación**: `sectors` por tamaño y porque usa readonly fields (patrón alternativo válido).
  - Pasos del piloto:
    1. Crear `sector.include.ts` con `as const satisfies Prisma.SectoresInclude`.
    2. Definir `Sector = Prisma.SectoresGetPayload<{include: typeof sectorInclude}>` en `infrastructure/repositories/`.
    3. Actualizar firma del repo: `findById()` retorna `Promise<Sector | null>`.
    4. Actualizar use-cases: donde tipaba `SectorEntity` ahora tipan `Sector`.
    5. Borrar `domain/entities/sector.entity.ts`.
    6. Si el mapper es 1:1 puro → borrar `infrastructure/mappers/sector.mapper.ts`. Si tiene lógica real → mantener reducido.
    7. Controller: DTO response usa `plainToInstance` o `@ClassSerializerInterceptor` desde `Sector`.
  - Validación: `pnpm test operations/sectors`, `pnpm test:e2e` (si aplica), flujo manual.

### Tareas por BC (esfuerzo: 1 PR por BC, 2-3 días por BC)

- [ ] **T-N2-1**: BC `clients`
- [ ] **T-N2-2**: BC `payments` (parcial — entity/mapper ceremony; el repo con lógica se mantiene)
- [ ] **T-N2-3**: BC `periods`
- [ ] **T-N2-4**: BC `discounts` (solo `toDomain`/`toDomainList` ceremony; `toPrisma*Input` se queda)
- [ ] **T-N2-5**: BC `meters` (parcial)
- [ ] **T-N2-6**: BC `readings` (NO — tiene snapshot histórico)
- [ ] **T-N2-7**: BC `routes`
- [ ] **T-N2-8**: BC `ordenes-trabajo`
- [ ] **T-N2-9**: BC `work-order-novelties`
- [ ] **T-N2-10**: BC `agreements` (parcial — toNumber helper se queda)

### Patrón estándar del refactor (por BC)

```typescript
// ANTES (ceremony)
//   domain/entities/cliente.entity.ts (25 líneas, Object.assign puro)
//   infrastructure/mappers/cliente.mapper.ts (40 líneas, 1:1)
//   interfaces/dto/cliente-response.dto.ts (50 líneas, static fromEntity)

// DESPUÉS (Prisma tipado)
//   infrastructure/repositories/cliente.include.ts
import { Prisma } from 'src/generated/prisma/client';

export const clienteInclude = {
  // default relations
} as const satisfies Prisma.ClientesInclude;

export type Cliente = Prisma.ClientesGetPayload<{
  include: typeof clienteInclude;
}>;

//   infrastructure/repositories/prisma-cliente.repository.ts
async findById(id: number): Promise<Cliente | null> {
  const result = await this.prisma.clientes.findUnique({
    where: { id },
    include: clienteInclude,
  });
  return result; // No mapper needed
}
```

### Contrato público a preservar
- HTTP API idéntico (forma JSON, códigos, errores).
- `class-validator` sigue aplicando en DTOs de input.
- Validación de Prisma no se pierde (tipos cubren las formas válidas).

---

## Nivel 3 — Eliminar DTOs response duplicados (esfuerzo: 1-2 PRs, 2-3 días)

**Estado actual (problemático)**: 6 DTOs response son subclases planas del entity con `static fromEntity()` que es `Object.assign`.

- [ ] **T-N3-1**: BC `clients` — eliminar `fromEntity` en `ClientResponseDto`, usar `ClassSerializerInterceptor`.
- [ ] **T-N3-2**: BC `agreements` — idem `AgreementResponseDto`.
- [ ] **T-N3-3**: BC `meters` — idem `MeterResponseDto`, `MeterHistoryResponseDto`.
- [ ] **T-N3-4**: BC `reemplazo-medidor` — idem.
- [ ] **T-N3-5**: BC `operator` (`OperatorRouteResponseDto`).
- [ ] **T-N3-6**: Activar `ClassSerializerInterceptor` global en `app.module.ts` si no está activo (revisar antes).

### Patrón del refactor (por DTO)

```typescript
// ANTES
export class ClientResponseDto {
  clienteId!: bigint;
  nombre!: string;
  // ...20 campos con @ApiProperty
  
  static fromEntity(entity: ClientEntity): ClientResponseDto {
    return new ClientResponseDto({ /* 1:1 */ });
  }
}

// DESPUÉS
export class ClientResponseDto {
  @Expose() clienteId!: bigint;
  @Expose() nombre!: string;
  // ...20 campos con @Expose + @ApiProperty
}
// El controller usa @UseInterceptors(ClassSerializerInterceptor) o @SerializeOptions
```

---

## Orden de ejecución

1. **Nivel 1** (este PR/branch). Resuelve `tx?: unknown`. Cierra 1 riesgo runtime concreto.
2. **PR Piloto Nivel 2** (siguiente branch, BC `sectors`). Valida el patrón completo end-to-end.
3. **Nivel 3** (PR independiente) — bajo riesgo, alto retorno en claridad.
4. **Nivel 2 BC por BC** — 5-10 PRs independientes.

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| Nivel 2 toca imports en cascada | PR chico por BC; CI en cada uno |
| Tests existentes mockean `PrismaService` con `Entity` | Estrategia: usar `Prisma.XGetPayload` reduce superficie de mocking |
| Devs futuros vuelvan a filtrar Prisma al domain | ESLint rule `no-restricted-imports` en `domain/`, `application/`, `interfaces/` (post-Nivel 2) |
| Nivel 3 cambia interceptores globales | Validar controller por controller |

---

## Cierre por nivel

Cada nivel cierra con:
- `pnpm ci` verde en `backend/`.
- Work-unit commit con mensaje conventional.
- Documentación inline donde se haya cambiado contrato público.
- Push de la rama — **NO merge automático**: el usuario decide cuándo mergear.
