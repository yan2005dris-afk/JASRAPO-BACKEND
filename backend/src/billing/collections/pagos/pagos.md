# Collections - Pagos

## Descripción

Gestión de pagos recibidos de clientes y su aplicación a facturas/cuotas.

## Modelos Prisma Relacionados

- `Pagos` → Pagos registrados
- `DetallePago` → Detalle de aplicación de pagos
- `SaldoFavorCliente` → Saldo a favor del cliente
- `CajaSesion` → Sesiones de caja
- `CajaArqueoDetalle` → Detalle de arqueo

## Estructura de Carpetas

```
pagos/
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
| GET | /pagos | Listar pagos |
| GET | /pagos/:id | Obtener un pago |
| POST | /pagos | Registrar nuevo pago |
| POST | /pagos/:id/aplicar | Aplicar pago a facturas/cuotas |
| POST | /pagos/:id/anular | Anular pago |
| GET | /pagos/cliente/:id | Pagos por cliente |

## Estados de Validación

- `REPORTADO` - Reportado por cajero
- `VALIDANDO` - En validación (pendiente)
- `APROBADO` - Aprobado y aplicado
- `RECHAZADO` - Rechazado (no válido)
- `CONCILIADO` - Conciliado con banco

## Flujo de un Pago

```
1. Cliente reporta pago en ventanilla/transferencia
2. Sistema crea PAGO con estado REPORTADO
3. Sistema validando (verifica con banco)
4. Sistema APROBADO o RECHAZADO
5. Si APROBADO → aplicar a facturas/cuotas
```

## Aplicación de Pagos

Orden de aplicación:
1. **Facturas vencidas más antiguas** (primero)
2. **Cuotas de convenios activas**
3. **Prefacturas pendientes**
4. **Saldo a favor** (si el cliente elige)

## Tipos de Origen de Saldo a Favor

- `PAGO_EXCESO` - Cliente pagó de más
- `AJUSTE_RECLAMO` - Ajuste por reclamo
- `OTROS` - Otros conceptos

## Referencias

- Schema Prisma: `logica-de-negocio/Pagos.prisma`
- Schema Prisma: `logica-de-negocio/DetallePago.prisma`
- Schema Prisma: `logica-de-negocio/SaldoFavorCliente.prisma`
- Schema Prisma: `logica-de-negocio/CajaSesion.prisma`
- Schema Prisma: `logica-de-negocio/CajaArqueoDetalle.prisma`