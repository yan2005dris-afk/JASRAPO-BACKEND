# Collections

## Descripción

Módulo de cobranza y gestión de pagos. Maneja convenios de pago y pagos de clientes.

## Sub-dominios

### Convenios

- **Convenios de pago**: Acuerdos cuando el cliente no puede pagar
- **CuotaConvenio**: Cuotas individuales del convenio
- Ubicación: `collections/convenios/`

### Pagos

- **Pagos**: Registro de pagos recibidos
- **DetallePago**: Aplicación de pagos a facturas/cuotas
- **SaldoFavorCliente**: Saldo a favor
- Ubicación: `collections/pagos/`

## Modelos Prisma

| Modelo | Prisma | Descripción |
|--------|--------|-------------|
| Convenios | logica-de-negocio/ | Convenios de pago |
| CuotaConvenio | logica-de-negocio/ | Cuotas del convenio |
| Pagos | logica-de-negocio/ | Pagos registrados |
| DetallePago | logica-de-negocio/ | Detalle de aplicación |
| SaldoFavorCliente | logica-de-negocio/ | Saldo a favor |
| CajaSesion | logica-de-negocio/ | Sesiones de caja |
| CajaArqueoDetalle | logica-de-negocio/ | Arqueo de caja |

## Conceptos Clave

- **Convenio**: Acuerdo entre empresa y cliente para pagar deuda en cuotas
- **Cuota**: Pago individual dentro de un convenio
- **Mora**: Retraso en el pago de cuotas
- **Interés por mora**: Recargo calculado por mora

## Referencias

- Documentación: `collections/convenios/convenios.md`
- Documentación: `collections/pagos/pagos.md`