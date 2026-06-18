# Tipo de Identificación (Legacy)

## Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| código | string | Código del tipo |
| descripción | string | Nombre del tipo |
| cod_sri | string | Código que mapea al SRI |

## Tipos

- Cédula
- RUC
- Pasaporte
- Consumidor Final

## Mapeo SRI

| Tipo | Código SRI |
|------|-----------|
| RUC | 04 |
| Cédula | 05 |
| Pasaporte | 06 |
| Consumidor Final | 07 |
| Identificación Exterior | 08 |

## Sistema nuevo

Ya implementado en `CatalogoTiposIdentificacion` de Prisma.
