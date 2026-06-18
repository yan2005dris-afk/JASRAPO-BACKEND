# Proceso de Cortes (Legacy)

## Flujo

```
Seleccionar filtro → Generar lista de morosos → Generar PDF → Ejecutar cortes
```

## Campos de entrada

| Campo | Tipo | Descripción |
|-------|------|-------------|
| numero | int | Número del proceso |
| fecha | date | Fecha |
| sector | string | Sector/comunidad |
| filtro | string | Meses atrasados / Saldo pendiente |
| condicion | string | Igual, Mayor igual, Menor igual |
| meses_atrasado | int | Cantidad de meses |

## Lista generada

| Campo | Descripción |
|-------|-------------|
| numero_cuenta | Cuenta morosa |
| numero_medidor | Medidor |
| nombre_cliente | Cliente |
| meses_atrasado | Meses sin pagar |
| saldo_pendiente | Deuda total |
| resultado_gestion | Resultado del corte |
| novedad | Novedad registrada |

## Uso típico

> "Se pone mayor igual a 2 meses y si hay esos casos entonces salen todas las personas que están morosas."

Se genera PDF para informar en **reuniones de comunidad** cuántos morosos hay y el valor total.

## Errores conocidos

> "Si dice 3 realmente es 4, si es 2 realmente es 3 — error de sistema que suma 1 automáticamente."

## Snapshot

> "Se quiere que se guarden los datos en snapshot, cuándo se sacó el reporte o se hizo el proceso."

## Listado de procesos

| Campo | Descripción |
|-------|-------------|
| numero | Número del proceso |
| año_proceso | Año |
| fecha | Fecha |
| sector | Sector |
