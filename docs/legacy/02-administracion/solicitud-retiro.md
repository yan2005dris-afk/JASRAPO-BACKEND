# Solicitud Retiro de Medidor (Legacy)

## Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| numero_solicitud | string | ID de la solicitud |
| fecha_solicitud | date | Fecha |
| numero_medidor | string | Medidor a retirar |
| propietario | string | Nombre del propietario |

## Notas

> "No representa algo que se le ayude lo suficiente"

Módulo básico, poco utilizado.

## En el sistema nuevo

Se maneja como **acción de negocio** en el módulo de medidores:

```
POST /meters/:id/decommission
```

No necesita un módulo separado.
