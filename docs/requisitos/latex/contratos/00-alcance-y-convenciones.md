# Alcance y convenciones

## Propósito

Este documento consolida los criterios transversales usados para leer los documentos de dominio y delimita qué se considera comportamiento confirmado, efecto persistente o pendiente.

## Convenciones de API

- La API utiliza el prefijo global `/api/v1`.
- Cada endpoint requiere autenticación Bearer y el permiso indicado por su controlador, salvo que el documento señale otra cosa.
- Los identificadores `BigInt` se transportan como strings en las respuestas JSON.
- Las respuestas paginadas usan `data` y `meta`; los campos concretos de `meta` dependen del DTO o caso de uso.
- Las respuestas de exportación o generación documental pueden ser archivos (`text/csv` o `application/pdf`) y no JSON.

## Convenciones de persistencia y lectura

- `deletedAt` representa eliminación lógica; no implica borrado físico.
- Una transformación DTO pura adapta entidades a JSON y no se considera un efecto de dominio.
- Las tablas Prisma listadas en cada caso representan las superficies de lectura o escritura observadas, no necesariamente todas las tablas transitivas.
- “Transaccional” se reserva para operaciones cuya transacción está confirmada en el caso de uso; si no se confirmó atomicidad, se declara expresamente.
- Las escrituras externas, como RustFS, se distinguen de las escrituras Prisma y se documentan como efectos reales.

## Convenciones de casos de uso

Cada caso de uso conserva, cuando está disponible, la siguiente ficha:

| Campo | Qué documenta |
|---|---|
| Descripción | Resultado funcional de la operación. |
| HTTP y ruta | Método, prefijo y parámetros relevantes. |
| Permiso | Permiso exigido por el controlador. |
| Cadena | Controlador, servicio, caso de uso y repositorio o adaptador. |
| Errores relevantes | Validación, autenticación, autorización, inexistencia, conflicto o aborto. |
| Efectos | Escrituras, archivos, handlers y cambios derivados. |
| Prisma | Tablas consultadas o modificadas. |
| Entrada | Body, path, query, multipart o identidad del JWT. |
| Salida | JSON, lista paginada, catálogo o archivo. |

## Estados y pendientes

- Los diagramas Mermaid son mapas de los estados y transiciones confirmados; no completan automáticamente las transiciones que el código no permite verificar.
- Las secciones “No documentado o pendiente de confirmar” son parte de la documentación: no deben reinterpretarse como comportamiento vigente.
- Cuando conviven campos legacy y estados separados, se documentan por separado y se conserva la duda de sincronización.

### Decisión funcional propuesta sobre novedades

No se agregará un estado persistido `NOVEDAD` a `OrdenTrabajo`. La orden permanecerá en `EN_PROGRESO` mientras exista una novedad y la UI mostrará una alerta derivada de la relación de novedades activas. `OrdenTrabajo.estado` continúa representando la ejecución operativa; `NovedadOrdenTrabajo.estado`, el análisis de la anomalía; y `Lectura.estado`, la captura y validación del dato. `NOVEDAD` es un indicador derivado, no un valor de enum.

Esta decisión está **pendiente de implementación**. Como regla propuesta, el backend debe impedir `COMPLETADA` si una novedad abierta afecta el resultado, sin depender sólo de la UI. También está pendiente definir el criterio que determina si una novedad es bloqueante (`afectaOrden`, tipo, resolución o regla equivalente).

## Niveles de evidencia

Cada afirmación se etiqueta como **Confirmada**, **Inferida** o **No encontrada**. La evidencia confirmada proviene de código, esquema Prisma, migraciones o handlers registrados y se cita con ruta relativa y línea aproximada. La evidencia inferida se presenta como inferencia, nunca como garantía. Cuando no se halló una fórmula, handler, rollback, transición o integración, se escribe literalmente `No se encontró...`.

Las fórmulas sólo se documentan como vigentes cuando tienen una fuente verificable; cada fórmula debe indicar archivo, símbolo y línea aproximada.

## Criterio de fuente

Esta carpeta es una copia reorganizada de `docs/architecture/modules/mejora/contratos/`. El código implementado y el esquema Prisma siguen siendo la fuente primaria para resolver discrepancias futuras. Los nombres de archivo numerados son deliberadamente estables para una futura compilación o documento formal.
