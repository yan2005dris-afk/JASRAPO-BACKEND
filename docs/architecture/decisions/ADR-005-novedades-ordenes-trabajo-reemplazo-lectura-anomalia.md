# ADR-005: Novedades de órdenes de trabajo como reemplazo de `LecturaAnomalia`

- **Estado:** Aceptado
- **Fecha:** 2026-09-01
- **Autores / Decisores:** Equipo Arquitectura JASRAPO
- **Supersede:** ADR-004 (se conserva sin modificaciones como registro histórico)

---

## Contexto y autorización

El negocio autoriza formalmente el reemplazo de `LecturaAnomalia` por `NovedadOrdenTrabajo`. La migración debe ser histórica, determinista y sin pérdida: todos los registros, identificadores, relaciones, estados, evidencia fotográfica, auditoría y datos de resolución económica deben preservarse o mapearse explícitamente.

ADR-004 registró la separación conceptual preliminar entre anomalía y orden de trabajo. Este ADR formaliza las decisiones definitivas de implementación y arquitectura, supersediendo a ADR-004 sin alterar su texto histórico.

## Decisiones arquitectónicas confirmadas

1. **Ownership estricto por orden de trabajo (`ordenTrabajoId` obligatorio):** Toda novedad pertenece a exactamente una orden de trabajo originadora. La orden es la dueña del ciclo de vida y la resolución de la novedad.
2. **Contexto de lectura opcional (`lecturaId` nullable):** La relación con `Lecturas` es meramente contextual. Si se provee, la lectura debe pertenecer a la misma orden originadora; se rechaza cualquier contexto cruzado.
3. **Ciclo de vida y mapa de estados:** Se adoptan 4 estados: `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED` (terminales: `RESOLVED` y `CANCELLED`). Mapeo histórico:
   - `PENDIENTE` → `OPEN`
   - `EN_REVISION` → `IN_PROGRESS`
   - `RESUELTA` → `RESOLVED`
   - `DESCARTADA` → `CANCELLED`
4. **Independencia de máquinas de estado:** Las transiciones de una novedad no alteran de forma implícita el estado de la lectura ni de la orden de trabajo.
5. **Frontera de colas offline en desarrollo:** El entorno de desarrollo permite limpiar colas locales en IndexedDB durante el cutover. Esto se documenta como reinicio local y no como pérdida de datos del servidor.
6. **Secuencia de migración expand / backfill / verify / cutover:** Esquema aditivo sin destruir la fuente histórica (`lectura_anomalia`), preflight que verifica que cada anomalía pertenezca a exactamente una orden, y backfill idempotente que preserva IDs y valores.
7. **Compuerta de retiro del legado:** La tabla `lectura_anomalia`, sus endpoints y permisos se retirarán en una etapa posterior e independiente, únicamente tras verificar cero referencias activas en el repositorio.

## Invariantes de migración

- Reconciliación 1 a 1 de filas antes y después del backfill.
- Ninguna pérdida de `foto_url`, timestamps, soft delete (`borrado_en`), observaciones ni datos de resolución económica (`resolucion_tipo`, `consumo_ajustado`, `observacion_resolucion`).
- Bloqueo sin mutación si alguna anomalía histórica no cuenta con orden de trabajo o presenta candidatos ambiguos.
- Idempotencia estricta: reejecuciones posteriores no duplican ni alteran datos previamente migrados.
