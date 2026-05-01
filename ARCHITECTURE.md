# 🏛️ Screaming Architecture & Context-Based Design

## ¿Qué es "Screaming Architecture"?

El término, acuñado por Uncle Bob, propone que **la arquitectura de un software debe "gritar" su intención**, no los frameworks o las herramientas que utiliza. 

Cuando mirás la carpeta `src/`, no deberías ver "controllers", "models" y "services" (arquitectura técnica), sino **"billing", "identity" y "metering"** (arquitectura de negocio). El objetivo es que cualquier desarrollador pueda entender qué hace el sistema simplemente mirando la estructura de archivos, sin necesidad de abrir una sola línea de código.

## Nuestra Implementación: Arquitectura por Contextos

Hemos estructurado `jasrapo-backend` siguiendo este principio, dividiendo el sistema en contextos de negocio aislados y altamente cohesivos.

### 🗺️ Mapa de Contextos (Bounded Contexts)

1.  **`identity/` (Identidad)**: Gestión de usuarios, autenticación, roles, permisos y sesiones. Es el guardián del acceso al sistema.
2.  **`metering/` (Medición)**: El núcleo operativo del agua. Gestiona dispositivos (medidores) y el ciclo de vida de las lecturas.
3.  **`billing/` (Facturación)**: Transforma la medición en economía. Tarifas, cargos, facturas e integración con el SRI.
4.  **`operations/` (Operaciones)**: Logística y territorio. Clientes, contratos, novedades operativas y la jerarquía de sectores/comunidades.
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

## 🚀 Beneficios de este Enfoque

-   **Mantenibilidad**: Los cambios en un contexto (ej. Facturación) tienen un impacto mínimo en otros (ej. Identidad).
-   **Escalabilidad**: Es mucho más fácil extraer un contexto a un microservicio independiente si el sistema crece demasiado.
-   **Claridad**: Los archivos relacionados están físicamente cerca, eliminando el "salto" constante entre carpetas técnicas distantes.
-   **Onboarding**: Un desarrollador nuevo sabe exactamente dónde encontrar la lógica de "medidores" sin tener que buscar en una carpeta global de `services`.
