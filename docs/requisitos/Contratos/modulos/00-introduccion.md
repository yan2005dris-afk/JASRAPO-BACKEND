# 00 - Introducción y Criterios Transversales

JASRAPO BACKEND • ESPECIFICACIÓN TÉCNICA

Documentación del Dominio de Contratos

Arquitectura, Estados, Casos de Uso, Rutas de Instalación, Lecturas y Persistencia

――――――――――――――――――――――――――――――――――――――――

Documentación del dominio de contratos

Propósito

Esta carpeta reúne, en un orden estable y apto para una futura composición formal, la documentación técnica verificable del dominio de contratos del backend. Sirve como índice de lectura para revisar el comportamiento actual de la API, sus casos de uso, persistencia y pendientes conocidos.

Alcance

El conjunto cubre clientes, contratos, convenios de pago, rutas y órdenes de trabajo, lecturas, consumo, medidores y categorías tarifarias. La API utiliza el prefijo global /api/v1; las rutas se muestran con ese prefijo. La documentación describe el código actual, no el comportamiento deseado ni endpoints retirados, salvo las decisiones marcadas explícitamente como propuestas y pendientes de implementación.

Decisión funcional sobre novedades

Decisión funcional propuesta — pendiente de implementación: no se agregará un estado persistido NOVEDAD a OrdenTrabajo. La orden permanecerá en EN_PROGRESO mientras exista una novedad y la interfaz mostrará tieneNovedadActiva como indicador derivado de la relación con NovedadOrdenTrabajo. Se mantienen separadas las máquinas de OrdenTrabajo.estado (ejecución operativa), NovedadOrdenTrabajo.estado (análisis de anomalía) y Lectura.estado (captura y validación del dato). El backend deberá impedir COMPLETADA cuando una novedad abierta afecte el resultado; queda pendiente definir el criterio de bloqueo.

Fuente de verdad

Comportamiento operativo: controladores, servicios, casos de uso y repositorios implementados en backend/.

Persistencia: modelos y relaciones Prisma referenciados por cada documento.

Cuando una transición, atomicidad o integración no pudo confirmarse, se conserva como pendiente explícito.

Estructura documental

Alcance y convenciones: criterios transversales de lectura, formato y límites de la documentación.

Clientes: identidad y datos del titular.

Contratos: vínculo cliente–medidor–tarifa y ciclo del servicio.

Convenios de pago: financiación de deuda, cuotas y pagos relacionados.

Rutas y órdenes: despacho, instalación y operación de campo.

Lecturas: captura, revisión y operación de lecturas.

El cálculo de consumo está documentado dentro de Lecturas y consumo.

Medidores: inventario, vínculos, reemplazos y retiro operativo.

Categorías tarifarias: vigencias, rubros y clasificación tarifaria.

Mapa del dominio

Flujo transversal verificable

Contrato → prefactura de instalación.  la creación puede invocar SELECT generar_prefactura_instalacion(...) dentro de la transacción cuando estadoServicio=PENDIENTE_PAGO.

Prefactura → pago validado.  PagoValidadoHandler actualiza prefacturas y, para instalación, lleva el contrato a PENDIENTE_INSTALACION con cobranza NO_APLICA.

Pago validado → instalación. Confirmado el estado PENDIENTE_INSTALACION; no se encontró una transición automática posterior a ACTIVO.

Instalación → lecturas/consumo. Confirmadas las superficies de rutas, órdenes, lecturas y cálculo de consumo; no se encontró un controlador independiente de consumo.

Lecturas/consumo → prefacturación mensual. La relación operativa está documentada, pero no se encontró una fórmula completa de prefacturación mensual.

Prefacturas → convenios/pagos. Confirmado: el resumen usa prefacturas no eliminadas en GENERADA, EN_REVISION o APROBADA; CuotaPagadaHandler verifica cuotas y dispara emisión SRI.

Alcance y convenciones

Propósito

Este documento consolida los criterios transversales usados para leer los documentos de dominio y delimita qué se considera comportamiento confirmado, efecto persistente o pendiente.

Convenciones de API

La API utiliza el prefijo global /api/v1.

Cada endpoint requiere autenticación Bearer y el permiso indicado por su controlador, salvo que el documento señale otra cosa.

Los identificadores BigInt se transportan como strings en las respuestas JSON.

Las respuestas paginadas usan data y meta; los campos concretos de meta dependen del DTO o caso de uso.

Las respuestas de exportación o generación documental pueden ser archivos (text/csv o application/pdf) y no JSON.

Convenciones de persistencia y lectura

deletedAt representa eliminación lógica; no implica borrado físico.

Una transformación DTO pura adapta entidades a JSON y no se considera un efecto de dominio.

Las tablas Prisma listadas en cada caso representan las superficies de lectura o escritura observadas, no necesariamente todas las tablas transitivas.

“Transaccional” se reserva para operaciones cuya transacción está confirmada en el caso de uso; si no se confirmó atomicidad, se declara expresamente.

Las escrituras externas, como RustFS, se distinguen de las escrituras Prisma y se documentan como efectos reales.

Convenciones de casos de uso

Cada caso de uso conserva, cuando está disponible, la siguiente ficha:

Estados y pendientes

Los diagramas Mermaid son mapas de los estados y transiciones confirmados; no completan automáticamente las transiciones que el código no permite verificar.

Las secciones “No documentado o pendiente de confirmar” son parte de la documentación: no deben reinterpretarse como comportamiento vigente.

Cuando conviven campos legacy y estados separados, se documentan por separado y se conserva la duda de sincronización.

Decisión funcional propuesta sobre novedades

No se agregará un estado persistido NOVEDAD a OrdenTrabajo. La orden permanecerá en EN_PROGRESO mientras exista una novedad y la UI mostrará una alerta derivada de la relación de novedades activas. OrdenTrabajo.estado continúa representando la ejecución operativa; NovedadOrdenTrabajo.estado, el análisis de la anomalía; y Lectura.estado, la captura y validación del dato. NOVEDAD es un indicador derivado, no un valor de enum.

Esta decisión está pendiente de implementación. Como regla propuesta, el backend debe impedir COMPLETADA si una novedad abierta afecta el resultado, sin depender sólo de la UI. También está pendiente definir el criterio que determina si una novedad es bloqueante (afectaOrden, tipo, resolución o regla equivalente).

Niveles de evidencia

Cada afirmación se etiqueta como Confirmada, Inferida o No encontrada. La evidencia confirmada proviene de código, esquema Prisma, migraciones o handlers registrados y se cita con ruta relativa y línea aproximada. La evidencia inferida se presenta como inferencia, nunca como garantía. Cuando no se halló una fórmula, handler, rollback, transición o integración, se escribe literalmente No se encontró....

Las fórmulas sólo se documentan como vigentes cuando tienen una fuente verificable; cada fórmula debe indicar archivo, símbolo y línea aproximada.

Criterio de fuente

Esta carpeta es una copia reorganizada de docs/architecture/modules/mejora/contratos/. El código implementado y el esquema Prisma siguen siendo la fuente primaria para resolver discrepancias futuras. Los nombres de archivo numerados son deliberadamente estables para una futura compilación o documento formal.