# Especificación de Casos de Uso
# FLUJOS FUNCIONALES DEL SISTEMA — JASRAPO

**Organización:** Junta Administradora de Servicios de Agua Potable de Olón (JASRAPO)  
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Estado:** Oficial / En Producción  

---

# 1 Introducción
Este documento describe las interacciones funcionales entre los actores y el sistema JASRAPO, cubriendo el ciclo completo de contratos, inspección, lecturas, facturación SRI, convenios de pago y arqueo de caja.

## 1.1 Actores
* **Abonado / Cliente:** Titular del servicio; consulta facturas y efectúa pagos.
* **Lector / Operario de Campo:** Registra lecturas móviles y ejecuta OTs de campo.
* **Cajero / Recaudador:** Registra cobros y realiza el arqueo de caja diario.
* **Tesorero:** Custodia cierres de caja, aprueba convenios y autoriza refacturaciones.
* **Administrador:** Reasigna operarios, parametriza tarifas y gestiona el sistema.

## 1.2 Mapa de Casos de Uso

| Código | Caso de Uso | Actor Principal |
| :--- | :--- | :--- |
| **CU-01** | Registrar cliente | Cajero / Administrador |
| **CU-02** | Crear contrato y solicitar inspección | Cajero / Administrador |
| **CU-03** | Ejecutar inspección técnica de factibilidad | Operario de Campo |
| **CU-04** | Cobrar prefactura de instalación | Cajero |
| **CU-05** | Ejecutar instalación física del medidor | Operario de Campo |
| **CU-06** | Asignar y reasignar rutas de lectura | Administrador |
| **CU-07** | Capturar lecturas móviles y novedades (offline/online) | Operario de Campo |
| **CU-08** | Detectar y validar anomalías de lectura | Sistema / Administrador |
| **CU-09** | Generar borrador mensual de facturación | Tesorero / Administrador |
| **CU-10** | Refacturar con justificación auditada | Tesorero / Administrador |
| **CU-11** | Emitir, firmar y autorizar factura electrónica ante el SRI | Sistema (Worker) |
| **CU-12** | Crear y amortizar convenio de pago | Cajero / Tesorero |
| **CU-13** | Registrar cobro de planilla | Cajero |
| **CU-14** | Ejecutar arqueo y cierre diario de caja (19:00) | Cajero / Tesorero |
| **CU-15** | Ejecutar corte por mora y reconexión tras pago | Operario de Campo / Sistema |

---

# 2 Detalle de Casos de Uso Críticos

## CU-02 Crear contrato y solicitar inspección
* **Entrada:** Datos del cliente, geolocalización en mapa Leaflet (lat/lng), número de guía, categoría tarifaria.
* **Flujo:** El sistema crea el contrato en `PENDIENTE_INSPECCION` y genera automáticamente una OT de tipo `INSPECCION`. **No genera prefactura en este punto.**

## CU-03 Ejecutar inspección técnica de factibilidad
* **Entrada:** Resultado de la inspección técnica (Factible / No Factible).
* **Flujo:** Si es Factible, la OT pasa a `COMPLETADA`, el contrato pasa a `PENDIENTE_PAGO` y se genera la prefactura de instalación. Si no es Factible, el contrato pasa a `RECHAZADO`.

## CU-07 Capturar lecturas móviles y novedades
* **Entrada:** Lectura actual en m³, estado del medidor, fotografía/observación de novedad.
* **Flujo:** La PWA almacena localmente si no hay conexión celular. Al sincronizar, valida contra históricos y pasa a `APROBADA` o `POR_REVISION` si detecta anomalía.

## CU-10 Refacturar con justificación auditada
* **Entrada:** ID de prefactura borrador, nuevos valores de consumo y campo obligatorio `motivo`.
* **Flujo:** El sistema valida permisos, recalcula rubros, actualiza la prefactura y registra al usuario autor y justificación en la tabla de auditoría.

## CU-14 Ejecutar arqueo y cierre diario de caja (19:00)
* **Entrada:** Conteo físico desglosado (efectivo, cheques, comprobantes de transferencia).
* **Flujo:** A las 19:00 el cajero inicia el cuadre. El sistema compara el conteo físico contra el balance de cobros. Si la diferencia no es cero, bloquea la confirmación. Al cuadrar, sella la caja como inmutable.

---

# 3 Reglas y Relaciones Comunes
* CU-02 siempre antecede a CU-03; CU-03 es precondición obligatoria para CU-04.
* CU-04 y CU-05 conducen el contrato al estado `ACTIVO`.
* CU-07 alimenta automáticamente el cálculo de consumo para CU-09.
* CU-10 solo es aplicable antes de que CU-11 emita y firme los comprobantes fiscales ante el SRI.
* CU-14 es inmutable y se ejecuta estrictamente una vez por jornada laboral.
