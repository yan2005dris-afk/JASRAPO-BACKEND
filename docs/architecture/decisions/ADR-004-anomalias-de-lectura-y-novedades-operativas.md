# ADR-004: Anomalías de lectura y novedades operativas

- **Estado:** Aceptado
- **Fecha:** 2026-09-17
- **Autores / Decisores:** Equipo Arquitectura JASRAPO

---

## Contexto y Problema

Una novedad observada durante una lectura puede requerir validación, resolución y un tratamiento contable propio. Si se convierte toda novedad en una orden de trabajo, se pierde el ciclo de vida de la anomalía; si se modelan las acciones de campo dentro de `LecturaAnomalia`, se duplica la responsabilidad de las órdenes y se mezclan diagnóstico y ejecución.

También es necesario distinguir la foto de una anomalía —que documenta el hallazgo— de la foto normal de una ejecución, que pertenece a la orden de trabajo según ADR-003.

## Opciones Consideradas

1. **Eliminar `LecturaAnomalia` y convertir toda novedad en una orden:** Unifica la bandeja operativa, pero pierde la validación independiente, la resolución económica y el historial del hallazgo.
2. **Mantener toda la ejecución dentro de `LecturaAnomalia`:** Conserva el contexto del hallazgo, pero duplica estados, asignación y evidencia que ya pertenecen a las órdenes de trabajo.
3. **Conservar la anomalía y derivar trabajo solo cuando sea necesario:** Mantiene el ciclo de vida de validación y contabilidad, mientras que las acciones de campo se ejecutan en una orden relacionada.

## Recomendación / Decisión Propuesta

Se recomienda **mantener `LecturaAnomalia` separada** de `OrdenesTrabajo` porque tiene un ciclo de vida independiente de validación y resolución, incluyendo `estado`, `resolucionTipo`, `consumoAjustado`, responsable y marcas de tiempo. Estos datos pueden tener consecuencias de liquidación y contabilidad, por lo que no deben quedar implícitos en una orden de campo.

La separación se aplica así:

- `LecturaAnomalia` representa el hallazgo, su validación y su resolución económica.
- La foto específica de la anomalía continúa siendo propiedad de `LecturaAnomalia`; no se confunde con la evidencia fotográfica normal de la orden.
- `OrdenesTrabajo` representa la acción de campo: inspeccionar, corregir, reconectar u otra actividad ejecutable, con sus resultados genéricos en la propia orden.
- No se duplican anomalías como novedades dentro de la orden. La orden debe referenciar el hallazgo original cuando se derive de él.
- Solo se crea una orden derivada cuando la anomalía requiere seguimiento o una acción de campo. Una anomalía que solo necesita validación o ajuste contable permanece sin orden.
- La resolución de la anomalía y el resultado de la orden son estados relacionados, pero no sustitutos: cada uno conserva su propia auditoría y autorización.

Esta decisión queda **aceptada**: las novedades permanecen separadas de la orden y no se reemplazan por campos específicos de actividad dentro de `OrdenesTrabajo`.

## Consecuencias

- **Positivas:** preserva la trazabilidad económica, evita duplicidad de anomalías y permite que el trabajo de campo evolucione independientemente del proceso de validación.
- **Trade-offs:** se requiere una relación explícita entre anomalía y orden derivada cuando exista seguimiento, además de coordinar dos ciclos de estado sin fusionarlos.

## Verificación

- **Estado de la decisión:** aceptada.
- **Verificación técnica:** la separación es compatible con el ciclo de resolución existente y con la centralización de la ejecución definida en ADR-003.
- **Pendiente:** confirmar con negocio únicamente los estados, responsables, reglas de derivación y efectos contables propios de las novedades.
