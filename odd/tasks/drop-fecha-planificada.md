# Feature: Drop fecha_planificada from Routes

## Objective
Completely remove `fechaPlanificada` / `fecha_planificada` from the database schema, Prisma model, backend domain, application use cases, DTOs, mappers, PDF field sheets, tests, and frontend contracts.

## Scope & Constraints
- Database: Run Prisma migration to drop column `fecha_planificada` and index `rutas_fecha_planificada_idx` from table `rutas`.
- Backend: Clean entity, repository, mappers, use cases, DTOs, PDF generator, and tests.
- Frontend: Ensure no stale references to `fechaPlanificada` break compilation.
- TDD Mode: Functional test suite verification (`pnpm --filter backend test`).

## Tasks
- [x] Task 1: Update `Rutas.prisma` and execute Prisma migration to drop `fecha_planificada` column.
- [x] Task 2: Remove `fechaPlanificada` from Domain Entities, Types, Repository interface, and Mappers.
- [x] Task 3: Remove `fechaPlanificada` from Application Use Cases and PDF generator.
- [x] Task 4: Remove `fechaPlanificada` from DTOs and Controller specs.
- [x] Task 5: Update all affected backend unit tests and verify `pnpm --filter backend test` passes.
- [x] Task 6: Verify frontend for stale types/references and run `pnpm --filter frontend test` or `build`.
