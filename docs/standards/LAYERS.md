# Standard: Layered Architecture (Hexagonal)

Arquitectura hexagonal con 4 capas por sub-dominio. Las dependencias fluyen hacia adentro:
`interfaces` → `application` → `domain` ← `infrastructure`

---

## Folder Structure

```
<context>/
└── <subdomain>/
    ├── application/
    │   ├── <entity>.service.ts              ← Orquesta use cases
    │   └── use-cases/
    │       ├── find-all-<entity>.use-case.ts
    │       ├── find-one-<entity>.use-case.ts
    │       └── <action>-<entity>.use-case.ts
    ├── domain/
    │   └── repositories/
    │       └── <entity>.repository.ts       ← Puerto (abstract class)
    ├── infrastructure/
    │   └── repositories/
    │       └── prisma-<entity>.repository.ts ← Adaptador Prisma
    ├── interfaces/
    │   ├── dto/
    │   │   └── <action>-<entity>.dto.ts
    │   └── http/
    │       └── <entity>.controller.ts
    └── <entity>.module.ts
```

---

## Layer Responsibilities

| Capa | Responsabilidad |
|------|----------------|
| `interfaces/http/` | HTTP: parsear request, delegar a Service, devolver response. Sin lógica de negocio. |
| `interfaces/dto/` | Input validation (`class-validator`) y shaping de output. |
| `application/service` | Orquesta use cases. Sin Prisma directo. |
| `application/use-cases/` | Una operación de negocio. Un método `execute()`. |
| `domain/repositories/` | Contrato abstracto (port). Sin imports de Prisma ni infra. |
| `infrastructure/repositories/` | Implementación Prisma del contrato del dominio (adapter). |

---

## Domain Repository (Port — abstract class)

```typescript
// domain/repositories/batch.repository.ts
export abstract class BatchRepository {
  abstract findMany(params: {
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<any[]>;

  abstract count(params?: { where?: Record<string, any> }): Promise<number>;

  abstract findById(
    id: number | bigint,
    options?: { include?: Record<string, any> },
  ): Promise<any>;
}
```

**Regla:** clase abstracta, no interfaz. No importa Prisma. No importa nada de `infrastructure/`.

---

## Infrastructure Repository (Adapter — Prisma)

```typescript
// infrastructure/repositories/prisma-batch.repository.ts
@Injectable()
export class PrismaBatchRepository implements BatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params): Promise<any[]> {
    return this.prisma.lote.findMany(params);
  }

  async count(params?): Promise<number> {
    return this.prisma.lote.count({ where: params?.where ?? {} });
  }

  async findById(id, options?): Promise<any> {
    return this.prisma.lote.findUnique({
      where: { loteId: BigInt(id) },
      include: options?.include,
    });
  }
}
```

**Regla:** solo Prisma, sin lógica de negocio.

---

## Use Case

```typescript
// application/use-cases/find-all-batches.use-case.ts
@Injectable()
export class FindAllBatchesUseCase {
  constructor(private readonly batchRepository: BatchRepository) {}

  async execute(page = 1, limit = 10): Promise<PaginatedResult<any>> {
    const { skip, take } = getPagination(page, limit);

    const [data, total] = await Promise.all([
      this.batchRepository.findMany({ orderBy: { createdAt: 'desc' }, skip, take }),
      this.batchRepository.count(),
    ]);

    return buildPaginatedResult(data, total, page, take);
  }
}
```

**Regla:** inyecta `BatchRepository` (abstract), nunca `PrismaService` directamente.

---

## Service (Application Orchestrator)

```typescript
// application/batch.service.ts
@Injectable()
export class BatchService {
  constructor(
    private readonly generateUseCase: GenerateBatchUseCase,
    private readonly findAllUseCase: FindAllBatchesUseCase,
    private readonly findOneUseCase: FindOneBatchUseCase,
  ) {}

  async generate(dto: GenerateBatchDto) {
    return this.generateUseCase.execute(dto);
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<any>> {
    return this.findAllUseCase.execute(page, limit);
  }

  async findOne(id: number) {
    return this.findOneUseCase.execute(id);
  }
}
```

**Regla:** delega a use cases. No contiene lógica de negocio ni queries Prisma.

---

## Controller

```typescript
// interfaces/http/batch.controller.ts
@ApiTags('batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('batches')
export class BatchController {
  constructor(private readonly batchService: BatchService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generar un nuevo lote de prefacturas' })
  @RequiredPermission('batches', 'create')
  async generate(@Body() dto: GenerateBatchDto) {
    return this.batchService.generate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los lotes' })
  @RequiredPermission('batches', 'read')
  async findAll(@Query() pagination: PaginationDto) {
    return this.batchService.findAll(pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un lote' })
  @RequiredPermission('batches', 'read')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchService.findOne(id);
  }
}
```

---

## Module (Dependency Wiring)

```typescript
// batch.module.ts
@Module({
  imports: [DatabaseModule],
  controllers: [BatchController],
  providers: [
    { provide: BatchRepository, useClass: PrismaBatchRepository }, // ← inversión de dependencia
    GenerateBatchUseCase,
    FindAllBatchesUseCase,
    FindOneBatchUseCase,
    BatchService,
  ],
  exports: [BatchRepository, BatchService],
})
export class BatchModule {}
```

El módulo es el único lugar donde `PrismaBatchRepository` aparece como implementación concreta.
Toda la aplicación trabaja contra `BatchRepository` (abstracto).

---

## DTOs

```typescript
// interfaces/dto/generate-batch.dto.ts
export class GenerateBatchDto {
  @ApiProperty({ description: 'ID del período de facturación', example: 1 })
  @IsInt()
  periodoId: number;

  @ApiProperty({ description: 'ID de comunidad (opcional, null = todo)', required: false })
  @IsOptional()
  @IsInt()
  comunidadId?: number;
}
```

**Reglas:**
- Campos en **español** (concordancia con DB). Ver [NAMING.md](./NAMING.md).
- `@ApiProperty` en cada campo — documentación Swagger obligatoria.
- `@IsXxx` de `class-validator` en cada campo que viene del usuario.
- Campos internos (`deletedAt`, `createdAt`) nunca en DTOs de respuesta.

---

## Dependency Flow

```
interfaces/http/Controller
    ↓ usa
application/Service
    ↓ usa
application/use-cases/UseCase
    ↓ inyecta (abstract)
domain/repositories/Repository  ←——  infrastructure/repositories/PrismaRepository
                                              ↓ usa
                                         PrismaService
```

La capa `domain` no conoce Prisma. La capa `infrastructure` no conoce la lógica de negocio.
