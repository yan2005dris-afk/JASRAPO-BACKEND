# Autorización de Descuentos en Planillas — Interés Mora (Legacy)

## Contexto

El interés por mora se calcula mensualmente según la tasa que da el gobierno. Es un cambio mensual, por lo que se necesita hacer **snapshot del interés de mora por mes**.

## Caso de uso

> "Una persona que tiene años que no pagaba y quiere volver a pagar o reactivar un medidor, pero esta persona quiere que le rebajen el interés mora. Esto debería poderse hacer porque al fin y al cabo es un pago que se está recuperando."

## Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| fecha | date | Fecha |
| cuenta.numero | string | Número de cuenta |
| cuenta.nombre | string | Nombre del cliente |
| cuenta.medidor | string | Número de medidor |
| planillas_pendientes | array | Lista de planillas |
| autorizado_por | string | Quién autoriza |
| interes_mora | decimal | Interés mora total |
| saldo_pendiente | decimal | Saldo pendiente |
| porcentaje_descuento | decimal | % de descuento |
| descuento | decimal | Valor del descuento |
| motivo_descuento | string | Razón |

## Planillas pendientes (detalle)

| Campo | Descripción |
|-------|-------------|
| fecha | Fecha |
| año_lectura | Año |
| mes_lectura | Mes |
| subtotal | Subtotal |
| iva | IVA |
| total | Total |
| interes_mora | Interés mora de esa planilla |
| saldo | Saldo |
| lectura_anterior | Anterior |
| lectura_actual | Actual |
| consumo | m³ |

## Problema actual

> "Se puede descontar un porcentaje del total de interés mora. Aunque con el porcentaje, como se aplica sobre el subtotal de las planillas, entonces se tiene que calcular manualmente cuánto porcentaje ponerle."

## Mejora propuesta

Debería ser de **dos maneras**:
1. **Por porcentaje** — ej: 100% de descuento
2. **Por monto fijo** — ej: $50 de descuento directo

> "Lo ideal sería hacer una tabla de descuento para poner todo tipo de descuento y ahí poner este descuento de interés por mora sobre las planillas."

## En el sistema nuevo

Se recomienda un módulo de **descuentos** genérico:

```prisma
model DescuentoDetalle {
  descuentoId     BigInt
  prefacturaId    BigInt
  montoDescuento  Decimal
  motivo          String
  autorizadoPor   String
  fecha           DateTime
}
```
