# Standard: REST API Endpoints

**Principio**: usar métodos HTTP para acciones, no verbos en la URL.

---

## Patrón CRUD Estándar

| Método HTTP | Endpoint | Descripción |
|-------------|----------|-------------|
| `GET` | `/meters` | Listar todos (colección) |
| `GET` | `/meters/:id` | Obtener uno |
| `POST` | `/meters` | Crear |
| `PATCH` | `/meters/:id` | Actualizar parcial |
| `DELETE` | `/meters/:id` | Eliminar (soft delete) |

## Acciones de Negocio (no-CRUD)

Para operaciones que no encajan en CRUD, usar sub-recursos con sustantivos o verbos de acción como sufijo:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/meters/:id/install` | Instalar medidor |
| `POST` | `/meters/:id/decommission` | Dar de baja |
| `POST` | `/meters/:id/report-defect` | Reportar daño |

---

## Controller Example

```typescript
@ApiTags('meters')
@ApiBearerAuth()
@Controller('meters')
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

  @Post()
  @RequiredPermission('meters', 'create')
  async create(@Body() dto: CreateMeterDto): Promise<MeterResponseDto> {
    return this.meterService.create(dto);
  }

  @Get()
  @RequiredPermission('meters', 'read')
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ): Promise<MeterResponseDto[]> {
    return this.meterService.findAll({ skip, take });
  }

  @Get(':id')
  @RequiredPermission('meters', 'read')
  async findOne(@Param('id') id: string): Promise<MeterResponseDto> {
    return this.meterService.findOne(BigInt(id));
  }

  @Patch(':id')
  @RequiredPermission('meters', 'update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMeterDto,
  ): Promise<MeterResponseDto> {
    return this.meterService.update(BigInt(id), dto);
  }

  @Delete(':id')
  @RequiredPermission('meters', 'delete')
  async remove(@Param('id') id: string): Promise<void> {
    return this.meterService.remove(BigInt(id));
  }

  @Post(':id/install')
  @RequiredPermission('meters', 'update')
  async install(
    @Param('id') id: string,
    @Body('contratoId') contratoId: string,
  ): Promise<MeterResponseDto> {
    return this.meterService.install(BigInt(id), BigInt(contratoId));
  }
}
```

---

## Reglas de Naming

| Regla | Correcto | Incorrecto |
|-------|----------|------------|
| Plural para colecciones | `/meters` | `/meter` |
| Sin verbos en URL | `POST /meters` | `POST /meters/create` |
| Minúsculas | `/users` | `/Users` |
| kebab-case | `/tariff-categories` | `/tariffCategories` |
| Sin trailing slash | `/meters` | `/meters/` |

## Excepciones Válidas

- `/auth/login` — acción de autenticación, no un recurso
- `/profile` — singleton por usuario (no colección)
- `/search` — búsqueda avanzada con query params
