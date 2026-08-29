# Registro de Decisiones Arquitectónicas (ADRs)

Este directorio contiene el registro formal de las decisiones arquitectónicas clave adoptadas en el proyecto JASRAPO. Seguimos la metodología **MADR** (*Markdown Architectural Decision Records*).

---

## Índice de Decisiones (ADRs)

| ID | Título | Estado | Fecha | PR / Ref |
| :--- | :--- | :--- | :--- | :--- |
| [ADR-001](./ADR-001-encapsulacion-infraestructura-core-module.md) | Centralización y encapsulación de infraestructura en `CoreModule` | **Aceptado** | 2026-08-23 | PR #235 (SC-234) |
| [ADR-002](./ADR-002-inmutabilidad-lecturas-fisicas-y-resolucion-anomalias.md) | Inmutabilidad de lecturas físicas en BD y resolución económica de anomalías | **Aceptado** | 2026-08-23 | PR #236 (SC-192) |
| [ADR-003](./ADR-003-ordenes-trabajo-evidencia-y-lecturas.md) | Órdenes de trabajo, evidencia y lecturas operativas | **Aceptado** | 2026-08-28 | — |
| [ADR-004](./ADR-004-anomalias-de-lectura-y-novedades-operativas.md) | Anomalías de lectura y novedades operativas | **Propuesto** | 2026-08-28 | — |

---

## Cómo Proponer un Nuevo ADR

1. Copiar `template.md` asignando el siguiente correlativo (ej. `ADR-005-...md`).
2. Completar contexto, opciones analizadas y justificación de trade-offs.
3. Crear el Pull Request y agregar la entrada a esta tabla de índice.
