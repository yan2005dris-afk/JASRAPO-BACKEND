# Feature: Disolver `infrastructure/common` — separación de responsabilidades

**Branch base**: `develop`
**Rama**: `refactor/split-infrastructure-common`
**Origen**: revisión de arquitectura 2026-10-10 — `infrastructure/common/` mezcla cableado Nest con utilidades puras bajo un nombre que miente sobre la dirección de dependencias.

## Diagnóstico

`infrastructure/` en hexagonal son adaptadores que implementan puertos (DB, mail, colas, storage). Pero `common/` contiene bloques del framework (decorators, guards, filters, interceptors, pipes) + utils puras + tipos HTTP. Evidencia de que existe por inercia: `dtos/` quedó vacío tras mover paginación a `shared/pagination/`.

Hallazgo clave del inventario: los "duplicados" `phone.util` / `validation.util` NO son accidente — `shared/utils/` tiene las versiones puras (sin framework) y `infrastructure/common/utils/` las acopladas a Nest (`BadRequestException`). Esa separación está bien y se preserva: lo puro ya vive en `shared`, lo acoplado va a `src/common`.

## Destino por pieza (contrato)

- **`src/common/` (nuevo, bloques Nest, sin lógica de negocio)**: `decorators/` (7), `filters/` (2+spec), `guards/` (permissions+spec), `interceptors/` (4+3 specs), `pipes/` (4), `types/auth-request.types.ts` (shape Express), `utils/phone.util.ts` + `utils/validation.util.ts` (clases que lanzan HTTP exceptions).
- **`src/shared/utils/` (puros, ya existe)**: `file`, `image-processor`, `url`, `env` (solo node stdlib/sharp, cero Nest).
- **`src/shared/resilience/circuit-breaker.ts`** (nuevo dir, primitiva genérica; hoy solo la usa SRI).
- **`infrastructure/storage/evidence-upload.util.ts`** (+spec): importa `StorageService`, es infra-bound, vive junto a su adaptador.
- **Eliminar**: `interfaces/response.interface.ts` (`ApiResponse`/`FileInfo`, 0 usos) + dir; `infrastructure/common/` completo si queda vacío.
- **Caso especial**: `guards/jwt-auth.guard.spec.ts` testea el guard de identity → se muda junto a su sujeto (`identity/auth/interfaces/http/guards/`).

Fuera de alcance: renombrar símbolos, cambiar lógica, tocar `shared/utils` puros existentes.

## Restricciones

- Solo rutas de import + `git mv`; cero cambios de comportamiento.
- Sin barrels `index.ts` (convención del repo, commit 3a02cd50): imports directos.
- `tsc --noEmit` sin errores nuevos vs baseline de la rama; `eslint` limpio; suites tocadas en verde.
- Commits work-unit; push + PR al final (el PR exige `Closes #N` con issue aprobado — lo indica el maintainer).

## Checklist

- [ ] **T1**: `git mv` bloques Nest → `src/common/` (decorators, filters, guards, interceptors, pipes, types, utils acoplados).
- [ ] **T2**: `git mv` puros → `src/shared/utils/`; circuit-breaker → `src/shared/resilience/`; evidence-upload → `infrastructure/storage/`; spec jwt-auth → identity guards.
- [ ] **T3**: eliminar `interfaces/response.interface.ts`; borrar dirs vacíos de `infrastructure/common/`.
- [ ] **T4**: bulk `sed` de imports (~93 archivos) + fix de imports relativos; `tsc`, `eslint`, `jest` afectado.
- [ ] **T5**: commit + push + PR con `type:refactor`.

## Progreso y evidencia

- 2026-10-10: rama creada desde `develop` (merge #406 incluido).
