# Auditoría del Módulo SRI — JASRAPO-BACKEND

> **Fecha**: 2026-08-15
> **Alcance**: `backend/src/sri/` — submódulos `emision`, `emisores`, `signature`, `webhooks`
> **Método**: Inspección directa de imports, conteo de HttpExceptions, búsqueda de validaciones de negocio clave.

---

## 1. Estructura del Módulo

```
sri/
├── emision/
│   ├── application/
│   │   ├── services/           sri.service.ts, sri-integration.service.ts
│   │   └── use-cases/          emitir-factura, emitir-nota-credito, emitir-nota-debito,
│   │                           emitir-retencion, emitir-comprobante-manual
│   ├── domain/
│   │   ├── constants/
│   │   ├── interfaces/         comprobante.interface.ts (shapes del XML)
│   │   └── repositories/       comprobante.repository.ts, secuencial.repository.ts (ports abstractos ✅)
│   ├── infrastructure/
│   │   ├── persistence/        prisma-comprobante.repository.ts, prisma-secuencial.repository.ts
│   │   ├── queue/              sri-emision.processor.ts
│   │   ├── soap/               sri-soap.client.ts, sri-soap-factory.service.ts
│   │   ├── storage/            xml-storage.service.ts, pdf.service.ts, template.service.ts
│   │   └── xml/                xml-builder.service.ts, xml-signer.service.ts,
│   │                           clave-acceso.service.ts, catalogo-validator.service.ts
│   └── interfaces/
│       ├── dto/                factura.dto.ts, nota-credito.dto.ts, etc.
│       └── http/               sri.controller.ts, catalogos.controller.ts
├── emisores/                   CRUD de emisores (empresa que emite comprobantes)
├── signature/                  Firma digital de PDFs
├── webhooks/                   Notificaciones salientes post-autorización
└── sri.module.ts
```

---

## 2. Hallazgos Críticos

### 2.1 ❌ Campo "RUC Proveedor" AUSENTE

**Impacto**: Incumplimiento legal activo. Cada comprobante emitido carece del campo obligatorio.

El campo `infoAdicional` existe en la interfaz y el XML builder lo renderiza correctamente. Pero **ningún use-case inyecta el campo `RUC Proveedor` automáticamente**. La estructura existe, el dato no.

Los use-cases solo añaden `email`, `telefono` y `direccion` del comprador al `infoAdicional`:

```
emitir-factura.use-case.ts:671  → push email
emitir-factura.use-case.ts:674  → push telefono
emitir-factura.use-case.ts:677  → push dirección
emitir-factura.use-case.ts:683  → push infoAdicional del DTO (viene del caller)
```

El "RUC Proveedor" no está en ninguna de esas líneas ni en los otros 4 use-cases de emisión.

**Corrección requerida**: en cada use-case de emisión, antes de asignar `infoAdicional`, agregar:

```typescript
infoAdicional.push({
  nombre: 'RUC Proveedor',
  valor: this.configService.getOrThrow<string>('SRI_DEVELOPER_RUC'),
});
```

El valor debe ser configurable vía variable de entorno `SRI_DEVELOPER_RUC` en el `.env`.

---

### 2.2 ❌ HttpExceptions masivas en use-cases de aplicación

Todos los use-cases de emisión lanzan excepciones NestJS desde la capa `application/`, violando la regla de dependencia.

| Use-case | HttpExceptions |
|---|---|
| `emitir-comprobante-manual.use-case.ts` | 9 |
| `emitir-factura.use-case.ts` | 8 |
| `emitir-nota-debito.use-case.ts` | 6 |
| `emitir-nota-credito.use-case.ts` | 5 |
| `emitir-retencion.use-case.ts` | 5 |
| `emisores.service.ts` | ≥ 3 |
| `webhooks.service.ts` | ≥ 2 |

**Total: ~38 HttpExceptions en capa application** que deben ser `DomainException`.

---

### 2.3 ❌ Use-cases importan concretos de infraestructura directamente

`emitir-factura.use-case.ts` (y todos los demás) importan **5 servicios de infraestructura**:

```typescript
import { ClaveAccesoService }  from '../../infrastructure/xml/clave-acceso.service';
import { XmlBuilderService }   from '../../infrastructure/xml/xml-builder.service';
import { XmlSignerService }    from '../../infrastructure/xml/xml-signer.service';
import { SriSoapClient }       from '../../infrastructure/soap/sri-soap.client';
import { XmlStorageService }   from '../../infrastructure/storage/xml-storage.service';
import { SriBaseService }      from '../../infrastructure/xml/sri-base.service';
```

Ninguno de estos tiene un port abstracto en `domain/`. Los use-cases están acoplados a la implementación concreta de la firma, el SOAP y el almacenamiento.

---

### 2.4 ❌ `webhooks.service.ts` inyecta PrismaService directamente

```typescript
// webhooks.service.ts:8
import { PrismaService } from '../../../infrastructure/database/prisma.service';
```

Un service de `application/` con PrismaService crudo — saltea el port de repositorio.

---

### 2.5 ❌ Sin validación RIMPE Negocio Popular + IVA 15%

El sistema almacena `contribuyente_rimpe: boolean` en el emisor (bien), pero **ningún use-case de emisión valida** que un emisor RIMPE no aplique IVA 15%. La restricción legal no existe en código.

---

### 2.6 ❌ Sin validación de fechas retroactivas

Los use-cases reciben `fechaEmision` como string `dd/MM/yyyy` y la parsean directamente sin comparar contra la fecha actual. Cualquier fecha anterior es aceptada sin restricción.

---

### 2.7 ⚠️ Ports de dominio existen pero incompletos

`domain/repositories/comprobante.repository.ts` y `secuencial.repository.ts` existen — punto positivo. Pero los ports de infraestructura transversal (XmlBuilder, XmlSigner, SoapClient, XmlStorage) no tienen abstracción equivalente.

---

### 2.8 ⚠️ `emision.module.ts` exporta concretos en lugar de ports

Según el audit de arquitectura previo, el módulo exporta implementaciones concretas (`SriService`, `XmlSignerService`, etc.) en vez de ports o tokens de DI — lo que obliga a los módulos consumidores a depender de concretos.

---

## 3. Lo que SÍ está bien

- Ports abstractos para `ComprobanteRepository` y `SecuencialRepository` en `domain/` ✅
- `prisma-comprobante.repository.ts` implementa el port correctamente ✅
- `xml-builder.service.ts` renderiza `infoAdicional` y `campoAdicional` correctamente (la estructura XML está lista para recibir el RUC Proveedor) ✅
- `EmisorRepository` abstracto en `emisores/domain/` ✅
- Almacena `contribuyente_rimpe` en el emisor (el dato existe para validar) ✅
- Queue processor para emisión asíncrona ✅
- `catalogo-validator.service.ts` y `identificacion-validator.service.ts` en infraestructura ✅

---

## 4. Priorización

### P0 — Cumplimiento legal inmediato

1. **RUC Proveedor ausente** — agregar en los 5 use-cases de emisión + variable `SRI_DEVELOPER_RUC` en `.env`. **Blocking.**

### P1 — Validaciones de negocio que previenen multas

2. **RIMPE + IVA 15%** — validar en `emitir-factura` y `emitir-nota-debito` antes de construir XML.
3. **Fechas retroactivas** — validar `fechaEmision >= hoy` en todos los use-cases de emisión.

### P2 — Arquitectura

4. **HttpExceptions → DomainException** en los 5 use-cases (~38 ocurrencias).
5. **Ports para XmlBuilder, XmlSigner, SoapClient, XmlStorage** — abstraer para permitir testing sin infraestructura real.
6. **PrismaService fuera de webhooks.service** — mover a través de un port.

---

## 5. Fix Inmediato: RUC Proveedor

Este es el único cambio con urgencia legal. El resto puede ir en iteraciones.

**Archivos a modificar** (mismo patrón en los 5):
- `emision/application/use-cases/emitir-factura.use-case.ts`
- `emision/application/use-cases/emitir-nota-credito.use-case.ts`
- `emision/application/use-cases/emitir-nota-debito.use-case.ts`
- `emision/application/use-cases/emitir-retencion.use-case.ts`
- `emision/application/use-cases/emitir-comprobante-manual.use-case.ts`

**Variable de entorno a agregar**:
```env
# RUC del proveedor de software (requerido por SRI desde 2025)
SRI_DEVELOPER_RUC=XXXXXXXXXXX001
```
