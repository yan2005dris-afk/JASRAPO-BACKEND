# Prefacturas

## Descripción

Gestión de prefacturas (facturas en revisión antes de ser aprobadas y generadas como facturas electrónicas).

## Modelos Prisma Relacionados

- `Prefacturas` → Pre-facturas generadas del ciclo de facturación
- `PrefacturaDetalle` → Detalle de items de la prefactura

## Estructura de Carpetas

```
prefacturas/
├── dto/              # Data Transfer Objects
├── types/            # TypeScript interfaces
├── entities/         # Entidades de dominio
├── services/         # Lógica de negocio
├── controllers/      # Endpoints HTTP
└── use-cases/      # Casos de uso
```

## Endpoints Esperados

| Método | Endpoint | Descripción |
|--------|---------|------------|
| GET | /prefacturas | Listar prefacturas |
| GET | /prefacturas/:id | Obtener una prefactura |
| PATCH | /prefacturas/:id/aprobar | Aprobar prefactura |
| PATCH | /prefacturas/:id/rechazar | Rechazar prefactura |
| POST | /prefacturas/:id/generar-factura | Generar factura electrónica |

## Estados

- `GENERADA` - Generada automáticamente
- `EN_REVISION` - En revisión por administrador
- `APROBADA` - Aprobada, lista para facturar
- `RECHAZADA` - Rechazada
- `ANULADA` - Anulada
- `PAGADA` - Pagada (después de generar factura)

## Flujo de Vida

```
lectura → prefactura GENERADA
              ↓
         prefactura EN_REVISION
              ↓
    ┌──────┴──────┐
    ↓             ↓
APROBADA     RECHAZADA
    ↓
prefactura APROBADA
    ↓
factura AUTORIZADA
```

## Referencias

- Schema Prisma: `facturacion/Prefacturas.prisma`
- Proceso: Generado desde lote de facturación