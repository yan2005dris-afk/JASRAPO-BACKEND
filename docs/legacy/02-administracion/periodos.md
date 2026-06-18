# Periodos (Legacy)

## Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| descripción | string | Nombre del periodo |
| activo | boolean | Estado |
| accion | string | Acción disponible |
| fecha_desde | date | Inicio del periodo |
| fecha_hasta | date | Fin del periodo |
| tipo | string | Semanal, mensual o anual |
| cerrado | boolean | Si el periodo ya está cerrado |

## Tipos de periodo

- Semanal
- Mensual
- Anual

## Recomendación

> "Más fácil y flexible por año. El año 2026 y se maneja por meses."

**En el sistema nuevo**: usar periodo anual (año) con meses individuales.

## Relación con facturación

```
Periodo → Lote de Facturación → Prefacturas
Cada mes del periodo genera un lote de facturación
```
