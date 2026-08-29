# ADR-003: Órdenes de trabajo, evidencia y lecturas operativas

- **Estado:** Aceptado
- **Fecha:** 2026-08-28
- **Autores / Decisores:** Equipo Arquitectura JASRAPO

---

## Contexto y Problema

La operación de campo mezclaba en las lecturas y en el operador acciones de ejecución, evidencia fotográfica y registro de mediciones. Esto dificultaba distinguir el trabajo planificado de su resultado, permitía crear lecturas fuera de una ruta y dejaba ambigua la responsabilidad sobre las actualizaciones de una orden.

Además, la instalación se estaba modelando como si el operador registrara un medidor nuevo, cuando la orden de instalación ejecuta sobre el medidor que ya existe en el expediente. Las fotos normales de la ejecución tampoco deben duplicarse en cada lectura.

## Opciones Consideradas

1. **Mantener POST independientes para cada acción del operador:** Conserva endpoints legados, pero permite mutaciones fuera de una orden, duplica evidencia y no expresa quién es dueño de la transición.
2. **Usar la lectura como contenedor de toda la ejecución:** Simplifica el formulario, pero mezcla medición con actividad de campo y hace que la foto de una ejecución parezca una propiedad de la lectura.
3. **Centralizar la ejecución en la orden de trabajo:** La orden es el agregado operativo; sus actualizaciones del operador son parciales (`PATCH`), la evidencia pertenece a la ejecución y cada lectura operativa queda vinculada a ruta y orden.

## Decisión Tomada

Se adopta la orden de trabajo como dueño de la ejecución operativa:

- Las actualizaciones del operador sobre una orden de trabajo son **únicamente `PATCH`**. El operador solo puede modificar los campos y el estado permitidos para su orden; la autorización y la propiedad de la transición se validan en el backend.
- La instalación registra la ejecución sobre el **medidor preexistente** asociado al expediente. No crea ni registra un medidor nuevo desde el flujo operativo legado.
- Las fotos de evidencia de la orden se almacenan en **RustFS**. `OrdenesTrabajo.evidenciaFotoUrl` conserva únicamente la clave del objeto, nunca el binario ni una URL pública persistente.
- `EjecucionesOrdenTrabajo` conserva los campos estructurados propios de la actividad ejecutada. Así, instalación, inspección, reconexión y lectura pueden tener resultados específicos sin sobrecargar `Lecturas` con datos de ejecución.
- `Lecturas` deja de ser propietaria de la foto normal de la operación. La foto ordinaria se adjunta a la orden; la foto de una anomalía de lectura permanece en `LecturaAnomalia` (véase ADR-004).
- Toda lectura operativa debe estar vinculada a su **ruta y orden de trabajo**. No se permite la creación de lecturas operativas independientes.
- La pantalla de lecturas es de **solo consulta para crear** una lectura: no ofrece creación autónoma, pero sí permite editar una lectura existente conforme a sus reglas de inmutabilidad y autorización.
- En Angular se sigue la convención del frontend de usar **Signals** para el estado reactivo de estas pantallas, formularios y sincronización; no se introduce un patrón paralelo de estado.
- Se eliminan el POST legado del operador para instalar medidores y la creación independiente de lecturas. El flujo equivalente parte de una orden de trabajo y registra su ejecución.

## Migración y Operación Offline

La migración debe:

1. trasladar o respaldar la referencia de las fotos normales existentes al contexto de la orden de trabajo, conservando las claves de RustFS y la trazabilidad;
2. hacer el *backfill* de las relaciones de las lecturas existentes con ruta y orden cuando la relación pueda determinarse de forma segura;
3. validar conteos, claves y relaciones antes de eliminar la columna de foto normal de `Lecturas` y retirar los endpoints legados.

Los registros sin una relación determinable no se eliminan silenciosamente: quedan reportados para conciliación antes del *drop*. El cliente offline debe encolar la actualización `PATCH` de la orden junto con la carga de evidencia a RustFS, conservar la clave/idempotencia para reintentos y publicar la lectura solo dentro de la orden correspondiente. Los reintentos no deben crear ejecuciones ni evidencias duplicadas.

## Consecuencias

- **Positivas:** responsabilidad clara, trazabilidad de campo, evidencia centralizada, lecturas con contexto operativo obligatorio y resultados estructurados por actividad.
- **Trade-offs:** los clientes deben migrar de POST independientes a `PATCH`; la sincronización offline necesita manejar orden, evidencia y lectura como una operación relacionada; el *backfill* requiere conciliación de datos históricos.

## Verificación

- **Estado de la decisión:** aceptado.
- **Verificación técnica:** realizada mediante la revisión de los cambios de backend y frontend asociados al flujo de órdenes, migraciones y sincronización offline.
- **Pendiente operativo:** ejecutar la migración en un entorno controlado, verificar el *backfill* y confirmar que no quedan consumidores de los endpoints legados antes de producción.
