# Reportes (Legacy)

## 1. Reporte de Facturación

### Campos de filtro

| Campo | Descripción |
|-------|-------------|
| sector | Filtrar por sector/comunidad |
| año_consumo | Periodo |
| mes_consumo | Mes |
| tipo | Detallado / Resumido mes-sector / Resumido sector-mes |
| formato | PDF, XLSX, CSV |

### Campos del reporte

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

## 2. Reporte de Abonos

### Filtros

| Campo | Descripción |
|-------|-------------|
| fecha_desde/hasta | Rango de fechas |
| sector | Sector/comunidad |
| cuenta | Cuenta específica |
| medidor | Medidor específico |
| tipo_reporte | Detallado, Detalle×factura, Resumen×día, Resumen×mes, Detalle factura sector, Detalle factura×fp×ago×sector |
| formato | PDF, XLSX, RTF, ODT, CSV |

### Campos

| Campo | Descripción |
|-------|-------------|
| factura | Número de factura |
| fecha | Fecha de pago |
| cliente | Nombre |
| cuenta | Número de cuenta |
| medidor | Número de medidor |
| emision | Mes que se cancela |
| valor | Monto pagado |

### Caso de uso — Pago acumulado

Un usuario paga 3 facturas en un día. El reporte muestra el desglose por factura, no el total pagado. Ejemplo: usuario paga $30, reporte dice $26.04 (el desglose de las 3 facturas).

## 3. Reporte Estado de Cuenta

### Filtros

| Campo | Descripción |
|-------|-------------|
| sector | Sector |
| observacion | Ej: "ahorre agua" |
| cuenta | Cuenta específica |
| medidor | Medidor específico |

### Notas

- Muestra las **planillas pendientes** de pago
- Si se saca para una comunidad, campos de cuenta/medidor quedan en blanco
- Si es persona específica, se muestran sus datos
- Incluye **nota de aviso** con novedades operativas
- Los respaldos se descargan como planillas masivas (PDF)
- **No se guarda en reportes** — es volátil, cambia según datos de BD

## 4. Reporte Historial de Conexión

### Filtros

| Campo | Descripción |
|-------|-------------|
| fecha_desde/hasta | Rango |
| sector | Sector |
| cuenta | Cuenta |
| medidor | Medidor |
| tipo_reporte | Tipo |
| formato | Formato |

### Campos del reporte

| Campo | Descripción |
|-------|-------------|
| mes_emision | Mes |
| lectura_actual | Actual |
| lectura_anterior | Anterior |
| consumo | m³ |
| valor_emision | Valor |
| abonos | Pagos realizados |
| saldo | Saldo pendiente |

### Nota

> "Cuando la lectura actual tiene valor pero la lectura anterior tiene 0, es porque hubo un cambio de medidor."

## 5. Reporte Estado de Cuenta Otros Servicios

- Similar al estado de cuenta pero para **otros ingresos** (inspecciones, servicios)
- Filtros: observación, cuenta, medidor

## 6. Reporte de Tasa de Seguridad

- Solo aplica para **Olón**
- Muestra tasa de seguridad por cuenta
