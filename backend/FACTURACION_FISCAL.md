# Guía de Facturación Fiscal y Documentos Complementarios (SRI) - JASRAP-Olon

Este documento describe el flujo lógico y legal de los documentos fiscales que interactúan con el sistema de facturación.

## 1. Notas de Crédito (NC)
Se utilizan para **anular** o **descontar** valores de una factura ya emitida y autorizada.

*   **Flujo:** `Factura (AUTORIZADA) -> Nota de Crédito -> Factura (ANULADA/MODIFICADA)`.
*   **Relación en DB:** Cada NC debe apuntar a una `factura_id` específica. 
*   **Impacto en Cuentas:** Una NC genera un crédito a favor del cliente, reduciendo su `saldo_pendiente` en la factura original.
*   **Uso común:** Error en la lectura, error en el nombre del cliente (después de emitida), o anulación total por reclamo.

## 2. Notas de Débito (ND)
Se utilizan para **aumentar** el valor de una factura ya emitida.

*   **Flujo:** `Factura (AUTORIZADA) -> Nota de Débito`.
*   **Relación en DB:** Apunta a la `factura_id` origen.
*   **Impacto en Cuentas:** Incrementa el `saldo_pendiente` del cliente.
*   **Uso común:** Intereses por mora que no fueron calculados inicialmente, o cargos adicionales descubiertos después de la facturación.

## 3. Comprobantes de Retención
Documentos que emiten los clientes (si son agentes de retención o empresas) al momento de pagarte.

*   **Flujo:** `Pago -> Recibo de Retención (del cliente) -> Registro de Retención (en nuestro sistema)`.
*   **Relación en DB:** Se vinculan al ciclo de ingresos para justificar por qué el cliente pagó menos efectivo del que decía la factura (ej. el cliente te retiene el IVA o la Fuente).
*   **Impacto:** El valor de la retención se suma al `monto_abonado` en el `DetallePago` como si fuera efectivo, cerrando la deuda de la factura.

## 4. Mejores Prácticas de Implementación
Para mantener la integridad fiscal y técnica:

1.  **Estados SRI:** Todos estos documentos comparten el enum `EstadoSri` (BORRADOR, FIRMADO, ENVIADO, AUTORIZADO, etc.).
2.  **Snapshot Inmutable:** Al igual que la Factura, la NC/ND debe guardar una copia de los datos del cliente al momento de la emisión.
3.  **URLs de MinIO:** No guardes el XML gigante en la base de datos. Usá los campos `xml_firmado_url` y `xml_autorizado_url` para apuntar al almacenamiento de objetos.
4.  **Secuenciales:** Cada tipo de documento (NC, ND, Retención) tiene su propio contador secuencial por Punto de Emisión.

---
**Nota de Arquitectura:** Aunque estos módulos están definidos en el esquema, se recomienda estabilizar primero el flujo de `Prefactura -> Factura -> Pago` antes de habilitar la emisión automática de Notas de Crédito.
