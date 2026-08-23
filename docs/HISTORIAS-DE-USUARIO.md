# Documento de Historias de Usuario — Sistema JASRAPO
**Junta Administradora de Agua Potable y Saneamiento (Olón, Las Núñez, La Entrada, Curia, San José)**  
*Fecha: 2026-08 | Versión: 1.1.0*

---

## 1. Introducción y Alcance
El sistema **JASRAPO** es una plataforma integral para automatizar la gestión técnica, comercial, operativa y financiera de las juntas administradoras de agua potable en el Ecuador. Este documento consolida las **Historias de Usuario (User Stories)** con criterios de aceptación verificables y mapeo técnico.

---

## 2. Matriz de Roles y Actores

| Rol | Descripción y Responsabilidad |
| :--- | :--- |
| **Administrador del Sistema** | Gestión de usuarios, roles, permisos, sesiones, emisores y certificados digitales. |
| **Secretaría** | Registro de clientes, contratos, digitación de lecturas, generación y envío de planillas. |
| **Tesorería / Caja** | Apertura/cierre de cajas, recaudación en ventanilla, transferencias, convenios de pago. |
| **Operador de Campo** | Hojas de ruta territoriales, toma de lecturas e inspección de anomalías en medidores. |
| **Presidencia / Directiva** | Supervisión, autorizaciones de refacturación, refinanciamientos y balances. |
| **Contabilidad / Fiscal** | Monitoreo de comprobantes electrónicos autorizados ante el SRI. |
| **Cliente / Usuario Final** | Consulta pública de saldos adeudados y recepción de planillas/facturas por correo. |

---

## 3. Historias de Usuario por Épica

### ÉPICA 1: Operaciones, Territorio y Padrón de Clientes

#### **HU-01: Registro y Mantenimiento del Padrón de Clientes**
- **Como** Secretaria / Administrador,
- **Quiero** registrar y mantener actualizados los datos personales, fiscales (Cédula/RUC) y de contacto de los usuarios,
- **Para** asegurar un padrón comercial fidedigno y emitir comprobantes fiscales válidos ante el SRI.

**Criterios de Aceptación:**
- **Escenario 1 (Validación de Identidad):** Valida el tipo de identificación (CÉDULA o RUC) y su formato (10 o 13 dígitos), y exige razón social obligatoria cuando el tipo es RUC. ⚠️ **Pendiente de implementación:** la validación mediante algoritmo verificador (dígito verificador) de cédula/RUC no existe en el código actual; solo se valida el tipo y el formato.
- **Escenario 2 (Beneficios de Ley):** El registro permite marcar al cliente como aplicable a tarifa de Tercera Edad o Discapacidad. El descuento NO se aplica automáticamente al registrar el cliente: se aplica manualmente sobre la prefactura mediante el módulo de descuentos (`apply-discount-to-preinvoice`).
- **Escenario 3 (Búsqueda Ágil):** Permite búsqueda instantánea por nombres o número de identificación.

#### **HU-02: Gestión de Contratos de Suministro y Asignación de Medidores**
- **Como** Secretaria,
- **Quiero** vincular un cliente con un punto físico de suministro (Comunidad, Sector) y un medidor asignado,
- **Para** formalizar el contrato de servicio y otorgar un número de guía o cuenta único.

**Criterios de Aceptación:**
- **Escenario 1 (Asignación de Medidor e Inmutabilidad de Lectura Inicial):** Al vincular un medidor en bodega a un contrato mediante la finalización de la vinculación (`finalize-meter-link`), pasa automáticamente a estado `INSTALADO`. La `lectura_inicial_historial` registrada en `historial_medidores` representa el valor físico de inicio y queda registrada de forma inmutable como base del primer ciclo de facturación.
- **Escenario 2 (Reemplazo o Cambio de Medidor por Daño):** Al reemplazar un medidor en un contrato existente, el sistema cierra el registro del medidor saliente fijando `fecha_hasta = NOW()` y su última lectura física (`lectura_final_historial`). Para el nuevo medidor se crea un nuevo registro en `historial_medidores` con su propia `lectura_inicial_historial` independiente (usualmente `0.00` o valor de bodega). **Bajo ninguna circunstancia se copia o arrastra el valor acumulado del medidor anterior.**
- **Escenario 3 (Territorio):** Cada contrato pertenece a una de las 5 comunidades (Olón, Las Núñez, La Entrada, Curia, San José) y a una categoría tarifaria.
- **Escenario 4 (Cambio de Titular):** Registra traspasos de dominio manteniendo el historial de consumos y deudas. ⚠️ **Pendiente de implementación:** el flujo de cambio de titular (traspaso de dominio) no pudo verificarse en el código; requiere confirmación e implementación.

---

### ÉPICA 2: Medición, Hojas de Ruta y Detección de Anomalías

#### **HU-03: Planificación y Asignación de Hojas de Ruta de Lectura**
- **Como** Administrador / Secretaria,
- **Quiero** generar hojas de ruta territoriales ordenadas por sector y asignarlas a los operadores de campo,
- **Para** asegurar la cobertura mensual eficiente en la toma física de mediciones.

**Criterios de Aceptación:**
- **Escenario 1 (Generación de Ruta):** Incluye todos los contratos activos del sector para el período indicado e inicializa sus lecturas en estado `PENDIENTE`.
- **Escenario 2 (Ciclo de Vida y Transición de Estados):** Pasa por estados `PENDIENTE` ➔ `EN_PROGRESO` ➔ `PARCIAL` / `COMPLETADA`.
- **Escenario 3 (Continuación y Retoma de Rutas Parciales):** Cuando una ruta queda en estado `PARCIAL` (por cierre de jornada o pendientes), el sistema permite reanudarla pasando de `PARCIAL` ➔ `EN_PROGRESO` o reasignar el operador para continuar la toma. En la vista del operador se filtran únicamente los medidores con lectura `PENDIENTE`, evitando duplicar rutas para la misma comunidad y período.
- **Escenario 4 (Cierre Automático):** Al registrar el 100% de las lecturas asignadas a la ruta, la ruta pasa automáticamente a estado `COMPLETADA`.

#### **HU-04: Captura de Lecturas y Control de Anomalías de Consumo**
- **Como** Operario de Campo / Secretaria,
- **Quiero** registrar la lectura actual del medidor y reportar incidentes en sitio (fugas, medidor dañado o trabado),
- **Para** calcular el volumen de agua consumido en m3 y evitar errores de facturación al usuario.

**Criterios de Aceptación:**
- **Escenario 1 (Cálculo Automático y Snapshot Inicial):** 
  - Para la **primera lectura** de un medidor (`lectura_inicial = true`), el sistema toma como `lectura_anterior` la `lectura_inicial_historial` registrada en `historial_medidores` del contrato.
  - Para **lecturas subsiguientes** (`lectura_inicial = false`), el sistema toma como `lectura_anterior` la `lectura_actual` del período anterior aprobado.
  - Calcula `Consumo = Lectura Actual - Lectura Anterior`.
- **Escenario 2 (Lectura Negativa):** Si la lectura es menor a la anterior, alerta anomalía de SALTO_NEGATIVO.
- **Escenario 3 (Alerta de Desvío):** Si excede el consumo promedio, se envía a revisión antes de aprobación; la actualización de la lectura aprueba o rechaza el registro según la máquina de estados (`update-reading`).
- **Escenario 4 (Bloqueo de Aprobación por Anomalías Pendientes):** Toda lectura que tenga anomalías registradas (`LecturaAnomalia`) en estado `PENDIENTE` o `EN_REVISION` no puede pasar a estado `APROBADA`. Solo cuando todas las anomalías asociadas han sido `RESUELTA` o `DESCARTADA` se habilita la aprobación de la lectura para prefacturación.

---

### ÉPICA 3: Facturación, Tarifas y Distribución de Planillas

#### **HU-05: Generación Masiva del Lote Mensual de Prefacturas (Planillas)**
- **Como** Secretaria,
- **Quiero** procesar en lote la generación de prefacturas mensuales por comunidad para las lecturas aprobadas,
- **Para** liquidar el valor total a pagar por cada hogar según los rubros tarifarios y saldos vencidos.

**Criterios de Aceptación:**
- **Escenario 1 (Cálculo Tarifario):** Aplica cargo fijo base, excedente por m3 adicional, tasa de seguridad comunitaria y descuentos de ley.
- **Escenario 2 (Mora y Saldo Vencido):** Suma planillas anteriores impagas e imputa interés legal de mora si tiene 3 o más meses atrasados.
- **Escenario 3 (Inmutabilidad):** Tras su aprobación, la prefactura congela sus rubros y detalles para consistencia fiscal; el cambio de estado se gestiona mediante `update-pre-invoice-state`.

#### **HU-06: Notificación y Distribución Digital de Planillas**
- **Como** Secretaria / Sistema,
- **Quiero** despachar por correo electrónico las planillas mensuales en formato PDF a los usuarios,
- **Para** que conozcan oportunamente el desglose de su consumo y valores antes de acercarse a pagar.

**Criterios de Aceptación:**
- **Escenario 1 (Envío Asíncrono):** Procesa envíos masivos mediante cola en segundo plano.
- **Escenario 2 (Diseño Claro):** Adjunta PDF oficial con desglose de rubros, consumo y cuentas de recaudación.

---

### ÉPICA 4: Recaudación, Ventanilla, Cuadro de Caja y Convenios

#### **HU-07: Recaudación en Ventanilla y Control de Sesión de Caja**
- **Como** Cajero / Tesorero,
- **Quiero** abrir caja, registrar cobros (efectivo, transferencia, tarjeta) y emitir comprobantes de pago,
- **Para** recibir la recaudación diaria y conciliar el cuadre al cierre de jornada.

**Criterios de Aceptación:**
- **Escenario 1 (Cobro Inmediato en Efectivo):** Registra el pago en estado REGISTRADO y emite comprobante; al validarse el pago (`validate-payment`) se procesan los eventos de negocio asociados (`PagoValidadoHandler`).
- **Escenario 2 (Abonos Parciales / Excesos):** Amortiza la deuda más antigua o acredita diferencia a Saldo a Favor (`apply-saldo-favor`).
- **Escenario 3 (Cierre de Caja):** Realiza el arqueo diario con desglose detallado por método de pago, con apertura, cierre y movimientos registrados por la sesión de caja (`PrismaCashSessionRepository`); la anulación de un pago dispara el manejo de eventos (`PagoAnuladoHandler`).

#### **HU-08: Gestión de Convenios de Refinanciamiento de Deuda**
- **Como** Tesorero / Presidente,
- **Quiero** pactar convenios de pago en cuotas mensuales para usuarios con mora acumulada,
- **Para** brindar facilidades de pago a familias vulnerables y evitar la suspensión del servicio.

**Criterios de Aceptación:**
- **Escenario 1 (Financiamiento):** Fija abono inicial y divide el remanente en N cuotas con vencimiento mensual, tomando el resumen de deuda del cliente (`get-debt-summary`).
- **Escenario 2 (Amortización):** Marca cuotas pagadas y reduce el saldo del convenio automáticamente (`CuotaPagadaHandler`).

---

### ÉPICA 5: Facturación Electrónica SRI (Facturación Fiscal)

#### **HU-09: Emisión, Firma Electrónica XAdES-BES y Autorización SRI**
- **Como** Sistema / Contador,
- **Quiero** que cuando una prefactura alcance el 100% de pago se genere el comprobante fiscal, se firme electrónicamente y se autorice ante el SRI,
- **Para** cumplir con la normativa tributaria del Ecuador de manera 100% automatizada.

**Criterios de Aceptación:**
- **Escenario 1 (Regla 100% Pagado):** Se emite al SRI solo cuando la prefactura pasa a PAGADA.
- **Escenario 2 (Resiliencia Outbox):** Garantiza reintentos automáticos ante caídas del servidor del SRI.
- **Escenario 3 (Entrega):** Envía XML firmado y RIDE (PDF) autorizado automáticamente al correo del cliente. ⚠️ **Pendiente de implementación:** la entrega automática del XML firmado y RIDE al correo del cliente no está implementada; el correo actual envía planillas (`sendPlanilla`), no comprobantes autorizados.

---

### ÉPICA 6: Reportes, Estadísticas y Consulta Pública

#### **HU-10: Reportes Financieros y Operativos (Auditoría y Gestión)**
- **Como** Directiva / Tesorero / Secretaria,
- **Quiero** consultar y exportar en tabla interactiva y PDF los reportes de Estado de Cuenta, Historial de Conexión, Morosidad y Abonos,
- **Para** auditar la salud financiera de la Junta y sustentar rendiciones de cuentas en asambleas comunitarias.

**Criterios de Aceptación:**
- **Escenario 1 (Tabla-Primera):** Muestra tabla interactiva con filtros y vista previa de PDF oficial.
- **Escenario 2 (Exportación):** Permite descarga directa de PDF y envío por correo electrónico (`send-report-by-email` con los distintos report keys).

#### **HU-11: Portal Público de Consulta de Deuda para el Ciudadano**
- **Como** Usuario / Habitante de la comunidad,
- **Quiero** consultar en línea el saldo adeudado de mi suministro ingresando mi número de cédula o número de guía,
- **Para** conocer mi monto a pagar desde mi teléfono o computadora sin trasladarme a las oficinas de la Junta.

**Criterios de Aceptación:**
- **Escenario 1 (Acceso Libre):** Consulta pública sin login que protege datos privados.
- **Escenario 2 (Transparencia):** Informa el consumo del mes, fecha de corte y saldo a cancelar.

---

### ÉPICA 7: Identidad y Control de Acceso

#### **HU-12: Administración de Usuarios, Roles y Permisos**
- **Como** Administrador del Sistema,
- **Quiero** gestionar usuarios, roles, permisos y sesiones del sistema,
- **Para** controlar quién accede a la plataforma y con qué nivel de autorización.

**Criterios de Aceptación:**
- **Escenario 1 (Autenticación con Bloqueo):** El login autentica al usuario (`login`, `register`) y bloquea la cuenta tras intentos fallidos; el administrador puede desbloquearla (`unlock-user-account`) y gestionar el cierre de sesión y la renovación de acceso (`logout`, `refresh-access-token`).
- **Escenario 2 (Permisos Directos y por Rol):** Los permisos se asignan directamente al usuario (`update-user-permissions`) o mediante roles (`create-role`, `update-role`, `assign-permission-to-role`, `remove-permission-from-role`); el permiso directo tiene precedencia sobre el heredado del rol (`get-effective-permissions`).
- **Escenario 3 (Sesiones y Token):** Las sesiones activas son auditables y revocables (`create-session`, `update-session`, `revoke-session`, `list-sessions-by-user`, `get-session`); la revocación invalida el refresh token mediante `tokenVersion`.

---

### ÉPICA 8: Configuración de Catálogos de Facturación

#### **HU-13: Configuración de Períodos, Rubros, Tarifas, Descuentos, Comunidades y Sectores**
- **Como** Secretaria / Administrador,
- **Quiero** configurar los catálogos base de facturación (períodos, rubros, tarifas, descuentos, comunidades y sectores),
- **Para** que la generación de planillas y prefacturas utilice siempre las reglas tarifarias vigentes.

**Criterios de Aceptación:**
- **Escenario 1 (Tarifas Versionadas):** La actualización de una categoría tarifaria crea una nueva versión vigente sin mutar el histórico; las prefacturas ya emitidas conservan la tarifa con la que se calcularon (`create-tariff-category`, `update-tariff-category`, `remove-tariff-category`, `find-all-tariff-categories`, `find-one-tariff-category`, `get-tarifas-impuesto`).
- **Escenario 2 (Descuentos Manuales):** Un descuento se crea con sus rubros asociados (`create-discount`, `update-discount`, `remove-discount`, `find-all-discounts`, `find-one-discount`, `get-discount-rubros`) y solo puede aplicarse manualmente a prefacturas no pagadas ni anuladas (`apply-discount-to-preinvoice`).
- **Escenario 3 (Comunidades y Sectores):** Comunidades y sectores usan código único (`create-community`, `update-community`, `create-sector`, `update-sector`); los registros eliminados pueden reactivarse conservando su historial (`delete-community`, `delete-sector`, `find-all-communities`, `find-one-community`, `get-all-sectors`, `get-sector`).

---

### ÉPICA 9: Operaciones de Campo — Instalación y Mantenimiento

#### **HU-14: Órdenes de Trabajo de Campo: Instalación, Defectos y Baja de Medidores**
- **Como** Operador de Campo,
- **Quiero** ejecutar órdenes de instalación, reportar defectos, dar de baja medidores y sincronizar mi trabajo desde el terreno,
- **Para** mantener el parque de medidores operativo y las lecturas al día.

**Criterios de Aceptación:**
- **Escenario 1 (Instalación):** Una tarea de instalación pasa de PENDIENTE a INSTALADO al completarse (`install-meter`, `update-task-state`, `get-operator-tasks`).
- **Escenario 2 (Defecto y Baja):** Un medidor instalado pasa a DANADO al reportarse un defecto (`report-defect`) y de DANADO a BAJA al darse de baja (`decommission-meter`).
- **Escenario 3 (Lecturas del Operador):** El operador consulta y actualiza sus lecturas (`get-operator-readings`, `get-operator-readings-with-anomalies`, `update-operator-reading`) solo cuando la lectura está en estado PENDIENTE o RECHAZADA_VERIFICACION; la sincronización consolida el trabajo realizado (`sync-all`).

---

### ÉPICA 10: Ciclo de Vida Fiscal Electrónico (SRI)

#### **HU-15: Emisión de Comprobantes Electrónicos, Notas de Crédito/Débito y Retenciones**
- **Como** Contador / Sistema,
- **Quiero** emitir y firmar XAdES-BES facturas, notas de crédito, notas de débito y retenciones, y gestionar su autorización, anulación, reintentos y reconciliación ante el SRI,
- **Para** mantener la emisión fiscal electrónica conforme a la normativa del SRI.

**Criterios de Aceptación:**
- **Escenario 1 (Emisión Automática Resiliente):** Al alcanzar el 100% de pago se emite el comprobante de forma automática (`emitir-factura`); ante fallos de conexión con el SRI se reintenta de forma resiliente (`SRIEmissionDispatcherService`, `SriService.reintentar`).
- **Escenario 2 (Notas de Crédito Automáticas):** Al anular un pago asociado a un comprobante autorizado, el sistema emite automáticamente la nota de crédito correspondiente (`emitir-nota-credito`, `emitir-nota-debito`, `emitir-retencion`, `emitir-comprobante-manual`).
- **Escenario 3 (Reconciliación y Emisión Manual):** El sistema concilia automáticamente los comprobantes con el SRI cada 15 minutos (`SriReconciliationService`); la emisión manual queda registrada y auditable (`SriService.verificarEnSri`, `SriService.sincronizarConSri`, `SriEmisionModeService`).

---

### ÉPICA 11: Emisores y Certificados Digitales

#### **HU-16: Gestión de Emisores (RUC) y Certificados Digitales**
- **Como** Administrador,
- **Quiero** administrar múltiples emisores (RUC) con sus certificados digitales P12,
- **Para** firmar los comprobantes electrónicos de cada RUC de forma independiente.

**Criterios de Aceptación:**
- **Escenario 1 (Alta/Baja de Emisores):** El alta y la baja de emisores gestiona el certificado P12 cifrado junto con los datos del RUC (`EmisoresService`, `CertificateService`).
- **Escenario 2 (Alerta de Expiración):** Un trabajo programado diario a las 08:00 detecta certificados próximos a vencer y alerta con al menos 30 días de anticipación (`CertificateExpiryCheckService`).

---

### ÉPICA 12: Documentos y Firma Digital

#### **HU-17: Generación de Documentos Oficiales y Firma Digital de PDF**
- **Como** Secretaria / Directiva,
- **Quiero** generar y firmar digitalmente documentos oficiales (solicitudes de conexión, actas de responsabilidad, convenios de pago y planillas),
- **Para** entregar documentación válida a los usuarios y a la Junta.

**Criterios de Aceptación:**
- **Escenario 1 (Generación con Firma):** Genera el PDF con firma visual + QR y lo firma con el certificado P12 (`generate-pdf`, `generate-and-sign-pdf`, `PdfService`); los datos se toman de los generadores específicos (`get-connection-request-pdf-data`, `get-responsibility-agreement-pdf-data`, `get-payment-agreement-pdf-data`).
- **Escenario 2 (Firma de PDF Existente):** Permite firmar un PDF ya existente sin regenerarlo (`sign-existing-pdf`, `generate-pdf-to-file`).
- **Escenario 3 (Fallback de Firma):** Si la firma criptográfica falla, el documento se emite con firma visual como respaldo, quedando el evento registrado.

---

### ÉPICA 13: Integraciones y Notificaciones

#### **HU-18: Notificaciones, Webhooks y Trabajos Programados**
- **Como** Sistema / Administrador,
- **Quiero** despachar correos, notificar eventos de comprobantes vía webhooks y ejecutar trabajos programados,
- **Para** mantener informados a los clientes y a los sistemas externos integrados.

**Criterios de Aceptación:**
- **Escenario 1 (Envío Masivo de Planillas):** Envía planillas por correo en lotes de 25 con adjuntos recuperados desde S3 (`MailService.sendBatchPlanillas`, `MailService.sendPlanilla`, `MailService.sendReport`).
- **Escenario 2 (Webhooks de Comprobantes):** Notifica los eventos `comprobante.autorizado` y `comprobante.rechazado` mediante webhooks firmados con secreto (`whsec`), con reintentos ante fallos de entrega (`WebhooksService`).
- **Escenario 3 (Trabajos Programados):** Ejecuta la reconciliación SRI cada 15 minutos (`*/15`) y la verificación de expiración de certificados a las 08:00 diarias (`0 8 * * *`) (`JobsService`).

---

## 4. Matriz de Trazabilidad Técnica

| Historia de Usuario | Módulo Frontend (Angular) | Casos de Uso Backend (NestJS / Hexagonal) |
| :--- | :--- | :--- |
| **HU-01 (Clientes)** | `features/contracts/clients/` | `create-client`, `update-client`, `remove-client`, `find-one-client` |
| **HU-02 (Contratos)** | `features/contracts/service-contracts/` | `create-contract`, `update-contract`, `finalize-meter-link`, `remove-contract`, `find-one-contract`, `find-all-contracts`, `get-connection-request-pdf-data`, `get-responsibility-agreement-pdf-data` |
| **HU-03 (Rutas)** | `features/contracts/reading-routes/` | `create-route`, `update-route`, `reassign-route`, `get-eligible-readings`, `delete-route`, `find-one-route`, `find-all-routes` |
| **HU-04 (Lecturas)** | `features/contracts/readings/` | `create-reading`, `update-reading` (máquina de estados: aprueba/rechaza), `create-reading-anomaly`, `find-all-readings`, `find-one-reading`, `remove-reading` |
| **HU-05 (Planillas)** | `features/billing/batches/`, `pre-invoices/` | `generate-batch`, `find-all-batches`, `find-one-batch`, `update-pre-invoice-state`, `generar_prefacturas_lote()` (SP SQL) |
| **HU-06 (Distribución)** | `features/billing/pre-invoices/` | `send-batch-emails`, `send-pre-invoice-by-email`, `MailService.sendPlanilla()` |
| **HU-07 (Cobros/Caja)** | `features/billing/payments/`, `cash-sessions/` | `create-payment`, `validate-payment`, `annul-payment`, `apply-saldo-favor`, `get-daily-cash-summary`, `create-cobro-puntual`, `find-one-payment`, `PagoValidadoHandler`, `PagoAnuladoHandler`, `PrismaCashSessionRepository` (apertura/cierre/movimientos/arqueo) |
| **HU-08 (Convenios)** | `features/contracts/payment-agreements/` | `create-agreement`, `update-agreement`, `find-one-agreement`, `get-debt-summary`, `get-payment-agreement-pdf-data`, `CuotaPagadaHandler` |
| **HU-09 (SRI)** | `features/billing/electronic-billing/` | `emitir-factura`, `SRIEmissionDispatcherService`, `XmlSignerService`, `SignatureService`, `SriService` |
| **HU-10 (Reportes)** | `features/reports/` | `send-report-by-email` (5 report keys), `ReportStyleDispatcher`, `PdfService` |
| **HU-11 (Portal)** | `features/bill-inquiry/` | `SearchDeudaPublicaUseCase`, `BusquedaPublicaService` |
| **HU-12 (Usuarios/Roles/Permisos)** | `features/admin/roles/`, `features/users/user-management/`, `features/auth/login/` | `login`, `register`, `logout`, `refresh-access-token`, `unlock-user-account`, `create-user`, `update-user`, `soft-delete-user`, `update-user-avatar`, `update-user-permissions`, `get-effective-permissions`, `get-active-users`, `get-user-detail`, `get-user-profile`, `create-role`, `update-role`, `assign-permission-to-role`, `remove-permission-from-role`, `get-role-permissions`, `find-all-roles`, `find-one-role`, `create-permission`, `update-permission`, `remove-permission`, `find-all-permissions`, `find-one-permission`, `get-my-menus`, `create-session`, `update-session`, `revoke-session`, `list-sessions-by-user`, `get-session` |
| **HU-13 (Catálogos de Facturación)** | `features/billing/rubros/`, `features/billing/discounts/`, `features/admin/comunidades/`, `features/contracts/tariffs/` | `create-period`, `update-period`, `delete-period`, `find-all-periods`, `find-one-period`, `create-rubro`, `update-rubro`, `delete-rubro`, `find-all-rubros`, `find-one-rubro`, `get-tarifas-impuesto`, `create-tariff-category`, `update-tariff-category`, `remove-tariff-category`, `find-all-tariff-categories`, `find-one-tariff-category`, `create-discount`, `update-discount`, `remove-discount`, `find-all-discounts`, `find-one-discount`, `get-discount-rubros`, `apply-discount-to-preinvoice`, `create-community`, `update-community`, `delete-community`, `find-all-communities`, `find-one-community`, `create-sector`, `update-sector`, `delete-sector`, `get-all-sectors`, `get-sector` |
| **HU-14 (Órdenes de Campo)** | `features/operator/`, `features/contracts/meters/` | `install-meter`, `decommission-meter`, `report-defect`, `update-task-state`, `get-operator-tasks`, `get-operator-readings`, `get-operator-readings-with-anomalies`, `update-operator-reading`, `sync-all`, `create-meter`, `update-meter`, `remove-meter`, `find-all-meters`, `find-one-meter` |
| **HU-15 (Comprobantes SRI)** | `features/billing/electronic-billing/`, `features/billing/credit-debit-notes/` | `emitir-factura`, `emitir-nota-credito`, `emitir-nota-debito`, `emitir-retencion`, `emitir-comprobante-manual`, `SRIEmissionDispatcherService`, `SriService` (autorización, validarXml, listar, anular, reintentar, verificarEnSri, sincronizarConSri), `SriReconciliationService`, `SriEmisionModeService`, `WebhooksService` |
| **HU-16 (Emisores/Certificados)** | `features/admin/company/`, `features/admin/system-config/` | `EmisoresService`, `CertificateService`, `CertificateExpiryCheckService` |
| **HU-17 (Documentos/Firma PDF)** | `features/contracts/service-agreements/`, `features/contracts/payment-agreements/` | `generate-pdf`, `generate-pdf-to-file`, `generate-and-sign-pdf`, `sign-existing-pdf`, `PdfService`, `get-connection-request-pdf-data`, `get-responsibility-agreement-pdf-data`, `get-payment-agreement-pdf-data` |
| **HU-18 (Notificaciones/Webhooks/Jobs)** | `features/distribution/`, `features/billing/pre-invoices/` | `MailService` (sendPlanilla/sendReport/sendBatchPlanillas), `WebhooksService` (eventos comprobante.autorizado / comprobante.rechazado), `JobsService` (reconciliación SRI */15, chequeo expiración certificados 0 8 * * *) |
