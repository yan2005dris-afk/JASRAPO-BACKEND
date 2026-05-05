# Invoices (Facturas Electrónicas)

## Descripción

Gestión de facturas electrónicas conforme a las regulaciones del SRI.

## Estructura

```
invoices/
├── dto/              # Data Transfer Objects
├── types/            # TypeScript interfaces
├── entities/         # Entidades de dominio
├── services/         # Lógica de negocio
├── controllers/      # Endpoints HTTP
└── use-cases/      # Casos de uso
```

## Modelos Prisma

| Modelo | Descripción |
|--------|-------------|
| Facturas | Facturas electrónicas |
| NotasCredito | Notas de crédito |
| NotasDebito | Notas de débito |
| Retenciones | Retenciones |

## Endpoints

| Método | Endpoint | Descripción |
|--------|---------|------------|
| GET | /facturas | Listar |
| GET | /facturas/:id | Obtener |
| POST | /facturas | Crear |
| PATCH | /facturas/:id | Actualizar |
| DELETE | /facturas/:id | Anular |

## Estados

- CREADA → AUTORIZADA → ANULADA
- CREADA → NO_AUTORIZADA

## Referencias

- Normativa SRI: Facturación electrónica