# Convenios de pago  
Financiación de deuda contractual, cuotas y efectos de pagos relacionados.  
> **Ficha de dominio:** documenta convenios, cuotas, resumen de deuda y pagos relacionados, incluidos sus estados, efectos derivados y superficies de generación de PDF.*  
## Alcance y entradas HTTP  
- **Controladores:** AgreementsController y, para pagos que afectan cuotas, PaymentsController.  
- **Servicios:** AgreementsService y PaymentsService.  
- **Casos:** GetDebtSummaryUseCase, CreateAgreementUseCase, FindOneAgreementUseCase, UpdateAgreementUseCase, GetPaymentAgreementPdfDataUseCase, CreatePaymentUseCase, ValidatePaymentUseCase, AnnulPaymentUseCase, ApplySaldoFavorUseCase.  
- Listar convenios y catálogos se resuelven directamente en los servicios; no se confirmó caso dedicado para findAll ni para catálogos.  
|-|-|-|  
| **Método y ruta** | **Caso/servicio ejecutado** | **Resultado** |   
| GET /api/v1/agreements/states | findAllAgreementStates() | Estados de convenio. |   
| GET /api/v1/agreements/installment-states | findAllInstallmentStates() | Estados de cuota. |   
| GET /api/v1/agreements/debt-summary/:contratoId | getDebtSummary() → GetDebtSummaryUseCase | Deuda. |   
| POST /api/v1/agreements | create() → CreateAgreementUseCase | Convenio y cuotas. |   
| GET /api/v1/agreements / :id / :id/installments | servicio / FindOneAgreementUseCase | Convenio/cuotas. |   
| PATCH /api/v1/agreements/:id | update() → UpdateAgreementUseCase | Estado. |   
| DELETE /api/v1/agreements/:id | cancel() → UpdateAgreementUseCase(ANULADO) | Anulación. |   
| GET /api/v1/agreements/:id/pdf | generatePdf() → GetPaymentAgreementPdfDataUseCase | PDF. |   
| POST/PATCH/DELETE /api/v1/payments... | casos de pagos | Crea, valida, aplica o anula pagos. |   

## Ejemplo JSON  
En los JSON de entrada, null representa un campo opcional omitido.  
```json
{
"convenioId": "8",
"contratoId": "1",
"deudaTotal": 240.5,
"abonoInicial": 40,
"numeroCuotas": 5,
"estado": "PENDIENTE_ABONO",
"cuotas": [
{
"cuotaConvenioId": "81",
"numeroCuota": 1,
"valorCuota": 40.1,
"estado": "PENDIENTE"
}
]
}
```

|-|-|-|  
| **Campo** | **Tipo** | **Regla/uso** |   
| convenioId, contratoId, cuotaConvenioId | string | BigInt serializado. |   
| deudaTotal, abonoInicial, valorCuota | number | Valores monetarios. |   
| numeroCuotas, numeroCuota | number | Plan y posición. |   
| estado | enum | Estado de convenio o cuota según el objeto. |   

## Estados  
|-|-|-|  
| **Entidad** | **Estados** | **Significado** |   
| Convenio | PREPARADO, PENDIENTE_ABONO, ACTIVO, PAGADO, ANULADO | Creado, abono pendiente, vigente, liquidado o anulado. |   
| Cuota | PENDIENTE, PAGADA | No liquidada o liquidada. |   
| Pago relacionado | PENDIENTE, REGISTRADO, ANULADO | Por validar, validado o anulado. |   

## Tablas, deuda y cálculo del convenio  
La relación es Contratos → Convenios → CuotaConvenio → PrefacturaDetalle → Prefacturas. El esquema se encuentra en backend/prisma/schema/models/logica-de-negocio/Contratos.prisma, Convenios.prisma, CuotaConvenio.prisma y en backend/prisma/schema/models/facturacion/Prefacturas.prisma, PrefacturaDetalle.prisma.  
La fuente de deuda son prefacturas no eliminadas (deletedAt IS NULL) con estado GENERADA, EN_REVISION o APROBADA. Por prefactura:  
saldoPrefactura = max(0, totalPagar - abono)  
deudaTotal = ROUND_HALF_UP(Σ saldoPrefactura, 2)  

mesesMoraActual cuenta prefacturas con saldo positivo. deudaAnterior busca el período inmediatamente anterior; esto depende de la continuidad/identificación de períodos y no equivale necesariamente a un calendario civil completo ni a una política automática de corte. Fuentes: backend/src/billing/collections/agreements/application/use-cases/get-debt-summary.use-case.ts (aprox. líneas 20-170), backend/src/billing/collections/agreements/infrastructure/repositories/prisma-agreement.repository.ts (aprox. líneas 1-260) y backend/src/shared/utils/debt-calculator.util.ts (aprox. líneas 1-180).  
Para crear cuotas, tasaMensual = tasa / 100. El interés lineal y la distribución confirmados son:  
interes = (deudaTotal - abonoInicial) × tasaMensual × numeroCuotas  
cuotaBase = TRUNC(totalADistribuir / numeroCuotas, 2)  
ultimaCuota = totalADistribuir - Σ(cuotas anteriores)  

La cuota base se trunca a dos decimales y la última absorbe el residuo. CreateAgreementUseCase, en backend/src/billing/collections/agreements/application/use-cases/create-agreement.use-case.ts (aprox. líneas 30-220), valida contrato, deuda convenible, abono inicial, número de cuotas, tasa y transiciones, y persiste convenio/cuotas en una transacción.  
El vencimiento se calcula mensualmente desde la fecha base del convenio y el número de cuota. Los estados confirmados son PREPARADO, PENDIENTE_ABONO, ACTIVO, PAGADO, ANULADO para convenios y PENDIENTE/PAGADA para cuotas.  
## Efectos y transacciones  
Crear convenio calcula deuda y cuotas y persiste Convenios/CuotaConvenio en transacción. PagoValidadoHandler actualiza prefacturas y contratos de instalación. CuotaPagadaHandler verifica cuotas y dispara emisión SRI. PagoAnuladoHandler emite nota de crédito si corresponde; no se confirmó rollback de cuotas, prefacturas o contratos. La generación de catálogos, consultas y DTO es pura. La subida de comprobante escribe RustFS y no Prisma.  
|-|-|  
| **Tabla Prisma** | **Uso** |   
| Convenios | Plan y estado. |   
| CuotaConvenio | Cuotas y pagos aplicados. |   
| Contratos, Prefacturas, PrefacturaDetalle, Rubros | Deuda de origen. |   
| Pagos, DetallePago, SaldoFavor | Cobros y saldos. |   

## Transiciones de estado del convenio  

### Cadena de transiciones confirmada  

| De → A | Cuándo se ejecuta | Implementación |  
|---|---|---|  
| _(creación)_ → `PREPARADO` | `POST /api/v1/agreements` sin `abonoInicial` | `CreateAgreementUseCase` (transacción) |  
| _(creación)_ → `PENDIENTE_ABONO` | `POST /api/v1/agreements` con `abonoInicial` | mismo |  
| `PREPARADO` o `PENDIENTE_ABONO` → `ACTIVO` | `PATCH /api/v1/agreements/:id` con estado `ACTIVO` | `UpdateAgreementUseCase.execute` → `agreementRepository.updateState(..., 'ACTIVO', { fechaAprobacion })` |  
| `PREPARADO` o `PENDIENTE_ABONO` → `PAGADO` | `PATCH /api/v1/agreements/:id` con estado `PAGADO` | `UpdateAgreementUseCase.execute` → `agreementRepository.markAsPaid` |  
| `PREPARADO` o `PENDIENTE_ABONO` → `ANULADO` | `DELETE /api/v1/agreements/:id` | `UpdateAgreementUseCase.execute(ANULADO)` → `agreementRepository.updateState(..., 'ANULADO', { deletedAt: now })` |  
| `ACTIVO` → `PAGADO` | mismo PATCH | mismo camino |  
| `ACTIVO` → `ANULADO` | mismo DELETE | mismo camino |  
| `PAGADO` → _cualquiera_ | **bloqueado** | `throw BadRequestException('No se puede cambiar el estado de un convenio PAGADO')` |  
| `ANULADO` → _cualquiera_ | **bloqueado** | `throw BadRequestException('No se puede cambiar el estado de un convenio ANULADO')` |  

### Handlers de efectos derivados  

Los pagos contra cuotas no cambian el estado del convenio directamente: disparan handlers que emiten comprobantes SRI.  

| Handler | Disparo | Efecto confirmado |  
|---|---|---|  
| `PagoValidadoHandler` | evento `pago.validado` (outbox) | marca prefactura `PAGADA` y promueve contrato a `PENDIENTE_INSTALACION` |  
| `CuotaPagadaHandler` | evento `cuota.pagada` (outbox) | **verifica** que todas las cuotas estén `PAGADA` y entonces dispara emisión SRI del comprobante. **No marca la cuota como PAGADA.** |  
| `PagoAnuladoHandler` | evento `pago.anulado` (outbox) | emite Nota de Crédito solo si el comprobante está `AUTORIZADO` en SRI. Si está en otro estado, no emite. |  

### Restricciones operativas  

- **`PAGADO` y `ANULADO` son terminales.** Cualquier intento de transición desde ellos falla con `BadRequestException` (`update-agreement.use-case.ts:36-39`).  
- **`PAGADO` se asigna solo cuando todas las cuotas están PAGADAS** (`markAsPaid` en el repositorio). El camino normal es que la última cuota llegue a saldo 0 por acumulación de pagos y dispare el handler; el PATCH explícito a `PAGADO` es un atajo administrativo.  
- **Cuota PAGADA se calcula por saldo, no por evento.** La transición `cuota.estado: PENDIENTE → PAGADA` ocurre en `apply-saldo-favor.use-case.ts:135-142` cuando `saldoPendiente.equals(0)`. Cada aplicación de saldo re-evalúa.  
- **Outbox pattern en pagos.** `ValidatePaymentUseCase` no ejecuta la transición directamente; persiste un evento en `eventos_pendientes` que un dispatcher consume para invocar al handler. La consistencia entre la transición de pago y sus efectos derivados depende del dispatcher de outbox.  

## Gráfico de estados  
### Estado del convenio  
Alcance del diagrama: **Confirmado** para los estados del catálogo. Las transiciones exactas entre ellos no están completas en la evidencia revisada; sólo se dibuja la creación y la anulación explícita del endpoint DELETE.  
stateDiagram-v2  
[*] --> PREPARADO: crear sin abono inicial  
[*] --> PENDIENTE_ABONO: crear con abono inicial  
PREPARADO --> ACTIVO: PATCH estado=ACTIVO  
PENDIENTE_ABONO --> ACTIVO: PATCH estado=ACTIVO  
PREPARADO --> PAGADO: PATCH estado=PAGADO  
PENDIENTE_ABONO --> PAGADO: PATCH estado=PAGADO  
ACTIVO --> PAGADO: PATCH estado=PAGADO  
PREPARADO --> ANULADO: DELETE /agreements/:id  
PENDIENTE_ABONO --> ANULADO: DELETE /agreements/:id  
ACTIVO --> ANULADO: DELETE /agreements/:id  
note right of PAGADO  
No se encontraron transiciones salientes confirmadas.  
end note  
note right of ANULADO  
No se encontraron transiciones salientes confirmadas.  
end note  

## Casos de uso  
### Caso: Consultar estados de convenio
**Descripción:** entrega el catálogo de estados disponibles para convenios.  

**HTTP y ruta:** GET /api/v1/agreements/states.  

**Permiso:** agreements:read.  

**Cadena:** AgreementsController.findAllStates() → AgreementsService.findAllAgreementStates() → enum.  

**Errores relevantes:** 401; 403.  

**Efectos:** ninguno; catálogo de lectura.  

**Prisma:** ninguna tabla.  

**Entrada:** sin body, path ni query.  

**Salida:**  
```json
[
{
"codigo": "ACTIVO",
"descripcion": "Activo"
}
]
```

### Caso: Consultar estados de cuota
**Descripción:** entrega el catálogo de estados disponibles para cuotas.  

**HTTP y ruta:** GET /api/v1/agreements/installment-states.  

**Permiso:** agreements:read.  

**Cadena:** AgreementsController.findAllInstallmentStates() → AgreementsService.findAllInstallmentStates() → enum.  

**Errores relevantes:** 401; 403.  

**Efectos:** ninguno; catálogo de lectura.  

**Prisma:** ninguna tabla.  

**Entrada:** sin body, path ni query.  

**Salida:**  
```json
[
{
"codigo": "PENDIENTE",
"descripcion": "Pendiente"
}
]
```

### Caso: Consultar resumen de deuda
**Descripción:** calcula el resumen de deuda pendiente y devuelve el detalle de las prefacturas impagadas. No expone un total agregado montoPagado en este caso de uso.  

**HTTP y ruta:** GET /api/v1/agreements/debt-summary/:contratoId.  

**Permiso:** agreements:read.  

**Cadena:** AgreementsController.getDebtSummary() → AgreementsService.getDebtSummary() → GetDebtSummaryUseCase.execute() → repositorio.  

**Errores relevantes:** 400; 401; 403; 404.  

**Efectos:** ninguno.  

**Prisma:** Contratos, Prefacturas, PrefacturaDetalle, Rubros, pagos.  

**Entrada:** sin body; path contratoId=1.  

**Salida:**  
```json
{
"contratoId": "1",
"deudaTotal": 240.5,
"deudaAnterior": 40,
"tasaMensualVigente": 2.5,
"maxMesesAtrasado": 2,
"totalPrefacturasImpagadas": 3,
"prefacturas": []
}
```

### Caso: Crear convenio
**Descripción:** crea un plan de pago y genera sus cuotas.  

**HTTP y ruta:** POST /api/v1/agreements.  

**Permiso:** agreements:create.  

**Cadena:** AgreementsController.create() → AgreementsService.create() → CreateAgreementUseCase.execute() → repositorio.  

**Errores relevantes:** 400; 401; 403; 404; deuda no convenible.  

**Efectos:** persiste convenio y cuotas; no activa por sí solo el contrato.  

**Prisma:** Convenios, CuotaConvenio, Contratos, prefacturas/rubros.  

**Entrada:**  
```json
{
"contratoId": "1",
"abonoInicial": 40,
"numeroCuotas": 5
}
```

**Salida:** JSON del ejemplo principal.  
### Caso: Listar convenios
**Descripción:** lista convenios paginados y filtrables.  

**HTTP y ruta:** GET /api/v1/agreements.  

**Permiso:** agreements:read.  

**Cadena:** AgreementsController.findAll() → AgreementsService.findAll() → repositorio; sin caso dedicado confirmado.  

**Errores relevantes:** 400; 401; 403.  

**Efectos:** ninguno.  

**Prisma:** Convenios, contrato/cliente.  

**Entrada:** sin body; query page, limit, contratoId, estado, search.  

**Salida:**  
```json
{
"data": [
{
"convenioId": "8",
"estado": "ACTIVO"
}
],
"meta": {}
}
```

### Caso: Obtener convenio
**Descripción:** devuelve el detalle de un convenio por identificador.  

**HTTP y ruta:** GET /api/v1/agreements/:id.  

**Permiso:** agreements:read.  

**Cadena:** AgreementsController.findOne() → AgreementsService.findOne() → FindOneAgreementUseCase.execute() → repositorio.  

**Errores relevantes:** 400; 401; 403; 404.  

**Efectos:** ninguno; consulta y DTO puros.  

**Prisma:** Convenios, Contratos, Clientes, CuotaConvenio.  

**Entrada:** sin body; path id=8.  

**Salida:** objeto JSON AgreementResponseDto con sus datos y cuotas.  
### Caso: Listar cuotas de un convenio
**Descripción:** devuelve las cuotas asociadas a un convenio.  

**HTTP y ruta:** GET /api/v1/agreements/:id/installments.  

**Permiso:** agreements:read.  

**Cadena:** AgreementsController.findInstallments() → AgreementsService.findInstallments() → repositorio.  

**Errores relevantes:** 400; 401; 403; 404.  

**Efectos:** ninguno; consulta y DTO puros.  

**Prisma:** CuotaConvenio, Convenios.  

**Entrada:** sin body; path id=8.  

**Salida:**  
```json
[
{
"cuotaConvenioId": "81",
"numeroCuota": 1,
"estado": "PENDIENTE"
}
]
```

### Caso: Actualizar estado del convenio
**Descripción:** aprueba, paga o cambia el estado permitido del convenio.  

**HTTP y ruta:** PATCH /api/v1/agreements/:id.  

**Permiso:** agreements:update.  

**Cadena:** AgreementsController.update() → AgreementsService.update() → UpdateAgreementUseCase.execute() → repositorio.  

**Errores relevantes:** 400; 401; 403; 404; transición inválida.  

**Efectos:** PAGADO puede marcar convenio y cuotas.  

**Prisma:** Convenios, CuotaConvenio.  

**Entrada:** path id=8; body:  
```json
{
"estado": "ACTIVO"
}
```

**Salida:**  
```json
{
"convenioId": "8",
"estado": "ACTIVO"
}
```

### Caso: Anular convenio
**Descripción:** marca un convenio como ANULADO.  

**HTTP y ruta:** DELETE /api/v1/agreements/:id.  

**Permiso:** agreements:delete.  

**Cadena:** AgreementsController.cancel() → AgreementsService.cancel() → UpdateAgreementUseCase(ANULADO).  

**Errores relevantes:** 400; 401; 403; 404.  

**Efectos:** persiste anulación; no se confirma borrado físico.  

**Prisma:** Convenios, cuotas si la transición las afecta.  

**Entrada:** sin body; path id=8.  

**Salida:**  
```json
{
"convenioId": "8",
"estado": "ANULADO"
}
```

### Caso: Generar PDF del convenio
**Descripción:** genera el documento imprimible del plan.  

**HTTP y ruta:** GET /api/v1/agreements/:id/pdf.  

**Permiso:** agreements:read.  

**Cadena:** AgreementsController.generatePdf() → AgreementsService.generatePdf() → GetPaymentAgreementPdfDataUseCase.execute() → dispatcher.  

**Errores relevantes:** 400; 401; 403; 404; aborto de solicitud.  

**Efectos:** sólo lectura y proyección; PDF puro.  

**Prisma:** Convenios, CuotaConvenio, Contratos, Clientes.  

**Entrada:** sin body; path id=8.  

**Salida:** no es JSON: application/pdf, Content-Disposition: inline, Content-Length y bytes PDF.  
**No documentado o pendiente de confirmar**

**Pendiente de confirmar contra código actual:**

- Forma exacta de los cuerpos de request/response para `POST /api/v1/agreements`, `PATCH /api/v1/agreements/:id` y `DELETE /api/v1/agreements/:id`. Los DTOs pueden haber cambiado desde la última revisión.
- Forma exacta de `cuotaConvenioId` en `apply-saldo-favor` (parámetro que dispara la transición de cuota). Confirmar contra el DTO actual.
- Handler explícito para la transición `cuota.estado: PENDIENTE → VENCIDA`. Hoy no se encontró un handler ni un job programado que marque cuotas vencidas; el documento decía "Umbral que convierte una cuota vencida en causal automática de corte" pero no hay implementación rastreable en el código revisado.
- Política completa de mora: el documento decía "No se encontró una política completa de mora". Sigue pendiente; el ciclo de cutoff (`collection-cutoff.service.ts`) opera a nivel de prefacturas, no de cuotas individuales.
