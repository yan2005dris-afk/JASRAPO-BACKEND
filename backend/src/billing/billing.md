# Billing (Facturación)

## Descripción

Módulo de facturación y cobranza. Transforma la medición en economía.

## Sub-dominios

### Tarifas

- Gestión de categorías de tarifa
- Ubicación: `tariffs/` ✅ Existe

### Lote

- Generación de lotes de prefacturación
- Ubicación: `lote/` ✅ Existe

### Facturación

- Facturas electrónicas
- Prefacturas
- Ubicación: `invoices/` (pendiente), `prefacturas/` (pendiente)

### Cobranza

- Convenios de pago
- Pagos y cobros
- Ubicación: `collectionsconvenios/`, `collections/pagos/`

### SRI

- Catálogos del SRI (formas de pago, impuestos, tipos de comprobante)
- Ubicación: `sri/`

## Modelos Prisma

| Modelo | Carpeta Prisma | Descripción |
|--------|--------------|-------------|
| Facturas | facturacion/ | Facturas electrónicas |
| Prefacturas | facturacion/ | Pre-facturas |
| NotasCredito | facturacion/ | Notas de crédito |
| NotasDebito | facturacion/ | Notas de débito |
| Retenciones | facturacion/ | Retenciones |
| Periodos | facturacion/ | Períodos |
| PuntosEmision | facturacion/ | Sucursales/puntos de emisión |
| Establecimientos | facturacion/ | Establecimientos |
| Empresa | facturacion/ | Datos de empresa |
| Lote | facturacion/ | Lotes de facturación |
| CatalogoDescuento | facturacion/ | Descuentos |
| DescuentoDetalle | facturacion/ | Detalle de descuentos |
| Convenios | logica-de-negocio/ | Convenios de pago |
| CuotaConvenio | logica-de-negocio/ | Cuotas de convenios |
| Pagos | logica-de-negocio/ | Pagos |
| DetallePago | logica-de-negocio/ | Detalle de pagos |
| SaldoFavorCliente | logica-de-negocio/ | Saldo a favor |
| CajaSesion | logica-de-negocio/ | Sesiones de caja |
| CategoriaTarifa | logica-de-negocio/ | Tarifas |
| Rubros | logica-de-negocio/ | Rubros |
| ParametroTasainteres | logica-de-negocio/ | Tasa de interés |

## Conceptos Clave

- **Prefactura**: Factura en revisión antes de ser generada
- **Factura**: Documento electrónico autorizado por el SRI
- **Convenio**: Acuerdo de pago cuando hay mora
- **Cuota**: Pago individual de un convenio

## Referencias

- Documentación: `tariffs/tariffs.md`
- Documentación: `lote/lote.md`
- Documentación: `invoices/invoices.md`
- Documentación: `prefacturas/prefacturas.md`
- Documentación: `collections/collections.md`
- Documentación: `sri/sri.md`