# Requisitos Legales SRI — Facturación Electrónica Ecuador

> **Fuente**: Ficha Técnica de Comprobantes Electrónicos del SRI + reglas de negocio no documentadas en el esquema técnico oficial.
> **Relevancia**: El desarrollador del software queda identificado en cada comprobante mediante su RUC. El incumplimiento genera responsabilidad legal directa sobre el desarrollador, no solo sobre el contribuyente.

---

## 1. Campo Obligatorio: RUC del Proveedor de Software

Desde la resolución vigente, todo comprobante electrónico **debe incluir** el RUC del desarrollador del sistema en `<infoAdicional>`. Este campo es de cumplimiento obligatorio.

### Estructura XML requerida

```xml
<infoAdicional>
  <campoAdicional nombre="RUC Proveedor">XXXXXXXXXXX001</campoAdicional>
</infoAdicional>
```

### Impacto en JASRAPO

- El campo debe estar presente en **todos** los tipos de comprobante: facturas, notas de crédito, retenciones, liquidaciones de compra.
- Debe ser un valor fijo configurable (variable de entorno o tabla de configuración), no hardcodeado.
- **Si este campo no está presente, el comprobante no cumple con los requisitos actuales del SRI.**

---

## 2. Reglas de Negocio No Documentadas en el Esquema

La ficha técnica del SRI describe la *estructura* del XML pero omite restricciones de negocio que son igualmente obligatorias por ley. El sistema debe validarlas **antes de intentar la autorización** — no dejar que el SRI las rechace.

### 2.1 RIMPE Negocio Popular e IVA 15%

| Tipo de contribuyente | IVA permitido |
|---|---|
| RIMPE Negocio Popular | 0% únicamente |
| Régimen General | 0%, 5%, 15% según aplique |
| RIMPE Emprendedor | 0%, 12% (sin tarifa diferenciada del 15%) |

**Regla**: Si el emisor es `RIMPE Negocio Popular`, el sistema debe **bloquear** cualquier ítem con tarifa de IVA 15%. El esquema técnico no lo rechaza — la ley sí lo prohíbe.

**Validación a implementar**: Antes de construir el XML, verificar `tipoContribuyente === 'RIMPE_NEGOCIO_POPULAR'` y rechazar si algún detalle tiene `porcentajeIva > 0`.

### 2.2 Fechas de Emisión Retroactivas

- El SRI no acepta comprobantes con `fechaEmision` anterior a la fecha real sin justificación.
- La emisión retroactiva sin autorización genera multas que parten desde **un salario básico unificado**.
- El sistema debe **bloquear por defecto** fechas anteriores al día de emisión.
- Si el negocio requiere fechas retroactivas (ej. cierre de mes), debe existir un mecanismo explícito de autorización interna auditado.

**Validación a implementar**: `fechaEmision >= startOfDay(new Date())` con posibilidad de override por rol autorizado con registro de auditoría.

### 2.3 Tipo de Contribuyente vs. Tipo de Comprobante

No todos los contribuyentes pueden emitir todos los tipos de comprobante:

| Tipo de contribuyente | Puede emitir |
|---|---|
| Persona natural no obligada a llevar contabilidad | Facturas, notas de venta (según régimen) |
| Sociedad | Facturas, notas de crédito, retenciones, liquidaciones |
| RIMPE Negocio Popular | Solo notas de venta (no facturas en algunos regímenes) |
| Agente de retención | Comprobantes de retención |

**Validación a implementar**: Lookup del tipo de contribuyente del emisor antes de permitir la creación del comprobante. Rechazar combinaciones inválidas con mensaje de error descriptivo.

### 2.4 Secuencia de Numeración

- Los comprobantes deben ser secuenciales y sin gaps dentro de cada establecimiento y punto de emisión.
- Anular un comprobante no libera ese número — queda registrado como anulado.
- El sistema debe garantizar unicidad de `establecimiento + puntoEmision + secuencial`.

---

## 3. Responsabilidad del Desarrollador

Con la exigencia del RUC del proveedor de software, el SRI establece **trazabilidad directa** sobre el sistema que generó el comprobante:

- Si el sistema emite comprobantes incorrectos de forma sistemática, el desarrollador queda expuesto a sanciones.
- Esto obliga a que el software implemente validaciones preventivas robustas.
- Las actualizaciones de requisitos del SRI deben procesarse con prioridad alta — no son opcionales.

---

## 4. Fuentes y Referencias

| Documento | URL |
|---|---|
| Ficha Técnica Comprobantes Electrónicos | https://www.sri.gob.ec/comprobantes-electronicos |
| Blog técnico de referencia | https://marantbq.dev/blog/facturacion-electronica-sri-ia/ |

---

## 5. Checklist de Cumplimiento para JASRAPO

- [ ] Campo `RUC Proveedor` presente en `<infoAdicional>` de todos los tipos de comprobante
- [ ] Valor configurable (variable de entorno o tabla de configuración), no hardcodeado
- [ ] Validación RIMPE Negocio Popular → bloquear IVA 15%
- [ ] Validación de fecha de emisión → no permitir retroactivas por defecto
- [ ] Validación tipo contribuyente vs. tipo comprobante antes de construir XML
- [ ] Secuencialidad garantizada con constraint único en DB
- [ ] Tests de integración con escenarios de contribuyentes RIMPE

> **⚠️ Prioridad**: El campo RUC Proveedor es el único con fecha de vigencia ya activa. Los demás son validaciones legales que deberían existir desde el inicio pero que el esquema técnico no fuerza.
