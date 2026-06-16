# Report Format Templates — Task List

## Contexto del Proyecto

- **Stack**: NestJS 11 + Prisma 7 + PostgreSQL
- **Generación PDF**: Puppeteer + Handlebars (`.hbs`) en `backend/src/infrastructure/pdf/`
- **Template engine**: Handlebars con helpers `math` y `eq`
- **Patrón PDF**: `PdfDocumentType` + `PdfService` + template HBS
  - Cada documento/tipo de reporte registra un `PdfDocumentType` con `{ type, name, template, adaptData() }`
  - `PdfService.generate(type, raw)` → adapta datos → renderiza HBS → Puppeteer → PDF
  - Registro via `registerDocumentType()` en módulos con `useFactory`
- **Formatos de salida actuales**: PDF (solo)
- **Formatos legacy a recuperar**: PDF, XLSX, RTF, ODT, CSV

### Archivos de Referencia

Los formatos físicos originales están en `Files JASRAP-Olon/` como PDFs de referencia:

```
Files JASRAP-Olon/
├── Facturas y Comprobantes/
│   ├── Factura Ejemplo.pdf                           # Factura física (papel)
│   └── Comprobante de Pago Ejemplo.pdf               # Recibo de pago
├── Reportes/
│   ├── Convenio de Pago.pdf                          # Convenio de pago impreso
│   ├── Reporte de Abonos.pdf                         # Reporte de pagos
│   └── Reporte Historal de Conexion.pdf              # Historial de conexión
├── Tipo Uno/
│   ├── Estado de Cuenta (Planilla) Tipo Uno Ejemplo Uno.pdf
│   ├── Estado de Cuenta (Planilla) Tipo Uno Ejemplo Dos.pdf
│   ├── Estado de Cuenta (Planilla) Tipo Uno Ejemplo Tres.pdf
│   ├── Solicitud para conexion Tipo Uno.pdf
│   ├── Acta de Responsabilidad Tipo Uno.pdf
│   ├── Convenio de Pago Tipo Uno.pdf
│   └── Obligaciones del Usuario Tipo Uno.pdf
├── Tipo Dos/
│   ├── Solicitud para conexion Tipo Dos.pdf
│   ├── Acta de Responsabilidad Tipo Dos.pdf
│   └── Obligaciones del Usuario Tipo Dos.pdf
└── Diagramas/ ...                                     # Diagramas de flujo/estado
```

---

## 1. Formato Base Actual (CSS + HBS)

### 1.1. Paleta y Estilo Consistente

| Elemento | Valor | Uso |
|----------|-------|-----|
| Color primario | `#0066cc` | Headers, títulos, bordes, badges |
| Color hover/active | `#e8f0fe` / `#f5f8ff` | Filas pares, info-boxes |
| Color danger | `#cc0000` / `#c0392b` | Deuda total, estados inactivos |
| Color success | `#1a7a2e` | Estados activos |
| Fondo general | `#ffffff` | Containers |
| Borde | `#ddd`, `#e0e0e0` | Tablas, separadores |
| Texto cuerpo | `#333` | Contenido principal |
| Texto secundario | `#666` / `#555` | Labels, metadatos |
| Texto footer | `#aaa` / `#999` | Footer |

### 1.2. Estructura de Plantilla (Patrón Reconocible)

Todas las templates .hbs siguen esta estructura:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    /* Reset: * { margin:0; padding:0; box-sizing:border-box; } */
    /* Body: font-family: Arial, sans-serif; font-size: 11-12px; color: #333; */
    /* Container: width: 100%; padding: 20px; */

    /* ─── HEADER ─────────────────────────────── */
    /* .header: border-bottom: 2px solid #0066cc */
    /*   Logo/Company: .company-name (16-18px bold #0066cc) */
    /*   Report title: .report-title (16-18px bold #0066cc) */
    /*   Meta: .report-meta (9-10px #666) */

    /* ─── INFO BOX ───────────────────────────── */
    /* .info-box: background #f5f8ff, border #c8d8f5, border-radius 4px */
    /* .label: bold #666, width 120px */

    /* ─── DATA TABLE ─────────────────────────── */
    /* table.data th: background #0066cc, white text, padding 7px */
    /* table.data td: border-bottom #e0e0e0, padding 6px */
    /* table.data tr.even: background #f5f8ff */
    /* table.data tr.total-row: background #0066cc, white, bold */

    /* ─── TOTALS ─────────────────────────────── */
    /* .totals-wrapper: text-align right */
    /* .totals-table: width 280-300px, margin-left auto */
    /* .total-row td: border-top 2px solid #0066cc, bold */

    /* ─── FOOTER ─────────────────────────────── */
    /* .footer: margin-top 24px, text-align center, 9px #aaa/#999 */
    /*            border-top 1px solid #ddd */
  </style>
</head>
<body>
  <div class="container">
    <!-- Header: tabla con logo JASRAPO (izq) + título/fechas (der) -->
    <!-- Cuerpo: info-box + tablas -->
    <!-- Footer: "Reporte generado por el sistema JASRAPO" -->
  </div>
</body>
</html>
```

### 1.3. Componentes Reutilizables Identificados

| Componente | Templates que lo usan |
|------------|----------------------|
| **Header simple** (JASRAPO + título + fecha) | Todos los reportes (clients-list, payments-report, connection-history, account-statement) |
| **Header documento** (JASRAPO + N° documento + período badge) | pre-invoice |
| **Header formulario** (JASRAPO + número circular + fecha) | connection-request, responsibility-agreement, payment-agreement |
| **Info Box** (fondo azul claro, borde) | account-statement, connection-history |
| **Tabla simple** (cabecera azul, filas alternadas) | clients-list, payments-report |
| **Tabla con totales** (fila total azul) | connection-history, pre-invoice, payments-report |
| **Tabla con subtotales** (fondo azul medio) | account-statement, payments-report |
| **Badge** (azul, texto blanco) | pre-invoice, clients-list |
| **Firma** (línea punteada, nombre, CI, rol) | payment-agreement, responsibility-agreement |
| **Sección cláusulas** (lista numerada) | responsibility-agreement |
| **Footer estándar** | Todos los reportes |
| **Footer documento legal** (RUC, datos) | connection-request, payment-agreement, responsibility-agreement |

### 1.4. Esquema de Datos (reporte.*)

Todos los reportes siguen una convención de datos en la raíz `reporte`:

```typescript
interface ReporteBase {
  titulo: string;
  fechaEmision: string;
  rangoFechas?: string;       // para reportes con filtro temporal
}

// Reportes con información de cuenta:
interface ReporteConCuenta extends ReporteBase {
  cuenta: string;
  clienteNombre: string;
  clienteIdentificacion?: string;
  clienteDireccion?: string;
  medidor: string;
}
```

---

## 2. Mapeo: Referencia PDF → Template Actual

| PDF Referencia (`Files JASRAP-Olon/`) | Template HBS | Document Type | Módulo | Estado |
|---------------------------------------|-------------|---------------|--------|--------|
| `Tipo Uno/*Estado de Cuenta*` | `account-statement.hbs` | `account-statement` | `reports/` | ✅ Implementado |
| `Reportes/Reporte de Abonos.pdf` | `payments-report.hbs` | `payments-report` | `reports/` | ✅ Implementado |
| `Reportes/Reporte Historial de Conexion.pdf` | `connection-history.hbs` | `connection-history` | `reports/` | ✅ Implementado |
| — | `clients-list.hbs` | `clients-list` | `reports/` | ✅ Implementado |
| `Facturas y Comprobantes/Factura Ejemplo.pdf` | `pre-invoice.hbs` | `pre-invoice` | `billing/pre-invoice/` | ✅ Implementado (pre-factura) |
| `Facturas y Comprobantes/Comprobante de Pago Ejemplo.pdf` | — | — | ❌ No implementado |
| `Tipo Uno/Solicitud para conexion Tipo Uno.pdf` | `connection-request.hbs` | `connection-request` | `operations/contracts/` | ✅ Implementado |
| `Tipo Dos/Solicitud para conexion Tipo Dos.pdf` | — (Tipo 2) | — | ❌ Pendiente |
| `Tipo Uno/Acta de Responsabilidad Tipo Uno.pdf` | `responsibility-agreement.hbs` | `responsibility-agreement` | `operations/contracts/` | ✅ Implementado |
| `Tipo Dos/Acta de Responsabilidad Tipo Dos.pdf` | — (Tipo 2) | — | ❌ Pendiente |
| `Tipo Uno/Convenio de Pago Tipo Uno.pdf` | `payment-agreement.hbs` | `payment-agreement` | `billing/agreements/` | ✅ Implementado |
| `Reportes/Convenio de Pago.pdf` | `payment-agreement.hbs` | `payment-agreement` | `billing/agreements/` | ✅ Implementado |
| `Tipo Uno/Obligaciones del Usuario Tipo Uno.pdf` | — | — | ❌ No implementado |
| `Tipo Dos/Obligaciones del Usuario Tipo Dos.pdf` | — (Tipo 2) | — | ❌ No implementado |

---

## 3. Reportes que Genera Actualmente el Sistema

### 3.1. Reportes via `reports/` module (endpoint: `GET /reports/`)

| Endpoint | Document Type | Template | Descripción | Filtros |
|----------|--------------|----------|-------------|---------|
| `GET /reports/clients-list` | `clients-list` | `clients-list.hbs` | Listado de clientes con filtros | mismos que listado clientes |
| `GET /reports/payments-report` | `payments-report` | `payments-report.hbs` | Reporte de abonos/pagos aplicados | rango fechas, cliente |
| `GET /reports/connection-history` | `connection-history` | `connection-history.hbs` | Historial de facturación por período | rango fechas, cuenta |
| `GET /reports/account-statement` | `account-statement` | `account-statement.hbs` | Estado de cuenta completo por contrato | rango fechas (default: últimos 6 períodos) |
| `GET /reports/types` | — | — | Lista los tipos registrados en PdfService | — |

### 3.2. PDFs Documentales (no reportes, generados desde sus módulos)

| Endpoint | Document Type | Template | Módulo |
|----------|--------------|----------|--------|
| `GET /pre-invoices/:id/pdf` | `pre-invoice` | `pre-invoice.hbs` | `billing/pre-invoice/` |
| `GET /agreements/:id/pdf` | `payment-agreement` | `payment-agreement.hbs` | `billing/agreements/` |
| `GET /contracts/:id/connection-request/pdf` | `connection-request` | `connection-request.hbs` | `operations/contracts/` |
| `GET /contracts/:id/responsibility-agreement/pdf` | `responsibility-agreement` | `responsibility-agreement.hbs` | `operations/contracts/` |

### 3.3. Arquitectura de Generación

```
Controller (ReportsController u otro)
  → llama a PdfService.generate(type, rawData)
    → PdfService busca PdfDocumentType registrado por type
      → ejecuta adaptData(raw) → shape para template HBS
        → renderiza con Handlebars (template.hbs + data)
          → Puppeteer convierte HTML → PDF (A4)
```

**Registro de tipos**: Cada módulo registra su `PdfDocumentType` via `useFactory`:

```typescript
// Ejemplo típico de provider:
{
  provide: 'ACCOUNT_STATEMENT_PDF_REGISTRAR',
  useFactory: (pdfService: PdfService) => {
    pdfService.registerDocumentType(AccountStatementPdfDocumentType);
    return pdfService;
  },
  inject: [PdfService],
}
```

---

## 4. Reportes del Sistema Legacy NO Migrados

Basado en `docs/legacy/06-reportes/reportes.md`:

| Reporte Legacy | Estado | Prioridad | Notas |
|----------------|--------|-----------|-------|
| **Reporte de Facturación** (Detallado / Resumido mes-sector / Resumido sector-mes) | ❌ No migrado | Alta | Muestra cuenta, cliente, lecturas, consumo, cargos por período. Formato: PDF, XLSX, CSV |
| **Reporte Estado de Cuenta Otros Servicios** | ❌ No migrado | Media | Similar al estado de cuenta pero para otros ingresos (inspecciones, servicios) |
| **Reporte de Tasa de Seguridad** | ❌ No migrado | Baja | Solo aplica para Olón. Muestra tasa de seguridad por cuenta |
| **Factura SRI** (electrónica autorizada) | ❌ No migrado | Alta | Diferente de la prefactura. Debe cumplir formato SRI. Hay un módulo `sri/` parcial |
| **Formato XLSX/CSV** para reportes | ❌ No migrado | Media | Legacy soportaba XLSX, RTF, ODT, CSV. Hoy solo PDF |

### 4.1. Reporte de Facturación — Pendiente

**Caso de uso**: Generar reporte de facturación de un lote/periodo completo (no por cliente).

**Filtros legacy**:

| Campo | Descripción |
|-------|-------------|
| sector | Filtrar por sector/comunidad |
| año_consumo | Periodo |
| mes_consumo | Mes |
| tipo | Detallado / Resumido mes-sector / Resumido sector-mes |
| formato | PDF, XLSX, CSV |

**Campos legacy**:

| Campo | Descripción |
|-------|-------------|
| cuenta | Número de cuenta |
| cliente | Nombre |
| lectura_actual | Lectura actual |
| lectura_anterior | Lectura anterior |
| consumo | m³ |
| valor_consumo | Valor del consumo |
| interes_mora | Interés mora |
| tasa_seguridad | Tasa seguridad |
| subtotal | Subtotal |
| descuento | Descuento |
| convenio | Convenio activo |
| total | Total |

---

## 5. Propuesta de Nuevo Formato Mejorado

### 5.1. Problemas del Formato Actual

1. **CSS duplicado**: Cada template HBS tiene su propio bloque `<style>` con el mismo código repetido. No hay un `base.css` compartido.
2. **Sin responsive**: Las templates están pensadas solo para PDF (A4). No funcionan para previsualización web ni móvil.
3. **Sin diseño modular**: Componentes como header, footer, info-box, signature están duplicados en cada template.
4. **Sin helpers compartidos**: `math` y `eq` están hardcodeados en `PdfService`. No hay helpers para formato monetario, fechas, etc.
5. **Sin tipado estricto**: `adaptData` usa `Record<string, any>`, no hay interfaces compartidas entre templates.
6. **Sin variantes por tipo de cliente**: Tipo 1 (doméstico) vs Tipo 2 (comercial) comparten template pero tienen campos diferentes.

### 5.2. Formato Mejorado Propuesto

#### a) CSS Base Compartido

Crear `templates/base.css` con estilos comunes que se inyectan en todas las templates:

```css
/* base.css — compartido por todas las plantillas */
/* NOVEDADES respecto al formato actual: */
/* 1. Variables CSS para tema */
/* 2. Clases utilitarias reutilizables */
/* 3. Soporte para @page A4 */
/* 4. Print-specific overrides */

:root {
  --color-primary: #0066cc;
  --color-primary-dark: #004999;
  --color-primary-light: #e8f0fe;
  --color-bg-alt: #f5f8ff;
  --color-danger: #cc0000;
  --color-success: #1a7a2e;
  --color-text: #333;
  --color-text-muted: #666;
  --color-border: #ddd;
  --font-family: Arial, sans-serif;
  --font-size-base: 11px;
}

@page { margin: 20mm 15mm; }
```

#### b) Layout con Partials (Handlebars partials)

En vez de repetir el header, usar partials:

```handlebars
{{> header title=reporte.titulo fecha=reporte.fechaEmision}}
{{> info-box-cuenta cuenta=reporte.cuenta cliente=reporte.clienteNombre}}
{{> data-table columns=columns rows=rows totals=totals}}
{{> footer}}
```

#### c) Side-by-side de Formatos: Actual vs Mejorado

| Aspecto | Formato Actual | Formato Mejorado Propuesto |
|---------|---------------|---------------------------|
| CSS | `style` inline en cada HBS | CSS compartido + variables temáticas |
| Header | Copiado manual en cada archivo | Partial `{{> header}}` |
| Footer | Copiado manual en cada archivo | Partial `{{> footer}}` |
| Info Box | Copiado manual | Partial `{{> info-box}}` |
| Signature | Copiado manual | Partial `{{> signature}}` |
| Helpers | `math`, `eq` (hardcodeados) | `formatMoney`, `formatDate`, `ifEven`, `ifActive` |
| Tipado | `Record<string, any>` | Interfaces por tipo de documento |
| Previsualización | Solo PDF | PDF + vista web responsiva |
| Paleta de colores | Colores fijos | Variables CSS |
| Variantes | Sin soporte | Layout switches por tipo de cliente |
| Tablas con subtotales | Estilo inconsistente | Clase `.table-group` normalizada |
| Estados (deuda/activo) | Colores hardcodeados | Clases utilitarias `.text-danger`, `.text-success` |

#### d) Esquema de Interfaces Tipadas

```typescript
// interfaces/pdf-templates.interface.ts
export interface ReportHeader {
  companyName: string;
  companySub: string;
  ruc: string;
  title: string;
  subtitle?: string;
  date: string;
  period?: string;
  documentNumber?: string;
  badge?: string;
}

export interface DataColumn {
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'money' | 'number' | 'date';
}

export interface DataRow {
  cells: Record<string, string | number>;
  isTotal?: boolean;
  isSubtotal?: boolean;
  isDanger?: boolean;
}

export interface ReportTotals {
  rows: Array<{ label: string; value: string; isTotal?: boolean }>;
  grandTotal?: string;
}
```

### 5.3. Estrategia de Implementación

| Fase | Qué | Impacto |
|------|-----|---------|
| **F1** | Extraer CSS base y crear `templates/base.css` | Refactor, sin cambio visual |
| **F2** | Crear partials de Handlebars (header, footer, info-box, signature, data-table) | Refactor progresivo |
| **F3** | Agregar helpers de formato (`formatMoney`, `formatDate`) en PdfService | Feature |
| **F4** | Tipar `PdfDocumentType.adaptData()` y crear interfaces | Refactor |
| **F5** | Refactor templates existentes para usar partials + CSS base | Refactor |
| **F6** | Implementar formatos faltantes (Tipo 2, Obligaciones, Factura SRI) | Nuevo |
| **F7** | Agregar soporte XLSX/CSV para reportes tabulares | Feature |
| **F8** | Implementar Reporte de Facturación (lote completo) | Nuevo |
| **F9** | Implementar Reporte Estado de Cuenta Otros Servicios | Nuevo |
| **F10** | Implementar Comprobante de Pago PDF | Nuevo |

---

## 6. Resumen de Archivos y Templates

### Templates Actuales (8)

| Archivo HBS | Document Type | Líneas | Propósito |
|-------------|--------------|--------|-----------|
| `pre-invoice.hbs` | `pre-invoice` | ~128 | Prefactura mensual con detalle de cargos |
| `account-statement.hbs` | `account-statement` | ~197 | Estado de cuenta completo por año/mes |
| `connection-history.hbs` | `connection-history` | ~125 | Historial de facturación por período |
| `payments-report.hbs` | `payments-report` | ~126 | Reporte de abonos con subtotales por factura |
| `clients-list.hbs` | `clients-list` | ~106 | Listado de clientes con estado |
| `connection-request.hbs` | `connection-request` | ~235 | Solicitud formal de conexión (formulario) |
| `responsibility-agreement.hbs` | `responsibility-agreement` | ~121 | Acta de responsabilidad con cláusulas |
| `payment-agreement.hbs` | `payment-agreement` | ~111 | Convenio de pago con firmas |

### Archivos del Sistema de Reportes

```
backend/src/
├── infrastructure/pdf/
│   ├── pdf.service.ts                    # Servicio principal de generación PDF
│   ├── pdf.module.ts                     # Módulo global exportable
│   ├── document-type.interface.ts        # Interfaz PdfDocumentType
│   └── templates/                        # 8 archivos .hbs
├── reports/
│   ├── reports.module.ts                 # Módulo de reportes
│   ├── interfaces/
│   │   ├── http/reports.controller.ts    # 5 endpoints (clients, payments, connection, account, types)
│   │   └── report-spec.interface.ts      # Interfaz IReportSpec
│   ├── specs/                            # 4 specs (fetchData + filtros)
│   ├── pdf/                              # 4 pdf-providers + 4 pdf-types
│   └── dto/                              # 4 filter DTOs
├── billing/pre-invoice/pdf/              # Pre-invoice PDF type + provider
├── billing/agreements/pdf/               # Payment agreement PDF type + provider
└── operations/contracts/pdf/             # Connection request + responsibility PDF types
```

### Templates Pendientes de Crear

| PDF | Prioridad | Módulo Sugerido | Referencia |
|-----|-----------|-----------------|------------|
| Obligaciones del Usuario (Tipo 1) | Media | `operations/contracts/` | `Files JASRAP-Olon/Tipo Uno/Obligaciones del Usuario Tipo Uno.pdf` |
| Obligaciones del Usuario (Tipo 2) | Media | `operations/contracts/` | `Files JASRAP-Olon/Tipo Dos/Obligaciones del Usuario Tipo Dos.pdf` |
| Solicitud Tipo 2 | Alta | `operations/contracts/` | `Files JASRAP-Olon/Tipo Dos/Solicitud para conexion Tipo Dos.pdf` |
| Acta de Responsabilidad Tipo 2 | Alta | `operations/contracts/` | `Files JASRAP-Olon/Tipo Dos/Acta de Responsabilidad Tipo Dos.pdf` |
| Comprobante de Pago | Alta | `billing/collections/payments/` | `Files JASRAP-Olon/Facturas y Comprobantes/Comprobante de Pago Ejemplo.pdf` |
| Reporte de Facturación | Alta | `reports/` | `docs/legacy/04-facturacion/facturacion.md` |
| Estado de Cuenta Otros Servicios | Media | `reports/` | `docs/legacy/06-reportes/reportes.md` |
| Factura SRI Electrónica | Alta | `sri/` | Módulo SRI existente, pendiente template final |

---

## 7. Dependencias y Notas

| Dependencia | Uso | Ya instalada |
|-------------|-----|-------------|
| `puppeteer` | Generación PDF desde HTML | ✅ |
| `handlebars` | Template engine HTML | ✅ |
| `exceljs` o `xlsx` | Generación XLSX | ❌ Nueva |
| `csv-stringify` | Generación CSV | ❌ Nueva |
| `json2csv` | CSV desde JSON | ❌ Nueva |
| `pdfkit` | Alternativa más liviana a Puppeteer | ❌ Evaluar |

### Notas de Implementación

- **Handlebars helpers**: Actualmente solo `math` y `eq` en `pdf.service.ts`. Agregar: `formatMoney`, `formatDate`, `ifEven`, `ifActive`, `ternary`.
- **Partials Handlebars**: Registrar directorio de partials. Los archivos `*.hbs` en `templates/partials/` deben cargarse como partials.
- **Base CSS**: Crear `templates/base.hbs` con `{{content}}` interno para usarse como layout base. O alternativamente, inyectar `<link>` a un CSS compartido.
- **Pruebas visuales**: Usar los PDFs de referencia en `Files JASRAP-Olon/` como golden files para comparación visual.
- **Números de guía**: Los documentos Tipo 1 vs Tipo 2 son variantes del mismo tipo (doméstico vs comercial). Evaluar si es un campo de tarifa o un template separado.

---

## 8. Checklist de Implementación Sugerida

- [ ] **F1**: Extraer CSS a `templates/base.css` y registrar en PdfService
- [ ] **F2**: Crear partials de Handlebars (header, footer, info-box, data-table, signature)
- [ ] **F3**: Agregar helpers `formatMoney`, `formatDate`, `ifEven`, `ifActive`
- [ ] **F4**: Tipar `PdfDocumentType` con genéricos y crear interfaces compartidas
- [ ] **F5**: Refactor templates existentes: clients-list, payments-report, connection-history, account-statement
- [ ] **F6**: Refactor templates documentales: pre-invoice, connection-request, responsibility-agreement, payment-agreement
- [ ] **F7**: Implementar Solicitud Tipo 2, Acta Tipo 2, Obligaciones Tipo 1 y Tipo 2
- [ ] **F8**: Implementar Comprobante de Pago PDF
- [ ] **F9**: Implementar Reporte de Facturación (lote completo) con filtros sector/periodo
- [ ] **F10**: Agregar soporte XLSX y CSV para reportes tabulares
- [ ] **F11**: Implementar Factura SRI electrónica (integrar con módulo sri/)
