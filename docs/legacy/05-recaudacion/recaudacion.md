# Recaudación (Legacy)

## Flujo diario

```
Apertura de caja → Recaudación → Cuadro diario → Cierre de caja
```

## 1. Apertura de Caja

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| fecha | date | Fecha |
| caja | string | Caja asignada |
| hora_inicial | time | Hora de apertura |
| hora_final | time | Hora de cierre |
| estado | string | Activa / Por liquidar |

## 2. Recaudación (Planillas/Consumo)

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| fecha_pago | date | Fecha del pago |
| numero_factura | string | Factura a la que aplica |
| numero_comprobante | string | Comprobante de pago |
| numero_cuenta | string | Cuenta del cliente |
| nombre_cliente | string | Nombre |
| total_cobro | decimal | Monto pagado |
| status | string | Estado |

### Modalidades de cobro

- **Efectivo** — pago en caja
- **Cheques** — instrumento bancario
- **Transferencia** — depósito bancario (problema: no envían comprobante)
- **Tarjeta de crédito** — no implementada, pendiente

## 3. Recaudación Otros Ingresos

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| fecha_pago | date | Fecha |
| numero_comprobante | string | Comprobante |
| origen | string | Origen del cobro |
| numero_factura_pendiente | string | Factura pendiente |
| total_cobro | decimal | Monto |
| estatus | string | Estado |

## 4. Cuadro Diario de Caja

- Resumen de ingresos del día
- Detalle efectivo es **ingreso manual**
- Debe cuadrar (ingresos = egresos + saldo)
- Se puede imprimir el cuadre

## 5. Cierre de Caja

### Notas importantes

> "Tomar en cuenta tipo de factura. Se quiere dejar específico que en el cierre de caja tiene que estar el tipo de factura: si es por planilla, inspección, consumo, etc."

- Se cierra todo lo facturado/cobrado en el día
- Los reportes se hacen por separado: recaudación normal vs otros ingresos

## 6. Procesar Documentos Electrónicos

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| fecha | date | Fecha |
| codigo_tipo_doc | string | Tipo de comprobante |
| tipo_doc | string | Descripción |
| serie_documento | string | Serie |
| num_doc | string | Número |
| fecha_emision | date | Cuando se creó |
| fecha_autorizacion | date | Cuando el SRI autorizó |
| clave_doc | string | Clave de acceso |
| estado | string | Nuevo / Autorizado |
| tip_id | string | Tipo ID sujeto |
| id_sujeto | string | ID del sujeto |
| razon_social | string | Razón social |
| subtotal | decimal | Subtotal |
| iva | decimal | IVA |
| total | decimal | Total |
| resultado_proceso | string | Resultado |

### Flujo de autorización SRI

1. Se crea la factura → fecha_emision se llena
2. Se envía al SRI → fecha_autorizacion se llena si autoriza
3. Si da error → estado = "Nuevo" (se reintenta)
4. Al autorizar → se envía correo al cliente (no funciona en el legacy)

### Selección

- Se puede seleccionar en masa o uno a uno
- Botón "Procesar" para enviar al SRI

## 7. Documentos Electrónicos (Historial)

- Historial de todas las autorizaciones
- Mismos datos que "Procesar documentos electrónicos"
- Filtros: fecha emisión (año, mes)
- Opciones: generar PDF/Excel
