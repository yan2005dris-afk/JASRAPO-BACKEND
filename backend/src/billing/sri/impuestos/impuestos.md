# SRI - Impuestos

## Descripción

Catálogo de impuestos según la tabla del SRI (IVA, ICE, etc.).

## Modelo Prisma

- `SriImpuesto` → Impuestos del SRI

## Estructura

```
impuestos/
├── dto/
├── types/
├── entities/
├── services/
├── controllers/
└── use-cases/
```

## Impuestos Disponibles

| Código | Nombre | TARIFA |
|--------|--------|-------|
| 2 | IVA | 12% |
| 2 | IVA | 14% |
| 3 | ICE | Variable |
| 0 | No grava IVA | 0% |

## Notas

- Este catálogo es de **solo lectura**
- Se sincroniza periódicamente desde el SRI
- No debe modificarse desde la aplicación

## Referencias

- Schema Prisma: `facturacion/SriImpuesto.prisma`
- Normativa SRI: Catálogo de impuestos