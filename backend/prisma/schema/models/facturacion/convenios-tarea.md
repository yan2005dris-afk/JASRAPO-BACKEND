# Task Specification: Payment Agreements Module

## Objective

Implement the Payment Agreements logic in the backend using existing tables `convenios` and `cuota_convenio`, with states queryable from the database.

---

## 1. Existing Data Model (already created)

### Tables to use

| Table | Description |
|-------|-------------|
| `convenios` | Payment agreement header |
| `cuota_convenio` | Individual installments |
| `prefacturas` | Client pre-invoices |
| `prefactura_detalle` | Pre-invoice detail |

### Existing relationships

```
Convenios → CuotaConvenio → PrefacturaDetalle → Prefacturas
```

---

## 2. New Tables to Create (Catalogs)

### ConventionState (agreement states)

| Field | Type | Description |
|-------|------|-------------|
| state_id | String (PK) | Identifier: PREPARADO, PENDIENTE_ABONO, ACTIVO, INCUMPLIDO, FINALIZADO, ANULADO |
| name | String | Human-readable name |
| description | String? | Optional description |
| is_active | Boolean | If active for new conventions |
| sort_order | Int | Order for display in combos |
| created_at | DateTime | Creation date |

### InstallmentState (installment states)

| Field | Type | Description |
|-------|------|-------------|
| state_id | String (PK) | Identifier: PENDIENTE, PAGADA, VENCIDA |
| name | String | Human-readable name |
| description | String? | Optional description |
| is_active | Boolean | If active |
| sort_order | Int | Order for combos |
| created_at | DateTime | Creation date |

---

## 3. Schema Modifications

### Convenios (modify)

```prisma
model Convenios {
  // ... existing fields ...
  
  // NEW FIELD: State relation
  stateId String @default("PREPARADO") @map("state_id")
  state ConventionState @relation(fields: [stateId], references: [state_id])
  
  // Relation to invoices (NEW)
  invoices ConventionInvoice[]
}
```

### CuotaConvenio (modify)

```prisma
model CuotaConvenio {
  // ... existing fields ...
  
  // NEW FIELD: State relation
  stateId String @default("PENDIENTE") @map("state_id")
  state InstallmentState @relation(fields: [stateId], references: [state_id])
}
```

### ConventionInvoice (NEW - N:N relation)

```prisma
model ConventionInvoice {
  id BigInt @id @default(autoincrement())
  conventionId BigInt @map("convention_id")
  invoiceId BigInt @map("invoice_id")
  includedAmount Decimal @map("included_amount") @db.Decimal(18,2)
  createdAt DateTime @default(now())
  
  @@unique([conventionId, invoiceId])
}
```

---

## 4. Endpoints to Implement

### GET /conventions/states
**Description**: List all available convention states
**Response**:
```json
[
  { "stateId": "PREPARADO", "name": "Preparado", "order": 1 },
  { "stateId": "PENDIENTE_ABONO", "name": "Pendiente de Abono", "order": 2 },
  { "stateId": "ACTIVO", "name": "Activo", "order": 3 },
  { "stateId": "INCUMPLIDO", "name": "Incumplido", "order": 4 },
  { "stateId": "FINALIZADO", "name": "Finalizado", "order": 5 },
  { "stateId": "ANULADO", "name": "Anulado", "order": 6 }
]
```

### GET /conventions/installment-states
**Description**: List installment states
**Response**:
```json
[
  { "stateId": "PENDIENTE", "name": "Pendiente", "order": 1 },
  { "stateId": "PAGADA", "name": "Pagada", "order": 2 },
  { "stateId": "VENCIDA", "name": "Vencida", "order": 3 }
]
```

### GET /conventions/debt/:contractId
**Description**: Get outstanding debt for a contract
**Parameters**: contractId in URL
**Response**:
```json
{
  "contractId": 123,
  "invoices": [
    {
      "invoiceId": 1,
      "period": "2024-01",
      "totalToPay": 55.00,
      "currentBalance": 50.00,
      "lateInterest": 5.00,
      "dueDate": "2024-01-15"
    },
    {
      "invoiceId": 2,
      "period": "2024-02", 
      "totalToPay": 33.00,
      "currentBalance": 30.00,
      "lateInterest": 3.00,
      "dueDate": "2024-02-15"
    }
  ],
  "totalDebt": 88.00,
  "invoiceCount": 2
}
```

### GET /conventions
**Description**: List all conventions
**Optional parameters**: contractId, stateId, page, limit

### GET /conventions/:id
**Description**: Get a specific convention with its installments

### POST /conventions
**Description**: Create a new convention
**Request body**:
```json
{
  "contractId": 123,
  "installmentCount": 6,
  "initialPayment": 20.00,
  "firstPaymentDate": "2024-03-01",
  "observations": "Convenio por mora de enero y febrero"
}
```
**Internal logic**:
1. Find outstanding invoices for the contract
2. Calculate totalDebt = SUM(currentBalance + lateInterest)
3. Create convention with PREPARADO state
4. Generate installments automatically

### PATCH /conventions/:id/approve
**Description**: Approve a convention (change state to ACTIVE)
**Logic**: Change state from PREPARADO/PENDIENTE_ABONO to ACTIVE

### GET /conventions/:id/installments
**Description**: List installments of a convention

### PATCH /conventions/:id/installments/:installmentId/pay
**Description**: Record payment of an installment
**Request body**:
```json
{
  "amountPaid": 20.00,
  "paymentDate": "2024-03-15",
  "reference": "TRANSFER-001"
}
```

---

## 5. Business Rules

### Calculate Total Debt

```typescript
const totalDebt = invoices
  .filter(i => i.state !== 'PAGADA')
  .reduce((sum, i) => sum + Number(i.currentBalance) + Number(i.lateInterest), 0);
```

### Generate Installments

```typescript
const installmentAmount = (totalDebt - initialPayment) / installmentCount;
let paymentDate = new Date(firstPaymentDate);

for (let i = 1; i <= installmentCount; i++) {
  paymentDate.setMonth(paymentDate.getMonth() + 1);
  await prisma.installment.create({
    data: {
      installmentNumber: i,
      amount: installmentAmount,
      dueDate: paymentDate,
      stateId: 'PENDIENTE'
    }
  });
}
```

### Payment Distribution (when recording installment payment)

The system automatically applies payment to the oldest invoices (by due date).

---

## 6. Initial Data (Seed)

### Convention States

```sql
INSERT INTO convention_state (state_id, name, description, is_active, sort_order, created_at) VALUES
('PREPARADO', 'Prepared', 'Agreement created waiting approval', true, 1, NOW()),
('PENDIENTE_ABONO', 'Pending Initial Payment', 'Waiting for initial payment', true, 2, NOW()),
('ACTIVO', 'Active', 'Active agreement', true, 3, NOW()),
('INCUMPLIDO', 'Default', 'Client defaulted on payment', true, 4, NOW()),
('FINALIZADO', 'Completed', 'All installments paid', true, 5, NOW()),
('ANULADO', 'Cancelled', 'Agreement cancelled', false, 6, NOW());
```

### Installment States

```sql
INSERT INTO installment_state (state_id, name, description, is_active, sort_order, created_at) VALUES
('PENDIENTE', 'Pending', 'Installment to pay', true, 1, NOW()),
('PAGADA', 'Paid', 'Installment paid', true, 2, NOW()),
('VENCIDA', 'Overdue', 'Installment overdue without payment', true, 3, NOW());
```

---

## 7. Important Notes

1. **Do NOT hardcode states in frontend** - Query from /conventions/states
2. **Debt is calculated automatically** - Do not ask user
3. **Relationship to PrefacturaDetalle is maintained** - For payment traceability
4. **All dates use Ecuador timezone**

---

## 8. Deliverables

1. State tables in Prisma
2. Applied migrations
3. Implemented endpoints
4. State seed data
5. Unit tests for main use cases