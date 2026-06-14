# Bancos (Legacy)

## Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| descripción | string | Nombre del banco |
| activo | boolean | Estado del registro |
| accion | string | Acción disponible |

## Notas

- Catálogo de bancos para referencia en pagos
- Se usa en recaudación para transferencias
- En el sistema nuevo se recomienda usar **enum** en vez de tabla (lista fija ~14 bancos ecuatorianos)

## bancos en el sistema nuevo

```prisma
enum Banco {
  PICHINCHA
  GUAYAQUIL
  PRODUBANC
  PACIFICIO
  BOLIVARIANO
  LOJA
  AUSTRO
  RUMIÑAHUI
  CNT
  Diners
  Mastercard
  Visa
  AMEX
  OTRO
}
```
