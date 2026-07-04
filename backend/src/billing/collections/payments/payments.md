# Módulo de pagos

Implementa endpoints de pagos para cobranza, siguiendo Clean Architecture como el módulo `agreements`.

## Endpoints

- `POST /payments`: crea un pago con detalle.
- `GET /payments`: lista pagos con paginación y filtros.
- `GET /payments/states`: catálogo de estados `PENDIENTE`, `REGISTRADO`, `ANULADO`.
- `GET /payments/banks`: catálogo de bancos del enum Prisma.
- `GET /payments/cuadro-diario`: resumen diario de caja con desglose por tipo de comprobante y tipo de detalle.
- `GET /payments/:id`: obtiene pago con detalle.
- `PATCH /payments/:id/state`: cambia estado respetando la máquina de estados.
- `DELETE /payments/:id`: anula pago con soft delete y reversa de aplicaciones.
- `GET /payments/cliente/:clienteId/saldo-favor`: lista saldos a favor disponibles.
- `POST /payments/apply-saldo-favor`: aplica saldo a favor a comprobante o cuota.

## Estados

- `PENDIENTE`: pago declarado, pendiente de confirmación.
- `REGISTRADO`: pago confirmado.
- `ANULADO`: pago anulado; estado final.

## Reglas clave

- El total recibido debe coincidir con la suma del detalle.
- Transferencias y referencias bancarias pueden registrar banco y número de operación.
- Las cuotas de convenio aceptan abonos parciales.
- La anulación revierte cuota de convenio y saldo a favor generado por el pago.
