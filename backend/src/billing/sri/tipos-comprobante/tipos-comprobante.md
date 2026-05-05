# SRI - Tipos de Comprobante

## Descripción

Catálogo de tipos de comprobante según la tabla del SRI.

## Modelo Prisma

- `SriTipoComprobante` → Tipos de comprobante SRI

## Estructura

```
tipos-comprobante/
├── dto/
├── types/
├── entities/
├── services/
├── controllers/
└── use-cases/
```

## Tipos de Comprobante

| Código | Nombre |
|--------|--------|
| 01 | Factura |
| 03 | Liquidación de compra de Bienes |
| 04 | Nota de Crédito |
| 05 | Nota de Débito |
| 06 | Guia de Remisión |
| 07 | Comprobante de Retención |
| 08 | Factura Expedir |
| 09 | Factura objects |

## Notas

- Este catálogo es de **solo lectura**
- Se sincroniza periódicamente desde el SRI
- No debe modificarse desde la aplicación

## Referencias

- Schema Prisma: `facturacion/SriTipoComprobante.prisma`
- Normativa SRI: Catálogo de tipos de comprobante