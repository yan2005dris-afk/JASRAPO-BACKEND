# ADR-008: Billing Periods, Temporal Domain Boundaries, and Collection Policy Separation

- **Status:** Accepted
- **Date:** 2026-09-26

## Context

During the implementation and refactoring of the Periods administration feature and annual generator wizard, several architectural and domain modeling questions emerged:

1. **Temporal Coupling / Domain Boundary Leakage:** Whether operational and master entities such as `Contratos` (Service Contracts), `Clientes` (Subscribers), and `Medidores` (Meters) should be linked to `Periodos` via foreign key relationships.
2. **Calendar Dates vs. Instant Timestamps:** Serialized period dates (`fechaInicio`, `fechaFin`, `fechaVencimiento`) suffered a 1-day subtraction offset in negative UTC offset timezones (e.g., UTC-5 Ecuador/Colombia: `2026-01-01 00:00:00 UTC` rendered as `31/12/2025`).
3. **Monthly Obligation Due Date vs. Periodic Collection Cutoff Day:** Ambiguity between the period invoice due date (`Periodos.fechaVencimiento`) and the global system configuration key (`sistema_config: cobranza.dia_corte_mensual`).

## Decision

### 1. Separation of Master Data from Cyclic/Transactional Data

- **Master Data (Long-lived lifecycle, atemporal):**
  - Entities: `Clientes`, `Contratos`, `Medidores`, `Comunidades`, `Sectores`, `CategoriaTarifa`, `Rubros`.
  - Master entities must **never** hold a foreign key to `Periodos`. A contract represents an enduring subscription agreement (often active for decades). Tying a contract to a specific billing period violates Domain-Driven Design (DDD) principles and creates severe temporal coupling.
  - Contracts own an independent start timestamp (`fechaInicio`), denoting when the service agreement was activated, completely decoupled from billing cycles.
- **Transactional & Cyclic Data (Period-bound):**
  - Entities: `Lecturas` (meter readings captured in a specific window), `Prefacturas` / `Facturas` (financial billing liquidation for a cycle), `Lotes` (billing batch execution), and `Rutas` (route reading schedules).
  - These entities strictly require `periodoId` to define the operational boundary of that specific cycle.

### 2. Calendar Date Treatment and Timezone Boundary

- **Timestamps (Instants in time):** `createdAt`, `updatedAt`, `pagoRealizadoEl`. Represent an absolute instant and are stored in UTC, converted to the client's local timezone for human presentation.
- **Calendar Dates (Date-Only / Business Dates):** `fechaInicio`, `fechaFin`, `fechaVencimiento`. These represent calendar civil days without hourly relevance.
  - **Backend Serialization:** `DateUtil.formatForFrontend` must extract UTC components (`getUTCFullYear()`, `getUTCMonth() + 1`, `getUTCDate()`) returning ISO strings formatted as `YYYY-MM-DD`. Using local date getters (`getFullYear()`) on UTC-instantiated dates causes an off-by-one day shift in non-UTC environments.
  - **Frontend Rendering:** Template date pipes must explicitly format in UTC (`{{ period.fechaInicio | date:'dd/MM/yyyy':'UTC' }}`) to avoid client browser timezone distortion.

### 3. Clear Separation Between Period Due Date and Cutoff Evaluation Policy

- **`Periodos.fechaVencimiento` (Billing Domain):**
  - Specifies the legal expiration date for invoices of that specific period (e.g., for January 2026, due on February 15, 2026).
  - Governs when an invoice transitions from current to overdue and begins accruing moratory interest.
  - Due dates are naturally greater than `fechaFin` because readings, invoice generation, and grace periods occur following the close of the service consumption window.
- **`sistema_config: cobranza.dia_corte_mensual` (Collection & Cutoff Domain):**
  - Specifies the calendar day of each month when the automated batch process evaluates debtor accounts.
  - Evaluates business policies defined by `cobranza.meses_para_mora` (default: 3 months overdue -> `EN_MORA`) and `cobranza.meses_para_corte` (default: 5 months overdue -> eligible for physical service suspension work order).
  - Does not replace or conflict with `Periodos.fechaVencimiento`; they operate in orthogonal domain concerns.

## Consequences

- Clean separation between core entity persistence and periodic billing lifecycles.
- Complete elimination of day-shifting display bugs across all timezones.
- Clarified system responsibilities: billing handles period lifecycle and invoice maturities; collection policy handles automated debt evaluation and service suspension triggers.
