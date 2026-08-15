# Auditoría de Arquitectura — Convenciones NestJS + Prisma vs Backend JASRAPO

> **Fecha**: 2026-08-14
> **Alcance**: Revisión completa de `backend/src/` (billing, identity, metering, operations, shared, infrastructure, sri) contra las convenciones de arquitectura hexagonal con NestJS + Prisma.
> **Método**: Investigación de convenciones de referencia (docs oficiales NestJS/Prisma + implementaciones de referencia DDD/hexagonal) y auditoría por dominio con evidencia `file:line`.

---

## 1. Resumen Ejecutivo

El backend **tiene la estructura correcta de capas** (`domain/application/infrastructure/interfaces`), use-cases bien formados, DTOs con class-validator, wiring de ports con DI y naming consistente. Sin embargo, hay **7 violaciones transversales** que comprometen la pureza de la arquitectura:

1. **Los ports de repositorio filtran Prisma al dominio** (`Prisma.*WhereInput/Select`, `Promise<any>`, `tx?: any`) en casi todos los módulos.
2. **`HttpException` de NestJS en application/domain** en lugar de `DomainException` — la jerarquía de excepciones de dominio ya existe pero es **código muerto**.
3. **Prisma raw dentro de use-cases y services** — el application layer saltea el port.
4. **Mappers mal ubicados** — `domain/types/*Mapper.ts` importan DTOs de interfaces (leak domain→interfaces).
5. **Entidades de dominio con `@nestjs/swagger`** — el dominio importa framework. ✅ meters/readings/reading-anomaly resueltos (2026-08-15); quedan **6 entidades** con `@ApiProperty`.
6. **Response DTOs "de mentira"** en communities, routes — se declaran pero los controllers devuelven entidades directas. ✅ clients, identity/users corregidos (2026-08-15).
7. **Sin traducción de errores Prisma (P2002/P2025)** en la mayoría de repos — errores raw → 500 genérico.

**Módulos de referencia (los que hacen las cosas bien)**: `contracts` (port transaccional de dominio + excepciones compartidas + mappers) y `discounts` (único port 100% limpio).

---

## 2. Convenciones de Referencia (NestJS + Prisma + Hexagonal)

### 2.1 Capas y regla de dependencia

La invariante es la **regla de dependencia de Robert Martin**: las dependencias de código fuente siempre apuntan hacia adentro.

```
interfaces      controllers, DTOs (validation), http concerns     → application → domain
application     use-cases, application services                   → domain
domain          entities/types, value objects, repository ports,
                domain exceptions, domain services                → NOTHING external
infrastructure  prisma-* repositories, mappers, adapters,
                PrismaService, third-party clients                → domain + application
```

| Capa | Contenido | NO debe importar |
|---|---|---|
| `interfaces/` | Controllers, `http/`, request/response DTOs (`dto/`), pipes | concretos de infraestructura (usar DI), detalles del dominio |
| `application/` | Use-cases (`use-cases/`), servicios orquestadores (`*.service.ts`) | infraestructura, interfaces, `@nestjs/common` HttpExceptions, Prisma |
| `domain/` | Entidades (`entities/` o `types/`), value objects, ports de repositorio (`repositories/`), excepciones de dominio (`exceptions/`), enums | **NestJS, Prisma, cualquier cosa externa** |
| `infrastructure/` | `repositories/prisma-*.repository.ts`, mappers, `PrismaService`/clientes | interfaces (presentación) |

**Prevención de fugas**:
- Usar `dependency-cruiser` o `eslint-plugin-boundaries` en CI (el dominio no importa application/infrastructure/interfaces; application solo importa domain; infrastructure nunca importa interfaces).
- Los tokens de DI son el único punto donde un concreto de infraestructura y un port de dominio se encuentran: `{ provide: AgreementRepository, useClass: PrismaAgreementRepository }`.
- Prohibir `@nestjs/*` y `src/generated/prisma` en `domain/`.

### 2.2 Types vs interfaces vs clases para modelos de dominio

Regla de decisión (no hay respuesta oficial de Prisma/NestJS — la dicta el comportamiento):

> **Usar `type`/`interface` por defecto para formas que transportan datos; llegar a `class` solo cuando el modelo tiene comportamiento (invariantes, transiciones de estado, cálculos).**

- **`type`** (ej. `IAgreement`, `IPayment`): correcto para modelos anémicos de lectura/escritura que reflejan persistencia sin comportamiento. Legítimo **solo si** el módulo es genuinamente CRUD; si hay reglas de negocio, empujan la lógica a los use-cases.
- **`interface`**: mismo rol estructural; elegir uno y ser consistente (el prefijo `I` es discutible pero defensible; la consistencia gana sobre cuál elegir).
- **`class`**: requerido cuando el objeto de dominio debe proteger invariantes (máquinas de estado, dinero/cálculos, validación al construir). NestJS **requiere** clases para DTOs — no para modelos de dominio.

### 2.3 DTOs con class-validator (capa de interfaces)

- **Los DTOs deben ser clases**, no interfaces ni types: TypeScript no guarda metadata de interfaces, `ValidationPipe` no puede validarlas.
- Request DTOs (`create-agreement.dto.ts`, `update-agreement.dto.ts`) viven en `interfaces/dto/` decorados con class-validator.
- **ValidationPipe global** en `main.ts` (o como `APP_PIPE`):
  ```ts
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,             // elimina propiedades no declaradas
    forbidNonWhitelisted: true,  // rechaza campos desconocidos explícitamente
    transform: true,             // instancia el DTO y coerce primitivos
  }));
  ```
- **Evitar `enableImplicitConversion: true`** — coerce desde el type TS solo y produce `NaN`/casts silenciosos. Usar `@Type(() => Number)` explícito donde haga falta.
- Campos anidados/arrays necesitan `@ValidateNested()` + `@Type()`.
- Update DTOs derivan de create vía mapped types (`PartialType`, `PickType`) — una sola fuente de verdad.

### 2.4 Response DTOs: mapear explícitamente, no devolver entidades

- **Convención: los controllers devuelven response DTOs, nunca entidades de dominio** ni filas de Prisma.
- Mapear en el límite con un mapper explícito (`toResponseDto`/`fromDomain()`) en `interfaces/` o presenters.
- `ClassSerializerInterceptor` (`@Exclude`/`@Expose`) solo cuando response ≈ entidad y solo hay que ocultar campos.
- Mapper explícito cuando la forma del response diverge (campos renombrados/computados, relaciones aplanadas).

### 2.5 Constructores: ¿sí o no?

Dos escuelas legítimas; la elección sigue directamente a 2.2:

1. **Rich DDD (clases)**: constructor privado + **métodos factory estáticos** — `create()` para "el usuario intenta un nuevo agregado", `fromPrimitives()`/`fromPersistence()` para reconstitución desde mapper; campos privados, readonly/getters, inmutabilidad. La validación corre en el constructor/factory para que **un objeto inválido no pueda existir** (fail-fast / estados imposibles).
2. **Estructural (types + literales)**: filas Prisma mapean 1:1 a objetos con forma `IAgreement`; sin comportamiento, una clase con constructor es ceremonia. **Aceptable para módulos CRUD genuinamente anémicos.**

Prisma devuelve objetos planos y es agnóstico del modelado de dominio; NestJS usa clases solo para DTOs. La recomendación la dicta el comportamiento, no el framework.

### 2.6 Validación por capas

| Tipo de validación | Dónde pertenece | Mecanismo |
|---|---|---|
| **Forma/formato de entrada** (campos requeridos, tipos, longitudes, enums) | `interfaces/` | class-validator DTOs + ValidationPipe global |
| **Invariantes de negocio** (transiciones de estado, constraints de valor, reglas cross-campo) | `domain/` | Métodos de entidad / factories de value objects que lanzan **excepciones de dominio** |
| **Reglas que cruzan agregados / existencia / unicidad** (requieren reads del repo) | `application/` (orquestación del use-case) | Checks contra el port; lanzan **excepciones de dominio** |
| **Errores técnicos de persistencia** (unique violation, record not found) | `infrastructure/` | El repositorio traduce errores Prisma → excepciones de dominio |

**La regla de oro**:
- Domain y application lanzan subclases de `DomainException` (cada una con mensaje semántico).
- Un **filtro global de excepciones** traduce `DomainException` → el `HttpException`/status correcto en un solo lugar.
- El repositorio traduce `PrismaClientKnownRequestError` (P2002 unique, P2025 not-found) → excepciones de dominio; **el código de application nunca ve errores Prisma**.
- **`HttpException` de NestJS NO debe aparecer en domain, ni lanzarse desde application.**
- La infraestructura no es lugar para validación de negocio — los repos traducen, no deciden.

### 2.7 Patrón de repositorio con Prisma

- **Port en domain**: interface o abstract class cuyos métodos se expresan en términos de dominio (tipos de dominio in/out). **No debe importar tipos Prisma ni devolver `any`.**
- **Implementación en infrastructure**: clase `@Injectable()` que `implements` el port, inyectando `PrismaService`. Es el **único** archivo que conoce `prisma.convenios.findMany(...)`.
- **Patrón mapper**: el repo mapea filas Prisma ↔ formas de dominio (`toDomain(record)` / `toPersistence(entity)`). Los mappers que tocan formas Prisma viven en `infrastructure/` (capa anti-corrupción). Los mappers de respuesta (`toResponseDto`) viven en `interfaces/`.
- **Transacciones pertenecen a application** (span de múltiples repos — el límite del "transaction script"). Los métodos del repo aceptan un `Prisma.TransactionClient` opcional (default: cliente inyectado). Los repos no abren transacciones salvo que la operación sea atómicamente de un solo agregado.
- Los repos devuelven **objetos de dominio** a application/interfaces, nunca filas Prisma.

### 2.8 Use-cases vs services

- **Use-case** = una operación de negocio, un `execute()`, nombrado por la operación (`CreateAgreementUseCase`). Dependencias inyectadas por constructor, todas contra ports/domain. Orquesta; no contiene HTTP ni persistencia.
- **Service** = fachada fina que agrupa los use-cases de un agregado (`agreements.service.ts`) — útil cuando un use-case se reutiliza entre transports (HTTP + eventos + cola), o cuando un módulo necesita un punto de entrada DI.
- Controllers → use-cases directo es totalmente convencional cuando no hay reuso cross-transport.
- **DI wiring** (composition root = `*.module.ts`):
  ```ts
  @Module({
    controllers: [AgreementsController],
    providers: [
      { provide: AgreementRepository, useClass: PrismaAgreementRepository },
      CreateAgreementUseCase, FindOneAgreementUseCase,
      AgreementsService,
    ],
    exports: [AgreementRepository, AgreementsService],
  })
  ```
  Exportar el **port**, no el concreto, cuando otro módulo lo consume.

### 2.9 Naming

| Artefacto | Archivo | Símbolo |
|---|---|---|
| Use-case | `application/use-cases/create-agreement.use-case.ts` | `CreateAgreementUseCase` |
| Service de aplicación | `application/agreements.service.ts` | `AgreementsService` |
| Port de dominio | `domain/repositories/agreement.repository.ts` | `abstract class AgreementRepository` |
| Repo infra | `infrastructure/repositories/prisma-agreement.repository.ts` | `PrismaAgreementRepository implements AgreementRepository` |
| Type estructural | `domain/types/IAgreement.ts` | `type IAgreement` |
| Enum de dominio | `domain/enums/estado-pago.enum.ts` | `enum EstadoPago` |
| Excepción de dominio | `shared/domain/exceptions/domain.exception.ts` | `EntityNotFoundException extends DomainException` |
| Request DTO | `interfaces/dto/create-agreement.dto.ts` | `class CreateAgreementDto` |
| Response DTO | `interfaces/dto/agreement-response.dto.ts` | `class AgreementResponseDto` |
| Controller | `interfaces/http/agreements.controller.ts` | `AgreementsController` |

Convenciones a mantener: archivos kebab-case, sufijos `.use-case.ts`/`.repository.ts`/`.dto.ts`/`.exception.ts`, prefijo `prisma-` en implementaciones, un DTO por operación.

---

## 3. Checklist de Auditoría

**Capas / dirección de dependencias**
- [ ] `domain/` no importa nada de `application/`, `infrastructure/` o `interfaces/`; sin `@nestjs/*` ni `src/generated/prisma`.
- [ ] `application/` importa solo `domain/`; no importa concretos `prisma-*` ni `PrismaService`.
- [ ] `interfaces/` nunca importa clases concretas de infraestructura — solo DI tokens.
- [ ] Ports de repositorio expresados en términos de dominio, no `Prisma.*WhereInput/Select`/`Promise<any>`.
- [ ] Config de `dependency-cruiser` (o equivalente) en CI.

**Entidades / types / DTOs**
- [ ] Request DTOs son **clases** con class-validator.
- [ ] Un DTO por operación: `Create*Dto`, `Update*Dto`, `FindAll*Dto`.
- [ ] Response DTOs existen; los controllers devuelven response DTOs, no entidades.
- [ ] Mapping de response explícito donde la forma diverge; `ClassSerializerInterceptor` solo para "entidad menos campos ocultos".
- [ ] Update DTOs derivan de create vía mapped types.

**Constructores / factories**
- [ ] Entidades/value objects con invariantes usan constructores privados + factories estáticas, validación al construir.
- [ ] Value objects inmutables y validados en su factory.
- [ ] Read models puros pueden ser `type`s — pero sus reglas deben vivir y testearse en use-cases.

**Validación**
- [ ] ValidationPipe global con `whitelist`, `forbidNonWhitelisted`, `transform`.
- [ ] `enableImplicitConversion` NO global; `@Type()` explícito donde se coerce; campos anidados con `@ValidateNested()` + `@Type()`.
- [ ] Validación de forma en `interfaces/dto/`, no en domain ni repos.
- [ ] Invariantes de negocio en entidades/VOs o use-cases — no en controllers ni repos.
- [ ] No se lanza `HttpException` de NestJS desde `domain/` ni `application/` — se lanzan `DomainException` subclases.
- [ ] Filtro global mapea `DomainException` → HTTP en un solo lugar.
- [ ] Errores Prisma (P2002, P2025) traducidos a excepciones de dominio **dentro de los repos**.

**Repositorio / Prisma**
- [ ] Repos implementan el port y son los únicos archivos que importan Prisma.
- [ ] Métodos de repo mapean filas↔dominio vía mappers; ninguna fila Prisma escapa.
- [ ] Transacción multi-repo → application vía `prisma.$transaction`; repos aceptan client opcional.
- [ ] Sin lógica de negocio dentro de repos (solo find/save).

**Use-cases / services / DI**
- [ ] Use-cases nombrados por operación, single `execute()`, ports por constructor.
- [ ] Services orquestan/agrupan use-cases; no contienen reglas de negocio ni Prisma.
- [ ] Wiring de módulo ata ports a implementaciones y exporta el port.
- [ ] Controllers finos: validan vía DTOs, llaman use-case/service, mapean a response DTO.

---

## 4. Resultados por Dominio

### 4.1 Billing (`backend/src/billing/`)

#### Agreements — `collections/agreements/`

**Conforme**: port cableado (`agreements.module.ts:17`), use-cases single-execute con DI, DTOs de clase con class-validator, response DTOs en controller (`agreements.controller.ts:129,158,207`), validación de forma en DTOs y reglas de negocio en use-cases, repo con selects seguros.

**Violaciones**:
- Port de dominio filtra Prisma + `any`: `agreement.repository.ts:1,4-56` (`Prisma.ConveniosWhereInput/Select`, `Promise<any>`, `tx: any`).
- Leak domain→interfaces: `domain/types/agreementsMapper.ts:2-3` importa `AgreementResponseDto`/`InstallmentResponseDto`.
- Application importa Prisma: `create-agreement.use-case.ts:6,154`; `get-debt-summary.use-case.ts:7`; `get-payment-agreement-pdf-data.use-case.ts:2,38`.
- **Prisma raw dentro de use-cases**: `create-agreement.use-case.ts:138` (`tx.convenios.create`), `:174`; `update-agreement.use-case.ts:79,85,99`.
- HttpExceptions de NestJS en use-cases: `create-agreement.use-case.ts:45,62,72,81`; `update-agreement.use-case.ts:32,41,47,61`; `find-one-agreement.use-case.ts:16`.
- Application importa DTOs de interfaces: `create-agreement.use-case.ts:10`.
- Service con PrismaService y queries raw: `agreements.service.ts:2,32,79-89,107-110`.
- Sin mappers infra (rows escapan como `any` en `agreementsMapper.ts:8,33`).
- Sin traducción de errores Prisma (P2025 crudo).
- Reglas ricas (matemática de cuotas `create-agreement.use-case.ts:106-124`, transiciones `update-agreement.use-case.ts:53-64`) sin modelo de dominio rico; `IAgreement.ts:15,19,22,31,38` usa `any` para dinero.
- `update-agreement.dto.ts:14-25` NO deriva de Create via PartialType.

#### Payments — `collections/payments/`

**Conforme**: port wiring (`payments.module.ts:23-24`), use-cases single-execute + DI, DTOs uno por operación, response DTOs (`payments.controller.ts:70,84,173,190`), **enums de dominio propios** (`domain/enums/estado-pago.enum.ts`), manejo de optimistic-lock (`create-payment.use-case.ts:290-313`), outbox handlers dependen de ports.

**Violaciones**:
- Port filtra Prisma en TODAS las firmas: `payment.repository.ts:1,4-134` (`Prisma.*WhereInput/Select`, `Promise<any>`, `tx?: Prisma.TransactionClient`).
- Port de servicio filtra Prisma: `domain/services/prefactura.service.ts:1,13,23` (`select?: any`).
- Leak domain→interfaces: `domain/types/paymentsMapper.ts:2-4`.
- Application importa enums generados: `create-payment.use-case.ts:7-14`, `apply-saldo-favor.use-case.ts:11` — **inconsistente** con annul/validate que usan enums de dominio.
- **Prisma raw**: `create-payment.use-case.ts:293` (`(tx as any).cuotaConvenio.updateMany`).
- HttpExceptions masivas: `create-payment.use-case.ts:113,126,141,157,176,211,220,237,243,273,281`; `validate-payment.use-case.ts:43`; `annul-payment.use-case.ts:25,33,37,43,89`; `apply-saldo-favor.use-case.ts:26-141`.
- Service con Prisma raw: `payments.service.ts:5,56,81,92-99,144,235`.
- Rows escapan con casts inseguros: `pago-validado.handler.ts:49` (`detalle.comprobanteId as bigint`).
- Máquina de estados en application, no domain: `VALID_TRANSITIONS` en `validate-payment.use-case.ts:10-14`.
- Money como `any`: `IPayment.ts:22`, `IPaymentDetail.ts:7`.

#### Tariffs — `tariffs/`

**Conforme**: port wiring (`categoria-tarifa.module.ts:15`), **Update deriva de Create via PartialType** (`update-categoria-tarifa.dto.ts:4-6` — único módulo que lo cumple), DTOs de clase, service fachada pura sin Prisma, use-cases single-execute, repo con select seguro.

**Violaciones**:
- Port filtra Prisma: `tariff.repository.ts:1,4-25`.
- Prisma raw en transacción: `update-tariff-category.use-case.ts:31,42,58`.
- HttpExceptions: `create-tariff-category.use-case.ts:18`; `update-tariff-category.use-case.ts:23,51`; `remove-tariff-category.use-case.ts:16`.
- Leak `any` + imports infra: `find-all-tariff-categories.use-case.ts:20` (`where: any`), `:3-4` (infra `getPagination`).
- Mapper tipado contra modelo Prisma generado: `types/tariffCategoryMapper.ts:2` (`import type { CategoriaTarifa } from 'src/generated/prisma/client'`).
- Response "DTO" es interface plana (sin clase/Swagger): `types/IResponseTariffCategory.ts`.
- Mapping invocado en use-cases (`create-tariff-category.use-case.ts:33`), inconsistente con agreements/payments.

#### Otros módulos bajo billing

- **discounts** ⭐: único port 100% limpio en domain terms (`discounts/domain/repositories/discount.repository.ts:3-43`) con mapper infra `toDomain`/`toPrisma` (`discounts/infrastructure/mappers/discount.mapper.ts`). PERO `discounts/domain/entities/discount.entity.ts:1` importa `@nestjs/swagger` — impureza de dominio.
- **batch / pre-invoice**: ports usan `Record<string, any>` (sin tipo pero al menos libres de Prisma).

**Cross-cutting billing**: cero `.exception.ts` en todo billing; cero traducción P2002/P2025; placement de mappers inconsistente (`domain/types/*Mapper.ts` vs `types/` raíz vs `infrastructure/mappers/`); services con Prisma raw (agreements, payments) vs fachada pura (tariffs).

### 4.2 Identity (`backend/src/identity/`)

#### Users ✅ **RESUELTO (2026-08-15, commit `cefafde`)** — *nota: gran parte del audit previo ya estaba desactualizado (service fachada fina, entity sin swagger, DTOs mapeados, use-cases registrados); se verificó el código real y solo quedaban los puntos abajo.*

**Conforme (verificado 2026-08-15)**: 4 capas, port abstracto + DI (`user.module.ts`), `PrismaUserRepository implements UserRepository`, DTOs de clase con `fromEntity` activos en el controller (6 endpoints), un use-case por operación, los 9 use-cases registrados, service **fachada fina** (solo `getEffectivePermissions` mapea salida).

**Corregido en `cefafde`**: `UserDetailResponseDto.fromEntity(user: any)`→`fromEntity(user: UserEntity)` (sin `|| []`; `permisosDirectos`/`permisosRol` pasan a obligatorios porque el constructor los inicializa); Nest `NotFoundException` en `update-user-permissions.use-case.ts:20`→`EntityNotFoundException('Usuario', id)`; raw `Error` en repo (mapper null en create/update, usuario ausente en `recordFailedLoginAttempt`)→`EntityNotFoundException`; index signatures `[key: string]: any` fuera de `DomainPaginationParams`/`DomainPaginationMeta`; `avatar?: any`→`UserAvatarInput` en repo data y DTO; **Prisma fuera de `create-user.dto.ts`** (`avatar?: Prisma.InputJsonValue`→`UserAvatarInput`); `findManyActive`/`findMany` del repo alineados a tipos de dominio (sin `as any[]`); **orquestación de avatar extraída a `avatar-upload.helper.ts`** (process+upload+rollback+old-delete; 3 helpers duplicados eliminados).

**Pendientes residuales (decisión aparte)**: lógica de negocio en repo — `updatePermissions` (diff/dedupe/soft-restore/validez) y `recordFailedLoginAttempt` (ventana deslizante de lockout) quedan en `prisma-user.repository.ts` como operaciones atómicas de infra (patrón aceptado; **ahora con tests**: `prisma-user.repository.spec.ts` 21 tests); `get-active-users.use-case.ts` y controller usan `PaginationDto`/`PaginatedResult` de infra (estructuralmente compatibles con los tipos de dominio — patrón transversal del proyecto); `ValidationUtil`/`PhoneUtil`/`StorageService`/`ImageProcessorUtil` de infra en use-cases (utils compartidos — patrón aceptado en readings).
- **Response DTOs nominal-only**: nunca se instancian; controllers devuelven `UserEntity`/`UserDetailEntity`/`UserProfileEntity` tipados como DTOs (`user.controller.ts:73,120-122,180,200,204,282,286`).
- Use-cases muertos: `GetUserDirectPermissionsUseCase`/`GetUserRolePermissionsUseCase` no registrados en `user.module.ts:14-24`.
- Coerción duplicada: `rolId` number en DTO pero re-parseado en controller (`user.controller.ts:159-165`).

#### Auth ✅ **RESUELTO (2026-08-15, commit `fabf97ad`)**

**Conforme (verificado 2026-08-15)**: use-cases single-execute + DI, `AuthService` fachada fina, DTOs de clase, reglas de negocio en application (lockout, bcrypt cost upgrade, replay detection), HTTP en controller, tipos de JWT centralizados en `application/types/jwt.types.ts`.

**Corregido en `fabf97ad`**: `JwtPayload` y tipos JWT centralizados en `application/types/jwt.types.ts`; removido `JwtRequest.types.ts` duplicado y `JwtPayload` obsoleto de `auth.dto.ts`; alineado el decorador `@CurrentUser()` y estrategias `JwtStrategy`/`RefreshStrategy` a los nuevos tipos; corregida la firma de `sri.controller` y `operator.controller` tipados con `JwtPayload`; agregadas pruebas unitarias completas para `jwt.strategy.spec.ts`, `refresh.strategy.spec.ts` y `current-user.decorator.spec.ts`.

**Pendientes residuales (decisión aparte)**: `auth/` desacoplado a través de services de aplicación existentes (`SessionsService`, `UserService` — patrón de delegación aceptado); `auth.dto.ts` mantiene DTOs de HTTP/Swagger (`LoginDto`, `RegisterUserDto`, `AuthResponseDto`).

### 4.3 Metering y Operations

**Cross-cutting (aplica a todos los módulos)**:
- Ports filtrando Prisma: `Record<string,any>`/`Promise<any>`/`tx?: any` en communities, contracts, routes, ~~meters~~ ✅, ~~operator~~ ✅, ~~clients~~ ✅.
- ~~6 de 8~~ **3 de 8 entidades** importan `@nestjs/swagger`: `community.entity.ts:1`, `route.entity.ts:1`, `reading-for-route.entity.ts:1` (meters/readings/reading-anomaly/clients limpiados 2026-08-15).
- Use-cases lanzan HttpExceptions; solo `prisma-contract` traduce a excepciones de dominio compartidas. ✅ readings y reading-anomaly migrados a `EntityNotFoundException` (2026-08-15).
- Application → infra concretos: `Prisma` generado (`create-meter.use-case.ts:2`), `StorageService` (`reading.service.ts`, `reading-anomaly.service.ts` — decisión aparte), `RouteMapper` desde infra (4 use-cases de routes), `GeneratePdfUseCase` (`contrato-medidor.service.ts:19`). ✅ `PrismaService` fuera de use-cases de readings.
- DI wiring de ports conforme en operator, routes, contracts, clients.
- Use-cases single-execute conformes en todos.
- Entidades anémicas `Object.assign` — sin modelos ricos donde hay reglas.
- Reglas de negocio en application/infra: overlap de rutas (`create-route.use-case.ts:29-109`), reemplazo de medidor (`update-contract.use-case.ts:24-35` + repo `:153-194`), ~~consumidor-final singleton (`create-client.use-case.ts:75-130`)~~ ✅ movido a composite `reactivateOrCreateConsumidorFinal` en repo. ✅ máquina de estados de lectura movida a `domain/reading-state.ts`; anomalía→CON_NOVEDAD: flag `nextEstadoLectura` decidido en application, escritura cruzada `tx.lecturas` queda en infra como patrón transaccional defensible; ✅ P2025 duck-typing de operator movido al repo (2026-08-15).
- Naming: `search.client.dto.ts` (punto en vez de kebab), `decommission-meter.dto.ts` bajo `http/` no `dto/`, `IResponse*.ts` PascalCase, mezcla español/inglés en nombres de archivos. ✅ `types/` en raíz eliminado en meters/readings/reading-anomaly (mappers movidos a `*ResponseDto.fromEntity()`).

**Response-DTO status**: controllers **mapean de verdad** solo en meters, readings, reading-anomaly, operator, clients. En **communities, routes** los response DTOs se agregaron pero los controllers devuelven entidades directas (tipado estructural — "el DTO es una mentira"). **contracts** no tiene response DTO. DTOs muertos: ~~`InstallMeterDto`~~ *(pendiente)*, ~~`QueryReadingsDto`~~ ✅, ~~`SearchClientDto`~~ ✅, `FindContractsQueryDto`.

#### Destacados por módulo

- **Meters** ✅ **RESUELTO (2026-08-15, commits `8a5bec8`/`741c62c4` + `a517aff` + `4d43c1f`)**: port de dominio limpio (`meter.repository.ts`), response DTO mapeado vía `MeterResponseDto.fromEntity()` (antes `toMeterResponse`), repo con `satisfies Prisma.MedidoresSelect`. Violaciones del audit **corregidas**: `metersMapper.ts` eliminado del dominio (mapeo movido al response DTO), P2002 traducido en el repo a `EntityAlreadyExistsException` (antes `ConflictException` en application), service ahora **fachada fina** con `FindAllMetersUseCase` (KPI), `UpdateMeterUseCase` y `RemoveMeterUseCase` extraídos, `tx?: any` reemplazado por `TransactionContext` tipado (domain) / `Prisma.TransactionClient` (infra). Pendientes residuales: `InstallMeterDto` sigue muerto (P1), `findAllStates` devuelve `METER_STATUS_LIST` directo.
- **Readings** ✅ **RESUELTO (2026-08-15, commits `cb633eb` + `3b71b33`)**: port limpio con CAS (`reading.repository.ts`), repo con CAS vía `updateMany` en transacción (`prisma-reading.repository.ts`). **Corregido en `cb633eb`**: `PrismaService` fuera del use-case (nuevo port `findActivePeriod()`, `create-reading.use-case.ts` usa solo el repo), máquina de estados movida a `domain/reading-state.ts` (`READING_STATE_TRANSITIONS` + `canTransitionReadingState`), response mapper movido a `ResponseReadingDto.fromEntity()` (borrados `types/readingMapper.ts` + `types/IResponseReading.ts` + carpeta `types/`), `query-readings.dto.ts` muerto eliminado, HttpExceptions→domain exceptions. **Corregido en `3b71b33`**: swagger eliminado de `lectura.entity.ts`, `as any`→casts tipados `$Enums.EstadoLectura` en repo. **Pendientes residuales (decisión aparte)**: `StorageService` + evidence-upload orchestration en `reading.service.ts` (patrón compartido con identity/reading-anomaly), application importa DTOs de interfaces y `getPagination`/`PaginatedResult` (patrón transversal del proyecto), `IsNotEmptyString` de infra en `create-lectura.dto.ts:9`.
- **Reading-anomaly** ✅ **RESUELTO (2026-08-15, commit `3b71b33`)**: port limpio, composite transaccional `createAndMarkReadingWithAnomaly` con flag `nextEstadoLectura` decidido en application (la escritura cruzada `tx.lecturas.estado` queda en infra como patrón transaccional defensible). **Corregido**: swagger eliminado de `reading-anomaly.entity.ts`, `NotFoundException`→`EntityNotFoundException` en 3 use-cases, `dataToUpdate: any`→tipado `UpdateReadingAnomalyRepositoryData` (destructuring para `lecturaId: BigInt`), response mapper movido a `ResponseReadingAnomalyDto.fromEntity()` (borrados `types/IResponseReadingAnomaly.ts` + `types/readingAnomalyMapper.ts` + carpeta `types/`). **Pendientes residuales (decisión aparte)**: `StorageService` en `reading-anomaly.service.ts`, `getPagination`/`PaginatedResult` en find-all, DTOs de interfaces en use-cases, `IsNotEmptyString` infra en DTO, `forwardRef` circular vestigial reading↔reading-anomaly (ningún provider consumido), `toDomain(raw: any)` en mapper infra.
- **Operator** ✅ **RESUELTO (2026-08-15, commit `ea655a2`)**: sin service — controller inyecta 9 use-cases directo (estilo hexagonal válido), transacción atómica task+meter (`prisma-operator.repository.ts`). **Decisión explícita (2026-08-15)**: se mantiene SIN `OperatorService` — el service en meters/readings/anomaly existe solo porque orquesta infraestructura de archivos (`StorageService`); operator no maneja archivos y cada endpoint es un use-case único, así que un service sería forwarding puro (YAGNI). NO "corregir" agregando un service vacío. **Corregido**: port filtra shapes Prisma (`findReadingsByPeriodAndRoutes`/`findMetersByRoutes` ahora aceptan `RouteData[]`, la traducción a where Prisma vive en infra — `toReadingRouteConditions`/`toMeterRouteConditions`), **duck-typing de P2025 movido al repo** (`updateTaskState`/`completeInstallationTask` traducen a `InvalidDomainOperationException('Conflicto de concurrencia')`), `TaskResponseDto.fromEntity()` con `operario`/`medidor` reales (eliminado el operario falso `nombres: ''` de `update-task-state` y `get-operator-tasks`), raw `tx.historialMedidores`/`tx.contratos` movido a método compuesto `MeterRepository.installMeter()` (cierre de historial + activación de contrato en `$transaction`), HttpExceptions→domain exceptions en los 9 use-cases, endpoint de anomalías tipado con `OperatorReadingAnomalyResponseDto.fromEntity()` (sin `any[]`), `decommission-meter.dto.ts` movido a `dto/`, exports muertos del module eliminados. **Pendientes residuales (decisión aparte)**: `update-operator-reading.use-case.ts` y `get-operator-readings.use-case.ts` importan de readings (composición deliberada — reutilizan la state machine de lecturas y el shape con detalle de contrato; sin ciclo), `getPagination`/`PaginatedResult` en find-all, DTOs de interfaces en use-cases, `TransactionContext = any` en port de meters (cosmético, habilitado por el patrón del proyecto).
- **Clients** ✅ **RESUELTO (2026-08-15, commits `0a2000b` + `8db01c9`)**: port reescrito con métodos de dominio (`findById`, `findByIdentificacion`, `updateClient`, `softDelete`, `reactivateOrCreateConsumidorFinal`) — adiós `Record<string,any>`/`Promise<any>`; **regla consumidor-final movida al repo como composite atómico** (`$transaction`, patrón `installMeter`): encuentra principal, soft-deletea duplicados, reactiva o crea el singleton; el use-case solo decide cuándo llamarla y devuelve la entidad (eliminado el wrapper `{message,data}`). Domain exceptions en los 4 use-cases; P2002/P2025 traducidos en infra. `ClientResponseDto.fromEntity()` + mapeo en controller; `SearchClientDto` muerto eliminado; service sin importar infra mapper (`IdentificacionMapper` eliminado). **Swagger fuera de la entidad de dominio** (`client.entity.ts` limpio; los decoradores viven en `ClientResponseDto`). `paginateClientes` mantiene `PaginateOptions`/`PaginatedResult` de infra como residual cross-cutting.
- **Communities** ✅ **RESUELTO (2026-08-15, commit `043e74a0`)**: port semántico limpio (`findById`, `findByCodigo`, `findActiveByNameOrCode`, `paginate`, `create`, `update`, `reactivate`, `softDelete`), repo con traducciones P2002/P2025 a excepciones de dominio compartidas, `community.entity.ts` sin Swagger, `CommunityResponseDto.fromEntity()` activo en el controller para todos los endpoints (incluyendo paginación), use-cases con `EntityAlreadyExistsException`/`EntityNotFoundException`, cobertura completa con 13 test suites / 55 tests pasando.
- **Sectors** ✅ **RESUELTO (2026-08-15, commit `9eed645a`)**: port semántico limpio (`findById`, `findByCodigo`, `findComunidadById`, `paginate`, `create`, `update`, `softDelete`), repo con traducciones P2002/P2025 a excepciones de dominio compartidas, `SectorResponseDto.fromEntity()` creado y mapeado en `sector.controller.ts`, use-cases refactorizados para devolver `SectorEntity` y lanzar `EntityNotFoundException`, cobertura completa con 13 test suites / 54 tests pasando (`prisma-sector.repository.spec.ts` añadido).
- **Contracts** ⭐: port expone operaciones transaccionales de dominio (`contract.repository.ts:39-50`), entity limpia sin framework, **único módulo que traduce a excepciones de dominio compartidas** (`prisma-contract.repository.ts:6-8,164,203,218,338-364`), mappers consistentes. Violaciones: port filtra `Record<string, any>` + imports infra (`contract.repository.ts:5-6,12-32`), `Promise<any>` en service/use-cases, `GeneratePdfUseCase` de infra en service (`contrato-medidor.service.ts:19`), update DTO no derivado de create, **sin response DTO** (`contrato-medidor.controller.ts:73-176`), regla de precios en application (`get-connection-request-pdf-data.use-case.ts:60-67`), reglas de dominio (BODEGA-only, reemplazo) ejecutadas dentro del repo infra (`prisma-contract.repository.ts:153-235,345-349`).
- **Routes** ✅ **RESUELTO (2026-08-15, commit `f572d644`)**: port semántico limpio (`findById`, `paginateRutas`, `create`, `update`, `softDelete`, `findUsuario`, `findComunidad`, `findSector`, `findPeriodo`, `findMedidor`, `findOverlappingRoutes`, `paginateLecturas`), repo con traducciones P2002/P2025 y encapsulación total de where-clauses de infraestructura (`paginateLecturas`), entities sin Swagger, `RouteResponseDto` y `ReadingForRouteResponseDto` con `fromEntity()` y `fromEntityList()` mapeados en el controller, use-cases usando excepciones de dominio compartidas (`EntityNotFoundException`, `InvalidDomainOperationException`), mapper bug corregido (`fechaPlanificada` mapeado desde `route.fechaPlanificada`), 12 test suites / 81 tests pasando (`prisma-route.repository.spec.ts` añadido).

### 4.4 Shared / Infrastructure / Sri / Wiring raíz

**Conforme**:
- ValidationPipe global con los 3 flags (`main.ts:174-184`).
- Filtro global catch-all con mapeo domain→HTTP en un solo lugar (`global-exception.filter.ts:73-82`) y envelope de validación `{ field, message, constraints, children }`.
- Jerarquía de excepciones de dominio framework-free: `shared/domain/exceptions/domain.exception.ts:1-18`.
- `shared/domain/` puro: cero `@nestjs`/Prisma.
- Outbox: port en términos de dominio (`eventos-pendientes.repository.ts:3-57`), DI correcto (`outbox.module.ts:11-14`), application habla solo con el port.
- `sri/emision/domain/` importa solo constantes/interfaces locales.

**Violaciones**:
- **La jerarquía DomainException es código muerto**: solo referenciada en `domain.exception.ts` y el filtro; nadie la lanza — el branch de mapeo del filtro es inalcanzable en la práctica.
- `main.ts:180-182` — `enableImplicitConversion: true` (coerción silenciosa).
- `main.ts:174-184` — sin `exceptionFactory` (el envelope de validación se logra indirectamente vía el filtro).
- Outbox: `eventos-pendientes.repository.ts:27` — `tx?: any` en el port.
- **Ningún catch de Prisma en shared/sri** — conflictos de unique (ej. `clave_acceso` duplicada) → 500 genérico.
- `OutboxModule` solo importado por payments — **no cableado en sri**.
- **Sri/application importa infraestructura directo**: `emitir-*.use-case.ts` importan `ClaveAccesoService`, `XmlBuilderService`, `XmlSignerService`, `SriSoapClient`, `XmlStorageService` de `../../infrastructure/...`; `sri-integration.service.ts:2,16` y `webhooks.service.ts:8` inyectan `PrismaService` raw.
- HttpExceptions masivas en sri: `emitir-factura.use-case.ts:1,101,150,166,276,324,368,700`; `emitir-nota-credito.use-case.ts`; `webhooks.service.ts:3-4,72,119`; `emisores.service.ts:3-4,41,91,107,168,193`; `certificate.service.ts:3-4,93,185,193,206,229`.
- Token string sin tipo: `{ provide: 'JobService', useExisting: JobsService }` (`emision.module.ts:78`) consumido con `@Inject('JobService')`.
- **Concretos exportados en vez de ports**: `emision.module.ts:96-111` exporta `SriService`, `SriIntegrationService`, `Emitir*UseCase`, `XmlSignerService`, etc.
- **`open-api-facturacion-sri-main/` es un proyecto NestJS paralelo** (own package.json) no integrado al module graph — cero matches de import en `backend/src`; dos stacks SRI que pueden divergir.
- **Prisma schema naming inconsistente**: `Convenios.prisma:22-24` columnas de auditoría en español (`actualizado_en`) vs `Comprobantes.prisma:41-42` en inglés (`created_at`); `Prefacturas.prisma:19` `meses_atrasado` snake_case sin mapping camelCase; modelo `Empresa` vs lenguaje de dominio "Emisores" (`Emisores.prisma:1`).

---

## 5. Priorización de Remedios

### P0 — Violaciones estructurales (rompen el aislamiento de capas)

1. **Mover la traducción de errores Prisma a los repos**: agregar catch de `P2002`/`P2025` → `EntityNotFoundException`/`InvalidDomainOperationException` en todos los repos (modelo a copiar: `prisma-contract.repository.ts`, `prisma-user.repository.ts:309`). Eliminar el duck-typing de P2025 en `update-task-state.use-case.ts:16-22`.
2. **Reemplazar HttpExceptions por DomainException en application/domain** y hacer que el filtro global (`global-exception.filter.ts`) las mapee — ya tiene el branch, solo falta que alguien lo lance.
3. **Limpiar los ports de repositorio**: eliminar `Prisma.*WhereInput/Select`, `Promise<any>`, `tx?: any` de todos los ports; expresarlos en términos de dominio (modelo: `discounts`, `contracts`).
4. **Eliminar Prisma raw de use-cases/services**: mover queries a los ports (`create-payment.use-case.ts:293`, `create-agreement.use-case.ts:138`, `create-reading.use-case.ts:46`, `agreements.service.ts:79`, `sri-integration.service.ts`).
5. **Mover mappers a `infrastructure/mappers/`** y quitar imports de interfaces DTOs desde `domain/` (`agreementsMapper.ts`, `paymentsMapper.ts`; ~~`metersMapper.ts`~~ ✅ resuelto en meters 2026-08-15).

### P1 — Higiene de dominio e interfaces

6. **Quitar `@nestjs/swagger` de entidades de dominio** (8 entidades); Swagger metadata solo en DTOs de interfaces.
7. **Conectar los response DTOs nominal-only** en clients, communities, routes, identity: agregar mappers reales `toResponse` (modelo: meters/readings/operator).
8. **Quitar `enableImplicitConversion: true`** (`main.ts:181`); usar `@Type()` explícito.
9. **Mover response mappers/types** de `domain/types/` y `types/` raíz a `interfaces/dto`/`infrastructure/mappers`.
10. **Eliminar DTOs muertos**: ~~`InstallMeterDto`~~ *(pendiente)*, ~~`QueryReadingsDto`~~ ✅, `SearchClientDto`, `FindContractsQueryDto`, `auth.dto.ts` grab-bag.
11. **Derivar update DTOs de create vía PartialType** donde aplique (`update-agreement`, `update-payment-state`, `update-contrato-medidor`).

### P2 — Modelo de dominio rico (deuda de diseño)

12. **Agreements y Payments**: promocionar a clases con factories (`create()`, `fromPrimitives()`) — matemática de cuotas, transiciones de estado, dinero tipado (hoy `any`). La máquina de estados `VALID_TRANSITIONS` debe vivir en el dominio.
13. **Mover lógica de negocio fuera de repos**: ~~`updatePermissions`/`recordFailedLoginAttempt` (`prisma-user.repository.ts:240-423`)~~ ✅ *decisión aparte: quedan en repo como operaciones atómicas con tests* (`prisma-user.repository.spec.ts`), reemplazo de medidor/regla BODEGA (`prisma-contract.repository.ts:153-235,345-349`).
14. **Auth: crear capa domain** con ports (políticas de lockout, sesiones) en vez de depender de services concretos.
15. **Sri: definir ports para infraestructura** (XmlBuilder, XmlSigner, SoapClient) e inyectarlos por DI.

### P3 — Naming y consistencia

16. Fix `route.mapper.ts:30` (fechaPlanificada desde createdAt — bug).
17. `search.client.dto.ts` → kebab; `decommission-meter.dto.ts` → `interfaces/dto/`.
18. Unificar columnas de auditoría en Prisma (español vs inglés) y `meses_atrasado`.
19. Resolver drift `Empresa` vs `Emisores`.
20. Evaluar `open-api-facturacion-sri-main/`: integrar o deprecar (dos stacks SRI).

---

## 6. Referencias

- NestJS — Validation (`ValidationPipe`, whitelist, forbidNonWhitelisted, transform): https://docs.nestjs.com/techniques/validation
- NestJS — Pipes & DTO classes (interfaces can't be validated): https://docs.nestjs.com/pipes
- NestJS — Custom providers / DI tokens (`useClass`): https://docs.nestjs.com/fundamentals/custom-providers
- NestJS — Exception filters: https://docs.nestjs.com/exception-filters
- NestJS — Serialization (`@Exclude`/`@Expose`): https://docs.nestjs.com/techniques/serialization
- Prisma — Transactions: https://www.prisma.io/docs/orm/prisma-client/queries/transactions
- Prisma — Handling exceptions and errors: https://www.prisma.io/docs/orm/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors
- Prisma community — DB-model ↔ application-model mapping: https://github.com/prisma/prisma/discussions/14564
- Implementaciones de referencia: gbourgeat/nestjs-ddd-clean-architecture-example, nurmuhamadas/nestjs-hexagonal-architecture-example, "Clean Architecture in NestJS — A Practical Guide"
- Auditoría previa del proyecto: `docs/domain_entities_inconsistencies.md`