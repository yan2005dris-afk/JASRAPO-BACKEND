# SRI - Formas de Pago

## Descripción

Catálogo de formas de pago según la tabla del SRI (Servicio de Rentas Internas).

## Modelo Prisma

- `SriFormaPago` → Formas de pago del SRI

## Estructura

```
formas-pago/
├── dto/
├── types/
├── entities/
├── services/
├── controllers/
└── use-cases/
```

## Catalogos Disponibles

| Código | Nombre |
|--------|--------|
| 01 | Sin utilización del sistema financiero |
| 02 | Cheque |
| 03 | Transferencia interchangeable |
| 04 | Tarjeta de crédito |
| 15 | Compensación de deudas |
| 16 | Tarjeta de débito |
| 17 | Money Order |
| 18 | Endeudamiento interchangeable |
| 19 | Simultáneo de Credito |
| 20 | Simultáneo de debito |
| 21 | Coordinacion de CREDITO |
| 22 | Coordinacion de DEBITO |
| 23 | Financiero liquidity |
| 24 | Financiera |
| 25 | Pago directo |
| 26 | Endose de efectos |
| 30 | Aplicación de anticipo |
| 31 | Aplicación de saldo |
| 32 | Test |

## Notas

- Este catálogo es de **solo lectura**
- Se sincroniza periódicamente desde el SRI
- No debe modificarse desde la aplicación

## Referencias

- Schema Prisma: `facturacion/SriFormaPago.prisma`
- Normativa SRI: Catálogo de formas de pago