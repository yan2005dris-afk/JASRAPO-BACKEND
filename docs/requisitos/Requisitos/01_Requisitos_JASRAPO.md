# Especificación de Requisitos Software
# REQUISITOS DEL PRODUCTO Y DEL SISTEMA — JASRAPO

**Organización:** Junta Administradora de Servicios de Agua Potable de Olón (JASRAPO)  
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Estado:** Oficial / En Producción  

---

# 1 Introducción

Este documento define los requisitos verificables de **JASRAPO**, una plataforma integral diseñada para automatizar y asegurar el ciclo comercial, operativo y financiero de la Junta de Agua Potable de Olón (Ecuador). El sistema cubre clientes, contratos con georreferenciación e inspección técnica previa, medidores, rutas, lecturas móviles con soporte offline, cálculo tarifario, facturación electrónica ante el SRI, convenios de pago y cuadre diario de caja.

## 1.1 Objetivo
Alinear a producto, desarrollo, operarios de campo, cajeros, tesorería y administración sobre el comportamiento esperado del sistema, reglas de negocio y criterios de aceptación verificables.

## 1.2 Ámbito
* Padrón de clientes con identificación ecuatoriana (Cédula, RUC, Pasaporte).
* Contratos de servicio con geolocalización opcional (lat/lng) y número de guía.
* Ciclo de vida contractual con inspección técnica previa obligatoria.
* Parque de medidores, historial de asignaciones y reemplazo transaccional.
* Planificación de rutas, asignación balanceada y reasignación administrativa exclusiva.
* Toma de lecturas móviles (26-30 de cada mes) con detección automática de anomalías.
* Emisión mensual de borradores (día 31) y refacturación auditada (motivo y autor).
* Facturación electrónica autorizada por el SRI (XML RIDE v2.1.0 y firma XAdES-BES .p12).
* Convenios de pago en cuotas niveladas con amortización automática.
* Módulo de arqueo y cierre diario a las 19:00 con bloqueo por discrepancias físicas.

## 1.3 Definiciones
* **Abonado:** Titular del contrato de servicio de agua potable.
* **Prefactura:** Comprobante interno de liquidación mensual previo a la emisión fiscal definitiva.
* **RIDE:** Representación Impresa del Documento Electrónico autorizado por el SRI.
* **Cuadre de Caja:** Proceso de verificación física de efectivo, cheques y transferencias contra los registros del sistema a las 19:00.

---

# 2 Usuarios y alcance

## 2.1 Incluido en el Sistema
* Gestión de clientes y validación de beneficio de 3ra edad / capacidades especiales (> 10 m³).
* Creación de contratos con disparo automático de Orden de Trabajo (OT) de Inspección.
* Bloqueo de cobro de instalación hasta que la inspección técnica sea APROBADA.
* Asignación mensual de rutas con vista de carga por operario.
* Captura offline en PWA para lectores en campo con sincronización automática.
* Generación de borrador el día 31 y refacturación con motivo obligatorio.
* Emisión y firma electrónica XAdES-BES de comprobantes SRI.
* Gestión de convenios de pago y liquidación automática de cuotas.
* Arqueo diario único e inmutable a las 19:00 con bloqueo por descuadre.
* Visor de facturas RIDE integrado en Angular (`ngx-extended-pdf-viewer`).

## 2.2 Fuera del Alcance Inicial
* Pasarelas de cobro online internacionales (Stripe / PayPal).
* Aplicación nativa en tiendas públicas (opera como PWA instalable).
* Telemedición IoT en tiempo real o lectura remota por radiofrecuencia.
* Múltiples cierres parciales de caja en un mismo día.

---

# 3 Reglas de negocio

1. **No prefactura sin viabilidad técnica:** Ningún contrato genera prefactura de instalación hasta que la OT de inspección esté en estado `COMPLETADA` y aprobada.
2. **Identidad informativa:** Los datos de los avisos entregados por correo deben coincidir exactamente con la factura definitiva emitida.
3. **Cierre diario único e inmutable:** La caja cierra a las 19:00. Si existe discrepancia entre el conteo físico y el balance registrado, el sistema bloquea el cierre definitivo.
4. **Auditoría obligatoria de refacturación:** Toda modificación sobre borradores de facturación exige registrar motivo explicativo y usuario responsable.
5. **Reasignación jerárquica de operarios:** La reasignación de rutas en el mismo mes es facultad exclusiva del rol Administrador.

---

# 4 Requisitos funcionales

## 4.1 Clientes y Contratos
* **RF-01:** Registro y búsqueda de clientes por identificación, nombre o código.
* **RF-02:** Creación de contrato con captura de latitud/longitud en mapa Leaflet y número de guía.
* **RF-03:** Disparo automático de OT de inspección y transición a `PENDIENTE_PAGO` solo tras aprobación técnica.

## 4.2 Medición y Operación de Campo
* **RF-04:** Registro móvil de lecturas con soporte offline y validación contra históricos.
* **RF-05:** Detección algorítmica automática de anomalías y consumos atípicos.
* **RF-06:** Reporte de novedades e incidencias en medidores desde el móvil.

## 4.3 Facturación y Cumplimiento SRI
* **RF-07:** Generación automática de borradores de facturación mensual el día 31.
* **RF-08:** Refacturación controlada con justificación textual y autoría mandatoria.
* **RF-09:** Generación de XML, firmado digital XAdES-BES (.p12) y autorización ante Web Services del SRI.

## 4.4 Recaudación, Convenios y Caja
* **RF-10:** Registro de cobros desglosado por método: Efectivo, Cheque, Transferencia.
* **RF-11:** Financiamiento en convenios de pago con cuotas niveladas y amortización vinculada a cobros.
* **RF-12:** Módulo de arqueo diario a las 19:00 con validación física y bloqueo ante descuadres.

---

# 5 Requisitos no funcionales
* **Rendimiento:** Tiempos de respuesta HTTP < 100 ms y generación de PDFs en segundo plano vía colas `pg-boss`.
* **Disponibilidad:** 99.5% en horario hábil de recaudación.
* **Seguridad:** Autenticación JWT, contraseñas bcrypt, Guards RBAC y cifrado de certificados `.p12`.
* **Integridad:** Transacciones ACID en PostgreSQL para cobros, contratos y cierres de caja.

---

# 6 Estados principales

### 6.1 Contratos
`PENDIENTE_INSPECCION` $\rightarrow$ `PENDIENTE_PAGO` $\rightarrow$ `PENDIENTE_INSTALACION` $\rightarrow$ `ACTIVO` $\rightarrow$ `SUSPENDIDO` $\rightarrow$ `RETIRADO` (o `RECHAZADO`).

### 6.2 Lecturas
`PENDIENTE`, `POR_REVISION`, `APROBADA`, `RECHAZADA_VERIFICACION`, `ESTIMADA`, `PLANILLADA`, `CON_NOVEDAD`.

### 6.3 Órdenes de Trabajo (OT)
`PENDIENTE`, `ASIGNADA`, `EN_PROGRESO`, `COMPLETADA`, `CANCELADA`.

### 6.4 Convenios
`PENDIENTE`, `ACTIVO`, `PAGADO`, `ANULADO`, `INCUMPLIDO`.

---

# 7 Criterios de aceptación de lanzamiento
* Ningún contrato nuevo genera cobro sin inspección técnica favorable.
* 100% de coincidencia entre comprobantes autorizados por el SRI y avisos remitidos por correo.
* Cierres de caja ejecutados diariamente a las 19:00 sin descuadres no identificados.
* Operarios capturan y sincronizan lecturas desde la PWA sin pérdidas de datos.
