# Inventario de artefactos de reportes PDF

Este inventario documenta las referencias verificadas antes de la limpieza de
PDF-03. La decisión de variantes se toma del catálogo aprobado de PDF-01 en
`report-style.catalog.ts`.

| Familia            | Clave del dispatcher | Endpoints                                                                                            | Plantillas conservadas                                           | Tipo registrado                   | Decisión                                                      |
| ------------------ | -------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------- |
| Payments Report    | `payments-report`    | `GET /reports/payments-report`, `POST /reports/payments-report/email`                                | `payments-report-legacy.hbs`, `payments-report-modern.hbs`       | factory tipada legacy/modern      | Ambas variantes están aprobadas por el catálogo.              |
| Connection History | `connection-history` | `GET /reports/connection-history`, `POST /reports/connection-history/email`                          | `connection-history-legacy.hbs`, `connection-history-modern.hbs` | factory tipada legacy/modern      | Ambas variantes están aprobadas por el catálogo.              |
| Account Statement  | `account-statement`  | `GET /reports/account-statement`, `POST /reports/account-statement/email`                            | `account-statement-legacy.hbs`, `account-statement-modern.hbs`   | factory tipada legacy/modern      | Ambas variantes están aprobadas por el catálogo.              |
| Clients List       | `clients-list`       | `GET /reports/clients-list`, `POST /reports/clients/email`                                           | `clients-list-legacy.hbs`, `clients-list-modern.hbs`             | factory tipada legacy/modern      | Ambas variantes están aprobadas por el catálogo.              |
| Payment Agreement  | `payment-agreement`  | `GET /reports/payment-agreement`, `POST /reports/payment-agreement/email`, `GET /agreements/:id/pdf` | `payment-agreement.hbs`                                          | `PaymentAgreementPdfDocumentType` | Documento legal canónico único; no consulta el estilo global. |

## Artefactos eliminados después de verificar referencias

| Artefacto                          | Evidencia                                                                                | Acción                                                                           |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `clients-list.hbs`                 | Hash idéntico a `clients-list-legacy.hbs`; su tipo sin sufijo no estaba registrado.      | Eliminado junto con `ClientsListPdfDocumentType`.                                |
| `account-statement.hbs`            | Hash idéntico a `account-statement-legacy.hbs`; su tipo sin sufijo no estaba registrado. | Eliminado junto con `AccountStatementPdfDocumentType`.                           |
| `payment-agreement-legacy.hbs`     | Era la plantilla usada por el registro canónico provisional.                             | Renombrada a `payment-agreement.hbs`.                                            |
| `payment-agreement-modern.hbs`     | El catálogo declara esta familia como canónica única.                                    | Eliminada.                                                                       |
| `payment-agreement.factory.ts`     | Producía tres registros para una familia canónica.                                       | Sustituida por un solo tipo tipado.                                              |
| Tipos separados de Payments Report | Ambos repetían agrupación y subtotales.                                                  | Sustituidos por una factory de presentación; los cálculos viven en el proyector. |

La prueba `duplicateReportArtifactsHaveNoReferencesBeforeDeletion` verifica que
los archivos retirados no reaparezcan, que la plantilla canónica exista y que
no queden imports de tipos eliminados.
