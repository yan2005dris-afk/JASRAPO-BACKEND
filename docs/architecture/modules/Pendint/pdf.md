# PDF Factory — Generación centralizada de PDFs

## Stack

| Herramienta | Rol |
|-------------|-----|
| **Handlebars** | Motor de plantillas — renderiza `.hbs` + datos → HTML |
| **Puppeteer** | Conversión — HTML → PDF vía Chromium headless |

Sin dependencias de LibreOffice ni Carbone.

## Cómo agregar un nuevo tipo de PDF

### 1. Template `.hbs`

Crear en `infrastructure/pdf/templates/`.  
Sintaxis Handlebars estándar:

```handlebars
{{variable}}                          {{! campo simple }}
{{objeto.propiedad}}                  {{! acceso anidado }}
{{#each array}}<tr>...</tr>{{/each}}  {{! loop }}
{{this.campo}}                        {{! item actual en loop }}
{{#if @even}}even{{/if}}              {{! fila par en loop }}
{{#if (eq valor 'X')}}...{{/if}}      {{! comparación }}
{{math @index '+' 1}}                 {{! aritmética (helper registrado) }}
```

Helpers registrados en `PdfService`: `math` (aritmética) y `eq` (igualdad).

**Ejemplo mínimo:**

```handlebars
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #0066cc; color: white; padding: 8px; }
    td { padding: 8px; border-bottom: 1px solid #ddd; }
  </style>
</head>
<body>
  <h1>{{reporte.titulo}}</h1>
  <table>
    <thead><tr><th>Nombre</th><th>Estado</th></tr></thead>
    <tbody>
      {{#each reporte.items}}
      <tr>
        <td>{{this.nombre}}</td>
        <td>{{this.estado}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>
</body>
</html>
```

### 2. Document Type (adaptador de datos)

Crear `*.pdf-type.ts` implementando `PdfDocumentType`:

```typescript
import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';

export const MyReportPdfDocumentType: PdfDocumentType = {
  type: 'my-report',
  name: 'Mi Reporte',
  template: 'my-report',       // nombre del .hbs sin extensión

  adaptData(raw: Record<string, unknown>): Record<string, unknown> {
    return {
      reporte: {
        titulo: 'Mi Reporte',
        items: (raw['items'] as any[] ?? []).map((i) => ({
          nombre: i.nombre,
          estado: i.activo ? 'Activo' : 'Inactivo',
        })),
      },
    };
  },
};
```

### 3. Registrar en el módulo

`PdfModule` es `@Global()` — no hace falta importarlo. Inyectá `PdfService` directo y registrá en `onModuleInit`:

```typescript
import { Module, OnModuleInit } from '@nestjs/common';
import { PdfService } from 'src/infrastructure/pdf/pdf.service';
import { MyReportPdfDocumentType } from './pdf/my-report.pdf-type';

@Module({
  providers: [MyReportService],
})
export class MyModule implements OnModuleInit {
  constructor(private readonly pdfService: PdfService) {}

  onModuleInit() {
    this.pdfService.registerDocumentType(MyReportPdfDocumentType);
  }
}
```

## Uso en código

```typescript
// Generar Buffer (para responder HTTP)
const buffer = await generatePdfUseCase.execute('my-report', rawData);

// Generar y guardar en /tmp
const filePath = await generatePdfToFileUseCase.execute('my-report', rawData, 'my-report-2026');
```

## Docker

En producción, Puppeteer usa el Chromium del sistema (no descarga el suyo):

```dockerfile
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

En desarrollo local, Puppeteer usa el Chromium que descargó a `~/.cache/puppeteer/`.  
No hace falta configurar nada.

## Estructura

```
infrastructure/pdf/
├── use-cases/
│   ├── generate-pdf.use-case.ts          ← lookup type → adaptData → render
│   └── generate-pdf-to-file.use-case.ts  ← genera y escribe en /tmp
├── document-type.interface.ts   ← Interfaz PdfDocumentType
├── pdf.service.ts               ← browser lifecycle + registry + render()
├── pdf.module.ts                ← Módulo global (@Global)
├── README.md
└── templates/
    ├── pre-invoice.hbs          ← Prefactura
    └── clients-list.hbs         ← Listado de clientes

reports/pdf/
└── clients-list.pdf-type.ts     ← Adaptador de datos

billing/pre-invoice/pdf/
└── pre-invoice.pdf-type.ts
```

## Checklist nuevo tipo

- [ ] `infrastructure/pdf/templates/<nombre>.hbs`
- [ ] `<módulo>/pdf/<nombre>.pdf-type.ts` implementando `PdfDocumentType`
- [ ] Registrar en `onModuleInit()` del módulo (inyectar `PdfService` directo)
- [ ] Sample data en `reports/sample-data.ts` (para pruebas vía Swagger)
- [ ] Enum actualizado en `reports.controller.ts`
