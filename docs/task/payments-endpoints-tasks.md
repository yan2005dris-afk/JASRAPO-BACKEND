# Payments Endpoints — Task List para Shortcut

## Contexto del Proyecto

- **Stack**: NestJS 11 + Prisma 7 + PostgreSQL
- **Módulo**: `backend/src/billing/collections/payments/`
- **Módulo padre**: `BillingModule` → `CollectionsModule`
- **Prisma models ya existentes**: `Pagos`, `DetallePago`, `SaldoFavorCliente`, `CajaSesion`, `CajaArqueoDetalle`
- **Patrón arquitectónico**: Clean Architecture (domain/application/infrastructure/interfaces)
- **Referencia**: Seguir exactamente la estructura de `agreements/`

### Lecciones del Sistema Legacy (`docs/legacy/`)

| Problema legacy | Solución en sistema nuevo |
|-----------------|--------------------------|
| No permite pagos parciales (mínimo $20 convenios) | Soporte para **cualquier monto** en pagos |
| Transferencias sin identificar quién pagó | Campo `banco` + `numeroOperacion` obligatorio para transferencias |
| Duplicación de facturas con efectivo | Validación en use case: verificar comprobante antes de aplicar |
| Cierre de caja sin tipo de factura | Endpoint de **cuadro diario** con desglose por tipo |
| Interés mora cambia mensualmente | Snapshot mensual de tasa (ya en `ParametroTasainteres`) |
| Descuento de interés mora manual | Sistema de **descuentos genérico** (por % o monto fijo) |
| Dos tipos de recaudación (consumo + otros ingresos) | `TipoDetallePago` ya lo maneja: COMPROBANTE vs PAGO_LIBRE |
| Trabajo duplicado (tesorería + contabilidad) | Un solo registro en pagos, reportes consistentes |

### Estados de Pago (3 simples)

```
PENDIENTE → REGISTRADO (transferencia/cheque confirmado en banco)
PENDIENTE → ANULADO    (cancelado antes de confirmar)
REGISTRADO → ANULADO   (anulado después de confirmado)
```

**Por qué 3 y no 5:**
- Empresa de agua pequeña, no banco con departamento de conciliación
- El cuadro diario de caja ya hace la conciliación interna
- `PENDIENTE` cubre transferencias/cheques sin confirmar (el caso de escalamiento más probable)
- Si mañana se necesita más estados, Prisma enum se extiende con una migración

---

## Enums del Modelo (Prisma)

```typescript
// ── Bancos (catálogo para filtrado y reporting) ──────────────────────────
enum Banco {
  PICHINCHA          // Banco Pichincha
  GUAYAQUIL          // Banco de Guayaquil
  PRODUBANC          // Produbanco
  PACIFICIO          // Pacífico
  BOLIVARIANO        // Banco Bolivariano
  LOJA               // Banco de Loja
  AUSTRO             // Banco Austro
  RUMIÑAHUI          // Banco Rumiñahui
  CNT                // CNT
  Diners             // Diners Club
  Mastercard         // Mastercard
  Visa               // Visa
  AMEX               // American Express
  OTRO               // Otro banco/no especificado
}

// ── Estados de pago ─────────────────────────────────────────────────────
enum EstadoPago {
  PENDIENTE    // Transferencia/cheque declarado, sin confirmar en banco
  REGISTRADO   // Pago confirmado (efectivo en caja, o transferencia vista en extracto)
  ANULADO      // Pago anulado
}

// ── Tipos de detalle de pago ─────────────────────────────────────────────
enum TipoDetallePago {
  COMPROBANTE      // Pago aplicado a factura
  CUOTA_CONVENIO   // Pago aplicado a cuota de convenio
  PAGO_LIBRE       // Pago libre (sin factura específica)
  SALDO_FAVOR      // Saldo a favor del cliente
}

// ── Origen del saldo a favor ─────────────────────────────────────────────
enum TipoOrigenAbono {
  PAGO_EXCESO      // Pago mayor al devido
  AJUSTE_RECLAMO   // Ajuste por reclamo
  OTROS            // Otros conceptos
}

// ── Estados de sesión de caja ───────────────────────────────────────────
enum EstadoCaja {
  ABIERTA
  CERRADA
  DESCUADRADA
}
```

### Cambio en modelo Pagos (migración)

El campo `referenciaBanco` (string libre) se mantiene para el **número de operación/referencia**, y se agrega `banco` como enum para el filtrado:

```prisma
model Pagos {
  pagoId              BigInt               @id @default(autoincrement()) @map("pago_id")
  cajaId              BigInt?              @map("caja_id")
  clienteId           BigInt               @map("cliente_id")
  banco               Banco?               @map("banco")              // ← NUEVO: enum de banco
  comprobanteUrl      String?              @map("comprobante_url")
  fechaPago           DateTime             @map("fecha_pago")
  montoTotalRecibido  Decimal              @map("monto_total_recibido") @db.Decimal
  numeroOperacion     String?              @map("numero_operacion")
  observaciones       String?              @map("observaciones")
  referenciaBanco     String?              @map("referencia_banco")   // ← SE MANTIENE: nro. operación
  // ... resto de campos igual
}
```

> **Por qué enum y no tabla**: Lista fija (~14 bancos ecuatorianos), no mapea a sistema externo como `CatalogoFormasPago` del SRI, y se alinea con el patrón de `EstadoCaja`, `EstadoConvenio`, `TipoDetallePago`.

---

## Archivos a Crear

### Estructura de directorios

```
backend/src/billing/collections/payments/
├── payments.module.ts
├── payments.md
├── domain/
│   ├── types/
│   │   ├── IPayment.ts              # Interfaces de tipo
│   │   └── paymentsMapper.ts        # Mappers de respuesta
│   └── repositories/
│       └── payment.repository.ts    # Abstract repository
├── application/
│   ├── payments.service.ts          # Orquestador
│   ├── payments.service.spec.ts     # Tests del servicio
│   └── use-cases/
│       ├── create-payment.use-case.ts
│       ├── create-payment.use-case.spec.ts
│       ├── find-one-payment.use-case.ts
│       ├── find-one-payment.use-case.spec.ts
│       ├── annul-payment.use-case.ts
│       ├── annul-payment.use-case.spec.ts
│       ├── validate-payment.use-case.ts
│       ├── validate-payment.use-case.spec.ts
│       └── apply-saldo-favor.use-case.ts
│           └── apply-saldo-favor.use-case.spec.ts
├── infrastructure/
│   └── repositories/
│       └── prisma-payment.repository.ts
└── interfaces/
    ├── http/
    │   ├── payments.controller.ts
    │   └── payments.controller.spec.ts
    └── dto/
        ├── create-payment.dto.ts
        ├── update-payment-state.dto.ts
        ├── find-all-payments.dto.ts
        ├── payment-response.dto.ts
        ├── payment-detail-response.dto.ts
        ├── payment-state-response.dto.ts
        ├── bank-response.dto.ts              # ← NUEVO
        └── saldo-favor-response.dto.ts
```

---

## Tareas Detalladas

### T0: Migración Prisma — Enum Banco

**Archivos**:
- `prisma/schema/models/logica-de-negocio/Pagos.prisma` (editar)
- Crear archivo nuevo o agregar enum en `Pagos.prisma`

**Acciones**:

1. Agregar enum `Banco` en el schema de Prisma
2. Agregar campo `banco Banco? @map("banco")` al modelo `Pagos`
3. Ejecutar `npx prisma migrate dev --name add-banco-enum-to-pagos`
4. Ejecutar `npx prisma generate`

**Schema a agregar**:

```prisma
enum Banco {
  PICHINCHA
  GUAYAQUIL
  PRODUBANC
  PACIFICIO
  BOLIVARIANO
  LOJA
  AUSTRO
  RUMIÑAHUI
  CNT
  Diners
  Mastercard
  Visa
  AMEX
  OTRO
}
```

**Cambio en modelo Pagos**:

```diff
model Pagos {
  pagoId              BigInt               @id @default(autoincrement()) @map("pago_id")
  cajaId              BigInt?              @map("caja_id")
  clienteId           BigInt               @map("cliente_id")
+ banco               Banco?               @map("banco")
  comprobanteUrl      String?              @map("comprobante_url")
  fechaPago           DateTime             @map("fecha_pago")
  montoTotalRecibido  Decimal              @map("monto_total_recibido") @db.Decimal
  numeroOperacion     String?              @map("numero_operacion")
  observaciones       String?              @map("observaciones")
  referenciaBanco     String?              @map("referencia_banco")
  // ... resto igual
}
```

**Criterio de aceptación**:
- Migración se ejecuta sin errores
- `prisma generate` completa exitosamente
- El enum `Banco` está disponible en `src/generated/prisma/enums`

---

### T1: Crear módulo base y abstract repository

**Archivos**:
- `payments.module.ts` (solo con providers, sin controllers aún)
- `domain/repositories/payment.repository.ts`
- `domain/types/IPayment.ts`

**Repository interface debe cubrir**:

```typescript
export abstract class PaymentRepository {
  // Pagos
  abstract findUniquePago(where, select?): Promise<any>;
  abstract findManyPagos(params): Promise<any[]>;
  abstract createPago(data, select?): Promise<any>;
  abstract updatePago(where, data, select?): Promise<any>;

  // DetallePago
  abstract findManyDetallePago(params): Promise<any[]>;
  abstract createManyDetallePago(data): Promise<any>;

  // SaldoFavorCliente
  abstract findManySaldoFavor(params): Promise<any[]>;
  abstract createSaldoFavor(data, select?): Promise<any>;
  abstract updateSaldoFavor(where, data): Promise<any>;

  // CajaSesion
  abstract findFirstCajaSesion(where, select?): Promise<any>;

  // Comprobantes
  abstract findUniqueComprobante(where, select?): Promise<any>;

  // CuotaConvenio
  abstract findUniqueCuotaConvenio(where, select?): Promise<any>;
  abstract updateCuotaConvenio(where, data): Promise<any>;

  // Transacciones
  abstract executeTransaction<T>(callback): Promise<T>;
}
```

**Criterio de aceptación**: El módulo compila, el repository se inyecta correctamente.

---

### T2: DTOs de entrada

**Archivos**:
- `interfaces/dto/create-payment.dto.ts`
- `interfaces/dto/update-payment-state.dto.ts`
- `interfaces/dto/find-all-payments.dto.ts`

**CreatePaymentDto**:

```typescript
export class CreatePaymentDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  clienteId: number;

  @ApiProperty({ example: 12345, required: false })
  @IsOptional()
  @IsNumber()
  cajaId?: number;

  @ApiProperty({ enum: Banco, example: 'PICHINCHA', required: false, description: 'Banco de origen del pago' })
  @IsOptional()
  @IsEnum(Banco)
  banco?: Banco;

  @ApiProperty({ example: '2024-01-15' })
  @IsDateString()
  fechaPago: string;

  @ApiProperty({ example: 150.50 })
  @IsNumber()
  montoTotalRecibido: number;

  @ApiProperty({ example: 'TRX-00123', required: false, description: 'Nro. de operación del banco' })
  @IsOptional()
  @IsString()
  numeroOperacion?: string;

  @ApiProperty({ example: 'Pago mensual', required: false })
  @IsOptional()
  @IsString()
  observaciones?: string;

  @ApiProperty({ example: 'REF-BANCO-001', required: false, description: 'Referencia adicional del banco' })
  @IsOptional()
  @IsString()
  referenciaBanco?: string;

  @ApiProperty({ example: 'comprobante-url.pdf', required: false })
  @IsOptional()
  @IsString()
  comprobanteUrl?: string;

  @ApiProperty({
    type: [CreateDetallePagoDto],
    description: 'Detalle de aplicación del pago',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDetallePagoDto)
  detalle: CreateDetallePagoDto[];
}

export class CreateDetallePagoDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  comprobanteId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  cuotaConvenioId?: number;

  @ApiProperty({ enum: TipoDetallePago, example: 'COMPROBANTE' })
  @IsEnum(TipoDetallePago)
  tipoPago: TipoDetallePago;

  @ApiProperty({ example: 100.00 })
  @IsNumber()
  montoAbonado: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  formaPagoId: number;

  @ApiProperty({ example: 'REF-001', required: false })
  @IsOptional()
  @IsString()
  referencia?: string;

  @ApiProperty({ example: '2024-01-15', required: false })
  @IsOptional()
  @IsDateString()
  fechaTransaccion?: string;
}
```

**UpdatePaymentStateDto**:

```typescript
export class UpdatePaymentStateDto {
  @ApiProperty({ enum: EstadoPago, example: 'REGISTRADO' })
  @IsEnum(EstadoPago)
  estadoPago: EstadoPago;

  @ApiProperty({ example: 'Motivo de anulación', required: false })
  @IsOptional()
  @IsString()
  motivo?: string;
}
```

**FindAllPaymentsDto** (query params):

```typescript
export class FindAllPaymentsDto {
  @ApiProperty({ default: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @ApiProperty({ default: 20, required: false })
  @IsOptional()
  @Type(() => Number)
  limit?: number;

  @ApiProperty({ required: false, description: 'Filtrar por cliente' })
  @IsOptional()
  clienteId?: string;

  @ApiProperty({ required: false, description: 'Filtrar por estado de pago' })
  @IsOptional()
  estadoPago?: string;

  @ApiProperty({ enum: Banco, required: false, description: 'Filtrar por banco de origen' })
  @IsOptional()
  @IsEnum(Banco)
  banco?: Banco;

  @ApiProperty({ required: false, description: 'Fecha desde (ISO)' })
  @IsOptional()
  fechaDesde?: string;

  @ApiProperty({ required: false, description: 'Fecha hasta (ISO)' })
  @IsOptional()
  fechaHasta?: string;
}
```

**Criterio de aceptación**: DTOs validan con class-validator, Swagger docs en español.

---

### T3: DTOs de respuesta

**Archivos**:
- `interfaces/dto/payment-response.dto.ts`
- `interfaces/dto/payment-detail-response.dto.ts`
- `interfaces/dto/payment-state-response.dto.ts`
- `interfaces/dto/saldo-favor-response.dto.ts`

**PaymentResponseDto**:

```typescript
export class PaymentResponseDto {
  @ApiProperty() pagoId: number;
  @ApiProperty() clienteId: number;
  @ApiProperty({ enum: Banco, required: false }) banco?: Banco;
  @ApiProperty() montoTotalRecibido: number;
  @ApiProperty() fechaPago: Date;
  @ApiProperty({ required: false }) numeroOperacion?: string;
  @ApiProperty({ required: false }) referenciaBanco?: string;
  @ApiProperty({ required: false }) comprobanteUrl?: string;
  @ApiProperty({ required: false }) observaciones?: string;
  @ApiProperty({ enum: EstadoPago }) estadoPago: EstadoPago;
  @ApiProperty() creadoPor: string;
  @ApiProperty({ required: false }) cajaId?: number;
  @ApiProperty() createdAt: Date;
  @ApiProperty({ required: false }) updatedAt?: Date;

  // Relaciones
  @ApiProperty({ type: [PaymentDetailResponseDto], required: false })
  detallePago?: PaymentDetailResponseDto[];

  @ApiProperty({ required: false }) motivoAnulacion?: string;
  @ApiProperty({ required: false }) fechaAnulacion?: Date;
  @ApiProperty({ required: false }) anuladoPor?: string;
}
```

**PaymentDetailResponseDto**:

```typescript
export class PaymentDetailResponseDto {
  @ApiProperty() detallePagoId: number;
  @ApiProperty() pagoId: number;
  @ApiProperty({ required: false }) comprobanteId?: number;
  @ApiProperty({ required: false }) cuotaConvenioId?: number;
  @ApiProperty({ enum: TipoDetallePago }) tipoPago: TipoDetallePago;
  @ApiProperty() montoAbonado: number;
  @ApiProperty() formaPagoId: number;
  @ApiProperty({ required: false }) referencia?: string;
  @ApiProperty({ required: false }) fechaTransaccion?: Date;
  @ApiProperty() createdAt: Date;
}
```

**PaymentStateResponseDto**:

```typescript
export class PaymentStateResponseDto {
  @ApiProperty({ enum: EstadoPago }) codigo: EstadoPago;
}
```

**BankResponseDto** (catálogo de bancos):

```typescript
export class BankResponseDto {
  @ApiProperty({ enum: Banco, example: 'PICHINCHA' }) codigo: Banco;
  @ApiProperty({ example: 'Banco Pichincha' }) descripcion: string;
}
```

> El service retorna `Object.values(Banco).map(...)` con el enum, igual que `findAllAgreementStates` en agreements.

**SaldoFavorResponseDto**:

```typescript
export class SaldoFavorResponseDto {
  @ApiProperty() saldoFavorId: number;
  @ApiProperty() clienteId: number;
  @ApiProperty({ required: false }) pagoId?: number;
  @ApiProperty() montoSaldo: number;
  @ApiProperty({ enum: TipoOrigenAbono }) tipoOrigen: TipoOrigenAbono;
  @ApiProperty() disponibleParaAplicar: boolean;
  @ApiProperty() createdAt: Date;
}
```

**Criterio de aceptación**: Responses documentados en Swagger con @ApiResponse y @ApiOperation en español.

---

### T4: Mapper de dominio

**Archivos**:
- `domain/types/paymentsMapper.ts`
- `domain/types/IPayment.ts` (selects seguros de Prisma)

**paymentsMapper.ts**:

```typescript
// Funciones:
// toPaymentResponse(pago) → PaymentResponseDto
// toPaymentDetailResponse(detalle) → PaymentDetailResponseDto
// toSaldoFavorResponse(saldo) → SaldoFavorResponseDto
```

**IPayment.ts** (safe selects):

```typescript
export const safePaymentSelect = { /* campos sin deletedAt, etc. */ };
export const safePaymentWithDetailSelect = { /* payment + detallePago */ };
export const safeDetailSelect = { /* solo detalle */ };
```

**Criterio de aceptación**: Mapea correctamente Prisma model → DTO, sin exponer campos internos.

---

### T5: Use Case — Create Payment

**Archivos**:
- `application/use-cases/create-payment.use-case.ts`
- `application/use-cases/create-payment.use-case.spec.ts`

**Lógica del use case**:

```
1. Validar que cliente existe
2. Validar caja sesión está ABIERTA (si se provee cajaId)
3. Crear el pago con estado REPORTADO
4. Crear detalle(s) del pago
5. Para cada detalle:
   - Si tipoPago === COMPROBANTE: verificar que comprobanteId existe, registrar aplicación
   - Si tipoPago === CUOTA_CONVENIO: verificar cuota existe y está PENDIENTE, actualizar estado cuota
   - Si tipoPago === SALDO_FAVOR: crear registro en SaldoFavorCliente
   - Si tipoPago === PAGO_LIBRE: registrar sin referencia específica
6. Validar que montoTotalRecibido === suma(detalle.montoAbonado)
7. Todo dentro de una transacción
```

**Criterio de aceptación**:
- Transaccionalidad garantizada
- Validación de integridad montos
- Spec cubre happy path + edge cases

---

### T6: Use Case — Find One Payment

**Archivos**:
- `application/use-cases/find-one-payment.use-case.ts`
- `application/use-cases/find-one-payment.use-case.spec.ts`

**Lógica**:

```
1. Buscar pago por ID (incluyendo detallePago)
2. Si no existe o deletedAt !== null → NotFoundException
3. Retornar PaymentResponseDto con detalle
```

**Criterio de aceptación**: Retorna pago con su detalle, error 404 si no existe.

---

### T7: Use Case — Update Payment State

**Archivos**:
- `application/use-cases/update-payment-state.use-case.ts`
- `application/use-cases/update-payment-state.use-case.spec.ts`

**Lógica del state machine**:

```
PENDIENTE → REGISTRADO (transferencia/cheque confirmado en banco)
PENDIENTE → ANULADO    (cancelado antes de confirmar)
REGISTRADO → ANULADO   (anulado después de confirmado)
```

**Transiciones válidas**:

| Estado actual | Permitido hacia | Quién lo hace |
|---------------|-----------------|---------------|
| PENDIENTE | REGISTRADO | Cajero al ver transferencia en extracto |
| PENDIENTE | ANULADO | Cajero si cliente cancela |
| REGISTRADO | ANULADO | Admin con motivo |

**Reglas**:
- Solo se puede anular desde PENDIENTE o REGISTRADO
- ANULADO es estado final (no se revierte)
- Al ANULAR: revertir efectos (saldo cuota convenio, saldo a favor)
- El cambio de PENDIENTE → REGISTRADO puede ser batch (varios pagos de una vez)

**Criterio de aceptación**:
- Solo transiciones válidas permitidas
- Validación de estado actual vs destino
- Spec cubre todas las transiciones

---

### T8: Use Case — Annul Payment

**Archivos**:
- `application/use-cases/annul-payment.use-case.ts`
- `application/use-cases/annul-payment.use-case.spec.ts`

**Lógica**:

```
1. Buscar pago, verificar que existe
2. Solo se puede anular si estado es PENDIENTE o REGISTRADO
3. Setear: estadoPago → ANULADO
4. Setear: motivoAnulacion, fechaAnulacion, anuladoPor
5. Soft delete: deletedAt = now()
6. Revertir aplicaciones:
   - Si tenía detalle a CUOTA_CONVENIO → revertir saldo de cuota
   - Si tenía SALDO_FAVOR → eliminar saldo a favor creado
```

**Criterio de aceptación**:
- No permite anular pagos ya CONCILIADOs
- Revierte todos los efectos del pago
- Spec cubre happy path + edge cases

---

### T9: Use Case — Apply Saldo Favor

**Archivos**:
- `application/use-cases/apply-saldo-favor.use-case.ts`
- `application/use-cases/apply-saldo-favor.use-case.spec.ts`

**Lógica**:

```
1. Verificar que saldo a favor existe y está disponible
2. Crear un nuevo pago con tipo SALDO_FAVOR
3. El detalle aplica el saldo a una factura o cuota
4. Marcar saldo como no disponible (disponibleParaAplicar = false)
```

**Criterio de aceptación**:
- Solo aplica saldos disponibles
- Actualiza correctamente el saldo Favor

---

### T10: Service (Orquestador)

**Archivos**:
- `application/payments.service.ts`
- `application/payments.service.spec.ts`

**Métodos del service**:

```typescript
@Injectable()
export class PaymentsService {
  // Delega a use cases
  async create(dto: CreatePaymentDto): Promise<PaymentResponseDto>;
  async findAll(params): Promise<PaginatedResult<PaymentResponseDto>>;
  async findOne(id: bigint): Promise<PaymentResponseDto>;
  async updateState(id: bigint, dto: UpdatePaymentStateDto): Promise<PaymentResponseDto>;
  async annul(id: bigint, dto: { motivoAnulacion: string, anuladoPor: string }): Promise<PaymentResponseDto>;
  async findSaldoFavorByCliente(clienteId: bigint): Promise<SaldoFavorResponseDto[]>;
  async findPaymentStates(): Promise<PaymentStateResponseDto[]>;
  async findBankCatalog(): Promise<BankResponseDto[]>;
}
```

**Criterio de aceptación**: Orquesta correctamente los use cases, tests cubren métodos principales.

---

### T11: Controller HTTP

**Archivos**:
- `interfaces/http/payments.controller.ts`
- `interfaces/http/payments.controller.spec.ts`

**Endpoints**:

| Método | Endpoint | Descripción | Permiso |
|--------|----------|-------------|---------|
| `POST` | `/payments` | Crear pago | `payments:create` |
| `GET` | `/payments` | Listar pagos (paginado, filtros por cliente/estado/banco/fechas) | `payments:read` |
| `GET` | `/payments/:id` | Obtener pago por ID con detalle | `payments:read` |
| `PATCH` | `/payments/:id/state` | Cambiar estado del pago (REGISTRADO/ANULADO) | `payments:update` |
| `DELETE` | `/payments/:id` | Anular pago (soft delete) | `payments:delete` |
| `GET` | `/payments/states` | Catálogo de estados de pago | `payments:read` |
| `GET` | `/payments/banks` | Catálogo de bancos (enum) | `payments:read` |
| `GET` | `/payments/cliente/:clienteId/saldo-favor` | Saldo a favor de un cliente | `payments:read` |
| `POST` | `/payments/apply-saldo-favor` | Aplicar saldo a favor a una factura | `payments:update` |

**Controller pattern** (igual que agreements):

```typescript
@ApiTags('payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @RequiredPermission('payments', 'create')
  @ApiOperation({ summary: 'Crear pago', description: '...' })
  @ApiResponse({ status: 201, type: PaymentResponseDto })
  async create(@Body() dto: CreatePaymentDto): Promise<PaymentResponseDto> { ... }

  @Get()
  @RequiredPermission('payments', 'read')
  @ApiPaginatedResponse(PaymentResponseDto)
  async findAll(@Query() query: FindAllPaymentsDto) { ... }

  @Get('states')
  @RequiredPermission('payments', 'read')
  async findStates(): Promise<PaymentStateResponseDto[]> { ... }

  @Get('banks')
  @RequiredPermission('payments', 'read')
  @ApiOperation({ summary: 'Catálogo de bancos', description: 'Lista los bancos disponibles del enum' })
  async findBanks(): Promise<BankResponseDto[]> { ... }

  @Get(':id')
  @RequiredPermission('payments', 'read')
  async findOne(@Param('id', ParseBigIntPipe) id: bigint) { ... }

  @Patch(':id/state')
  @RequiredPermission('payments', 'update')
  async updateState(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: UpdatePaymentStateDto) { ... }

  @Delete(':id')
  @RequiredPermission('payments', 'delete')
  async annul(@Param('id', ParseBigIntPipe) id: bigint, @Body() dto: AnnulPaymentDto) { ... }

  @Get('cliente/:clienteId/saldo-favor')
  @RequiredPermission('payments', 'read')
  async findSaldoFavor(@Param('clienteId', ParseBigIntPipe) clienteId: bigint) { ... }

  @Post('apply-saldo-favor')
  @RequiredPermission('payments', 'update')
  async applySaldoFavor(@Body() dto: ApplySaldoFavorDto) { ... }
}
```

**Criterio de aceptación**:
- Todos los endpoints documentados con Swagger
- @ApiTags('payments'), @ApiBearerAuth()
- Guards: JwtAuthGuard + PermissionsGuard
- @RequiredPermission en cada endpoint
- ParseBigIntPipe en params numéricos
- Responses tipados

---

### T12: Registrar módulo en BillingModule

**Archivos**:
- `collections/payments/payments.module.ts` (ya creado en T1)
- `billing/billing.module.ts` (editar)

**Cambios en billing.module.ts**:

```typescript
import { PaymentsModule } from './collections/payments/payments.module';

@Module({
  imports: [
    CategoriaTarifaModule,
    LoteModule,
    AgreementsModule,
    PrefacturaModule,
    PaymentsModule,  // ← agregar
  ],
  exports: [
    CategoriaTarifaModule,
    LoteModule,
    AgreementsModule,
    PrefacturaModule,
    PaymentsModule,  // ← agregar
  ],
})
export class BillingModule {}
```

**Criterio de aceptación**: El módulo compila, los endpoints son accesibles.

---

### T13: Tests E2E (opcional pero recomendado)

**Archivos**:
- `test/payments.e2e-spec.ts`

**Scenarios**:
1. Crear pago con detalle a comprobante → 201
2. Crear pago con monto no coincide con detalle → 400
3. Listar pagos con filtro por cliente → 200
4. Obtener pago por ID → 200
5. Obtener pago inexistente → 404
6. Cambiar estado PENDIENTE → REGISTRADO → 200
7. Cambiar estado a ANULADO sin motivo → 400
8. Anular pago → 200
9. Anular pago ya ANULADO → 400
10. Obtener saldo favor de cliente → 200
11. Aplicar saldo favor → 200

---

## Resumen de Archivos

| # | Archivo | Descripción |
|---|---------|-------------|
| 0 | `prisma/schema/models/logica-de-negocio/Pagos.prisma` | Enum Banco + campo banco en Pagos |
| 1 | `payments.module.ts` | Module definition |
| 2 | `payments.md` | Documentación del módulo |
| 3 | `domain/types/IPayment.ts` | Interfaces y selects |
| 4 | `domain/types/paymentsMapper.ts` | Mappers |
| 5 | `domain/repositories/payment.repository.ts` | Abstract repository |
| 6 | `application/payments.service.ts` | Service orchestrator |
| 7 | `application/payments.service.spec.ts` | Service tests |
| 8 | `application/use-cases/create-payment.use-case.ts` | Create use case |
| 9 | `application/use-cases/create-payment.use-case.spec.ts` | Create tests |
| 10 | `application/use-cases/find-one-payment.use-case.ts` | Find one use case |
| 11 | `application/use-cases/find-one-payment.use-case.spec.ts` | Find one tests |
| 12 | `application/use-cases/validate-payment.use-case.ts` | Validate state use case |
| 13 | `application/use-cases/validate-payment.use-case.spec.ts` | Validate tests |
| 14 | `application/use-cases/annul-payment.use-case.ts` | Annul use case |
| 15 | `application/use-cases/annul-payment.use-case.spec.ts` | Annul tests |
| 16 | `application/use-cases/apply-saldo-favor.use-case.ts` | Apply saldo favor |
| 17 | `application/use-cases/apply-saldo-favor.use-case.spec.ts` | Apply saldo tests |
| 18 | `infrastructure/repositories/prisma-payment.repository.ts` | Prisma repository impl |
| 19 | `interfaces/http/payments.controller.ts` | HTTP controller |
| 20 | `interfaces/http/payments.controller.spec.ts` | Controller tests |
| 21 | `interfaces/dto/create-payment.dto.ts` | Create DTOs |
| 22 | `interfaces/dto/update-payment-state.dto.ts` | Update state DTO |
| 23 | `interfaces/dto/find-all-payments.dto.ts` | Find all DTO |
| 24 | `interfaces/dto/payment-response.dto.ts` | Response DTO |
| 25 | `interfaces/dto/payment-detail-response.dto.ts` | Detail response DTO |
| 26 | `interfaces/dto/payment-state-response.dto.ts` | State response DTO |
| 27 | `interfaces/dto/bank-response.dto.ts` | Bank catalog response DTO |
| 28 | `interfaces/dto/saldo-favor-response.dto.ts` | Saldo favor response DTO |

---

## Dependencias Externas

| Dependencia | Uso | Ya instalada |
|-------------|-----|-------------|
| `@nestjs/swagger` | Documentación API | ✅ |
| `class-validator` | Validación DTOs | ✅ |
| `class-transformer` | Transformación | ✅ |
| `PrismaService` | Database access | ✅ |

---

## Notas para Shortcut

- **Prioridad sugerida**: T0 → T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9 → T10 → T11 → T12 → T13
- **Dependency chain**: T0 es prerequisito de todo. T12 requiere T11. T10 requiere T5-T9. T11 requiere T10. T13 requiere T12.
- **Labels sugeridas**: `backend`, `billing`, `payments`, `nestjs`, `prisma`, `migration`
- **Sprint sugerido**: 2-3 sprints (módulo completo)
- **T0 es bloqueante**: sin la migración del enum Banco, nada del módulo compila
