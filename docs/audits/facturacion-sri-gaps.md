# Auditoría de Brechas — Facturación Electrónica SRI

> Estado al 2026-07-23. Comparado contra `docs/guides/FACTURACION_FISCAL.md`,
> `docs/billing-rules.md` y la implementación de referencia vendorizada en
> `external/open-api-facturacion-sri/` (deprecado, referencia histórica). Alcance: `backend/src/sri/` y
> `backend/src/billing/`. Auditoría de solo lectura — no se modificó código.

## 1. Tabla resumen

| Área | Estado | Nota |
|---|---|---|
| Factura (emisión, firma, envío, autorización) | **Implementado** | Flujo síncrono completo con reintentos y circuit breaker en `sri-soap.client.ts`; auto-disparo desde pagos |
| Nota de Crédito | **Parcial** | Endpoint SRI completo (576 líneas); sin disparo automático desde `billing` (anulación de pago no la genera) ni tests |
| Nota de Débito | **Parcial** | Endpoint SRI completo (481 líneas); sin disparo automático desde `billing` ni tests |
| Comprobante de Retención | **Parcial** | Endpoint SRI completo (477 líneas); sin disparo automático desde `billing` ni tests |
| Guía de Remisión | **No aplica (Fuera de alcance)** | No aplica al dominio de JASRAPO (Junta de Agua Potable); no se requiere transporte de bienes/mercaderías |
| Firma XML (XAdES-BES) | **Implementado** | `xml-signer.service.ts`, con spec propio |
| Envío SRI (Recepción) | **Implementado** | `sri-soap.client.ts#validarComprobante`, con circuit breaker por ambiente |
| Autorización (polling) | **Parcial** | Polling con backoff exponencial pero acotado a `SRI_MAX_RETRIES` (default 3) dentro del mismo job; sin job programado que reintente automáticamente los que quedan `EN PROCESO`/`PENDIENTE` |
| Contingencia (caída del SRI) | **Ausente** | `TipoEmision.CONTINGENCIA` existe como enum pero no se usa en ningún flujo; no hay detección de indisponibilidad ni cambio de modo de emisión |
| Anulación | **Parcial** | `anularComprobante()` solo cambia estado local si NO fue autorizado; anulación de comprobantes autorizados depende 100% de emitir NC manualmente, sin automatismo desde `billing` |
| Gestión de certificados — listado/borrado (legacy, filesystem) | **Implementado (módulo obsoleto)** | `CertificateController` marcado `[En Desarrollo]` en Swagger; opera sobre disco local, no sobre S3 ni por emisor |
| Gestión de certificados — subida real (S3, por emisor) | **Código muerto** | `EmisoresService.uploadCertificado()`/`deleteCertificado()` están completos (S3, cifrado, extracción de metadata) pero **no están conectados a ningún endpoint HTTP** |
| Alertas de expiración de certificado | **Ausente** | `validateCertificateExpiry()` calcula `daysUntilExpiry` pero nada la invoca de forma proactiva; no hay `@Cron` en todo el backend |
| RIDE (representación impresa) | **Parcial/insuficiente** | Un único template genérico (`sri-document.hbs`) que vuelca cualquier objeto en una tabla clave-valor; no hay layout oficial SRI (QR, código de acceso en barra, desglose de impuestos, logo, formato 001-001-000000001) ni diferenciación por tipo de comprobante |
| Webhooks — entrega | **Implementado** | Firma HMAC (secreto por webhook), SSRF resolver (159 líneas), reintentos con backoff vía pg-boss (`retryLimit`, `retryBackoff`, `retryDelayMax`) |
| Reintento automático de envío SRI (cola) | **Ausente** | El job `SRI_EMISION_JOB` se encola con `jobsService.send()` sin `retryLimit`/`retryBackoff` — a diferencia del job de webhooks, un fallo transitorio (ej. SOAP timeout) no se reintenta solo |
| Sincronización de estado con SRI | **Manual únicamente** | `sincronizarConSri()` existe y es robusto (batching, rate-limit configurable, eventos), pero solo se dispara vía `POST /sri/sincronizar`; no hay `@Cron` que lo ejecute periódicamente |
| Tests — firma/envío/lifecycle | **Insuficiente** | Ver sección 3.8 |

## 2. Detalle por brecha

### 2.1 Guía de Remisión — no aplica al dominio

**Estado**: Fuera de alcance (No aplica).

**Justificación de negocio**: JASRAPO administra la Junta del Sistema Regional de Agua Potable Olón. Los servicios ofrecidos corresponden al suministro de agua potable, alcantarillado y cobranza de planillas a usuarios finales. La Guía de Remisión (comprobante SRI 06) según la normativa fiscal del SRI está destinada al traslado de mercaderías/bienes físicos en logística y transporte. No aplica a la operación de facturación de servicios públicos de agua de la Junta.


### 2.2 NC/ND/Retención sin disparo automático desde `billing`

**Qué falta**: `backend/src/billing/collections/payments/application/annul-payment.use-case.ts`
no referencia SRI ni notas de crédito en absoluto (verificado por grep, cero
coincidencias). El único punto de auto-emisión SRI es
`SRIEmissionDispatcherService.tryEmit()`, invocado desde
`pago-validado.handler.ts:107` y `cuota-pagada.handler.ts:105` — y ambos
únicamente emiten **factura**. No existe un handler equivalente que, al
anular un pago o corregir una factura ya `AUTORIZADA`, dispare
automáticamente una Nota de Crédito.

**Por qué importa**: `docs/guides/FACTURACION_FISCAL.md:8` define el flujo
`Factura (AUTORIZADA) -> Nota de Crédito -> Factura (ANULADA/MODIFICADA)`
como el mecanismo oficial de anulación. Hoy ese flujo depende 100% de que un
operador humano llame manualmente al endpoint SRI de notas de crédito; si no
lo hace, el registro fiscal queda desincronizado del registro contable
(`saldo_pendiente` corregido en `billing` pero factura SRI todavía
`AUTORIZADA` sin NC asociada).

**Nota de contexto**: esto es coherente con la advertencia explícita en el
propio `FACTURACION_FISCAL.md:37` ("se recomienda estabilizar primero el
flujo de Prefactura -> Factura -> Pago antes de habilitar la emisión
automática de Notas de Crédito"), así que es una omisión **deliberada y
documentada**, no un bug — pero sigue siendo un bloqueante para producción
completa si el negocio ya emite anulaciones reales.

**Dónde debería vivir**: un handler en
`backend/src/billing/collections/payments/application/` análogo a
`cuota-pagada.handler.ts`, escuchando el evento de anulación/reverso y
llamando `EmitirNotaCreditoUseCase`.

### 2.3 Contingencia — no implementada

**Qué falta**: `TipoEmision.CONTINGENCIA = '2'`
(`backend/src/sri/emision/domain/constants/sri.enums.ts:27`) es el único
rastro del modo contingencia en todo `backend/src/sri`. Es un valor de enum
que nunca se lee ni se escribe en ningún archivo de producción (confirmado
por búsqueda exhaustiva). No hay detección de indisponibilidad del SRI (más
allá del circuit breaker que solo corta llamadas, no cambia el tipo de
emisión), ni generación de clave de acceso con `tipoEmision=2`, ni cola de
comprobantes "offline" para reenvío posterior.

**Por qué importa**: la Ficha Técnica del SRI permite (y en la práctica
exige) que un contribuyente pueda seguir emitiendo comprobantes cuando los
servicios web del SRI están caídos, usando `tipoEmision=2` en la clave de
acceso y enviando los documentos diferidos apenas el servicio se restablece.
Sin esto, cualquier caída del SRI bloquea toda la operación de facturación
de la empresa mientras dure la caída.

**Nota de contexto**: la implementación de referencia (`external/open-api-facturacion-sri/`, deprecado, referencia histórica)
tampoco lo implementa más allá de su propio enum — no es una regresión
respecto al baseline, es una brecha compartida. Prioridad más baja que 2.1 y
2.2, pero real para un rollout de producción sin intervención manual.

### 2.4 Certificados: la subida real está desconectada (código muerto)

**Qué falta — hallazgo concreto**: existen **dos** rutas de gestión de
certificados que no se comunican entre sí:

1. `backend/src/sri/certificates/` (`CertificateController` +
   `CertificateService`) — opera sobre archivos `.p12` en disco local
   (`STORAGE_PATHS.certs`), expone solo `GET /sri/certificates` (listar) y
   `DELETE /sri/certificates/:fileName` (borrar). Su `@ApiTags` está
   literalmente marcado `'[En Desarrollo] Certificados'`
   (`backend/src/sri/certificates/interfaces/http/certificate.controller.ts:15`).
   **No tiene endpoint de subida** (`POST`) en absoluto.
2. `backend/src/sri/emisores/application/emisores.service.ts:180-223` —
   `uploadCertificado(id, file, password)` es una implementación **completa
   y correcta**: sube el `.p12` a RustFS/S3 por RUC del emisor, cifra la
   contraseña (`encryptionService.encrypt`), extrae y persiste
   `certificado_valido_hasta` y `certificado_sujeto` desde el propio
   certificado, y limpia la caché de firma (`xmlSignerService.clearEmisorCache`).
   Existe también `deleteCertificado()` (líneas 225-260) con el mismo nivel
   de completitud.

**El problema**: ninguno de los dos métodos de `EmisoresService`
(`uploadCertificado`, `deleteCertificado`) es llamado desde
`backend/src/sri/emisores/interfaces/http/emisores.controller.ts` ni desde
ningún otro archivo del backend (verificado por grep de
`uploadCertificado(` / `deleteCertificado(` en todo `backend/src`: los
únicos dos resultados son las propias definiciones). El DTO
`UploadCertificadoDto`
(`backend/src/sri/emisores/interfaces/dto/emisor.dto.ts:165-170`) tampoco se
usa en ningún controlador — es evidencia de que el endpoint se planeó pero
nunca se conectó.

**Por qué importa**: hoy no existe ninguna forma, vía API, de subir un
certificado `.p12` real asociado a un emisor con todo el flujo correcto
(S3 + cifrado + extracción de metadata). La única superficie de API
existente (`CertificateController`) es un módulo legacy sobre disco local
que ni siquiera permite subir archivos. En la práctica esto obliga a cargar
certificados por acceso directo al servidor/infra, lo cual es inviable para
un flujo de onboarding de clientes en producción.

**Dónde arreglarlo**: añadir `POST /sri/emisores/:id/certificado` (multipart,
`FileInterceptor`) en `emisores.controller.ts` que invoque el
`uploadCertificado` ya existente, y `DELETE /sri/emisores/:id/certificado`
para `deleteCertificado`. Es la brecha de menor esfuerzo de todo el informe:
la lógica de negocio ya está escrita y probablemente probada manualmente en
algún punto; solo falta el cableado HTTP.

### 2.5 Sin alertas proactivas de expiración de certificado

**Qué falta**: `CertificateService.validateCertificateExpiry()`
(`backend/src/sri/certificates/application/certificate.service.ts:306-350`)
calcula correctamente `daysUntilExpiry` y genera un `warning` si quedan ≤30
días, pero es un método que hay que invocar explícitamente — no hay ningún
`@Cron` en todo `backend/src` (búsqueda exhaustiva sin resultados) que lo
ejecute periódicamente, ni notificación por email/webhook cuando un
certificado está por expirar.

**Por qué importa**: un certificado de firma expirado bloquea la emisión de
**todos** los comprobantes de ese emisor sin previo aviso operativo. Sin
alerta proactiva, el primer síntoma es una factura fallida en producción.

**Dónde debería vivir**: un `@Cron` (ej. diario) en un nuevo
`certificate-expiry-check.service.ts` dentro de
`backend/src/sri/certificates/` o `backend/src/sri/emisores/`, que recorra
emisores con `certificado_valido_hasta` próximo y emita un evento/webhook/email.

### 2.6 RIDE genérico, no conforme al formato oficial SRI

**Qué falta**: el único template PDF para comprobantes SRI es
`backend/src/infrastructure/pdf/templates/sri-document.hbs` (98 líneas),
registrado vía `backend/src/sri/emision/infrastructure/pdf/sri-document.pdf-type.ts`.
Su `adaptData()` solo envuelve el objeto crudo (`raw`) y el template itera
genéricamente sobre `{{#each data}}` volcando cada campo en una fila de
tabla `<th>{{@key}}</th><td>{{this}}</td>`, con fallback a `<pre>{{json this}}</pre>`
para objetos anidados. No hay:
- Layout oficial por tipo de comprobante (factura vs. NC vs. ND vs. retención
  tienen diseños RIDE distintos según la Ficha Técnica del SRI).
- Código QR ni representación en barras de la clave de acceso.
- Desglose visual de impuestos (IVA 15%/0%, ICE) en formato tabular estándar.
- Numeración `001-001-000000001`, razón social/logo del emisor en cabecera,
  ni caja de "AUTORIZACIÓN SRI" con fecha/número.

**Por qué importa**: el RIDE es lo que el cliente final recibe/imprime. Un
volcado clave-valor genérico no es una representación impresa válida ni
profesional; para producción real esto bloquea el envío de comprobantes
"presentables" a los clientes aunque el XML autorizado por el SRI sea
perfectamente válido.

**Dónde arreglarlo**: crear templates específicos por tipo de comprobante
(`factura.hbs`, `nota-credito.hbs`, etc.) y un `adaptData()` por tipo en
lugar del volcado genérico actual.

### 2.7 Sin reintento automático de la cola de emisión SRI

**Qué falta**: en `sri.service.ts` (líneas 60, 96, 120, 144) y
`sri-emission-dispatcher.service.ts:208`, todas las llamadas a
`jobsService.send(SRI_EMISION_JOB, {...})` se hacen **sin** pasar
`options` de reintento. Comparado con el job de webhooks
(`backend/src/sri/webhooks/application/webhooks.service.ts:217-222`), que sí
pasa `{ retryLimit: config.reintentosMax || 5, retryBackoff: true, retryDelay: 3, retryDelayMax: 180 }`,
el job de emisión SRI queda con el default de pg-boss (sin reintentos
automáticos tras un fallo).

**Por qué importa**: si `SriEmisionProcessor.processEmision()`
(`backend/src/sri/emision/infrastructure/queue/processors/sri-emision.processor.ts:40-72`)
lanza una excepción (timeout de red, error transitorio del SOAP, etc.), el
job de emisión de factura/NC/ND/retención falla **una sola vez** y queda
huérfano — no hay reintento automático de la cola; la única recuperación es
que un operador llame manualmente a `POST /sri/reintentar/:claveAcceso` o
`POST /sri/sincronizar`. Esto es doblemente delicado porque, a diferencia de
un webhook, un fallo aquí puede significar que un comprobante fiscal nunca
llegó a enviarse al SRI, con impacto legal.

**Dónde arreglarlo**: añadir `retryLimit`/`retryBackoff`/`retryDelay` a las
llamadas `jobsService.send(SRI_EMISION_JOB, ...)`, con cuidado de que los
reintentos no dupliquen secuenciales (el use-case ya reserva secuencial
antes de fallar, revisar idempotencia antes de habilitar reintentos ciegos).

### 2.8 Sincronización de estado SRI — solo manual, sin cron

**Qué falta**: `sincronizarConSri()`
(`backend/src/sri/emision/application/services/sri.service.ts:647-870`) es
una implementación robusta (batching de 50, `SRI_REQUEST_DELAY_MS`
configurable para no saturar al SRI, eventos `comprobante.autorizado` /
`comprobante.rechazado`), pero el único punto de entrada es
`sri.controller.ts:348` (`POST /sri/sincronizar`, llamado manualmente). No
existe ningún `@Cron` en todo el backend que la dispare periódicamente.

**Por qué importa**: cualquier comprobante que quede `EN PROCESO` tras
agotar los 3 reintentos internos de `enviarYAutorizar()` (ver sección 3.6)
permanecerá en ese estado indefinidamente hasta que alguien ejecute la
sincronización a mano.

**Dónde arreglarlo**: exponer `sincronizarConSri` detrás de un `@Cron`
periódico (ej. cada 15 min) con los estados `PENDIENTE`, `EN_PROCESO`,
`DEVUELTA`, o documentar explícitamente que se espera un cronjob externo a
nivel de infraestructura (k8s CronJob) que llame al endpoint — pero eso no
está documentado en ningún sitio del repo actualmente.

### 2.9 Cobertura de tests — insuficiente en rutas críticas

**Qué existe**: 12 archivos `.spec.ts` en `backend/src/sri/` cubren
`sri-emision-mode.service`, `sri-emission-dispatcher.service`,
`sri-integration.service` (solo el método `emitirDesdeComprobante`),
`comprobante-estado.enum`, `emitir-comprobante-manual.use-case`,
`emitir-factura.use-case`, `prisma-comprobante.repository`,
`sri-emision.processor`, `xml-signer.service`, `sri.controller`,
`webhook.processor`, `job-service.interface`.

**Qué falta — sin ningún `.spec.ts`**:
- `emitir-nota-credito.use-case.ts` (576 líneas)
- `emitir-nota-debito.use-case.ts` (481 líneas)
- `emitir-retencion.use-case.ts` (477 líneas)
- `xml-builder.service.ts` — construcción del XML del comprobante (crítico:
  cualquier error de estructura aquí causa `DEVUELTA` del SRI)
- `clave-acceso.service.ts` — generación de la clave de acceso de 49 dígitos
  y dígito verificador (crítico: un dígito mal calculado invalida el
  comprobante)
- `sri-soap.client.ts` — cliente SOAP de envío/autorización (el punto de
  integración más crítico de todo el módulo)
- `sri-soap-factory.service.ts` — circuit breaker y clientes SOAP
- `sri.service.ts` — contiene `reintentarComprobante`, `sincronizarConSri`,
  `anularComprobante`, `verificarEnSri` (todo el ciclo de vida post-emisión)
- `certificate.service.ts` — extracción/validación de certificados P12
- `emisores.service.ts` — incluye `uploadCertificado`/`deleteCertificado`
- `catalogo-validator.service.ts`, `identificacion-validator.service.ts`
- `signature.service.ts`, `generate-and-sign-pdf.use-case.ts`

En `backend/src/billing/` la proporción es mejor: 31 specs sobre 107
archivos no-spec, y las rutas de pago/convenio críticas sí tienen cobertura
(`create-payment.use-case.spec.ts`, `annul-payment.use-case.spec.ts`,
`validate-payment.use-case.spec.ts`, etc.).

**Por qué importa**: la firma XML, la generación de clave de acceso y el
cliente SOAP son exactamente las piezas donde un bug produce comprobantes
fiscalmente inválidos o rechazados por el SRI — y son las tres piezas sin
ningún test.

## 3. Priorización

### Bloqueantes para un rollout real a producción

1. **Certificados: conectar `uploadCertificado`/`deleteCertificado` a un
   endpoint HTTP** (2.4) — sin esto no hay forma de dar de alta un emisor
   nuevo sin acceso directo al servidor. Esfuerzo bajo, la lógica ya existe.
2. **Guía de Remisión ausente** (2.1) — bloqueante legal si la empresa
   transporta bienes físicos (medidores, materiales) y necesita respaldarlo
   fiscalmente.
3. **Sin reintento automático de la cola de emisión SRI** (2.7) — un fallo
   transitorio de red puede dejar una factura sin enviar al SRI de forma
   silenciosa, con impacto legal directo.
4. **Sin cron de sincronización/reintento de estado SRI** (2.8) — comprobantes
   `EN PROCESO` quedan huérfanos indefinidamente sin intervención manual.
5. **Tests ausentes en firma XML, clave de acceso y cliente SOAP** (2.9) —
   son las piezas de mayor riesgo fiscal/legal de todo el módulo y no tienen
   ninguna red de seguridad automatizada.
6. **RIDE no conforme al formato oficial** (2.6) — bloqueante de cara al
   cliente final aunque el backend fiscal funcione correctamente.

### Importantes pero no bloqueantes inmediatos

7. **NC/ND/Retención sin disparo automático desde `billing`** (2.2) — es una
   omisión documentada y deliberada según el propio `FACTURACION_FISCAL.md`;
   aceptable mientras el negocio siga anulando/ajustando facturas
   manualmente, pero debe resolverse antes de escalar volumen.
8. **Alertas de expiración de certificado** (2.5) — importante para
   operación continua, pero mitigable a corto plazo con revisión manual
   periódica mientras no haya muchos emisores.

### Nice-to-have / prioridad baja

9. **Modo contingencia** (2.3) — la referencia tampoco lo implementa; solo
   se vuelve crítico si el negocio no puede tolerar ninguna ventana de
   indisponibilidad del SRI para seguir facturando.

## 4. Metodología

Auditoría realizada con `rg`/`fd` sobre `backend/src/sri/`,
`backend/src/billing/` y `external/open-api-facturacion-sri/` (deprecado, referencia histórica), más lectura
puntual de los archivos citados. No se encontraron marcadores literales
`TODO`/`FIXME`/`throw new Error('not implemented')` — las brechas
identificadas son omisiones estructurales (código no escrito o no
conectado), no marcadores explícitos dejados por el equipo.
