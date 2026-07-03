# Especificación de Requisitos de Software (SRS)
## Sistema JASRAPO — Gestión Integral de Agua Potable para JASRAP-Olón

**Versión:** 2.0  
**Fecha:** 2026-06-17  
**Estado:** Borrador en Revisión  
**Autor:** Equipo de Desarrollo JASRAPO  
**Clasificación:** Documento Técnico Interno

---

## Historial de Revisiones

| Versión | Fecha | Descripción | Autor |
|---------|-------|-------------|-------|
| 0.1 | 2026-06-17 | Borrador inicial basado en análisis del código fuente | Equipo Dev |
| 1.0 | 2026-06-17 | Versión completa estructurada bajo ISO/IEC 25010 | Equipo Dev |
| 2.0 | 2026-06-17 | Integración de propuesta operativa: nuevas definiciones (Guía, Tasa de Seguridad), contexto legacy, escala real (2.400 usuarios), RFs 032–035, NF-021, riesgos R-13 a R-16 | Equipo Dev |

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Descripción General](#2-descripción-general)
3. [Requisitos Funcionales](#3-requisitos-funcionales-adecuación-funcional)
4. [Requisitos No Funcionales](#4-requisitos-no-funcionales-atributos-de-calidad)
5. [Aseguramiento y Control de Calidad](#5-aseguramiento-y-control-de-calidad-qaqc)
6. [Gestión de Riesgos](#6-gestión-de-riesgos)

---

## 1. Introducción

### 1.1 Propósito

Este documento define la Especificación de Requisitos de Software (SRS) para el sistema **JASRAPO** (Sistema de Gestión Integral de Agua Potable para la Junta Administradora de Servicios de Agua Potable y Saneamiento de Olón). El propósito del sistema es **automatizar y digitalizar** los procesos operativos, comerciales y financieros de la JASRAP-Olón: desde el registro de medidores y la lectura mensual de consumo, hasta la generación de planillas, cobros, facturación electrónica con el SRI y la generación de reportes gerenciales.

Este SRS sirve como contrato de entendimiento entre el equipo de desarrollo y los stakeholders de la JASRAP-Olón, y constituye la base para el diseño, implementación, pruebas y aceptación del sistema. El documento integra dos fuentes complementarias: el **análisis del código fuente** del sistema en construcción y el **contexto operativo** derivado de reuniones con el personal de la Junta (Presidencia, Tesorero, Secretaría y Recaudación).

### 1.2 Alcance

**El sistema JASRAPO cubre:**
- Gestión de clientes y contratos de servicio de agua potable (con identificador de Guía por suministro)
- Registro y seguimiento de medidores (alta, baja, historial, anomalías)
- Captura de lecturas mensuales de consumo y detección de anomalías
- Interfaz web responsive optimizada para toma de lecturas en campo (5 comunidades) desde dispositivos móviles o tablets
- Cálculo automático de consumo y generación de pre-facturas por lote (ciclo mensual iniciando el día 25)
- Emisión de planillas/estados de cuenta (PDF) y comprobantes electrónicos
- Facturación electrónica conforme a la normativa del SRI Ecuador (Comprobantes Electrónicos)
- Gestión de pagos, recaudación y convenios de pago por deuda vencida
- Control de caja (apertura/cierre de sesión, arqueo)
- Gestión de saldos a favor del cliente e historial inmutable de abonos
- Órdenes de corte y reconexión del servicio
- Portal público de consulta de planilla (sin autenticación)
- Reportes operativos y gerenciales: consumo por zona, morosidad, estado de cuenta, historial de conexión
- Exportación de datos compatible para auditorías externas (SENAGUA, entes de control)
- Gestión de usuarios internos, roles y permisos granulares (RBAC)
- Administración de sectores, comunidades y rutas de lectura
- Observabilidad del sistema (métricas, trazabilidad, logs)

**El sistema JASRAPO NO cubre:**
- Gestión financiera-contable completa (contabilidad de la Junta, balances contables NIIF), aunque exporta datos compatibles para auditoría
- Facturación de otros servicios municipales distintos al agua potable
- Integración con sistemas bancarios para cobro automático (transferencias automáticas)
- Gestión de RRHH o nómina del personal de la Junta
- Monitoreo en tiempo real de infraestructura física (tuberías, presión, calidad del agua)
- Aplicación móvil nativa (iOS/Android) para usuarios finales; la interfaz responsive cubre el uso en campo del personal operativo

### 1.3 Definiciones, Acrónimos y Abreviaturas

| Término / Acrónimo | Definición |
|---|---|
| **JASRAP-Olón** | Junta Administradora de Servicios de Agua Potable y Saneamiento de Olón, provincia de Santa Elena, Ecuador. Entidad comunitaria privada sin fines de lucro que administra el servicio de agua potable. |
| **JASRAPO** | Nombre del sistema de software desarrollado para JASRAP-Olón. |
| **SRS** | Software Requirements Specification (Especificación de Requisitos de Software). |
| **SRI** | Servicio de Rentas Internas. Entidad gubernamental ecuatoriana que regula la emisión de comprobantes electrónicos. |
| **Comprobante Electrónico** | Documento fiscal digital (factura, nota de crédito, nota de débito) emitido según normativa SRI y firmado electrónicamente. |
| **Planilla** | Estado de cuenta mensual del cliente, también llamado "pre-factura" antes de ser autorizada por el SRI. Equivalente al recibo de servicio de agua. |
| **Medidor** | Dispositivo físico instalado en la propiedad del cliente que mide el consumo de agua en m³. |
| **Lectura** | Registro mensual del valor del medidor en m³ realizado por personal de la Junta. |
| **Anomalía de Lectura** | Situación irregular detectada al registrar una lectura (fuga, medidor dañado, consumo atípico, etc.). |
| **Lote de Facturación** | Conjunto de pre-facturas generadas en un mismo período de facturación mensual. |
| **Contrato** | Acuerdo formal entre la JASRAP-Olón y un cliente que regula las condiciones del servicio (categoría tarifaria, medidor asignado, etc.). |
| **Categoría Tarifaria** | Clasificación tarifaria del cliente según tipo de uso: doméstico, comercial, industrial, oficial. Determina los rangos de precio por m³. |
| **Convenio de Pago** | Acuerdo de pago en cuotas entre la Junta y un cliente moroso para saldar su deuda. |
| **Ruta** | Trayecto geográfico asignado a un lector para la toma de lecturas de un grupo de medidores. |
| **Comunidad** | División geográfica de primer nivel en la que opera la Junta (ej. Olón centro, Olón norte). |
| **Sector** | Subdivisión dentro de una Comunidad para organizar zonas de distribución del agua. |
| **RBAC** | Role-Based Access Control. Control de acceso basado en roles, que determina qué funciones puede realizar cada usuario. |
| **JWT** | JSON Web Token. Mecanismo de autenticación sin estado utilizado en la API REST. |
| **ORM** | Object-Relational Mapper. Herramienta de mapeo entre objetos del código y tablas de base de datos. |
| **API REST** | Interfaz de programación de aplicaciones basada en HTTP y arquitectura REST. |
| **PDF** | Portable Document Format. Formato de documento para planillas, reportes e informes. |
| **S3** | Amazon Simple Storage Service. Estándar de almacenamiento de objetos utilizado por RustFS. |
| **RUC** | Registro Único de Contribuyentes. Identificación fiscal en Ecuador. |
| **CI** | Cédula de Identidad. Documento de identificación personal en Ecuador. |
| **IVA** | Impuesto al Valor Agregado. Impuesto aplicado a los comprobantes fiscales. |
| **NF** | Requisito No Funcional. |
| **RF** | Requisito Funcional. |
| **ISO/IEC 25010** | Norma internacional de calidad del producto de software que define el modelo de calidad. |
| **SPA** | Single Page Application. Tipo de aplicación web donde la navegación no recarga la página. |
| **Guía** | Identificador único del suministro de agua potable, asignado a cada medidor físico instalado en una propiedad. Permite localizar rápidamente el contrato y cliente asociados. Equivale a un "número de cuenta" del servicio. |
| **Tasa de Seguridad** | Recargo del 5% calculado sobre el consumo de agua, aplicado exclusivamente a los suministros ubicados en los sectores de Olón. Aparece como rubro independiente en la planilla. |
| **Lazy Cleansing** | Estrategia de captura diferida de datos incompletos: permite registrar clientes con datos mínimos y completar la información SRI requerida (correo, dirección fiscal) de forma no bloqueante en el momento del cobro en ventanilla. |
| **Otros Ingresos** | Categoría de cobros de la Junta distintos al consumo de agua: multas, reconexiones, instalaciones, trámites administrativos. Su deuda pendiente puede bloquear el cobro del servicio ordinario. |
| **Orden de Corte** | Instrucción formal emitida por el sistema para que el Operador de campo suspenda el servicio de agua a un cliente por deuda vencida. Se complementa con la Orden de Reconexión al regularizar la deuda. |

---

## 2. Descripción General

### 2.1 Contexto del Sistema

La JASRAP-Olón administra actualmente el servicio de agua potable utilizando una **plataforma legacy** que presenta fallos críticos: actualizaciones incorrectas de lecturas históricas, falta de integración entre módulos (lecturas, cobros y facturación operan de forma desconectada), y eliminación involuntaria de planillas pagadas que dificulta las auditorías. Este contexto, sumado al incumplimiento creciente con la normativa de facturación electrónica del SRI y la dificultad para generar reportes de morosidad confiables, motiva el desarrollo del sistema JASRAPO.

**JASRAPO reemplaza íntegramente la plataforma legacy.** Previo al go-live se ejecutará un proceso de migración de datos históricos (clientes, medidores, lecturas, pagos) con estandarización de campos (normalización de idioma, formatos de fecha, caracteres especiales) para garantizar la calidad del dato histórico importado.

El sistema opera en un entorno **híbrido**: administración centralizada en la oficina de la Junta (vía navegador de escritorio) + interfaz web responsive para la toma de lecturas en campo, utilizada por los Operadores en las **cinco comunidades atendidas** (Olón, San José, Curía, La Entrada y una quinta comunidad por confirmar con la Junta). La arquitectura es **cliente-servidor web**: un backend NestJS expone una API REST consumida por un frontend Angular. Ambas aplicaciones se despliegan mediante Docker en un servidor Linux (producción) accesible públicamente a través de un túnel Cloudflare. Los datos residen en PostgreSQL 16; los archivos (certificados, PDF generados) en almacenamiento S3-compatible (RustFS).

### 2.2 Tipos de Usuarios (Actores del Sistema)

#### 2.2.1 Usuarios Internos (Entidad Privada / Operativa)

| Actor | Descripción | Acceso Típico |
|---|---|---|
| **Administrador del Sistema** | Responsable técnico del sistema. Configura usuarios, roles, parámetros del sistema y el emisor SRI. Acceso total. | Total |
| **Presidente** | Máxima autoridad de la Junta. Aprueba convenios de pago, aplica descuentos extraordinarios y condonaciones, revisa reportes gerenciales y actas. Su clave es requerida para acciones sensibles del Recaudador. | Reportes, aprobaciones, descuentos |
| **Tesorero** | Responsable de la gestión financiera. Supervisa facturación, gestiona convenios y genera reportes de morosidad y recaudación. | Facturación, reportes, convenios |
| **Recaudador** | Personal de ventanilla. Registra cobros diarios, opera apertura/cierre de caja y gestiona el punto de recaudación. No puede aplicar descuentos sin autorización de Presidencia. | Pagos, caja |
| **Secretario/a** | Responsable administrativo. Administra el padrón de clientes, gestiona contratos y supervisa el ingreso de lecturas. | Clientes, contratos, lecturas |
| **Operador de Lectura** | Personal de campo. Registra lecturas mensuales de medidores, reporta anomalías y ejecuta órdenes de corte/reconexión en las comunidades. | Lecturas, medidores, órdenes de corte |

#### 2.2.2 Usuarios Externos (Entidad Pública / Comunidad)

| Actor | Descripción | Acceso |
|---|---|---|
| **Cliente/Abonado** | Habitante u organización que recibe el servicio de agua. Puede consultar su planilla mediante el portal público usando su número de cédula, RUC o número de Guía. | Portal público (sin login) |
| **Ente Regulador** | SENAGUA u organismos de control. Puede requerir reportes del sistema (cubierto por exportación de reportes en formatos auditables). | Reportes exportados |
| **SRI (Ecuador)** | Servicio de Rentas Internas. Receptor de los comprobantes electrónicos vía WSDL; emite la autorización y número de autorización. El sistema recibe las respuestas mediante webhooks o polling. | Integración automática (sin login humano) |

### 2.3 Restricciones del Sistema

#### 2.3.1 Restricciones Tecnológicas
- La API REST del backend **debe mantener compatibilidad** con el frontend Angular existente; cambios de contrato de API requieren coordinación.
- La integración con el SRI debe seguir exactamente la especificación técnica del SRI Ecuador para comprobantes electrónicos (esquemas XML, endpoints WSDL de producción y pruebas).
- El sistema debe operar en el entorno Docker Compose definido (PostgreSQL 16, Node.js 22, Angular + Nginx).
- El certificado digital (firma electrónica) para el SRI debe ser gestionado de forma segura; no se almacena en texto plano en variables de entorno.

#### 2.3.2 Restricciones de Negocio y Regulatorias
- La Junta opera bajo la **Ley Orgánica de Recursos Hídricos, Usos y Aprovechamiento del Agua** (Ecuador) y sus reglamentos.
- La facturación electrónica debe cumplir con la **Ficha Técnica de Comprobantes Electrónicos del SRI** vigente.
- Los datos personales de los clientes están protegidos por la **Ley Orgánica de Protección de Datos Personales (LOPDP)** del Ecuador.
- La Junta no cuenta con un departamento de TI propio; el mantenimiento del sistema es delegado al equipo de desarrollo externo.

#### 2.3.3 Restricciones de Conectividad en Campo
- Las comunidades atendidas (especialmente La Entrada y Curía) pueden tener cobertura de datos móviles intermitente o inexistente.
- El módulo de registro de lecturas debe ser tolerante a conectividad intermitente: permitir la captura local de lecturas y sincronizar con el servidor al recuperar conexión, o al menos operar con cargas rápidas y retries transparentes.
- Los Operadores deben poder completar su ruta de lecturas aunque la conexión falle temporalmente durante el recorrido.

#### 2.3.4 Restricciones de Presupuesto y Tiempo
- El sistema se desarrolla con un presupuesto ajustado, por lo que se prioriza funcionalidad core sobre integraciones avanzadas.
- Las funcionalidades de Tesorería (ingresos/egresos) y Secretaría (documentos/correspondencia) están previstas como módulos futuros; sus rutas frontend existen pero sus componentes son placeholders.

---

## 3. Requisitos Funcionales (Adecuación Funcional)

> Conforme a ISO/IEC 25010, la adecuación funcional cubre: **Completitud** (todas las tareas necesarias), **Corrección** (resultados exactos) y **Pertinencia** (facilitar realmente el trabajo).

---

### 3.1 Módulo de Identidad y Control de Acceso

#### RF-001: Autenticación de Usuarios
- El sistema debe autenticar usuarios mediante correo electrónico y contraseña.
- Tras autenticación exitosa, debe emitir un JWT con tiempo de expiración configurable.
- El sistema debe registrar la sesión activa (tabla `Sesiones`) con IP, user agent y fecha.
- Debe existir un endpoint de cierre de sesión que invalide el token en el servidor.

#### RF-002: Gestión de Roles y Permisos (RBAC)
- El sistema debe soportar múltiples roles (Administrador, Presidente, Tesorero, Secretario, Operador).
- Cada rol tendrá un conjunto de permisos granulares definidos por módulo y acción (crear, leer, actualizar, eliminar).
- El Administrador debe poder crear nuevos roles y asignarles permisos desde la interfaz.
- Los permisos deben aplicarse tanto en el backend (guard `PermissionsGuard`) como reflejarse en el menú visible del frontend.

#### RF-003: Gestión de Usuarios del Sistema
- El Administrador debe poder crear, editar, activar/desactivar y eliminar (soft-delete) usuarios del sistema.
- Al crear un usuario se debe asignar al menos un rol.
- El sistema debe permitir el restablecimiento de contraseña mediante correo electrónico.
- Los usuarios no deben poder ver ni modificar información fuera del alcance de sus permisos.

#### RF-004: Menú Dinámico por Rol
- El menú de navegación del frontend debe renderizarse dinámicamente según los permisos del usuario autenticado.
- Los ítems del menú sin permiso no deben ser visibles ni accesibles por URL directa.

---

### 3.2 Módulo de Operaciones (Clientes, Contratos, Territorio)

#### RF-005: Gestión de Clientes
- El sistema debe permitir registrar clientes con: nombres completos, tipo de identificación (CI/RUC/Pasaporte), número de identificación, dirección, teléfono, correo electrónico.
- Debe soportar búsqueda por: nombre completo, número de identificación (CI/RUC), **número de Guía** del suministro y **dirección** del inmueble.
- Debe registrar el estado del cliente (activo, suspendido, retirado).
- El sistema debe prevenir duplicados de identificación.
- Debe mostrar un indicador visual cuando falten datos SRI obligatorios (correo electrónico, dirección fiscal) para facilitar el proceso de Lazy Cleansing.

#### RF-006: Gestión de Contratos de Servicio
- Cada contrato vincula un cliente con un medidor y una categoría tarifaria.
- El contrato debe registrar: **número de Guía** (identificador único del suministro), fecha de inicio, tipo de conexión, número de medidor, sector, comunidad y ruta asignada.
- Los tipos de contrato reconocidos son: **Tipo 1** (doméstico estándar), **Tipo 2** (comercial/institucional), **Tipo 3** (a definir y aprobar con la Junta antes de su implementación).
- Un cliente puede tener múltiples contratos (ej. propiedad principal + local comercial), cada uno con su propia Guía.
- El contrato debe tener estados: Activo, Suspendido (corte temporal), Terminado.
- El sistema debe generar el documento PDF de contrato (Solicitud de Conexión, Acta de Responsabilidad, Obligaciones) conforme a las plantillas de Tipo Uno y Tipo Dos existentes en los documentos de la Junta.

#### RF-007: Gestión de Medidores
- El sistema debe registrar medidores con: número de serie, marca, modelo, fecha de instalación, estado (activo, dañado, retirado).
- Debe mantener historial de cambios de medidor (`HistorialMedidores`): quién lo cambió, cuándo y por qué motivo.
- Un medidor solo puede estar activo en un contrato a la vez.

#### RF-008: Gestión Geográfica (Comunidades, Sectores, Rutas)
- El Administrador debe poder crear, editar y desactivar Comunidades y Sectores.
- Debe poder definir Rutas de lectura, asignando un conjunto de medidores a una ruta en orden de visita.
- Las rutas facilitan la planificación del trabajo de campo del lector.

#### RF-009: Gestión de Categorías Tarifarias
- El sistema debe mantener un catálogo de categorías tarifarias con rangos de consumo y precios por m³.
- Las categorías base reconocidas son: **Categoría Tipo 1** (doméstico), **Categoría Tipo 2** (comercial/institucional) y **Categoría Tipo 3** (por definir con la Junta). El sistema debe soportar agregar categorías adicionales sin cambios de código.
- Cada categoría define: nombre, cargo fijo mensual, rangos escalonados de consumo (m³ mínimo – m³ máximo, precio/m³ por rango) y excedente (precio/m³ sobre el último rango).
- El Administrador debe poder crear y modificar categorías; las modificaciones deben aplicar a futuros períodos (no retroactivas).

---

### 3.3 Módulo de Medición (Lecturas y Anomalías)

#### RF-010: Registro de Lecturas Mensuales
- El sistema debe permitir registrar la lectura de cada medidor para un período mensual (año/mes).
- La lectura registra: valor actual del medidor (m³), fecha de toma, usuario que tomó la lectura.
- El sistema debe calcular automáticamente el **consumo del período** = lectura actual − lectura anterior.
- Si no existe lectura anterior, el consumo se considera desde cero (primera lectura del medidor).
- El sistema debe prevenir lecturas duplicadas para el mismo medidor y período.

#### RF-011: Validación Automática de Lecturas
- El sistema debe alertar (no bloquear) cuando el consumo calculado sea atípicamente alto o bajo según parámetros configurables (ej. desviación >200% del promedio de los últimos 6 meses).
- El sistema debe alertar si la lectura actual es menor que la lectura anterior (regresión de medidor).

#### RF-012: Gestión de Anomalías de Lectura
- El operador debe poder registrar anomalías asociadas a una lectura: fuga visible, medidor dañado, medidor inaccesible, consumo cero sospechoso, entre otros tipos configurables.
- Las anomalías deben quedar registradas con descripción, tipo y usuario que las reportó.
- Las anomalías pendientes deben ser visibles para el Tesorero/Administrador para su resolución.
- Una lectura con anomalía activa no debe incluirse en el lote de facturación hasta ser resuelta o marcada como excepción autorizada.

---

### 3.4 Módulo de Facturación

#### RF-013: Generación de Lote de Pre-Facturas
- El sistema debe permitir generar un **lote de pre-facturas** para un período (mes/año) con un solo comando.
- El **ciclo de facturación mensual inicia el día 25 de cada mes** con la apertura del período de lectura y concluye con la emisión definitiva de planillas antes del primer día del mes siguiente.
- La generación toma todas las lecturas del período sin anomalías pendientes, aplica la tarifa correspondiente a cada contrato y genera una `Prefactura` por cliente.
- El cálculo de la pre-factura debe incluir: consumo en m³, precio por rango escalonado, cargo fijo, **Tasa de Seguridad (5% del consumo, solo para suministros en sectores de Olón)**, otros rubros aplicables (alcantarillado, administración, etc.), descuentos autorizados, subtotal, IVA y total.
- La Tasa de Seguridad debe aparecer como **rubro desglosado e identificable** en la planilla (no incluida en el precio/m³).
- El lote debe tener estados: Borrador, Aprobado, Enviado al SRI, Finalizado.
- El sistema debe garantizar la **unicidad del número de comprobante** enviado al SRI; no puede existir duplicidad de secuenciales por emisor y tipo de comprobante.
- **Corrección funcional (ISO 25010):** Los cálculos monetarios deben usar aritmética decimal de precisión fija (no flotante) para evitar errores de redondeo en cobros.

#### RF-014: Gestión de Pre-Facturas
- El Tesorero debe poder revisar el detalle de cada pre-factura antes de aprobar el lote.
- Debe poder editar manualmente una pre-factura (ajuste por anomalía o resolución de reclamación) con registro de motivo.
- Debe poder anular una pre-factura individual con motivo documentado.

#### RF-015: Generación de Planilla PDF
- El sistema debe generar el PDF de planilla (estado de cuenta del cliente) a partir de la pre-factura aprobada.
- El PDF debe contener: datos del cliente, período, lecturas (anterior y actual), consumo, detalle de rubros, total a pagar, fecha límite de pago, código de referencia y datos de la Junta (emisor).
- El formato debe corresponder al modelo de "Estado de Cuenta (Planilla) Tipo Uno" existente en los documentos de la Junta.

#### RF-016: Facturación Electrónica (Integración SRI)
- El sistema debe generar y enviar comprobantes electrónicos al SRI de Ecuador: Facturas y Notas de Crédito/Débito.
- El proceso debe seguir el flujo oficial del SRI: generación XML → firma electrónica → recepción → autorización → almacenamiento del RIDE.
- El sistema debe gestionar el certificado de firma electrónica del emisor de forma segura.
- Debe implementar reintentos automáticos ante rechazos temporales del SRI (red, indisponibilidad).
- El estado del comprobante (Pendiente, Autorizado, Rechazado, Anulado) debe ser rastreable en el sistema.
- Los comprobantes autorizados deben enviarse al correo del cliente automáticamente.

#### RF-017: Catálogos SRI
- El sistema debe mantener actualizados los catálogos del SRI: tipos de impuesto, formas de pago, tipos de identificación, documentos de sustento, retenciones, tarifas.
- Debe soportar la carga inicial desde el `init.sql` oficial del SRI y actualizaciones manuales.

---

### 3.5 Módulo de Cobros y Pagos

#### RF-018: Registro de Pagos
- El sistema debe registrar el pago de una planilla por un cliente: monto, forma de pago (efectivo, transferencia, cheque), fecha, referencia.
- Debe actualizar el estado de la pre-factura/comprobante a "Pagado" (total o parcial).
- Si hay saldo a favor del cliente (`SaldoFavorCliente`), debe aplicarse automáticamente al siguiente cobro o de forma manual.

#### RF-019: Control de Caja
- El sistema debe soportar apertura y cierre de sesión de caja (`CajaSesion`) por usuario y turno.
- Debe registrar todos los movimientos de caja del turno.
- Al cierre, debe generar un arqueo (`CajaArqueoDetalle`) con el resumen de ingresos por forma de pago.

#### RF-020: Convenios de Pago por Deuda
- El Tesorero/Presidente debe poder crear un convenio de pago para clientes con deuda vencida.
- La estructura típica de convenio es: **50% de entrada** al momento de firmar + saldo dividido en cuotas mensuales (ej. 3 cuotas). El sistema debe soportar estructuras configurables (cualquier % de entrada + cualquier número de cuotas).
- El convenio debe registrar: deuda total cubierta, monto de entrada, número de cuotas, valor de cada cuota, fechas de vencimiento por cuota.
- El sistema debe rastrear el pago de cada cuota (`CuotaConvenio`) y marcar el convenio como cumplido al completar todas las cuotas.
- El Presidente debe aprobar convenios que superen un umbral de deuda configurable.
- El estado del convenio (activo, en mora, cumplido, incumplido) debe reflejarse automáticamente en el perfil del cliente.

#### RF-021: Gestión de Morosidad
- El sistema debe identificar automáticamente los clientes con deuda vencida (planillas no pagadas después de la fecha límite).
- Debe calcular intereses por mora según la tasa configurada en `ParametroTasainteres`.
- Debe generar la Nota de Débito correspondiente para registrar los intereses.

#### RF-022: Descuentos y Condonaciones
- El sistema debe soportar un catálogo de descuentos (`CatalogoDescuento`) aplicables a clientes específicos o categorías (ej. adulto mayor, persona con discapacidad, según normativa local).
- Los descuentos aplicados **durante el proceso de cobro en ventanilla** (por el Recaudador) deben requerir **autorización explícita del rol Presidente**: el sistema debe solicitar confirmación con la clave del usuario con rol Presidente antes de aplicar el descuento.
- El Presidente puede aplicar **condonaciones totales o parciales** de deuda con registro obligatorio de motivo y referencia a resolución de asamblea (si aplica).
- Los descuentos y condonaciones deben quedar registrados con: usuario que los aplicó, usuario que los autorizó, fecha, motivo y monto.
- Los descuentos deben quedar desglosados en el detalle de la pre-factura (`DescuentoDetalle`).

---

### 3.6 Portal Público de Consulta

#### RF-023: Consulta Pública de Planilla
- El portal público debe permitir a cualquier persona consultar el estado de cuenta de un cliente **sin autenticación**.
- La búsqueda se realiza por número de cédula/RUC del titular del contrato.
- El resultado debe mostrar: nombre del cliente, período, consumo, valor a pagar, estado (pagado/pendiente), fecha límite.
- No debe mostrar información sensible no relacionada con el servicio (dirección exacta, teléfono, etc.).

---

### 3.6.1 Nuevos Requisitos Funcionales Operativos

#### RF-032: Bloqueo de Cobro por Deudas de Otros Ingresos
- El sistema debe verificar, antes de procesar el cobro del consumo de agua de un cliente, si existen **cargos de "Otros Ingresos" pendientes de pago** (multas, reconexiones, instalaciones, trámites).
- Si existen cargos pendientes, el sistema debe **alertar al Recaudador** e impedir el cobro del servicio ordinario hasta que se salden los cargos pendientes o se obtenga autorización explícita del Presidente/Administrador para proceder.
- La anulación del bloqueo debe quedar registrada con usuario, fecha y motivo.

#### RF-033: Captura Diferida de Datos SRI (Lazy Cleansing)
- El sistema debe permitir registrar clientes con datos mínimos (nombres + número de identificación) sin bloquear el proceso por datos SRI faltantes (correo electrónico, dirección fiscal).
- El sistema debe mostrar un **indicador visual** (ej. ícono de advertencia) en la ficha del cliente y en la pantalla de cobro cuando falten datos SRI obligatorios para la emisión de comprobantes electrónicos.
- El Recaudador debe poder **completar los datos faltantes directamente desde la pantalla de cobro**, sin abandonar el flujo de pago, en el momento en que el cliente los proporcione en ventanilla.
- Los datos capturados mediante Lazy Cleansing deben actualizarse en el perfil del cliente con registro de quién los completó y cuándo.

#### RF-034: Órdenes de Corte y Reconexión
- El sistema debe generar automáticamente **órdenes de corte** para clientes con deuda que supere un número configurable de períodos vencidos sin pago.
- La Presidencia/Tesorero debe poder generar órdenes de corte manuales para casos específicos.
- El Operador de Lectura debe poder registrar la **ejecución de la orden de corte o reconexión** desde su dispositivo en campo, indicando: fecha/hora, observaciones y confirmación fotográfica (opcional).
- Al registrar la ejecución del corte, el estado del contrato (`Suspendido`) debe actualizarse automáticamente.
- Al registrar la reconexión (posterior al pago o convenio), el estado del contrato debe volver a `Activo`.

#### RF-035: Registro de Abonos Históricos (Trazabilidad para Auditoría)
- El sistema debe mantener un **historial completo e inmutable** de todos los abonos (pagos totales o parciales) realizados a una cuenta de cliente, incluyendo: fecha, monto, forma de pago, usuario de caja, referencia y estado del comprobante asociado.
- Los registros de pago **no pueden eliminarse físicamente**; solo anularse con motivo documentado y con registro del usuario que realizó la anulación.
- Este historial debe ser accesible para auditorías internas en cualquier momento y exportable en formato PDF o CSV para auditorías externas (SENAGUA, resolución judicial, etc.).
- Los datos históricos migrados desde el sistema legacy deben incluir los abonos disponibles, con marca clara de su origen ("importado desde sistema anterior").

---

### 3.7 Módulo de Reportes

#### RF-024: Reporte de Lista de Clientes
- El sistema debe generar un listado de clientes con sus contratos activos, sector, comunidad y estado del medidor.
- Exportable a PDF y (deseable) Excel.

#### RF-025: Reporte de Pagos/Recaudación
- El sistema debe generar reportes de pagos recibidos en un rango de fechas: totales por forma de pago, por sector/comunidad, por operador de caja.

#### RF-026: Reporte de Historial de Conexión
- Por cliente, debe mostrar el historial completo de lecturas, consumo mensual, pagos y estado de la cuenta desde su primera conexión.

#### RF-027: Reporte de Estado de Cuenta del Cliente
- El sistema debe generar el PDF de estado de cuenta individual para un cliente en un período seleccionado.
- Equivale a la planilla mensual, pero consultable para cualquier período histórico.

#### RF-028: Reporte de Consumo por Zonas (KPI)
- El sistema debe generar un reporte de consumo total por sector y comunidad para un período.
- Incluye: m³ consumidos, número de clientes activos, promedio de consumo, comparativa con período anterior.

#### RF-029: Reporte de Morosidad
- El sistema debe generar el reporte de cuentas por cobrar vencidas: clientes morosos, monto adeudado, días de vencimiento, estado del convenio (si aplica).

---

### 3.8 Módulo de Administración del Sistema

#### RF-030: Configuración del Emisor SRI
- El Administrador debe poder configurar los datos del emisor para facturación electrónica: RUC, razón social, nombre comercial, dirección matriz, ambiente (pruebas/producción), tipo de emisión.
- Debe poder cargar y gestionar el certificado digital (archivo P12) para la firma electrónica de forma segura.

#### RF-031: Configuración General del Sistema
- El sistema debe exponer una pantalla de configuración para parámetros globales: tasa de interés por mora, días de gracia para pago, límite de deuda para convenio sin aprobación presidencial, logo de la Junta.

---

## 4. Requisitos No Funcionales (Atributos de Calidad)

> Siguiendo el modelo de calidad **ISO/IEC 25010**, esta sección traduce los objetivos de calidad en condiciones verificables y medibles.

---

### 4.1 Confiabilidad

#### NF-001: Disponibilidad del Sistema
- El sistema debe tener una disponibilidad del **99.0% mensual** durante el horario laboral de la Junta (lunes a viernes 08:00–17:00 ECT, sábados 08:00–13:00 ECT).
- Los períodos de mantenimiento programado deben notificarse con al menos 24 horas de anticipación.
- La medición de disponibilidad se realiza con el endpoint de health-check del backend.

#### NF-002: Tolerancia a Fallos
- Ante un fallo de la integración SRI (servicio externo no disponible), el sistema debe continuar operando en modo degradado: los comprobantes se encolan en la base de datos y se reenvían automáticamente cuando el SRI esté disponible, sin pérdida de datos.
- El sistema de jobs asíncronos (basado en PostgreSQL) debe garantizar que las tareas encoladas no se pierdan ante un reinicio del servidor.

#### NF-003: Integridad de Datos
- El sistema debe garantizar consistencia transaccional en todas las operaciones financieras (pagos, generación de lotes, convenios) usando transacciones ACID de PostgreSQL.
- Los datos financieros (montos, consumos) no deben poder ser eliminados físicamente; solo marcados como anulados o con soft-delete.

---

### 4.2 Usabilidad (Capacidad de Interacción)

#### NF-004: Aprendizabilidad
- Un usuario con conocimientos básicos de computadora (manejo de navegador web) debe ser capaz de registrar una lectura de medidor sin asistencia, después de **2 horas de capacitación**.
- La interfaz de registro de lecturas debe estar optimizada para uso en **dispositivos móviles y tablets** en campo: botones táctiles de tamaño adecuado, mínima escritura (campos numéricos con teclado numérico nativo), carga rápida incluso en redes lentas (< 5 segundos en 3G).
- El sistema debe incluir mensajes de error descriptivos en español (no mensajes técnicos en inglés al usuario final).

#### NF-005: Accesibilidad — Portal Público e Interfaz de Campo
- El portal público de consulta de planilla y la interfaz de lecturas de campo deben ser usables en dispositivos móviles (diseño responsive, probado en pantallas de 5" en adelante).
- La búsqueda en el portal público debe aceptar **número de Guía, nombre del titular o número de cédula/RUC** para facilitar la consulta por parte de usuarios con distintos datos a mano.
- La búsqueda en ventanilla (módulo de cobro) debe soportar búsqueda por **guía, nombre o dirección** para reducir tiempos de espera del cliente.
- El resultado de consulta del portal público debe ser comprensible para un usuario sin formación técnica; los términos técnicos deben estar explicados o evitados.

#### NF-006: Retroalimentación al Usuario
- Toda operación de larga duración (generación de lote, envío al SRI) debe mostrar un indicador de progreso o confirmación visual al usuario.
- El sistema debe mostrar notificaciones de éxito/error al completar operaciones críticas (pago registrado, planilla generada, error de conexión SRI).

#### NF-007: Consistencia Visual
- La interfaz debe mantener un lenguaje visual consistente basado en Angular Material a lo largo de todos los módulos.

---

### 4.3 Seguridad

#### NF-008: Autenticación y Autorización
- Todos los endpoints de la API (excepto login, health-check y portal público) deben requerir JWT válido.
- El sistema debe implementar autorización por permiso granular en cada endpoint (`RequiredPermission` decorator). Un token válido sin el permiso necesario debe recibir HTTP 403.
- Los JWT deben tener tiempo de expiración no mayor a 8 horas. Las sesiones deben poder revocarse individualmente.

#### NF-009: Protección Contra Ataques Comunes
- El sistema debe implementar rate-limiting en todos los endpoints (máx. 20 solicitudes/minuto/IP por defecto, configurable).
- Los inputs de los usuarios deben ser validados y sanitizados en el backend (class-validator en NestJS) para prevenir inyección SQL, XSS y similares.
- Las contraseñas deben almacenarse con hash bcrypt (factor de coste ≥ 10).

#### NF-010: Protección de Datos Personales (LOPDP)
- El sistema solo debe recopilar datos personales necesarios para la operación del servicio (principio de minimización de datos).
- El acceso a datos de clientes debe quedar registrado en el log de auditoría para operaciones sensibles (consulta de deuda, modificación de datos).
- Los datos de identificación de clientes no deben exponerse en URLs ni logs de aplicación.

#### NF-011: Seguridad del Certificado Digital
- El certificado digital P12 para firma electrónica no debe almacenarse en variables de entorno en texto plano ni en el repositorio de código.
- Debe almacenarse cifrado (usando el módulo `EncryptionModule` del sistema) o en el almacenamiento S3 con acceso restringido.

#### NF-012: Comunicaciones Cifradas
- Toda comunicación entre el frontend, backend y servicios externos debe realizarse sobre HTTPS/TLS.
- El túnel Cloudflare garantiza TLS para las conexiones externas; las comunicaciones internas Docker deben ser en red privada.

---

### 4.4 Eficiencia de Desempeño

#### NF-013: Tiempos de Respuesta
- Las consultas de uso frecuente (búsqueda de cliente, estado de planilla, lista de lecturas) deben responder en **< 3 segundos** bajo carga normal.
- La generación de un lote de pre-facturas para hasta **2.400 clientes** (escala real de la Junta) debe completarse en **< 5 minutos**.
- La generación de un PDF de planilla individual debe completarse en **< 5 segundos**.
- La búsqueda de cliente por guía, nombre o dirección debe responder en **< 2 segundos** para reducir tiempos de espera en ventanilla.

#### NF-014: Capacidad
- El sistema debe soportar hasta **2.400 clientes activos** (escala real operacional de la JASRAP-Olón) sin degradación de rendimiento.
- La base de datos debe escalar hasta **5 años de historial de lecturas** (aprox. **144.000 lecturas** para 2.400 clientes) sin requerir archivado ni particionado manual.

#### NF-015: Uso de Recursos
- El sistema debe operar de forma estable en un servidor con **2 vCPU y 4 GB RAM**, que es la capacidad del entorno de producción actual.

---

### 4.5 Mantenibilidad

#### NF-016: Modularidad del Código
- El backend debe mantener la separación de módulos por dominio (`metering`, `billing`, `operations`, `identity`, `sri`, `reports`) definida en la arquitectura hexagonal actual.
- No deben existir dependencias circulares entre módulos de dominio.

#### NF-017: Cobertura de Pruebas
- Los casos de uso críticos (cálculo de factura, aplicación de tarifa, generación de lote, registro de pago) deben tener cobertura de pruebas unitarias y/o de integración mínima del **70%**.
- Toda nueva funcionalidad debe entregarse con sus pruebas correspondientes.

#### NF-018: Documentación de la API
- Todos los endpoints de la API deben estar documentados en Swagger/OpenAPI con: descripción, parámetros, cuerpo de request y responses posibles.
- La documentación Swagger debe estar accesible en `/api/docs` en el ambiente de desarrollo.

#### NF-019: Trazabilidad y Observabilidad
- El sistema debe emitir logs estructurados (JSON) para todas las operaciones con nivel ERROR o superior.
- Debe exponer métricas Prometheus (disponibles en `/metrics`) para: latencia de endpoints, tasa de errores, estado de la cola de jobs.
- Las trazas distribuidas deben exportarse a Grafana Tempo via OpenTelemetry.

#### NF-020: Versionamiento y Despliegue
- El código fuente debe mantenerse en repositorio Git con rama `main` (producción) y `develop` (desarrollo).
- El despliegue a producción debe realizarse mediante `docker compose up --build` sin pasos manuales adicionales más allá de la configuración de variables de entorno.

#### NF-021: Log de Auditoría Inmutable
- El sistema debe mantener un log de auditoría **append-only** (solo escritura, nunca borrado) para todas las operaciones sensibles sobre: lecturas de medidor (creación, modificación, anulación), deudas y saldos (ajustes, condonaciones), descuentos aplicados y modificaciones a convenios de pago.
- Este log debe incluir: timestamp, usuario que ejecutó la acción, acción realizada, valores anteriores y nuevos (campo modificado → valor viejo → valor nuevo).
- **Ningún rol**, incluido el Administrador del Sistema, puede borrar o modificar registros del log de auditoría.
- El log debe ser consultable por el Presidente y Administrador con filtros por usuario, fecha y tipo de operación.
- Este requisito complementa el `AuditModule` existente en la infraestructura del backend, ampliando su alcance a las entidades financieras críticas.

---

## 5. Aseguramiento y Control de Calidad (QA/QC)

### 5.1 Actividades de Aseguramiento de la Calidad (QA — Prevención)

Estas actividades buscan **prevenir defectos** antes de que ocurran:

| Actividad | Descripción | Frecuencia |
|---|---|---|
| **Revisión de Requisitos** | Antes de codificar cualquier funcionalidad, el desarrollador debe confirmar la comprensión con el Product Owner. Toda ambigüedad se documenta y resuelve. | Por cada RF nuevo |
| **Code Review** | Todo código debe ser revisado por al menos otro miembro del equipo antes de fusionarse a `develop`. Se usa la herramienta CodeRabbit (`.coderabbit.yaml` presente en el repositorio). | Por cada Pull Request |
| **Revisión de Esquema de BD** | Toda migración de Prisma debe revisarse contra el esquema existente para verificar compatibilidad hacia atrás y corrección de relaciones. | Por cada migración |
| **Revisión de Seguridad** | Antes de cada release, revisar: endpoints sin autenticación, datos sensibles en logs, validaciones de input. | Por cada release |
| **Revisión de Documentación API** | Verificar que los decoradores Swagger reflejan el comportamiento real del endpoint. | Por cada Controller nuevo/modificado |
| **Estandarización de Datos Migrados** | Antes de la migración desde el sistema legacy, revisar y normalizar todos los campos: idioma uniforme (español), formato de fechas (ISO 8601), caracteres especiales en nombres, valores nulos vs. vacíos. La migración se ejecuta solo sobre datos validados. | Una vez, previo al go-live |
| **Validación de Fórmulas Financieras** | Las fórmulas de cálculo de interés por mora y la Tasa de Seguridad deben ser revisadas y aprobadas formalmente por Presidencia/Tesorero antes de implementar. El acta de aprobación se archiva como respaldo. | Una vez por fórmula + ante cambios regulatorios |

### 5.2 Actividades de Control de Calidad (QC — Detección)

Estas actividades buscan **detectar defectos** antes de la entrega al usuario:

#### 5.2.1 Pruebas Unitarias
- **Alcance:** Lógica de negocio en casos de uso (`use-cases/`) y servicios de aplicación.
- **Framework:** Jest (configurado en el proyecto).
- **Criterio de aceptación:** Todos los tests pasan. Cobertura ≥ 70% en módulos `billing`, `metering`, `operations`.
- **Casos obligatorios:**
  - Cálculo de consumo (lectura actual − anterior, manejo de primera lectura)
  - Aplicación de tarifa escalonada (rangos correctos, precisión decimal)
  - Cálculo de Tasa de Seguridad (5% solo para sectores de Olón; 0% para otras comunidades)
  - Cálculo de interés por mora (fórmula aprobada por la Junta, tasa configurada × días × deuda)
  - Validación de anomalías (lectura regresiva, consumo atípico)
  - Generación de lote (excluye anomalías pendientes, incluye solo períodos activos, aplica Tasa de Seguridad por sector)
  - Bloqueo de cobro por Otros Ingresos pendientes (bloquea / permite con autorización)
  - Flujo de autorización de descuento (solo aprobado con rol Presidente)

#### 5.2.2 Pruebas de Integración
- **Alcance:** Endpoints HTTP (controllers) que integran servicio + repositorio + BD.
- **Framework:** Jest + Supertest (e2e), base de datos de prueba PostgreSQL aislada.
- **Criterio de aceptación:** Todos los flujos happy-path y principales casos de error responden con los códigos HTTP correctos y estructura de respuesta esperada.

#### 5.2.3 Pruebas de Integración SRI
- **Alcance:** Envío de comprobantes al ambiente de **pruebas** del SRI.
- **Criterio de aceptación:** El sistema recibe autorización del SRI de pruebas para facturas, notas de crédito y notas de débito con datos de prueba válidos.
- **Nota:** Nunca usar el ambiente de producción del SRI para pruebas.

#### 5.2.4 Pruebas de Carga
- **Alcance:** Endpoint de generación de lote y consulta de listados paginados.
- **Herramienta:** k6 u otra herramienta de carga.
- **Criterio de aceptación:** El endpoint de generación de lote para **2.400 clientes** concluye en **< 5 minutos** sin errores bajo 5 usuarios concurrentes. La búsqueda de cliente responde en < 2 s bajo 10 usuarios concurrentes.

#### 5.2.5 Pruebas de Aceptación del Usuario (UAT)
- **Alcance:** Flujos completos de negocio ejecutados por el personal de la Junta en ambiente de staging.
- **Flujos obligatorios:**
  1. Alta de cliente → creación de contrato (con Guía) → instalación de medidor
  2. Registro de lecturas mensuales (incluyendo toma en campo desde dispositivo móvil) → generación de lote → revisión de pre-facturas → aprobación
  3. Generación de planilla PDF (verificar Tasa de Seguridad en planilla de cliente de sector Olón) → registro de pago en caja → cierre de sesión de caja
  4. Envío de comprobante electrónico al SRI → recepción de autorización → envío por email al cliente
  5. Cliente moroso → creación de convenio de pago (50% entrada + 3 cuotas) → registro de cuotas → cierre del convenio
  6. Consulta de planilla en portal público (buscar por Guía, por nombre y por cédula)
  7. **Lazy Cleansing:** cliente sin correo registrado → proceso de cobro en ventanilla → captura de correo en el flujo → reenvío automático del comprobante al nuevo correo
  8. **Orden de corte:** cliente moroso X períodos → generación de orden de corte → ejecución por Operador en campo → actualización de estado del contrato a Suspendido

#### 5.2.6 Pruebas de Regresión
- Antes de cada release, ejecutar la suite completa de pruebas unitarias y de integración para verificar que cambios nuevos no rompen funcionalidad existente.

#### 5.2.7 Pruebas en Paralelo con el Sistema Legacy (Período de Transición)
- **Alcance:** Durante el período de transición (mínimo 1 ciclo de facturación completo antes del go-live definitivo), ejecutar el proceso de facturación en **paralelo**: JASRAPO y el sistema legacy procesan el mismo mes con los mismos datos.
- **Qué comparar:** totales de consumo por cliente, montos de planilla individual, cálculo de intereses por mora, aplicación de Tasa de Seguridad, totales de recaudación por período.
- **Criterio de aceptación:** Diferencia entre totales ≤ 0.01%. Las diferencias mayores al umbral deben ser justificadas y documentadas (ej. corrección de error conocido del legacy).
- **Responsable:** El Tesorero/Secretaría valida los resultados con ambos sistemas side-by-side.
- **Resultado:** Acta firmada por Presidencia confirmando que los cálculos de JASRAPO son correctos o superiores al legacy, habilitando el cierre definitivo del sistema anterior.

---

## 6. Gestión de Riesgos

### 6.1 Matriz de Riesgos

| ID | Riesgo | Probabilidad | Impacto | Nivel | Estrategia |
|---|---|---|---|---|---|
| R-01 | Cambios en la normativa del SRI (nuevo esquema XML, nuevos endpoints) que invaliden la integración de facturación electrónica | Media | Alto | **ALTO** | Monitorear boletines del SRI. Encapsular la integración en un módulo desacoplado (`SriModule`) para facilitar actualizaciones. |
| R-02 | Pérdida de datos por falta de backup de la base de datos PostgreSQL | Baja | Crítico | **ALTO** | Implementar backup automático diario de la BD (dump PostgreSQL) a almacenamiento S3. Probar restauración mensualmente. |
| R-03 | Pérdida del certificado digital P12 para firma electrónica | Baja | Crítico | **ALTO** | Almacenar copia del certificado cifrado en al menos 2 ubicaciones seguras (S3 del sistema + custodia física del Presidente). Documentar proceso de renovación. |
| R-04 | Interpretación errónea de la tarifa escalonada durante el desarrollo, resultando en cobros incorrectos | Media | Alto | **ALTO** | Validar el algoritmo de cálculo tarifario con el Tesorero antes de codificar. Cubrir con pruebas unitarias exhaustivas con casos reales de la Junta. |
| R-05 | Personal de la Junta no adopta el sistema (resistencia al cambio / usabilidad insuficiente) | Media | Alto | **ALTO** | Involucrar a usuarios finales en pruebas UAT desde etapas tempranas. Ofrecer capacitación presencial y material de apoyo (manual de usuario). |
| R-06 | Caída del servidor de producción durante el período de facturación mensual | Media | Alto | **ALTO** | Implementar monitoreo automático con alertas (Prometheus/Grafana). Documentar procedimiento de recuperación manual de emergencia. |
| R-07 | Corrupción de datos por migración incorrecta de Prisma en producción | Baja | Alto | **MEDIO** | Siempre realizar backup antes de aplicar migraciones en producción. Revisar migraciones en staging antes de aplicar en producción. Usar transacciones en migraciones. |
| R-08 | Acceso no autorizado a datos de clientes (brecha de seguridad) | Baja | Alto | **MEDIO** | Implementar auditoría de accesos. Aplicar principio de mínimo privilegio en roles. Mantener dependencias actualizadas (auditoría npm). Revisar configuración CORS. |
| R-09 | El módulo de almacenamiento RustFS (S3) falla y los PDFs no son accesibles | Media | Medio | **MEDIO** | Configurar healthcheck del servicio RustFS. Implementar generación on-demand de PDFs cuando el almacenamiento no esté disponible. |
| R-10 | Retrasos en el desarrollo por falta de claridad en requisitos de módulos futuros (Tesorería, Secretaría) | Alta | Medio | **MEDIO** | Priorizar y completar módulos core antes de iniciar módulos futuros. Mantener las rutas frontend como placeholders hasta que los requisitos estén definidos. |
| R-11 | Conectividad a internet inestable en la sede de la Junta afecta el envío al SRI | Alta | Medio | **MEDIO** | El sistema de jobs asíncronos (basado en PG) encola reintentos automáticos. Los operadores pueden continuar registrando pagos offline; el envío al SRI se resuelve cuando se restaura la conexión. |
| R-12 | Error humano al registrar lecturas (dato incorrecto no detectado por validaciones) | Alta | Medio | **MEDIO** | Implementar validaciones de rango configurables. Mostrar historial de consumo junto al formulario de lectura como referencia. Requerir confirmación en valores atípicos. |
| R-13 | El sistema legacy borra planillas pagadas del reporte actual, impidiendo reconstruir el historial para auditorías | Alta | Alto | **ALTO** | Implementar RF-035 (historial inmutable de abonos). Migrar todo el histórico disponible del legacy antes del go-live. Crear respaldo archivístico del legacy antes de su cierre definitivo. |
| R-14 | Clientes reacios a entregar cédula o correo electrónico para facturación SRI, generando comprobantes con datos incompletos | Alta | Medio | **MEDIO** | Implementar RF-033 (Lazy Cleansing) para captura no bloqueante. Capacitar al Recaudador sobre la obligatoriedad legal (LOPDP + normativa SRI). El sistema debe emitir recordatorios periódicos de datos incompletos. |
| R-15 | Fórmulas de interés por mora ambiguas en el sistema legacy generan inconsistencia al migrar criterios al nuevo sistema | Media | Alto | **ALTO** | Documentar y aprobar formalmente la fórmula de interés con Presidencia y Tesorero antes de implementar, basada en normativa legal vigente y resoluciones de asamblea de la Junta. Incluir validación en pruebas paralelas (5.2.7). |
| R-16 | Falta de conectividad en comunidades alejadas (La Entrada, Curía) impide sincronización de lecturas en campo durante el recorrido | Alta | Medio | **MEDIO** | Diseñar módulo de lecturas con tolerancia a conectividad intermitente (caché local + sincronización diferida) o documentar proceso manual de transcripción al regresar a la oficina como fallback aceptable. Evaluar modo offline en próximas iteraciones. |

### 6.2 Plan de Respuesta a Riesgos Críticos

#### R-01 — Cambios SRI
**Acción preventiva:** El módulo `open-api-facturacion-sri-main` está desacoplado del backend principal, permitiendo actualización independiente.  
**Acción correctiva:** Al detectar un cambio en la normativa SRI, suspender el envío automático de comprobantes y activar el modo manual hasta completar la actualización.

#### R-02 — Backup de Base de Datos
**Acción preventiva:** Configurar un cron job que ejecute `pg_dump` diariamente a las 02:00 ECT y suba el archivo cifrado a un bucket S3 separado del ambiente de producción.  
**Acción correctiva:** En caso de pérdida, restaurar desde el último backup disponible. Comunicar a la Junta el período de datos perdidos.

#### R-04 — Cálculo Tarifario Incorrecto
**Acción preventiva:** El algoritmo de tarifa escalonada debe ser revisado y aprobado formalmente por el Tesorero antes del release. El acta de aprobación se adjunta al documento del módulo de facturación.  
**Acción correctiva:** Generar notas de crédito para los clientes afectados y re-facturar el período. Auditar todos los períodos procesados con el algoritmo incorrecto.

#### R-06 — Caída en Período de Facturación
**Acción preventiva:** Configurar alertas Grafana para CPU > 80%, memoria > 80% y errores HTTP 5xx > 5/min.  
**Acción correctiva:** Procedimiento de reinicio del stack Docker (`docker compose restart`). Si el problema persiste, acceso remoto al servidor vía Cloudflare para diagnóstico.

#### R-13 — Pérdida de Historial por Legacy
**Acción preventiva:** Antes del cierre del sistema legacy, generar exportación completa de todos los registros históricos (planillas, pagos, convenios) independientemente de su estado. Almacenar como respaldo archivístico en formato legible (CSV/PDF). Implementar RF-035 desde el inicio del proyecto.  
**Acción correctiva:** Si el legacy es cerrado sin exportación completa, reconstruir historial desde documentos físicos o estados de cuenta impresos disponibles en la Junta.

#### R-15 — Ambigüedad en Fórmulas de Mora
**Acción preventiva:** Convocar reunión con Presidencia, Tesorero y asesor legal antes de la implementación del módulo de morosidad. Documentar fórmula aprobada (base de cálculo, tasa, período mínimo) en acta firmada. La fórmula debe quedar parametrizable en `ParametroTasainteres` para ajustes futuros sin cambios de código.  
**Acción correctiva:** Si se detecta error de cálculo post-go-live, emitir notas de crédito/débito correctivas para los períodos afectados y reconfigurar el parámetro.

---

## Apéndice A: Resumen del Stack Tecnológico

| Componente | Tecnología | Versión |
|---|---|---|
| Backend API | NestJS | Node.js 22, TypeScript |
| ORM | Prisma | - |
| Base de Datos | PostgreSQL | 16 |
| Almacenamiento de Objetos | RustFS (S3-compatible) | Latest |
| Frontend | Angular | 19+ (standalone components) |
| UI Components | Angular Material | - |
| Autenticación | JWT (passport-jwt) | - |
| Testing Backend | Jest + Supertest | - |
| Testing Frontend | Vitest | - |
| Documentación API | Swagger / OpenAPI | - |
| Contenedores | Docker + Docker Compose | - |
| Proxy / Acceso Público | Cloudflare Tunnel | - |
| Observabilidad | Prometheus + Grafana + OpenTelemetry | - |
| Firma Electrónica SRI | Módulo open-api-facturacion-sri | - |

---

## Apéndice B: Módulos del Sistema (Vista de Implementación)

```
JASRAPO Backend (NestJS)
├── identity/           → Autenticación, Usuarios, Roles, Permisos, Menús
├── metering/           → Medidores, Lecturas, Anomalías de Lectura
├── operations/         → Clientes, Contratos, Comunidades, Sectores, Rutas
├── billing/
│   ├── batch/          → Generación y gestión de lotes de pre-facturas
│   ├── pre-invoice/    → CRUD de pre-facturas individuales
│   ├── tariffs/        → Categorías tarifarias
│   └── collections/
│       └── agreements/ → Convenios de pago, cuotas, deuda
├── sri/                → Facturación electrónica SRI (emisores, catálogos, firma, webhooks)
├── reports/            → Reportes PDF (lista clientes, pagos, historial, estado de cuenta)
├── public-portal/      → Portal público de consulta de planilla
└── infrastructure/
    ├── database/       → Prisma service, soft-delete
    ├── audit/          → Auditoría de operaciones
    ├── encryption/     → Cifrado de datos sensibles
    ├── jobs/           → Jobs asíncronos basados en PostgreSQL
    ├── mail/           → Envío de correos (comprobantes, notificaciones)
    ├── pdf/            → Generación de PDFs (Puppeteer)
    ├── storage/        → Cliente RustFS S3
    ├── storage-proxy/  → Proxy de acceso a archivos almacenados
    └── observability/  → Prometheus, OpenTelemetry

JASRAPO Frontend (Angular)
├── features/
│   ├── auth/           → Login
│   ├── bill-inquiry/   → Portal público consulta planilla
│   ├── dashboard/      → Dashboard principal
│   ├── admin/          → Usuarios, Sectores, Comunidades, Roles, Config
│   ├── contracts/      → Clientes, Contratos, Medidores, Lecturas, Tarifas, Convenios
│   ├── billing/        → Generación planilla, Envío facturación, Facturación electrónica, Pagos, Notas C/D
│   ├── reports/        → Estado de cuenta, Morosidad, Consumo por zonas, KPI
│   ├── president/      → Aprobaciones, Reportes presidencia, Actas [FUTURO]
│   ├── secretary/      → Documentos, Correspondencia, Archivo [FUTURO]
│   └── treasurer/      → Ingresos, Egresos, Balance [FUTURO]
└── core/
    ├── guards/         → Auth guard, Menu resolver
    ├── interceptors/   → Auth, Error, Spinner
    └── services/       → Auth, Menú, Breadcrumb, Layout
```

---

## Apéndice C: Diagrama de Entidades Principales

```
Comunidades ─── Sectores ─── Rutas
                    │
                Contratos (Guía) ──── Clientes
                    │                     │
                Medidores           SaldoFavorCliente
                    │
                Lecturas ─── LecturaAnomalia
                    │
                Prefacturas ── PrefacturaDetalle ── DescuentoDetalle
                    │
                  Lote (Batch)
                    │
                Comprobantes ── ComprobanteImpuestos
                    │        └── ComprobanteTotales
                    │        └── InfoAdicional
                    │
                  Pagos ──── DetallePago
                    │
                Convenios ─── CuotaConvenio
                    │
                CajaSesion ─── CajaArqueoDetalle

CategoriaTarifa ────────────────── Contratos
Rubros ────────────────────────── PrefacturaDetalle
Emisores ─────────────────────── Comprobantes
```

---

*Este documento es un artefacto vivo. Debe actualizarse cuando cambien los requisitos del negocio, la arquitectura del sistema o las regulaciones aplicables.*

*Próxima revisión programada: Antes del inicio de cada sprint de desarrollo.*
