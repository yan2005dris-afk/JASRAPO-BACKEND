# Collections - Agreements

## Description

Payment agreement management (collection arrangements when the client cannot pay).

## Related Prisma Models

- `Convenios` → Payment agreements
- `CuotaConvenio` → Agreement installments

## Directory Structure

```
agreements/
├── dto/              # Data Transfer Objects
├── types/            # TypeScript interfaces
├── use-cases/        # Business logic use cases
├── agreements.controller.ts
├── agreements.service.ts
└── agreements.module.ts
```

## Endpoints

| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | /agreements | List agreements (paginated) |
| GET | /agreements/:id | Get agreement by ID with installments |
| POST | /agreements | Create agreement |
| DELETE | /agreements/:id | Cancel agreement |
| GET | /agreements/states | Agreement state catalog |
| GET | /agreements/installment-states | Installment state catalog |
| GET | /agreements/debt-summary/:contractId | Debt summary by contract |

## Agreement States

- `PREPARADO` - In preparation
- `PENDIENTE_ABONO` - Waiting for initial payment
- `ACTIVO` - Active
- `ANULADO` - Cancelled before completion
- `PAGADO` - Fully paid

## Installment States

- `PENDIENTE` - Pending payment
- `PAGADA` - Fully paid

## Lifecycle

```
client in default → CREATE PREPARADO agreement
                       ↓
              PENDIENTE_ABONO (waiting initial payment)
                       ↓
                ACTIVO agreement
                       ↓
              PAGADO (all paid)
              ANULADO (cancelled)
```

## Calculations

- **Late interest**: Calculated from `ParametroTasainteres`
- **Installment amount**: (total debt + interest) / number of installments
- **Due date**: Start date + (installment number × interval)

## References

- Prisma Schema: `logica-de-negocio/Convenios.prisma`
- Prisma Schema: `logica-de-negocio/CuotaConvenio.prisma`
