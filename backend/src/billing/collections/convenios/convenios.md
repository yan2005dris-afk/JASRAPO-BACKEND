# Collections - Convenios

## Descripción

Gestión de convenios de pago (acuerdos de cobranza cuando el cliente no puede pagar).

## Modelos Prisma Relacionados

- `Convenios` → Convenios de pago
- `CuotaConvenio` → Cuotas del convenio

## Estructura de Carpetas

```
convenios/
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
| GET | /convenios | Listar convenios |
| GET | /convenios/:id | Obtener un convenio |
| POST | /convenios | Crear nuevo convenio |
| PATCH | /convenios/:id | Actualizar convenio |
| DELETE | /convenios/:id | Anular convenio |
| GET | /convenios/:id/cuotas | Ver cuotas del convenio |
| POST | /convenios/:id/pagar-cuota | Registrar pago de cuota |

## Estados del Convenio

- `PREPARADO` - En preparación
- `PENDIENTE_ABONO` - Esperando abono inicial
- `ACTIVO` - Vigente
- `INCUMPLIDO` - Convention roto (mora)
- `FINALIZADO` - Completamente pagado
- `ANULADO` - Anulado

## Estados de la Cuota

- `PENDIENTE` - Pendiente de pago
- `PAGADA` - Pagada
- `VENCIDA` - Vencida sin pago
- `INCUMPLIDA` - Pagada fuera de fecha

## Flujo de Vida

```
cliente en mora → crear CONVENIO PREPARADO
                      ↓
               CONVENIO PENDIENTE_ABONO (espera abono inicial)
                      ↓
               CONVENIO ACTIVO
                      ↓
    ┌─────────────────────────────────┐
    │                                │
    ↓                                ↓
incumplido                    FINALIZADO
(roto por mora)           (todas pagadas)
```

## Cálculos

- **Interés por mora**: Se calcula según `ParametroTasainteres`
- **Monto de cuota**: (deuda total + intereses) / número de cuotas
- **Fecha de vencimiento**: Fecha inicial + (número de cuota × intervalo)

## Referencias

- Schema Prisma: `logica-de-negocio/Convenios.prisma`
- Schema Prisma: `logica-de-negocio/CuotaConvenio.prisma`
- Dependencias: `billing/tariffs/` (tarifas), `operations/contracts/` (contratos)