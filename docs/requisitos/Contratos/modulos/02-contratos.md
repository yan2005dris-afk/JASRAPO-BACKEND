# 02 - Contratos

Contratos

Vínculo entre cliente, medidor, tarifa y servicio.

Alcance y entradas HTTP

Controlador: ContratoMedidorController.

Servicio: ContratoMedidorService.

Casos:

CreateContractUseCase.

FindAllContractsUseCase.

FindOneContractUseCase.

UpdateContractUseCase.

FinalizeMeterLinkUseCase.

RemoveContractUseCase.

La asignación de ruta usa el servicio/repositorios; no se confirmó un caso de uso dedicado.

Ejemplo JSON

En los JSON de entrada, null representa un campo opcional omitido.

Estados

Cadena POST de creación y validaciones

La cadena confirmada es ContratoMedidorController.crear() → ContratoMedidorService.crearContrato() → CreateContractUseCase.execute() → PrismaContractRepository.

Fuentes:

backend/src/operations/contracts/application/use-cases/create-contract.use-case.ts,

backend/src/operations/contracts/infrastructure/repositories/prisma-contract.repository.ts

backend/src/operations/contracts/interfaces/dto/create-contrato-medidor.dto.ts.

Antes de escribir se validan el DTO, la existencia de cliente, categoría y medidor, la disponibilidad del medidor y la coherencia de relaciones/estado inicial. La operación se ejecuta transaccionalmente. El caso escribe contrato, historial y medidor; la prefactura de instalación tiene un camino SQL específico.

Efectos directos e indirectos

La función está en 0260822010000_add_codigo_sistema_rubro_and_update_sp/migration.sql. Crea Comprobante, ComprobanteDetalle, Prefacturas y PrefacturaDetalle. Busca el rubro por categoria_tarifa_id = v_contrato.categoria_tarifa_id y codigo_sistema_rubro = 'INSTALACION'. El criterio codigo_sri LIKE 'SERV-GUIA-%' es histórico/legacy y no es la regla vigente.

Fórmula de instalación

subtotal = precioUnitarioGuiaRemision × cantidad

iva      = ROUND(subtotal × tasaImpuesto, 2)

total    = subtotal + iva

Fuente: bloque generar_prefactura_instalacion de la misma migración SQL (aprox. líneas 80-220). cantidad corresponde a la cantidad facturada en el detalle del rubro de instalación, no a una cantidad de contratos ni de medidores. precioUnitarioGuiaRemision y tasaImpuesto son nombres conceptuales: el SQL puede persistirlos con nombres distintos en Rubros o en la tarifa de impuesto. El precio unitario se obtiene del rubro seleccionado por categoría y codigo_sistema_rubro = 'INSTALACION'.

Gráfico de estados

Estado del servicio

Alcance del diagrama: Confirmado para los estados del catálogo y las transiciones mostradas. La creación y PagoValidadoHandler están confirmados; para las demás transiciones no se encontró una operación explícita en la evidencia revisada.

A la izquierda estaria el estado actual, el objetivo es el estado derecho.

Figura: Diagrama de estados del servicio de contrato

Estado de cobranza

Alcance del diagrama: Confirmado para los valores y para la normalización de estados. ContractState no restringe la transición de cobranza; el proceso de corte puede escribir AL_DIA o EN_MORA para contratos ACTIVO. No se confirmó una flecha de negocio desde NO_APLICA hacia un estado concreto fuera de esos procesos.

Figura: Diagrama de estados de cobranza de contrato

Transiciones de estado del contrato

Cadena de transiciones confirmada

El contrato recorre los siguientes estados de estadoServicio (y estadoCobranza) en operaciones explícitas, no automáticas implícitas:

Restricciones operativas

Pago parcial no promueve el estado. PagoValidadoHandler aborta la transición si totalAbonado < totalComprobante (líneas 60-64). El contrato permanece en PENDIENTE_PAGO hasta que se cubra el 100 % del comprobante.

Solo dos tipos de orden producen transición de estado del contrato: INSTALACION (de PENDIENTE_INSTALACION a ACTIVO) y RECONEXION (de SUSPENDIDO a ACTIVO). Otros tipos de actividad pasan por el helper sin efecto sobre estadoServicio.

Validación defensiva del estado origen (líneas 379-388 del helper): si el contrato no está exactamente en el estado requerido por el tipo de orden, el helper rechaza con InvalidDomainOperationException en vez de transicionar. Esto evita saltos inválidos.

Atomicidad. La transición de estado del contrato, la marca de prefactura como PAGADA y el disparo de emisión SRI ocurren dentro de la misma transacción Prisma; no hay estados intermedios observables desde la API.

Estado actual de implementación

Todas las transiciones marcadas con implementación arriba están operativas y verificadas en código. La transición a RETIRADO no tiene handler identificado.

Casos de uso

Caso: Crear contrato

Descripción: crea el contrato y prepara la instalación del medidor.

HTTP y ruta: POST /api/v1/contracts.

Permiso: contracts:create.

Cadena: ContratoMedidorController.crear() → ContratoMedidorService.crearContrato() → CreateContractUseCase.execute() → repositorios.

Errores relevantes: 400 datos/relaciones inválidas; 401; 403; 404; medidor no disponible.

Efectos: crea directamente Contratos, HistorialMedidores y Medidores; invoca la función SQL dentro de la transacción cuando corresponde.

Prisma/SQL: Contratos, HistorialMedidores, Medidores, CategoriaTarifa, Clientes; indirectamente Comprobantes, ComprobanteDetalle, Prefacturas, PrefacturaDetalle y Rubros.

Entrada:

Salida:

Caso: Listar contratos

Descripción: devuelve contratos filtrados y paginados.

HTTP y ruta: GET /api/v1/contracts.

Permiso: contracts:read.

Cadena: ContratoMedidorController.buscarContratos() → ContratoMedidorService.buscarContratos() → FindAllContractsUseCase.execute() → repositorio.

Errores relevantes: 400 query inválida; 401; 403.

Efectos: ninguno; consulta y DTO puros.

Prisma: Contratos, Clientes, Medidores, CategoriaTarifa.

Entrada: sin body; query del FilterContractsDto (paginación y filtros definidos por el DTO).

Salida:

Caso: Obtener contrato

Descripción: consulta el detalle de un contrato.

HTTP y ruta: GET /api/v1/contracts/:id.

Permiso: contracts:read.

Cadena: ContratoMedidorController.buscarContrato() → ContratoMedidorService.buscarContrato() → FindOneContractUseCase.execute() → repositorio.

Errores relevantes: 400; 401; 403; 404.

Efectos: ninguno; mapeo puro.

Prisma: Contratos, Clientes, Medidores, CategoriaTarifa, HistorialMedidores.

Entrada: sin body; path id=1.

Salida:

Caso: Actualizar contrato

Descripción: actualiza estados, dirección, sector o reemplaza el medidor si se envía medidorId.

HTTP y ruta: PATCH /api/v1/contracts/:id.

Permiso: contracts:update.

Cadena: ContratoMedidorController.actualizarContrato() → ContratoMedidorService.actualizar() → UpdateContractUseCase.execute() → repositorio.

Errores relevantes: 400; 401; 403; 404; conflicto de estado/relación.

Efectos: actualización; el reemplazo indicado se ejecuta transaccionalmente según el caso.

Prisma: Contratos, Medidores, HistorialMedidores.

Entrada: path id=1; body:

Salida:

Caso: Finalizar vínculo de medidor

Descripción: finaliza el vínculo activo del contrato con su medidor.

HTTP y ruta: POST /api/v1/contracts/:id/finalize.

Permiso: contracts:update.

Cadena: ContratoMedidorController.finalizarVinculo() → ContratoMedidorService.finalizarVinculo() → FinalizeMeterLinkUseCase.execute() → repositorio.

Errores relevantes: 400; 401; 403; 404.

Efectos: registra el cierre en el historial.

Prisma: HistorialMedidores, Contratos, Medidores.

Entrada: sin body; path id=1.

Salida:

Caso: Asignar ruta de instalación

Descripción: asigna un contrato pendiente de instalación a una ruta existente o crea una ruta de instalación y su orden.

HTTP y ruta: POST /api/v1/contracts/:id/assign-installation-route.

Permiso: contracts:update.

Cadena: ContratoMedidorController.assignInstallationRoute() → ContratoMedidorService.assignInstallationRoute() → repositorios de rutas/órdenes.

Errores relevantes: 400; 401; 403; 404; ruta destino inválida.

Efectos: crea/reutiliza Rutas y crea OrdenTrabajo; no se confirma atomicidad de ambas escrituras.

Prisma: Rutas, OrdenTrabajo, Contratos, Medidores.

Entrada: path id=1; body opcional:

También puede omitirse routeId, según el DTO.

Salida:

Caso: Eliminar contrato

Descripción: marca el contrato como eliminado lógicamente.

HTTP y ruta: DELETE /api/v1/contracts/:id.

Permiso: contracts:delete.

Cadena: ContratoMedidorController.eliminarContrato() → ContratoMedidorService.eliminar() → RemoveContractUseCase.execute() → repositorio.

Errores relevantes: 400; 401; 403; 404.

Efectos: soft delete en Contratos.

Prisma: Contratos.

Entrada: sin body; path id=1.

Salida:

Caso: Generar PDF de solicitud de conexión

Descripción: genera la solicitud oficial de conexión.

HTTP y ruta: GET /api/v1/contracts/:id/pdf/connection-request.

Permiso: contracts:read.

Cadena: ContratoMedidorController.connectionRequestPdf() → ContratoMedidorService.generateConnectionRequestPdf() → GetConnectionRequestPdfDataUseCase → generador.

Errores relevantes: 400; 401; 403; 404; aborto de solicitud.

Efectos: sólo lectura y proyección; serialización PDF pura.

Prisma: Contratos, Clientes, Medidores, CategoriaTarifa.

Entrada: sin body; path id=1.

Salida: no es JSON: Content-Type: application/pdf, Content-Disposition: inline y Content-Length, con bytes PDF.

Caso: Generar PDF de acuerdo de responsabilidad

Descripción: genera el acta de responsabilidad asociada al contrato.

HTTP y ruta: GET /api/v1/contracts/:id/pdf/responsibility-agreement.

Permiso: contracts:read.

Cadena: ContratoMedidorController.responsibilityAgreementPdf() → ContratoMedidorService.generateResponsibilityAgreementPdf() → GetResponsibilityAgreementPdfDataUseCase → generador.

Errores relevantes: 400; 401; 403; 404; aborto de solicitud.

Efectos: no se confirma escritura de dominio; proyección y PDF puros.

Prisma: Contratos, Clientes, Medidores, HistorialMedidores.

Entrada: sin body; path id=1.

Salida: no es JSON: application/pdf, Content-Disposition: inline, Content-Length y bytes PDF.

No documentado o pendiente de confirmar

Pendiente de confirmar contra código actual:

Forma exacta de los cuerpos de request/response para POST /api/v1/contracts/:id/finalize y POST /api/v1/contracts/:id/assign-installation-route. Los DTOs pueden haber cambiado desde la última revisión del documento.

Sincronización del campo legacy estado (columna persistida en contratos, distinta de estadoServicio). Si un cambio de estado se aplica por SQL directo sin pasar por el repositorio Prisma, las dos columnas podrían quedar desalineadas.

Handler explícito para la transición ACTIVO → RETIRADO. Hoy no hay handler identificado en el código revisado; el cierre operativo del contrato se hace vía DELETE /api/v1/contracts/:id (soft delete), pero eso no cambia estadoServicio a RETIRADO.