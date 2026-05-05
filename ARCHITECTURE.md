# 🏛️ Screaming Architecture & Context-Based Design

## ¿Qué es "Screaming Architecture"?

El término, acuñado por Uncle Bob, propone que **la arquitectura de un software debe "gritar" su intención**, no los frameworks o las herramientas que utiliza. 

Cuando mirás la carpeta `src/`, no deberías ver "controllers", "models" y "services" (arquitectura técnica), sino **"billing", "identity" y "metering"** (arquitectura de negocio). El objetivo es que cualquier desarrollador pueda entender qué hace el sistema simplemente mirando la estructura de archivos, sin necesidad de abrir una sola línea de código.

## Nuestra Implementación: Arquitectura por Contextos

Hemos estructurado `jasrapo-backend` siguiendo este principio, dividiendo el sistema en contextos de negocio aislados y altamente cohesivos.

### 🗺️ Mapa de Contextos (Bounded Contexts)

1.  **`identity/` (Identidad)**: Gestión de usuarios, autenticación, roles, permisos y sesiones. Es el guardián del acceso al sistema.
2.  **`metering/` (Medición)**: El núcleo operativo del agua. Gestiona dispositivos (medidores) y el ciclo de vida de las lecturas.
3.  **`billing/` (Facturación)**: Transforma la medición en economía. Tarifas, facturas, convenios, cobros, pagos e integración con el SRI.
4.  **`operations/` (Operaciones)**: Logística y territorio. Clientes, contratos, territorio y la jerarquía de sectores/comunidades.
5.  **`public-portal/` (Portal Público)**: Exposición controlada de datos para el cliente final (consultas de facturas, búsquedas públicas).

---

### 🧱 Anatomía de un Contexto

Cada carpeta dentro de un contexto es un **Dominio** o **Sub-dominio** que contiene sus propios recursos técnicos. Por ejemplo, dentro de `identity/auth/` verás:

-   `dto/`: Objetos de transferencia de datos.
-   `guards/`: Reglas de acceso.
-   `strategies/`: Lógicas de autenticación (JWT).
-   `auth.service.ts`: Lógica de negocio pura.
-   `auth.controller.ts`: Puerta de entrada HTTP.
-   `auth.module.ts`: Definición de NestJS para este sub-dominio.

### ⚙️ Infrastructure (Infraestructura)

Todo lo que sea un **detalle técnico** o una herramienta externa que no pertenece a la lógica de negocio se centraliza en `src/infrastructure/`:
-   `database/`: Prisma Service y conexión a PostgreSQL.
-   `storage/`: Integración con Minio (S3).
-   `common/`: Decoradores, filtros, interceptores y utilidades globales.
-   `config/`: Constantes y configuración de la aplicación.

---

## 📋 Mapeo Completo: Prisma → NestJS

Esta tabla establece la correspondencia entre los modelos del schema de Prisma y su ubicación en el código NestJS.

### 🔐 Identity (Identidad y Autenticación)

Carpeta Prisma: `autenticacion-autorizacion/` → Carpeta NestJS: `src/identity/`

| Modelo Prisma | Ubicación NestJS | Sub-dominio | Descripción |
|--------------|------------------|------------|-------------|
| Usuarios | `users/` | users | Gestión de usuarios del sistema |
| Roles | `roles/` | roles | Roles y permisos |
| Permisos | `permissions/` | permissions | Permisos granulares |
| Sesiones | `sessions/` | sessions | Sesiones activas de usuarios |
| Menus | `menus/` | menus | Menú del sistema por perfil |
| Perfiles | `profiles/` | profiles | Perfiles de usuario (avatars) |
| RolPermisos | `roles/` | roles | Relación muchos a muchos |
| UsuarioPermisos | `users/` | users | Relación muchos a muchos |
| MenuPermisos | `menus/` | menuss | Relación muchos a muchos |

---

### 📐 Metering (Medición)

Carpeta Prisma: `logica-de-negocio/` → Carpeta NestJS: `src/metering/`

| Modelo Prisma | Ubicación NestJS | Sub-dominio | Descripción |
|--------------|------------------|------------|-------------|
| Medidores | `meters/` | meters | Dispositivos de medición |
| Lecturas | `readings/` | readings | Lecturas de medidores |
| LecturaAnomalia | `reading-anomaly/` | reading-anomaly | Anomalías en lecturas (fugas, daños) |
| EstadoMedidor | `meters/` | meters | Estados del medidor (activo, dañado, dado de baja) |
| HistorialMedidores | `readings/` | readings | Historial de cambios de medidores |

---

### 🏢 Operations (Operaciones Comerciales)

Carpeta Prisma: `logica-de-negocio/` → Carpeta NestJS: `src/operations/`

| Modelo Prisma | Ubicación NestJS | Sub-dominio | Descripción |
|--------------|------------------|------------|-------------|
| Clientes | `clients/` | clients | Clientes del sistema |
| Contratos | `contracts/` | contracts | Contratos de servicio (medidor - cliente) |
| Comunidades | `territory/communities/` | communities | Comunidades/barrios |
| Sectores | `territory/sectors/` | sectors | Sectores dentro de comunidades |
| Identificacion | `clients/` | clients | Tipos de identificación (Cédula, RUC, Pasaporte) |
| CategoriaTarifa | `billing/tariffs/` | tariffs | Categorías de tarifa |
| Rubros | *(pendiente)* | - | Rubros para cargos adicionales |
| ParametroTasainteres | *(pendiente)* | - | Parámetros de tasa de interés por mora |

---

### 💰 Billing (Facturación y Cobranza)

Carpeta Prisma: `facturacion/` y `logica-de-negocio/` → Carpeta NestJS: `src/billing/`

#### Sub-dominio: Facturación (SRI)

| Modelo Prisma | Ubicación NestJS | Sub-dominio | Descripción |
|--------------|------------------|------------|-------------|
| Facturas | *(pendiente)* | - | Facturas electrónicas |
| Prefacturas | *(pendiente)* | - | Pre-facturas antes de aprobación |
| PrefacturaDetalle | *(pendiente)* | - | Detalle de prefacturas |
| NotasCredito | *(pendiente)* | - | Notas de crédito |
| NotasDebito | *(pendiente)* | - | Notas de débito |
| Retenciones | *(pendiente)* | - | Retenciones en facturas |
| Periodos | *(pendiente)* | - | Períodos de facturación |
| PuntosEmision | *(pendiente)* | - | Puntos de emisión (sucursales) |
| Establecimientos | *(pendiente)* | - | Establecimientos/empresas |
| Empresa | *(pendiente)* | - | Datos de la empresa |
| Lote | `lote/` | lote | Lotes de generación de prefacturas |
| SriFormaPago | *(pendiente)* | - | Formas de pago del SRI |
| SriImpuesto | *(pendiente)* | - | Impuestos (IVA, ICE) |
| SriTipoComprobante | *(pendiente)* | - | Tipos de comprobante SRI |
| CatalogoDescuento | *(pendiente)* | - | Catálogo de descuentos |
| DescuentoDetalle | *(pendiente)* | - | Detalle de descuentos aplicados |

#### Sub-dominio: Convenios y Cobranza 🆕

| Modelo Prisma | Ubicación NestJS | Sub-dominio | Descripción |
|--------------|------------------|------------|-------------|
| Convenios | `collections/convenios/` | convenios | Convenios de pago (acuerdos por mora) |
| CuotaConvenio | `collections/convenios/` | convenios | Cuotas del convenio de pago |

**Nota**: Convenios y CuotaConvenio están en Prisma en `logica-de-negocio/`, pero en NestJS van en `billing/collections/` porque representan la **lógica de cobranza** (cuando el cliente no puede pagar, se negocia un acuerdo de pago). Es un tema de facturación, no de operaciones comerciales.

#### Sub-dominio: Pagos y Cobros

| Modelo Prisma | Ubicación NestJS | Sub-dominio | Descripción |
|--------------|------------------|------------|-------------|
| Pagos | *(pendiente)* | - | Pagos recibidos |
| DetallePago | *(pendiente)* | - | Detalle de pagos (aplicación a facturas/cuotas) |
| SaldoFavorCliente | *(pendiente)* | - | Saldo a favor del cliente |
| CajaSesion | *(pendiente)* | - | Sesiones de caja |
| CajaArqueoDetalle | *(pendiente)* | - | Detalle de arqueo de caja |

---

### ⚙️ Infrastructure (Configuración del Sistema)

Carpeta Prisma: `infrastructure/` → Carpeta NestJS: `src/infrastructure/`

| Modelo Prisma | Ubicación NestJS | Descripción |
|--------------|------------------|-------------|
| PreferenciasSistema | `config/` | Preferencias configurables del sistema |

---

## 🎯 Reglas de Organización

### Criterios para asignar un modelo a un contexto

1.  **¿Quién crea/gestiona este recurso?**
    - Si lo crea el **cliente selbst** → `operations/` (ej. contratos)
    - Si lo crea el **sistema automaticamente** → `billing/` (ej. prefacturas)
    - Si lo crea un **admin** → `identity/` (ej. usuarios)

2.  **¿Qué proceso de negocio representa?**
    - Si es parte del **ciclo del agua** (medidor → lectura → consumo) → `metering/`
    - Si es parte del **ciclo de dinero** (factura → cobro → pago) → `billing/`
    - Si es parte de la **relación comercial** → `operations/`

3.  **¿Dónde tiene más sentido buscarlo?**
    - Un usuario buscando "mis facturas" → `billing/`
    - Un usuario buscando "mi contrato" → `operations/`
    - Un técnico buscando "medidores" → `metering/`

### Convenios: Caso Especial

Los **Convenios** y **CuotaConvenio** son un caso especial importante:

- En Prisma están en `logica-de-negocio/` (junto con Contratos)
- En NestJS deben estar en `billing/collections/` (no en `operations/`)

**Por qué**: Un convenio de pago es un acuerdo de **cobranza**, no una operación comercial básica. El contrato es la relación inicial; el convenio es la negociación cuando esa relación falló y el cliente no puede pagar. Por eso:
- `operations/contracts/` = relación comercial (dar de alta un servicio)
- `billing/collections/convenios/` = cobranza (acuerdo cuando hay mora)

---

## 📁 Estructura Sugerida para billing/

```
src/billing/
├── billing.module.ts
├── billing.md
├── tariffs/                    # ✅ Existe
│   └── ...
├── lote/                     # ✅ Existe
│   └── ...
├── invoices/                 # ⏳ Pendiente
│   ├── dto/
│   ├── types/
│   ├── entities/
│   ├── invoice.service.ts
│   ├── invoice.controller.ts
│   └── ...
├── prefacturas/               # ⏳ Pendiente
│   └── ...
├── collections/               # ⏳ Pendiente (NUEVO)
│   ├── dto/
│   ├── types/
│   ├── entities/
│   ├── convenios/            # Convenios y cuotas
│   │   ├── dto/
│   │   ├── convenios.service.ts
│   │   ├── convenios.controller.ts
│   │   └── ...
│   └── pagos/               # Pagos y cobros
│       ├── dto/
│       ├── pagos.service.ts
│       └── ...
└── sri/                     # ⏳ Pendiente
    ├── formas-pago/
    ├── impuestos/
    └── tipos-comprobante/
```

---

## 🚀 Beneficios de este Enfoque

- **Mantenibilidad**: Los cambios en un contexto (ej. Facturación) tienen un impacto mínimo en otros (ej. Identidad).
- **Escalabilidad**: Es mucho más fácil extraer un contexto a un microservicio independiente si el sistema crece demasiado.
- **Claridad**: Los archivos relacionados están físicamente cerca, eliminando el "salto" constante entre carpetas técnicas distantes.
- **Onboarding**: Un desarrollador nuevo sabe exactamente dónde encontrar la lógica de "medidores" sin tener que buscar en una carpeta global de `services`.

---

## 📝 Leyenda

| Símbolo | Significado |
|--------|------------|
| ✅ | Ya implementado |
| ⏳ | Pendiente de implementar |
| 🆕 | Nuevo en esta versión |