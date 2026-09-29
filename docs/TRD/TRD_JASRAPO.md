# Documento de Diseño Técnico (TRD)
# JASRAPO — Sistema Integral de Gestión de Agua Potable, Facturación Electrónica y Recaudación

**Organización:** Junta Administradora de Servicios de Agua Potable de Olón (JASRAPO)  
**Versión:** 1.0  
**Fecha:** Septiembre 2026  
**Estado:** Aprobado / Arquitectura Oficial  

---

## 1. Resumen
JASRAPO es una plataforma integral desarrollada para modernizar, centralizar y automatizar el ciclo operativo, comercial y financiero de la Junta Administradora de Servicios de Agua Potable de Olón (Ecuador).

El sistema cubre desde el registro de abonados, contratos con geolocalización e inspección previa obligatoria, control de inventario y reemplazo de medidores, planificación de rutas y toma móvil de lecturas, hasta el cálculo tarifario escalonado, prefacturación mensual, facturación electrónica legal autorizada por el SRI (firma XAdES-BES PKCS#12 y Web Services SOAP), convenios de pago en cuotas y arqueo diario de caja con validación física estricta.

El sistema se compone de dos aplicaciones principales en el repositorio:
1. **Frontend:** Single Page Application (SPA) y Progressive Web App (PWA) construida con **Angular 21**, **Angular Material**, **Bootstrap 5**, **Leaflet** y soporte offline con `@angular/service-worker`.
2. **Backend:** Monolito Modular desacoplado en capas bajo principios de **Clean Architecture / Hexagonal** utilizando **NestJS 11** y **TypeScript**, con persistencia en **PostgreSQL** mediante **Prisma ORM** y colas asíncronas persistentes gestionadas por **pg-boss**.

---

## 2. Objetivos técnicos
* **Modularidad y bajo acoplamiento:** Organizar el frontend (módulos/componentes Standalone de Angular) y el backend (módulos NestJS) con límites de dominio bien definidos y contratos fuertemente tipados.
* **Integridad transaccional ACID:** Asegurar consistencia financiera absoluta en emisión de prefacturas, pagos, convenios y cuadres de caja en PostgreSQL.
* **Experiencia de usuario y soporte en campo:** Proveer interfaces web responsivas y capacidades offline/PWA para operarios en campo y visores PDF integrados.
* **Desacoplamiento de procesos:** Aislar la latencia del tráfico HTTP síncrono frente a operaciones pesadas de CPU/IO mediante colas durables en segundo plano (`pg-boss`).
* **Cumplimiento tributario SRI:** Integrar generación de XML RIDE v2.1.0, firma digital XAdES-BES con certificados `.p12` y clientes SOAP resilientes.
* **Control de acceso granular:** Implementar autenticación JWT con rotación de sesiones, Guards en Angular y decoradores de permisos en NestJS (`@RequiredPermission`).
* **Observabilidad y trazabilidad:** Instrumentar el sistema con logs JSON estructurados (Pino), trazas distribuidas (OpenTelemetry) y métricas de rendimiento (Prometheus).

---

## 3. Alcance técnico

### 3.1 Incluido
* **Frontend:**
  * Framework **Angular 21** con componentes Standalone, Signals, Reactive Forms y Router.
  * Interfaz de usuario con **Angular Material 21** y utilidades responsivas de **Bootstrap 5.3**.
  * Soporte PWA / Offline con **`@angular/service-worker`** para la toma de lecturas en campo.
  * Mapas interactivos y georreferenciación con **Leaflet** para contratos e inmuebles.
  * Visualización y previsualización de facturas/comprobantes con **`ngx-extended-pdf-viewer`** y **`pdfmake`**.
  * Generación de clientes tipados de API (`scripts/gen-api.ts`).
  * Pruebas End-to-End con **Playwright**.
* **Backend:**
  * Arquitectura de Monolito Modular con **NestJS 11** y **TypeScript**.
  * Persistencia relacional con **PostgreSQL 16** y **Prisma ORM**.
  * 29 submódulos organizados en 6 dominios arquitectónicos.
  * API REST documentada exhaustivamente mediante **OpenAPI / Swagger**.
  * Procesamiento asíncrono durable con **pg-boss**.
  * Firma digital XAdES-BES (`.p12`) y conexión SOAP con el SRI.
  * Generación de comprobantes y hojas de trabajo en PDF con **Puppeteer** y **PDF-Lib**.
  * Almacenamiento con soporte para AWS S3 o disco local.
  * Pruebas unitarias con **Jest** e integración con **Testcontainers**.

### 3.2 Fuera del alcance inicial
* Arquitectura distribuida basada en microservicios independientes.
* Clúster externo de caché Redis (PostgreSQL y caché en memoria cubren la demanda actual).
* Orquestación compleja con Kubernetes (despliegue mediante contenedores Docker / Docker Compose sobre VPS).
* Pasarelas de pago internacionales en tiempo real (Stripe / PayPal).
* Conexión directa a hardware de telemetría o medidores inteligentes IoT.

---

## 4. Principios arquitectónicos

### 4.1 Monolito modular y Frontend desacoplado
El backend se organiza en módulos de dominio cohesivos con Clean Architecture. El frontend consume la API REST a través de servicios tipados y generados automáticamente, manejando su propio estado y ciclo de vida de interfaz.

### 4.2 Separación entre API y worker
Las peticiones HTTP entrantes se atienden mediante controladores síncronos de respuesta rápida. Cualquier tarea computacionalmente pesada (firma digital, renderizado de PDFs, envío de correos electrónicos y consultas SOAP al SRI) se encola en `pg-boss`.

### 4.3 PostgreSQL como fuente de verdad
PostgreSQL es la única fuente de verdad transaccional y de estado. Garantiza integridad referencial mediante claves foráneas y restricciones `CHECK`, atomicidad en cobros mediante transacciones ACID (`$transaction`), y almacenamiento durable tanto para entidades de negocio como para las colas de `pg-boss`.

### 4.4 Procesamiento idempotente
Toda operación asíncrona (como emisión SRI, generación de prefacturas mensuales y conciliación de pagos) se diseña para ser idempotente.

### 4.5 Integraciones mediante adaptadores
Las dependencias externas (servicios SOAP del SRI, motores de renderizado PDF, proveedores de correo SMTP y almacenamiento S3) se implementan detrás de interfaces/puertos (Ports & Adapters).

---

## 5. Decisiones técnicas principales

| Dimensión | Decisión adoptada | Justificación técnica |
| :--- | :--- | :--- |
| **Frontend Framework** | Angular 21 (Standalone + Signals) | Rendimiento, tipado estricto con TypeScript, arquitectura escalable y soporte oficial a largo plazo. |
| **Frontend UI & Estilos** | Angular Material 21 + Bootstrap 5.3 | Componentes accesibles y diseño responsivo para pantallas de escritorio (caja/administración) y móviles (campo). |
| **Capacidades Offline** | `@angular/service-worker` (PWA) | Permite a los lectores registrar lecturas en campo sin interrupciones por pérdida de cobertura celular. |
| **Visualización Geo / PDF** | Leaflet + `ngx-extended-pdf-viewer` | Renderizado nativo de coordenadas satelitales e inspección de comprobantes RIDE directamente en el navegador. |
| **Testing Frontend** | Playwright | Pruebas E2E rápidas y confiables simulando flujos de usuario reales de caja, lectura y contratos. |
| **Framework Backend** | NestJS 11 (Node.js 22+) | Arquitectura modular estructurada, inyección de dependencias nativa y soporte enterprise. |
| **Persistencia / ORM** | PostgreSQL 16 + Prisma ORM | Esquemas relacionales fuertemente tipados, migraciones declarativas y seguridad contra inyecciones SQL. |
| **Colas de Fondo** | pg-boss | Colas durables en PostgreSQL sin infraestructura externa adicional, con soporte de reintentos y transacciones. |
| **Firma Digital** | XAdES-BES con `@signpdf` / `node-forge` | Cumplimiento estricto del estándar técnico del SRI de Ecuador con certificados `.p12`. |
| **Motor de PDF Backend** | Puppeteer + PDF-Lib | Renderizado visual fiel de comprobantes RIDE a partir de HTML/CSS. |
| **Observabilidad** | Pino + OpenTelemetry + Prometheus | Logs estructurados JSON de alto rendimiento y métricas exportables a Prometheus/Grafana. |

---

## 6. Arquitectura general

### 6.1 Capas del Frontend (Angular 21)
1. **Views & Pages (Standalone Components):** Formularios reactivos, tablas paginadas, paneles de caja y mapas interactivos.
2. **State & Services:** Servicios HTTP tipados, manejo reactivo con RxJS y Signals, e interceptores HTTP (inyección de Bearer Token y manejo global de errores).
3. **Guards & Resolvers:** Control de rutas basado en roles y permisos (`AuthGuard`, `PermissionGuard`).
4. **Service Worker:** Caché de assets y soporte de sincronización de datos de lectura.

### 6.2 Capas del Backend (NestJS 11)
1. **Presentation Layer:** Controladores REST con validación de entrada (`ValidationPipe`), Swagger y decoradores `@RequiredPermission`.
2. **Application Layer:** Casos de uso (`*UseCase`) que orquestan la lógica de negocio y coordinan transacciones.
3. **Domain Layer:** Entidades puras, enums, value objects y puertos de repositorios.
4. **Infrastructure Layer:** Repositorios Prisma, clientes SOAP, adaptadores S3/Local, colas pg-boss y mailers.

---

## 7. Organización del monorepo

```
Jasrapo-1/
├── JASRAPO-FRONTEND/         # Aplicación Angular 21
│   ├── src/
│   │   ├── app/              # Componentes, servicios, guards, páginas
│   │   ├── assets/           # Iconos, imágenes, mapas
│   │   └── environments/     # Configuración por entorno
│   ├── scripts/              # Generación de cliente API (gen-api.ts)
│   └── playwright.config.ts  # Configuración de pruebas E2E
│
└── JASRAPO-BACKEND/          # Aplicación NestJS 11
    └── backend/
        └── src/
            ├── operations/   # Clientes, Contratos, Rutas, OTs, Novedades, Sectores
            ├── metering/     # Medidores, Lecturas, Operador de Campo
            ├── billing/      # Facturación, Periodos, Tarifas, Cobranzas (Caja, Convenios, Cortes)
            ├── sri/          # Comprobantes, Firma XAdES, Certificados, SOAP
            ├── reports/      # Motor de reportería y generación de estadísticas
            ├── public-portal/# Búsqueda pública de planillas para abonados
            └── infrastructure/# Database (Prisma), Mail, PDF, Storage, Observability, Jobs
```

---

## 8. Unidades de despliegue
* **Contenedor Frontend (`frontend`):** Build de producción compilado de Angular servido mediante Nginx con compresión gzip/brotli y caché de estáticos.
* **Contenedor API & App (`backend`):** Proceso NestJS ejecutando la API REST HTTP y los listeners de eventos.
* **Contenedor Base de Datos (`postgres`):** Instancia de PostgreSQL 16 con extensiones y esquema `jobs` para pg-boss.
* **Contenedor Proxy Inverso (`nginx-gateway`):** Proxy perimetral con terminación SSL/TLS, enrutamiento a `/api/v1` hacia el backend y `/` hacia el frontend.

---

## 9. Módulos del sistema

### 9.1 Reglas entre módulos
1. Cada módulo en el backend es propietario de sus tablas, entidades y casos de uso.
2. La comunicación inter-módulo se realiza mediante casos de uso exportados o eventos de dominio (`@nestjs/event-emitter`).
3. El frontend consume únicamente las APIs expuestas en los contratos OpenAPI.
4. Los DTOs de transporte HTTP nunca se utilizan como modelos de dominio interno.
5. Se prohíben dependencias circulares mediante inyección de interfaces.

---

## 10. Contratos e integraciones

### 10.1 API
* Prefijo global: `/api/v1`.
* Formato de transporte: JSON con `Content-Type: application/json`.
* Identificadores `BigInt` serializados como `string` en respuestas JSON.

### 10.2 Estructura de errores (RFC 7807)
```json
{
  "statusCode": 400,
  "message": "Mensaje descriptivo del error",
  "error": "Bad Request",
  "timestamp": "2026-09-23T17:30:00.000Z",
  "path": "/api/v1/contracts"
}
```

### 10.3 Base de datos
Acceso exclusivo mediante Prisma Client tipado y transacciones seguras con `$transaction`.

### 10.4 Correo electrónico
Integración SMTP mediante Nodemailer con plantillas Handlebars compiladas para notificaciones de RIDE y avisos de cobro.

### 10.5 Almacenamiento de archivos
Adaptador `StorageService` con soporte para AWS S3 o almacenamiento en sistema de archivos local para XMLs firmados y PDFs generados.

### 10.6 Convención de respuestas
Respuestas paginadas estándar:
```json
{
  "data": [ ... ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

---

## 11. Persistencia y convenciones de datos
* Convención de nombrado: `snake_case` en columnas SQL y `camelCase` en TypeScript.
* Manejo de borrado lógico mediante columna `deleted_at: timestamp | null`.
* Auditoría estándar con `created_at` y `updated_at`.
* Valores monetarios modelados con `Decimal(12, 2)` para evitar imprecisiones de coma flotante.

---

## 12. Gestión de conexiones
* Pool de conexiones administrado por Prisma y `pg` nativo.
* Configuración de pool dimensionada: 20 conexiones máximas para la API y 10 conexiones dedicadas para workers de `pg-boss`.

---

## 13. Autenticación y seguridad
* **JWT (JSON Web Tokens):** Tokens de acceso firmados con expiración corta (1h) y refresh tokens almacenados de forma segura en cookies `HttpOnly`.
* **Cifrado de contraseñas:** Algoritmo bcrypt con factor de costo 10.
* **Control de acceso:** Decorador `@RequiredPermission(recurso, accion)` validado por `PermissionsGuard` en el backend y evaluado por directivas/guards en Angular.
* **Seguridad perimetral:** Helmet para cabeceras HTTP seguras, CORS restringido y rate limiting con `@nestjs/throttler` (máximo 100 req/min por IP).

---

## 14. Flujos técnicos críticos

### 14.1 Inserción transaccional de jobs
Al emitir facturación mensual, los comprobantes se guardan en base de datos y los jobs de firmado/envío al SRI se insertan dentro de la misma transacción PostgreSQL.

### 14.2 Ciclo del contrato con inspección previa
1. Frontend envía `POST /api/v1/contracts`: Crea contrato en `PENDIENTE_INSPECCION` y emite Orden de Trabajo de Inspección.
2. OT de inspección completada con éxito $\rightarrow$ Dispara generación de prefactura de instalación y pasa a `PENDIENTE_PAGO`.
3. Pago recibido en ventanilla $\rightarrow$ Pasa a `PENDIENTE_INSTALACION` $\rightarrow$ OT de instalación completada $\rightarrow$ Pasa a `ACTIVO`.

### 14.3 Cuadre y cierre de caja diario
1. Cajero accede a preparación de cuadre en la SPA a las 19:00.
2. El backend calcula cobros registrados en el día (efectivo, cheques, transferencias).
3. Cajero ingresa conteo físico. Si `diferencia !== 0`, el botón de confirmación se deshabilita en la interfaz.
4. Al cuadrar a cero, se confirma el cierre, marcando la caja como inmutable.

### 14.4 Refacturación auditada
Cualquier edición de un borrador de prefactura exige un DTO con `motivo` (mínimo 10 caracteres) y registra automáticamente el `userId` en la tabla de auditoría.

### 14.5 Emisión y firma electrónica SRI
1. Módulo SRI genera XML según ficha técnica v2.1.0.
2. Módulo criptográfico firma con certificado `.p12` (estándar XAdES-BES).
3. Envío al Web Service de Recepción del SRI vía SOAP.
4. Si es RECIBIDA, consulta el Web Service de Autorización hasta obtener número de autorización y clave de acceso.

---

## 15. Procesamiento asíncrono
Gestionado íntegramente por `pg-boss` en el esquema `jobs`:
* Cola `sri:sign-and-send`: Firma y autorización ante el SRI (concurrencia: 5, reintentos: 3).
* Cola `pdf:generate-ride`: Renderizado de PDFs con Puppeteer (concurrencia: 3).
* Cola `mail:send-receipt`: Envío de correos electrónicos con comprobantes adjuntos (concurrencia: 10).

---

## 16. Estrategia de caché
* **Frontend:** Caché de Service Worker para assets estáticos y plantillas HTML.
* **Backend:** Caché en memoria en proceso (`CacheModule`) para catálogos estáticos de baja mutabilidad: tipos de identificación, categorías tarifarias activas y rubros base (TTL de 1 hora con invalidación automática).

---

## 17. Estrategia de testing
* **Frontend Tests:** Pruebas E2E con **Playwright** (`pnpm run e2e`) verificando flujos de recaudación, login, contratos y visualización de reportes.
* **Backend Unit Tests (Jest):** Cobertura de lógica de negocio en use cases, entidades y servicios (`pnpm test`).
* **Backend Integration Tests (Testcontainers):** Pruebas de repositorios y transacciones sobre PostgreSQL real en Docker (`pnpm run test:integration`).
* **Load Tests (k6):** Pruebas de estrés para la generación masiva de PDFs y procesamiento de cobros en caja (`pnpm run test:load:pdf`).

---

## 18. Entornos
* **Desarrollo (Local):** `ng serve` (puerto 4200) conectado a `nest start:dev` (puerto 3000), PostgreSQL local en Docker, MailHog (SMTP mock) y ambiente de pruebas SRI.
* **Staging / Pruebas:** Servidor de pruebas conectado al ambiente de pruebas del SRI (Web Services de test).
* **Producción:** Nginx sirviendo el build de Angular y balanceando hacia la API NestJS con certificados `.p12` reales y Web Services de producción del SRI.

---

## 19. Despliegue y migraciones

### 19.1 Procedimiento general
1. Ejecución de suite de integración, linter y compilación en CI (`pnpm run ci` en frontend y backend).
2. Generación de imágenes Docker etiquetadas por commit.
3. Despliegue en servidor con `docker compose pull && docker compose up -d`.

### 19.2 Migraciones compatibles
* Ejecución de migraciones declarativas mediante `prisma migrate deploy` previo al arranque de la nueva versión del contenedor.
* Regla de cambios no destructivos: adición de columnas antes de eliminación de campos obsoletos.

---

## 20. Observabilidad
* **Logs estructurados:** Implementación de Pino Logger emitiendo JSON con `traceId`, `userId` y nivel de severidad.
* **Métricas:** Exportador Prometheus en `/metrics` recolectando duración de peticiones HTTP, estado del pool de conexiones y tamaño de colas pg-boss.
* **Health Checks:** Endpoint `/health` con NestJS Terminus monitoreando disponibilidad de PostgreSQL y almacenamiento.

---

## 21. Backups y recuperación
* **Respaldos de Base de Datos:** `pg_dump` automatizado diario a las 02:00 UTC con compresión y rotación de 30 días.
* **Respaldos de Archivos:** Sincronización diaria de XMLs autorizados y certificados cifrados hacia almacenamiento secundario.
* **RTO (Recovery Time Objective):** < 2 horas.
* **RPO (Recovery Point Objective):** < 24 horas.

---

## 22. Disponibilidad y tolerancia a fallos
* Reinicio automático de contenedores (`restart: unless-stopped`).
* Reintentos exponenciales con backoff ante caídas temporales de los Web Services del SRI.
* Cola de reintentos en `pg-boss` para envíos de correo fallidos.

---

## 23. Estrategia de escalamiento

### 23.1 Primera versión
Monolito modular y SPA desplegados en una única instancia VPS (4 vCPUs, 8 GB RAM) con Nginx, PostgreSQL optimizado y workers encolados localmente.

### 23.2 Escala media
Separación del contenedor de workers de `pg-boss` a una instancia dedicada para aislar el consumo de CPU de Puppeteer y firmas criptográficas del tráfico HTTP.

### 23.3 Mayor escala
Base de datos PostgreSQL en servidor dedicado con réplica de lectura para consultas pesadas de reportería y balanceador de carga Nginx distribuyendo a múltiples réplicas de la API.

---

## 24. Criterios para extraer microservicios
Solo se evaluará extraer un microservicio independiente si:
1. El módulo del SRI experimenta picos de emisión tan elevados que afecte la memoria de la API principal.
2. Se requiera un equipo de desarrollo dedicado exclusivamente a la integración de telemedición / IoT en tiempo real.

---

## 25. Riesgos técnicos
* **Intermitencia del SRI:** Caídas del portal del SRI durante días de emisión masiva (mitigado con buffer en colas pg-boss y reintentos automáticos).
* **Consumo de memoria por Puppeteer:** Fugas de memoria en renderizado de PDFs (mitigado con reciclaje de instancias Chromium y concurrencia limitada).

---

## 26. Decisiones pendientes
* Definición de contingencia operativa para pagos presentados post-cierre de caja de las 19:00.
* Selección de proveedor para pasarela bancaria nacional (Deuna / Banco del Barrio).

---

## 27. Checklist de revisión
- [x] Stack del Frontend (Angular 21, Material, Leaflet, PWA, Playwright) formalizado.
- [x] Separación en 6 dominios y 29 submódulos documentada.
- [x] Integración de firma XAdES-BES y comprobantes SRI formalizada.
- [x] Flujo de inspección técnica previa en contratos detallado.
- [x] Reglas de inmutabilidad en cierre de caja y auditoría en refacturación definidas.
- [x] Configuración de colas asíncronas con pg-boss especificada.

---

## 28. Documentos relacionados
* [PRD_JASRAPO.md](file:///home/yan2005dris-afk/Documentos/GitHub/Jasrapo-1/JASRAPO-BACKEND/docs/PRD/PRD_JASRAPO.md): Documento de Requisitos de Producto.
* [00-introduccion.md](file:///home/yan2005dris-afk/Documentos/GitHub/Jasrapo-1/JASRAPO-BACKEND/docs/requisitos/Contratos/modulos/00-introduccion.md): Documentación del Dominio de Contratos y Módulos.
