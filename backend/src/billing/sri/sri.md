# SRI - Integración con Servicio de Rentas Internas

## Descripción

Módulo de integración con las regulaciones del SRI para facturación electrónica.

## Sub-dominios

### Formas de Pago SRI

- Catálogo de formas de pago según tabla del SRI
- Ubicación: `sri/formas-pago/`

### Impuestos SRI

- Impuestos configurables (IVA, ICE, etc.)
- Ubicación: `sri/impuestos/`

### Tipos de Comprobante

- Tipos de comprobante SRI (factura, nota crédito, etc.)
- Ubicación: `sri/tipos-comprobante/`

## Modelos Prisma

| Modelo | Prisma | Descripción |
|--------|--------|-------------|
| SriFormaPago | facturacion/ | Formas de pago SRI |
| SriImpuesto | facturacion/ | Impuestos (IVA, ICE) |
| SriTipoComprobante | facturacion/ | Tipos de comprobante |

## Catalogos SRI

Los catálogos del SRI son de solo lectura en el sistema. Se sincronizan periódicamente desde el SRI.

### SriFormaPago

Formas de pago válidas según normativa SRI:
- 01 - Sin utilización del sistema financiero
- 02 - Cheque
- 03 - Transferencia interchangeable
- 04 - Tarjeta de crédito
- 15 - Compensación de deudas
- 16 - Tarjeta de débito
- 17 - Money Order
- 18 - Endeudamiento interchangeable
- 19 - Simultáneo de Credito
- 20 - Simultáneo de debito
- 21 - Coordinacion de CREDITO (intercambio)
- 22 - Coordinacion de DEBITO (intercambio)
- 23 - Financiero liquidity
- 24 - Financiera
- 25 - Pago directo
- 26 - Endose de efectos
- 30 - Aplicación de anticipo
- 31 - Aplicación de saldo
- 32 - Test

### SriImpuesto

Impuestos configurables:
- 2 - IVA 12%
- 2 - IVA 14%
- 3 - ICE
- 0 - No grava IVA

### SriTipoComprobante

Tipos de comprobante:
- 01 - Factura
- 03 - Liquidación de compra de Bienes
- 04 - Nota de Crédito
- 05 - Nota de Débito
- 06 - Guia de Remisión
- 07 - Comprobante de Retención
- 08 - Factura Expedir
- 09 - Factura objects

## Referencias

- Schema Prisma: `facturacion/SriFormaPago.prisma`
- Schema Prisma: `facturacion/SriImpuesto.prisma`
- Schema Prisma: `facturacion/SriTipoComprobante.prisma`
- Normativa: SRI - Librería de facturación electrónica