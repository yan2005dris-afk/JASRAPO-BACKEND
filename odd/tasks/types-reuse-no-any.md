# Feature: Reutilizar types y eliminar `any` — P0 + P1

**Branch base**: `develop`
**Rama**: `refactor/types-reuse-no-any`
**Origen**: auditoría de types 2026-10-10 (redundancia paginación + 119 `any` reales en `backend/src` sin `generated`/spec).
**Ruta**: delegated direct degradado a direct inline (Task/subagents no disponibles en este runtime: "OpenCode's free tier can only be used from within OpenCode"). Implementación single-threaded en el padre.

## Objetivo

Unificar el sistema de paginación en un único dueño canónico y eliminar los `any` de mayor riesgo/valor sin cambiar comportamiento en runtime ni API HTTP.

## Alcance autorizado

- `backend/src/shared/domain/types/pagination.types.ts` (canónico)
- `backend/src/infrastructure/common/utils/pagination.util.ts` (colisión `PaginationParams`)
- `backend/src/infrastructure/common/decorators/api-paginated-response.decorator.ts` (`Type<any>`)
- `backend/src/infrastructure/common/dtos/pagination.dto.ts` + `pagination-meta.dto.ts` (alinear, no romper Swagger)
- `any` alto valor: `where: any` → `Prisma.WhereInput`, `@CurrentUser() user: any` → `AuthUser`, `paginate(model/args: any)` → genéricos, `catch (err: any)` → `unknown`, `(d: any)` en filtros/mappers, `createUserData: any`, `fileFilter: (...: any)` en controllers
- `PaginatedResult<K = Record<string, any>>` → `Record<string, unknown>`

Fuera de alcance: `backend/src/generated/**` (Prisma, no tocar), `*.spec.ts` salvo que el cambio de firma lo exija, renombrar `paginaActual/porPagina` (breaking Swagger/UI, se deja para después), `BaseFilterDto` y `FromRow<T>` (P2, otro PR).

## Restricciones

- Sin cambios de comportamiento: mismas queries, mismos JSON de respuesta, mismas firmas en runtime.
- `import type` donde solo sea tipo (no meter Prisma en runtime desde `shared`).
- Español en comentarios/docs existentes se preserva; código nuevo sigue convención del archivo.

## Checklist

- [ ] **T1 — P0 paginación canónica**: `pagination.types.ts` como único dueño (`PaginationParams`, `PaginationMeta`, `PaginatedResult<K = Record<string, unknown>>`); eliminar `PaginationParams` duplicado de `pagination.util.ts`; importar el canónico; `PaginateOptions` documentado como alias de transición o eliminado si nadie lo usa.
- [ ] **T2 — P0 decorator + DTOs**: `ApiPaginatedResponse <TModel extends Type<unknown>>`; verificar `PaginationMetaDto` vs `PaginationMeta` (documentar divergencia `page/limit` sin romper Swagger).
- [ ] **T3 — P1 paginate + where**: `paginate<T>(model, args)` tipado sin `any`; `where: any` → `Prisma.<Model>WhereInput` en cash-sessions, operator, y resto de repos.
- [ ] **T4 — P1 auth/user + controllers**: `@CurrentUser() user: any` → `AuthUser`; `fileFilter: (req: any, ..., callback: any)` → tipos Multer/Express; `@Res() res: any` donde aplique → `Response`.
- [ ] **T5 — P1 casos chicos**: `catch (err: any)` → `unknown` + narrowing; `(d: any)` → tipo de fila Prisma/DTO; `createUserData: any`, `montoAbonado: any`, `raw: any` en mappers → tipos reales o `unknown` + guard. `JsonValue` de `shared/domain/types/json.ts` para payloads JSON.
- [ ] **T6 — Verificación**: `pnpm --filter backend exec tsc --noEmit`, `pnpm --filter backend run lint`, tests afectados. Commits work-unit por T1..T5 en la rama. Sin push/PR sin autorización.

## Criterios de aceptación

- `grep ":\s*any" backend/src --exclude-dir=generated` sin contar spec baja vs baseline 119 y cero `any` en archivos tocados por T1..T5.
- `tsc --noEmit` verde, `lint` verde en archivos tocados, tests afectados verdes.
- Cada tarea cierra con commit work-unit con identidad registrada abajo.

## Progreso y evidencia

- 2026-10-10: rama `refactor/types-reuse-no-any` creada desde `develop` (49a30777). Baseline: 119 `any` en src no-generado no-spec.
- Commits: (pendiente)
