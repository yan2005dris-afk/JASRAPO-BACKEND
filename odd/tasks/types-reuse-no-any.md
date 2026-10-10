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

- [x] **T1 — P0 paginación canónica**: `pagination.types.ts` como único dueño (`PaginationParams`, `PaginationOffset`, `PaginateOptions`, `PaginatedResult<T, K = unknown>`); `PaginationParams` duplicado de `pagination.util.ts` convertido en alias deprecated; `PaginateOptions` re-exportado; `paginate(model: unknown)` sin `any`.
- [x] **T2 — P0 decorator + DTOs**: `ApiPaginatedResponse <TModel extends Type<unknown>>`; divergencia `PaginationMeta`/`PaginationMetaDto` documentada sin romper Swagger.
- [x] **T3 — P1 paginate + where**: `paginate` sin `any`; `where: any` → `Prisma.*WhereInput` / `RouteFilters` (cash-sessions, operator x6, usuarios, routes).
- [x] **T4 — P1 auth/user + controllers**: `@CurrentUser() user: any` → `JwtPayload` (+spec con `mockUser`); `fileFilter` y `@Res()` tipados.
- [x] **T5 — P1 casos chicos**: `catch (err: any)` → `unknown` + narrowing; lambdas `(d: any)` con shapes locales; `createUserData`/`InvitationUser`/role-permission/`montoAbonado` tipados; `JsonValue`/`InputJsonValue` donde tocaba; `ColumnDefinition<T = unknown>`; mail `Job<SendMailOptions>`; webhook `WebHookJob` + circuit `(error: unknown)`.
- [x] **T6 — Capas novelties**: `OperatorNoveltiesService` movido de Prisma directo al puerto `OperatorRepository` (include+Row+re-export, patrón #366 Nivel 2). Servicio sin `PrismaService`; spec rewireado al puerto.
- [x] **T7 — Verificación**: `tsc --noEmit`, `eslint`, tests afectados. Commits work-unit en la rama. Sin push/PR sin autorización.

## Criterios de aceptación

- `grep ":\s*any" backend/src --exclude-dir=generated` sin contar spec baja vs baseline 119 y cero `any` en archivos tocados por T1..T5.
- `tsc --noEmit` verde, `lint` verde en archivos tocados, tests afectados verdes.
- Cada tarea cierra con commit work-unit con identidad registrada abajo.

## Progreso y evidencia

- 2026-10-10: rama `refactor/types-reuse-no-any` creada desde `develop` (49a30777). Baseline: 119 `any` en src no-generado no-spec; tsc 165 errores pre-existentes (specs con drift de schema, Decimal, etc.).
- 2026-10-10: `5dd95de` P0 paginación (tsc 165==165, pagination.util.spec 14/14).
- 2026-10-10: `fbbf8e7` P1 any de alto valor (tsc 165→161, 4 specs `{email}` corregidos; suites tocadas 79/79 verde).
- 2026-10-10: `df29b1a` novelties a repo infra (tsc 161==161; operator 12 suites/71 tests verde).
- `any` restantes en src no-generado no-spec: 78 (de 119). Quedan: `tx: any` documentado (SC-187), `reading.mapper raw: any` (mapper defensivo, P2), validators PipeTransform/class-validator (contrato externo exige `any`), soft-delete middleware (glue de Prisma), specs con mocks `any` (~40, chore aparte).
- `unknown` en src: uso correcto (catch, `as unknown as`, narrowing). No se toca.
