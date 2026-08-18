# Documento de Historias de Usuario — Sistema JASRAPO
**Junta Administradora de Agua Potable y Saneamiento (Olón, Las Núñez, La Entrada, Curia, San José)**  
*Fecha: 2026-08 | Versión: 1.0.0*

---

## 1. Introducción y Alcance
El sistema **JASRAPO** es una plataforma integral para automatizar la gestión técnica, comercial, operativa y financiera de las juntas administradoras de agua potable en el Ecuador. Este documento consolida las **Historias de Usuario (User Stories)** con criterios de aceptación verificables y mapeo técnico.

---

## 2. Matriz de Roles y Actores

| Rol | Descripción y Responsabilidad |
| :--- | :--- |
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
- **Escenario 1 (Validación de Identidad):** Valida cédula ecuatoriana o RUC de 13 dígitos mediante algoritmo verificador.
- **Escenario 2 (Beneficios de Ley):** Clientes registrados como Tercera Edad o Discapacidad reciben automáticamente descuentos sobre el cargo fijo.
- **Escenario 3 (Búsqueda Ágil):** Permite búsqueda instantánea por nombres o número de identificación.

#### **HU-02: Gestión de Contratos de Suministro y Asignación de Medidores**
- **Como** Secretaria,
- **Quiero** vincular un cliente con un punto físico de suministro (Comunidad, Sector) y un medidor asignado,
- **Para** formalizar el contrato de servicio y otorgar un número de guía o cuenta único.

**Criterios de Aceptación:**
- **Escenario 1 (Asignación de Medidor):** Al vincular un medidor en bodega a un contrato, pasa automáticamente a estado INSTALADO.
- **Escenario 2 (Territorio):** Cada contrato pertenece a una de las 5 comunidades (Olón, Las Núñez, La Entrada, Curia, San José) y a una categoría tarifaria.
- **Escenario 3 (Cambio de Titular):** Registra traspasos de dominio manteniendo el historial de consumos y deudas.

---

### ÉPICA 2: Medición, Hojas de Ruta y Detección de Anomalías

#### **HU-03: Planificación y Asignación de Hojas de Ruta de Lectura**
- **Como** Administrador / Secretaria,
- **Quiero** generar hojas de ruta territoriales ordenadas por sector y asignarlas a los operadores de campo,
- **Para** asegurar la cobertura mensual eficiente en la toma física de mediciones.

**Criterios de Aceptación:**
- **Escenario 1 (Generación de Ruta):** Incluye todos los contratos activos del sector para el período indicado.
- **Escenario 2 (Flujo de Estado):** Pasa por estados PENDIENTE -> EN_PROGRESO -> COMPLETADA.

#### **HU-04: Captura de Lecturas y Control de Anomalías de Consumo**
- **Como** Operario de Campo / Secretaria,
- **Quiero** registrar la lectura actual del medidor y reportar incidentes en sitio (fugas, medidor dañado o trabado),
- **Para** calcular el volumen de agua consumido en m3 y evitar errores de facturación al usuario.

**Criterios de Aceptación:**
- **Escenario 1 (Cálculo Automático):** Calcula Consumo = Lectura Actual - Lectura Anterior.
- **Escenario 2 (Lectura Negativa):** Si la lectura es menor a la anterior, alerta anomalía de SALTO_NEGATIVO.
- **Escenario 3 (Alerta de Desvío):** Si excede el consumo promedio, se envía a revisión antes de aprobación.

---

### ÉPICA 3: Facturación, Tarifas y Distribución de Planillas

#### **HU-05: Generación Masiva del Lote Mensual de Prefacturas (Planillas)**
- **Como** Secretaria,
- **Quiero** procesar en lote la generación de prefacturas mensuales por comunidad para las lecturas aprobadas,
- **Para** liquidar el valor total a pagar por cada hogar según los rubros tarifarios y saldos vencidos.

**Criterios de Aceptación:**
- **Escenario 1 (Cálculo Tarifario):** Aplica cargo fijo base, excedente por m3 adicional, tasa de seguridad comunitaria y descuentos de ley.
- **Escenario 2 (Mora y Saldo Vencido):** Suma planillas anteriores impagas e imputa interés legal de mora si tiene 3 o más meses atrasados.
- **Escenario 3 (Inmutabilidad):** Tras su aprobación, la prefactura congela sus rubros y detalles para consistencia fiscal.

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
- **Escenario 1 (Cobro Inmediato en Efectivo):** Registra el pago en estado REGISTRADO y emite comprobante.
- **Escenario 2 (Abonos Parciales / Excesos):** Amortiza la deuda más antigua o acredita diferencia a Saldo a Favor.
- **Escenario 3 (Cierre de Caja):** Realiza el arqueo diario con desglose detallado por método de pago.

#### **HU-08: Gestión de Convenios de Refinanciamiento de Deuda**
- **Como** Tesorero / Presidente,
- **Quiero** pactar convenios de pago en cuotas mensuales para usuarios con mora acumulada,
- **Para** brindar facilidades de pago a familias vulnerables y evitar la suspensión del servicio.

**Criterios de Aceptación:**
- **Escenario 1 (Financiamiento):** Fija abono inicial y divide el remanente en N cuotas con vencimiento mensual.
- **Escenario 2 (Amortización):** Marca cuotas pagadas y reduce el saldo del convenio automáticamente.

---

### ÉPICA 5: Facturación Electrónica SRI (Facturación Fiscal)

#### **HU-09: Emisión, Firma Electrónica XAdES-BES y Autorización SRI**
- **Como** Sistema / Contador,
- **Quiero** que cuando una prefactura alcance el 100% de pago se genere el comprobante fiscal, se firme electrónicamente y se autorice ante el SRI,
- **Para** cumplir con la normativa tributaria del Ecuador de manera 100% automatizada.

**Criterios de Aceptación:**
- **Escenario 1 (Regla 100% Pagado):** Se emite al SRI solo cuando la prefactura pasa a PAGADA.
- **Escenario 2 (Resiliencia Outbox):** Garantiza reintentos automáticos ante caídas del servidor del SRI.
- **Escenario 3 (Entrega):** Envía XML firmado y RIDE (PDF) autorizado automáticamente al correo del cliente.

---

### ÉPICA 6: Reportes, Estadísticas y Consulta Pública

#### **HU-10: Reportes Financieros y Operativos (Auditoría y Gestión)**
- **Como** Directiva / Tesorero / Secretaria,
- **Quiero** consultar y exportar en tabla interactiva y PDF los reportes de Estado de Cuenta, Historial de Conexión, Morosidad y Abonos,
- **Para** auditar la salud financiera de la Junta y sustentar rendiciones de cuentas en asambleas comunitarias.

**Criterios de Aceptación:**
- **Escenario 1 (Tabla-Primera):** Muestra tabla interactiva con filtros y vista previa de PDF oficial.
- **Escenario 2 (Exportación):** Permite descarga directa de PDF y envío por correo electrónico.

#### **HU-11: Portal Público de Consulta de Deuda para el Ciudadano**
- **Como** Usuario / Habitante de la comunidad,
- **Quiero** consultar en línea el saldo adeudado de mi suministro ingresando mi número de cédula o número de guía,
- **Para** conocer mi monto a pagar desde mi teléfono o computadora sin trasladarme a las oficinas de la Junta.

**Criterios de Aceptación:**
- **Escenario 1 (Acceso Libre):** Consulta pública sin login que protege datos privados.
- **Escenario 2 (Transparencia):** Informa el consumo del mes, fecha de corte y saldo a cancelar.

---

## 4. Matriz de Trazabilidad Técnica

| Historia de Usuario | Módulo Frontend (Angular) | Casos de Uso Backend (NestJS / Hexagonal) |
| :--- | :--- | :--- |
| **HU-01 (Clientes)** | `features/contracts/clients/` | `CreateClientUseCase`, `UpdateClientUseCase` |
| **HU-02 (Contratos)** | `features/contracts/service-contracts/` | `CreateServiceContractUseCase`, `UpdateStateUseCase` |
| **HU-03 (Rutas)** | `features/contracts/reading-routes/` | `CreateReadingRouteUseCase`, `AssignRouteUseCase` |
| **HU-04 (Lecturas)** | `features/contracts/readings/` | `CreateReadingUseCase`, `ApproveReadingUseCase` |
| **HU-05 (Planillas)** | `features/billing/batches/`, `pre-invoices/` | `GenerateBatchUseCase`, `generar_prefacturas_lote()` |
| **HU-06 (Distribución)** | `features/billing/pre-invoices/` | `SendBatchEmailsUseCase`, `MailService.sendPlanilla()` |
| **HU-07 (Cobros/Caja)** | `features/billing/payments/` | `CreatePaymentUseCase`, `PagoValidadoHandler` |
| **HU-08 (Convenios)** | `features/contracts/payment-agreements/` | `CreatePaymentAgreementUseCase`, `PayCuotaUseCase` |
| **HU-09 (SRI)** | `features/billing/electronic-billing/` | `SRIEmissionDispatcherService`, `FirmadorXAdES` |
| **HU-10 (Reportes)** | `features/reports/` | `ClientStatementReportUseCase`, `OverdueAccountsReportUseCase` |
| **HU-11 (Portal)** | `features/bill-inquiry/` | `PublicPortalService.consultarDeuda()` |
