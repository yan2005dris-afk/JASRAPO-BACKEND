# Histórico de Cambios (Legacy)

## Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| numero_medidor | string | Medidor afectado |
| dato_anterior | string | Valor anterior |
| dato_nuevo | string | Valor nuevo |
| motivo_cambio | string | Razón del cambio |
| userupdt | string | Usuario que hizo el cambio |
| fechaupdt | datetime | Fecha del cambio |

## Notas

- Funciona como **tabla de auditoría**
- Registra cambios en medidores (propietario, estado, etc.)
- Se usa para trazabilidad

## En el sistema nuevo

Ya se maneja con `createdAt`, `updatedAt`, `deletedAt` en cada modelo.
Para auditoría completa se recomienda usar **PG Boss** o tabla de audit log separada.
