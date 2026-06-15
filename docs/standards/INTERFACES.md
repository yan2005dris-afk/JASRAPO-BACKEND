# Estándar de Interfaces TypeScript

## Regla del prefijo `I`

Toda interfaz TypeScript en este proyecto lleva el prefijo `I`.

```ts
// ✅ Correcto
export interface IStorageService { ... }
export interface IResponseFactura { ... }
export interface IMailProvider { ... }

// ❌ Incorrecto
export interface StorageService { ... }
export interface ResponseFactura { ... }
```

**Excepción:** objetos de configuración o parámetros que no son contratos de comportamiento
ni tipos de respuesta de dominio pueden omitir el prefijo.

```ts
// ✅ Sin prefijo — son shapes de configuración, no contratos
export interface UploadOptions { ... }
export interface SendMailOptions { ... }
```

---

## Idioma de campos vs. métodos

Las interfaces tienen dos partes con reglas distintas:

| Parte | Idioma | Razón |
|-------|--------|-------|
| **Campos / propiedades** | Español | Mapean a columnas de la base de datos (Prisma) |
| **Métodos** | Inglés | El código ejecutable es siempre en inglés |

### Interfaces de respuesta (tipos de DB)

Los campos reflejan exactamente el nombre de la columna en Prisma/PostgreSQL.

```ts
// ✅ Correcto — campos en español, mapean a columnas DB
export interface IResponseLectura {
  lecturaId: string;
  fecha: Date;
  lecturaActual: number;
  consumoCalculado: number;
  estado: string;
}

export interface IResponseFactura {
  facturaId: string;
  numeroSecuencial: string;
  fechaEmision: Date;
  importeTotal: number;
  estadoSri: string;
}

// ❌ Incorrecto — campos en inglés rompen concordancia con DB
export interface IResponseInvoice {
  invoiceId: string;
  sequentialNumber: string;
  emissionDate: Date;
}
```

### Interfaces de comportamiento (ports / contratos)

Los métodos en inglés, los parámetros pueden ser en inglés si son genéricos o en español
si reciben datos de dominio.

```ts
// ✅ Correcto — métodos en inglés, interfaz con prefijo I
export interface IStorageService {
  upload(bucket: string, key: string, buffer: Buffer): Promise<UploadResult>;
  getUrl(bucket: string, key: string, expiresInSeconds?: number): Promise<string>;
  delete(bucket: string, key: string): Promise<void>;
  exists(bucket: string, key: string): Promise<boolean>;
}

export interface IMailProvider {
  send(options: SendMailOptions): Promise<MailResult>;
}

// ✅ Correcto — repositorio de dominio, método en inglés, parámetro en español
export interface IFacturaRepository {
  findById(facturaId: string): Promise<IResponseFactura | null>;
  findByCliente(clienteId: string): Promise<IResponseFactura[]>;
  save(factura: CrearFacturaDto): Promise<IResponseFactura>;
}
```

---

## Ubicación de archivos

| Tipo de interfaz | Carpeta | Nombre de archivo |
|-----------------|---------|-------------------|
| Respuesta de dominio (DB) | `<modulo>/domain/types/` | `IResponse<Entidad>.ts` |
| Contrato de puerto (port) | `<modulo>/domain/interfaces/` | `<nombre>.interface.ts` |
| Contrato de proveedor (infra) | `infrastructure/<servicio>/interfaces/` | `<nombre>.interface.ts` |

```
metering/
└── reading-anomaly/
    └── types/
        └── IResponseReadingAnomaly.ts     ← tipo de respuesta DB

infrastructure/
└── storage/
    └── interfaces/
        └── storage.interface.ts           ← IStorageService (port)
└── mail/
    └── interfaces/
        └── mail-provider.interface.ts     ← IMailProvider (port)
```

---

## Resumen rápido

```
Interfaz de respuesta DB  →  prefijo I  +  campos en ESPAÑOL
Interfaz de comportamiento →  prefijo I  +  métodos en INGLÉS
Shape de configuración    →  sin prefijo +  campos en inglés
```

---

> Relacionado: [AGENTS.md](../AGENTS.md) — tabla completa de naming por capa.
> Relacionado: [README.md](./README.md) — índice de todos los estándares.
