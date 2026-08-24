# ADR-002: Inmutabilidad de Lecturas Físicas en BD y Resolución Económica de Anomalías

- **Estado:** Aceptado
- **Fecha:** 2026-08-23
- **Autores / Decisores:** Equipo Arquitectura JASRAPO
- **Referencia:** PR #236 / Tarea SC-192

---

## Contexto y Problema
Existía el riesgo de que correcciones operativas en campo o procesos manuales sobreescribieran lecturas físicas históricas (`lectura_actual` o `consumo_calculado`) que ya habían sido aprobadas o planilladas/facturadas, rompiendo la trazabilidad contable y auditoría del SRI.

## Opciones Consideradas
1. **Validación exclusiva a nivel de código de aplicación (NestJS Services):** Vulnerable a actualizaciones directas vía scripts SQL, migraciones o fallos lógicos en use-cases.
2. **Restricción a nivel de Base de Datos mediante Trigger SQL:** Garantiza inmutabilidad estricta e incontestable en el motor PostgreSQL.

## Decisión Tomada
Se implementó el trigger `trg_prevent_immutable_reading_update` en PostgreSQL ejecutado `BEFORE UPDATE` en la tabla `lecturas`. Si una lectura está en estado `APROBADA` o `PLANILLADA`, cualquier intento de modificar `lectura_actual` o `consumo_calculado` genera una excepción fatal `INVARIANTE VIOLADA`.

Adicionalmente, se habilitó el ciclo de resolución económica de anomalías (`LecturaAnomalia`) con auditoría explícita (`resolucion_tipo`, `consumo_ajustado`, `resuelto_por_usuario_id`, `resuelto_en`).

## Consecuencias
- **Positivas:** Integridad contable blindada, cumplimiento tributario con SRI y trazabilidad inmutable de mediciones físicas.
- **Trade-offs:** Cualquier ajuste posterior a una factura debe realizarse mediante mecanismos contables (notas de crédito o compensación) y nunca alterando la medición original.
