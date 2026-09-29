# Documento de Requisitos de Producto (PRD)
# JASRAPO — Plataforma Integral de Gestión de Agua Potable, Facturación Electrónica y Recaudación

**Organización:** Junta Administradora de Servicios de Agua Potable de Olón (JASRAPO)  
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Estado:** Oficial / En Producción  

---

## 1. Decisión del producto en una línea
JASRAPO automatiza y centraliza la administración integral del agua potable en Olón mediante una aplicación web y móvil (PWA): desde la gestión de clientes, contratos con georreferenciación (Leaflet) e inspección técnica previa, hasta la toma móvil de lecturas con soporte offline, detección automática de anomalías, cálculo tarifario escalonado, facturación electrónica legal ante el SRI con visualizador de PDF (RIDE), convenios de pago en cuotas y arqueo diario de caja con validación física estricta.

---

## 2. Resumen ejecutivo
La Junta Administradora de Servicios de Agua Potable de Olón requiere modernizar y asegurar la trazabilidad de su ciclo operativo y comercial. Previamente, la gestión manual, la falta de verificación técnica antes de cobrar contratos, las discrepancias entre avisos de correo y facturas físicas, y los cierres de caja sin validación en tiempo real generaban reclamos de abonados, demoras en la recaudación y descuadres contables.

JASRAPO integra en una única plataforma web y PWA responsiva (Angular 21 + Angular Material) el trabajo de campo de los operarios con la administración, tesorería y el cumplimiento tributario ecuatoriano. El sistema impone un ciclo de vida contractual con inspección previa obligatoria, detecta automáticamente anomalías en las lecturas, emite comprobantes electrónicos con firma XAdES-BES autorizados por el SRI, provee visualización directa de comprobantes en navegador y asegura un cuadre diario de caja transparente e inmutable.

---

## 3. Problema

### 3.1 Problema del abonado / cliente
* Inconsistencias entre los avisos de cobro recibidos por correo electrónico y la factura física definitiva entregada en el domicilio.
* Cobros de instalación prematuros generados antes de verificar si la red física permite la conexión técnica.
* Dificultad para regularizar deudas acumuladas sin un esquema formal y transparente de convenios en cuotas.
* Bloqueos de pago post-cierre cuando el abonado asiste a cancelar después del cierre de caja diario (19:00) y se le imposibilita el pago hasta el mes siguiente.

### 3.2 Problema de los operadores y lectores de campo
* Dificultad para visualizar qué rutas ya fueron asignadas a un operario en el mismo mes, generando sobrecargas o solapamientos.
* Pérdida de conectividad celular en sectores rurales de Olón que interrumpe la toma de lecturas o registro de novedades.
* Revisión manual lenta de consumos atípicos y medidores defectuosos sin asistencia algorítmica ni soporte de geolocalización.
* Falta de un canal ágil para reportar novedades en campo (medidores destruidos, trabados o inaccesibles).

### 3.3 Problema administrativo, financiero y tributario
* Riesgo de descuadres de caja al admitir múltiples cierres parciales o modificaciones manuales sin auditoría.
* Modificaciones de consumos y valores en refacturación sin registrar la causa/motivo ni la identidad del responsable.
* Retrasos y complejidad en la autorización y visualización de comprobantes electrónicos (RIDE) ante el SRI.

---

## 4. Hipótesis del producto
* Si se condiciona la generación de la prefactura de instalación a la aprobación de una Orden de Trabajo de Inspección técnica, se eliminarán al 100% los cobros indebidos por contratos inviables.
* Si el sistema provee una interfaz PWA con soporte offline para los lectores en campo, la toma de lecturas mensuales se completará sin interrupciones del 26 al 30 de cada mes.
* Si el sistema detecta automáticamente consumos atípicos y anomalías en las lecturas, se reducirán los reclamos por refacturación en más de un 80%.
* Si se implementa un arqueo diario único a las 19:00 con bloqueo por discrepancias físicas en la interfaz del cajero, se garantizará la conciliación contable sin pérdidas financieras.

---

## 5. Objetivos del Sistema
* Centralizar el padrón de clientes, contratos y medidores con georreferenciación en mapa interactivo (Leaflet) y número de guía.
* Imponer el ciclo de vida del contrato: `PENDIENTE_INSPECCION` $\rightarrow$ `PENDIENTE_PAGO` $\rightarrow$ `PENDIENTE_INSTALACION` $\rightarrow$ `ACTIVO`.
* Proveer una experiencia de usuario responsiva (Angular 21 + Angular Material) optimizada para cajas y administración en escritorio, y trabajo de campo en dispositivos móviles.
* Automatizar el cronograma de lecturas del 26 al 30 de cada mes con capacidades offline (Service Worker) y detección algorítmica de anomalías.
* Generar el borrador mensual de facturación el día 31 y habilitar refacturación justificada con autoría obligatoria.
* Emitir comprobantes tributarios electrónicos (RIDE) validados ante el SRI con visor PDF integrado (`ngx-extended-pdf-viewer`).
* Permitir convenios de pago nivelados con abono inicial optativo y liquidación automática de cuotas.
* Ejecutar un único cierre de caja diario a las 19:00, inmutable y con bloqueo automático en pantalla ante discrepancias físicas.

---

## 6. No objetivos del Sistema
* No se procesarán pagos mediante pasarelas internacionales (Stripe, PayPal); los pagos son en ventanilla física, cheques y transferencias bancarias locales.
* No se publicará una app nativa en App Store / Play Store; la solución móvil opera como Progressive Web App (PWA) instalable desde el navegador.
* No se admitirán múltiples cierres de caja parciales en un mismo día.
* No se permitirá modificar lecturas aprobadas sin generar un registro explícito de auditoría.
* No se emitirán comprobantes tributarios directos al SRI sin pasar previamente por el ciclo de prefacturación y validación.

---

## 7. Usuarios y Personas

### 7.1 Abonado / Cliente
Titular o usuario del servicio de agua potable. Consulta consumos, visualiza contratos y facturas en visor PDF integrado, recibe avisos por correo y realiza pagos en ventanilla o bancos.

### 7.2 Lector / Operario de campo
Personal operativo en campo. Utiliza la PWA móvil en smartphone/tablet con soporte offline para tomar lecturas (26-30), consultar la ubicación de medidores en mapa interactivo (Leaflet), ejecutar OTs (inspecciones, instalaciones, cortes) y registrar novedades.

### 7.3 Cajero / Recaudador
Personal de atención y cobranzas. Utiliza la interfaz de escritorio de Angular para registrar cobros multicanal, imprimir recibos, realizar conteo físico de caja e iniciar el arqueo y cierre diario.

### 7.4 Tesorero / Administrador financiero
Responsable de finanzas y caja. Supervisa reportes interactivos, custodia cierres diarios, aprueba convenios de pago y supervisa cartera vencida.

### 7.5 Administrador del sistema
Gestión integral y soporte. Reasigna operarios con vista de balance mensual, parametriza tarifas/rubros, gestiona usuarios y administra certificados SRI.

---

## 8. Roles y Permisos
* `clientes:read`, `clientes:create`, `clientes:update`, `clientes:delete`.
* `contratos:read`, `contratos:create`, `contratos:update`, `contratos:delete`.
* `lecturas:read`, `lecturas:create`, `lecturas:update`, `lecturas:delete`.
* `agreements:read`, `agreements:create`, `agreements:update`, `agreements:delete`.
* `caja:apertura`, `caja:cobro`, `caja:cuadre`, `caja:cierre`.
* `tarifas:read`, `tarifas:create`, `tarifas:update`, `tarifas:delete`.
* `sri:emitir`, `sri:anular`, `sri:firmar`.

---

## 9. Resumen de Decisiones del Producto
* **Arquitectura de Interfaz:** SPA / PWA en Angular 21 con diseño modular, Signals y componentes Standalone.
* **Inspección técnica previa:** Contrato nace en `PENDIENTE_INSPECCION` y no genera deuda hasta ser aprobado técnicamente.
* **Toma offline:** Service Worker permite capturar lecturas sin conexión a internet y sincronizarlas al recuperar señal.
* **Cronograma fijo mensual:** Lecturas del 26 al 30, Borrador el 31, Carga definitiva 1-2, Reparto de avisos físicos 4-7.
* **Único cierre diario:** Arqueo a las 19:00 inmutable y bajo responsabilidad de Tesorería.
* **Reasignación jerárquica:** Exclusiva para el rol Administrador en la interfaz de gestión de rutas.
* **Beneficio legal de consumo:** Descuento de 3ra edad / discapacidad aplica sobre los 10 m³ reglamentarios.

---

## 10. Alcance Funcional del Sistema

### 10.1 Gestión de Clientes y Contratos
* Registro con Cédula/RUC/Pasaporte con validación reactiva de identificaciones ecuatorianas.
* Georreferenciación con mapa interactivo Leaflet (captura y visualización de latitud/longitud) y número de guía.
* Asignación de categoría tarifaria y medidor.

### 10.2 Medidores e Inventario
* Control de stock, series, diámetros y marcas.
* Reemplazo transaccional con traspaso de lectura anterior a nueva serie.

### 10.3 Rutas, Despacho y Órdenes de Trabajo
* Asignación mensual balanceada de rutas con panel visual de carga por operario.
* Generación de OTs para Inspección, Instalación, Corte por Mora y Reconexión.

### 10.4 Lecturas y Detección de Anomalías
* Registro móvil de lectura actual y novedades (medidor trabado, roto, inaccesible) con almacenamiento local temporal.
* Detección algorítmica de variaciones de consumo anormales en tiempo real.

### 10.5 Facturación y SRI
* Generación de prefacturas mensuales (borrador el 31).
* Refacturación auditada con modal que exige motivo mandatorio y registra al usuario autor.
* Visualizador integrado de PDF/RIDE (`ngx-extended-pdf-viewer`) y descarga de XML autorizado.

### 10.6 Convenios de Pago y Cobranzas
* Financiamiento en cuotas niveladas con abono inicial opcional y tabla de amortización dinámica en pantalla.
* Liquidación automática de cuotas con cobros recibidos.

### 10.7 Recaudación y Cierre de Caja
* Cobranza multicanal (efectivo, cheque, transferencias).
* Pantalla de arqueo diario a las 19:00 con validación física y bloqueo de confirmación ante diferencias.

---

## 11. Fuera del Alcance y Roadmap

### 11.1 No incluido en la versión actual
* Pagos con tarjeta de crédito en pasarelas online internacionales.
* Aplicación móvil nativa compilada en Kotlin/Swift (se utiliza PWA instalable).
* Integración con telemedición IoT o medidores ultrasónicos inteligentes.

### 11.2 Roadmap futuro
* Portal de pagos online con botón de pago bancario nacional (RedFacilito / Deuna).
* Notificaciones masivas de avisos de corte y cobro vía WhatsApp API oficial.
* Medición automática remota mediante radiofrecuencia (AMR).

---

## 12. Flujo Principal del Abonado
1. Solicita nuevo contrato de agua potable en ventanilla o portal.
2. Espera la visita del operario para la inspección técnica de factibilidad.
3. Tras recibir la aprobación técnica, abona la prefactura de instalación en ventanilla.
4. Recibe la instalación física del medidor y activación del servicio.
5. Mensualmente recibe su aviso de cobro por correo y/o factura física, con opción de consultar su RIDE en el portal.
6. Realiza su pago antes del vencimiento para evitar corte del servicio.

---

## 13. Flujo Principal del Operario / Lector
1. Abre la PWA en su dispositivo móvil y consulta sus rutas asignadas (del 26 al 30 de cada mes).
2. Recorre el sector e ingresa la lectura actual de cada medidor; si pierde señal, los datos se almacenan localmente en el Service Worker.
3. Visualiza la ubicación geográfica del medidor en el mapa interactivo (Leaflet).
4. Reporta novedades de estado en medidores dañados o inaccesibles.
5. Al recuperar conexión, sincroniza en un solo clic las lecturas al servidor.
6. Recibe y ejecuta OTs asignadas (inspecciones, instalaciones, cortes y reconexiones), marcándolas como completadas.

---

## 14. Flujo Administrativo y Financiero
1. **Día 31:** Tesorería genera y revisa el borrador de prefacturación mensual en la web de administración.
2. Si hay reclamos o anomalías, ejecuta refacturación indicando obligatoriamente el motivo en el modal.
3. **Días 1-2:** Aprueba la emisión definitiva y dispara el firmado y envío al SRI.
4. Durante el mes, Cajeros registran pagos y abonos a convenios en el módulo de caja.
5. **Cada día a las 19:00:** Cajero realiza conteo físico de billetes, monedas y cheques, ingresa montos al sistema, valida que la diferencia sea cero y confirma el cierre definitivo.

---

## 15. Modelo de Estados

### 15.1 Estados del Contrato
* `PENDIENTE_INSPECCION` $\rightarrow$ `PENDIENTE_PAGO` $\rightarrow$ `PENDIENTE_INSTALACION` $\rightarrow$ `ACTIVO` $\rightarrow$ `SUSPENDIDO` $\rightarrow$ `RETIRADO` (o `RECHAZADO`).

### 15.2 Estados de la Lectura
* `PENDIENTE`, `POR_REVISION`, `APROBADA`, `RECHAZADA_VERIFICACION`, `ESTIMADA`, `PLANILLADA`, `CON_NOVEDAD`.

### 15.3 Estados de la Orden de Trabajo (OT)
* `PENDIENTE`, `ASIGNADA`, `EN_PROGRESO`, `COMPLETADA`, `CANCELADA`.

### 15.4 Estados del Convenio de Pago
* `PENDIENTE`, `ACTIVO`, `PAGADO`, `ANULADO`, `INCUMPLIDO`.

---

## 16. Reglas de Negocio

### 16.1 Contratos e Inspecciones
* No se puede generar prefactura de instalación sin OT de inspección en estado `COMPLETADA` y aprobada.
* Si la inspección resulta no factible, el contrato pasa a `RECHAZADO` sin saldos pendientes.

### 16.2 Lecturas y Refacturación
* Las lecturas ingresadas fuera del rango estadístico histórico pasan automáticamente a `POR_REVISION`.
* Toda refacturación o corrección en etapa de borrador exige obligatoriamente justificación textual y autor.

### 16.3 Cuadre de Caja
* La interfaz bloquea el botón de confirmación si existe discrepancia entre el conteo físico y el balance del sistema.
* El cierre de caja es inmutable; no se admiten modificaciones posteriores.

### 16.4 Convenios de Pago
* Solo contratos con 2 o más meses de mora pueden solicitar convenio.
* El abono inicial es optativo pero amortiza inmediatamente el saldo adeudado.

---

## 17. Estructura de Datos de Contratos y Tarifas
* Contrato: `contratoId`, `clienteId`, `categoriaTarifaId`, `medidorId`, `numeroGuia`, `latitud`, `longitud`, `estadoServicio`, `estadoCobranza`.
* Lectura: `lecturaId`, `contratoId`, `periodoId`, `lecturaAnterior`, `lecturaActual`, `consumoM3`, `estado`.
* Convenio: `convenioId`, `contratoId`, `numeroCuotas`, `abonoInicial`, `deudaTotal`, `fechaPrimerPago`, `estado`.

---

## 18. Reglas de Cálculo Tarifario y Facturación
* **Cargo Fijo:** Cobrado de acuerdo a la categoría tarifaria vigente.
* **Consumo Escalonado:** Bloques de consumo en m³ con tarifas progresivas.
* **Tercera Edad / Capacidades Especiales:** Exoneración del 50% del cargo básico y consumo hasta el límite legal aplicable sobre 10 m³.

---

## 19. Requisitos Funcionales

### 19.1 Módulo de Clientes y Contratos
* RF-01: Registro y búsqueda reactiva de clientes por identificación, nombre o código.
* RF-02: Creación de contrato con selector en mapa interactivo (Leaflet) y número de guía.
* RF-03: Bloqueo automático de cobros hasta culminar inspección técnica.

### 19.2 Módulo de Medición y Campo
* RF-04: Captura de lecturas en PWA offline/online con validación de rangos.
* RF-05: Alerta automática visual de anomalías y consumos atípicos.
* RF-06: Reporte de novedades con evidencia fotográfica desde el dispositivo móvil.

### 19.3 Módulo de Facturación y SRI
* RF-07: Emisión de borrador mensual de facturación el día 31.
* RF-08: Formulario de refacturación con motivo mandatorio.
* RF-09: Generación, firma digital XAdES-BES, envío al SRI y visualización en `ngx-extended-pdf-viewer`.

### 19.4 Módulo de Cobranzas y Caja
* RF-10: Registro de cobros con desglose por medio de pago e impresión de recibos.
* RF-11: Creación y amortización automática de convenios de pago.
* RF-12: Módulo de arqueo y cierre diario a las 19:00 con validación física obligatoria en interfaz.

---

## 20. Requisitos No Funcionales
* **Rendimiento Frontend:** Tiempo de carga inicial de la SPA inferior a 1.5 segundos; renderizado fluido con Angular Signals.
* **Disponibilidad:** 99.5% de uptime en horas hábiles de recaudación.
* **Usabilidad & Accesibilidad:** Interfaz en Angular Material accesible para cajeros y adaptada a exteriores para lectores.
* **Seguridad:** Encriptación de contraseñas con bcrypt, tokens JWT en cookies HttpOnly y protección XSS/CSRF.
* **Integridad:** Transacciones ACID en cobros y cierres de caja.

---

## 21. Privacidad y Seguridad de Datos
* Protección de datos personales de los abonados según la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador.
* Custodia cifrada de los certificados de firma digital (.p12) en el servidor.

---

## 22. Prevención de Abuso y Fraude
* Imposibilidad de alterar recibos o facturas una vez autorizados por el SRI.
* Bloqueo estricto del cierre de caja en la interfaz si no cuadra el conteo físico con el sistema.
* Auditoría completa (`created_by`, `updated_by`, `deleted_at`) en todas las tablas transaccionales.

---

## 23. Notificaciones y Comunicación
* Envío automático por correo electrónico del comprobante RIDE y XML autorizado al abonado.
* Impresión de avisos de cobro físicos para usuarios sin correo entre los días 4 y 7 de cada mes.

---

## 24. Métricas y Analítica
* **Métrica Principal (North Star):** % de recaudación mensual efectiva sobre el total facturado.
* **Métricas Operativas:** Tiempo promedio de toma de lecturas por ruta, % de sincronizaciones offline exitosas.
* **Métricas Financieras:** Cartera vencida por sector, recaudación diaria promedio, % de convenios cumplidos.

---

## 25. Instrumentación Mínima
* Logs estructurados JSON con Pino en backend.
* Trazabilidad distribuida con OpenTelemetry.
* Métricas de salud del sistema mediante endpoints de Prometheus y NestJS Terminus.

---

## 26. Experiencia de Usuario y Contenido
* Interfaz web responsiva clara con Angular Material y Bootstrap 5.
* Retroalimentación visual inmediata (Snackbars / Toasts) en operaciones de guardado, cobro y cierre de caja.
* Mensajes de error claros en validaciones de cédula, RUC y montos de caja.

---

## 27. Dependencias del Sistema
* Web Services del SRI (Recepción y Autorización de comprobantes).
* Servidor SMTP para envío de correos electrónicos.
* Base de datos PostgreSQL y almacenamiento compatible S3/Local.

---

## 28. Riesgos del Producto
* Caída o intermitencia de los servicios del SRI durante la emisión mensual masiva (mitigado con reintentos en colas pg-boss).
* Falta de conectividad móvil en sectores rurales de Olón (mitigado con PWA y Service Worker offline).

---

## 29. Supuestos Clave
* La Junta cuenta con certificado digital de firma electrónica (.p12) vigente emitido por una entidad certificadora autorizada en Ecuador.
* Los cajeros y operarios disponen de dispositivos móviles y equipos de escritorio adecuados.

---

## 30. Preguntas Abiertas y Decisiones Pendientes
* Política definitiva para cobros rezagados que llegan después del cierre de las 19:00.
* Integración futura de pasarela de pago bancario nacional (Deuna / Banco del Barrio).

---

## 31. Plan de Validación
* **Pruebas de Campo:** Simulación de toma de lecturas con operarios en un sector piloto utilizando la PWA offline.
* **Pruebas E2E Automatizadas:** Suites completas con Playwright para verificar arqueos, cobros y flujos de contratos.
* **Simulación Fiscal:** Pruebas en el ambiente de pruebas del SRI con certificados de prueba.

---

## 32. Criterios de Aceptación para Lanzamiento
* 100% de los contratos nuevos procesan inspección técnica antes de prefacturarse.
* PWA sincroniza correctamente el 100% de las lecturas tomadas en modo offline.
* 0 fallas en la autorización de comprobantes válidos ante el SRI.
* Cuadres de caja diarios ejecutados a las 19:00 sin descuadres no identificados.

---

## 33. Estrategia de Lanzamiento
* Migración inicial de padrón de usuarios y saldos de deuda histórica.
* Capacitación presencial a operarios (uso de PWA en móvil), cajeros y personal de tesorería.
* Puesta en marcha oficial a partir del primer ciclo de lecturas mensual.

---

## 34. Criterios para Avanzar el Roadmap
* Estabilidad alcanzada tras 3 meses consecutivos de emisión fiscal sin incidencias críticas.
* Solicitud formal de la Junta para habilitar canal de recaudación externa o convenios bancarios.
