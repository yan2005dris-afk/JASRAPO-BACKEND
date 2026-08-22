# open-api-facturacion-sri (vendor de referencia histórica)

> ⚠️ **Código de referencia histórica — NO productivo**

## Origen

Este árbol es un fork/vendor del proyecto público
[`open-api-facturacion-sri`](https://github.com/angelo-barzola/open-api-facturacion-sri)
(autor original: **Angelo Barzola Villamar**, licencia **MIT** — confirmado en
`LICENSE` local). Fue vendorizado en las etapas tempranas de JASRAPO como
referencia de implementación para los flujos SRI (facturación electrónica,
firma XAdES-BES, webhooks).

## Estado actual

| Pregunta | Respuesta |
|---|---|
| ¿Se compila? | **NO** — `pnpm-workspace.yaml` solo lista `backend/`. |
| ¿Se importa desde `backend/src/`? | **NO** — verificado: 0 hits de `import` en `backend/src/`. |
| ¿Se distribuye en el bundle? | **NO** — vive fuera del workspace. |
| ¿Se mantiene localmente? | **NO** — no se aceptan parches aquí. |

## Implementación real

La implementación productiva del módulo SRI vive en:

```
JASRAPO-BACKEND/backend/src/sri/
├── emision/         # Emisión de comprobantes (factura, NC, ND, retención)
├── emisores/        # Emisores (datos RUC, certificados por emisor)
├── catalogos/       # Catálogos oficiales SRI
├── signature/       # Firma XAdES-BES
├── webhooks/        # Webhooks de notificación SRI
└── certificates/    # Gestión legacy de certificados (filesystem local)
```

Esta implementación ya **divergió** del upstream. La referencia histórica
sirve solo para entender la intención original; no es una guía canónica.

## Mantenimiento

Para cambios en la lógica SRI, editar directamente `backend/src/sri/`.
Para consultar la referencia upstream (deprecada pero conservada aquí),
ver el árbol de archivos `.ts` originales en este directorio o visitar
el repositorio público mencionado arriba.

## Regeneración del code-map (graft)

Tras un `git mv` de este árbol, el cache local de
`graft/open-api-facturacion-sri-main/` queda con paths viejos. Para
regenerarlo:

```bash
cd JASRAPO-BACKEND
graft build
```

Esto no afecta al repositorio: `graft/` está gitignored.
