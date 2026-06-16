# Facturación (Legacy)

## 1. Generación de Facturas (Lotes)

### Campos de entrada

| Campo | Tipo | Descripción |
|-------|------|-------------|
| año_lectura | int | Periodo |
| año_consumo | int | Año de consumo |
| mes_lectura | int | Mes de lectura |
| mes_consumo | int | Mes de consumo |
| area_toMA_lectura | string | Área de toma de lectura |
| estado | string | Borrador / Definitiva |

### Áreas generadas

| Campo | Descripción |
|-------|-------------|
| código_area | Código del área |
| area_lectura | Nombre del área |
| sector | Sector |
| clientes | Cantidad de clientes |
| valor | Total facturado |
| estado | Estado del área |

### Reporte del Borrador

| Campo | Descripción |
|-------|-------------|
| cuenta | Número de cuenta |
| clientes | Nombre del cliente |
| lectura_anterior | Lectura previa |
| lectura_actual | Lectura actual |
| consumo | m³ consumidos |
| cargo_fijo | Cargo fijo (10m³ = $4 mínimo) |
| excedente | Cargo por excedente ($0.40/m³) |
| valor_consumo | Total consumo |
| interes_mora | Interés por mora |
| tasa_seguridad | Tasa de seguridad (solo Olón) |
| subtotal | Subtotal |
| descuento | Descuento aplicado |
| convenio | Convenio de pago activo |
| total | Total a pagar |

### Fórmula de consumo

```
Mínimo: 10m³ = $4.00
Excedente: $0.40 por m³ adicional

Ejemplo: 15m³
= $4.00 (mínimo 10m³) + (5m³ × $0.40) = $6.00
```

## 2. Factura Otros Ingresos

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| numero_factura | string | Número |
| fecha_factura | date | Fecha |
| cliente | string | ID del cliente |
| nombre_cliente | string | Nombre |
| identificacion | string | Cédula/RUC |
| descripcion | string | Motivo |

### Descripciones comunes

- Por inspección
- Pago tercera parte (enero)
- Costo de la guía

### Caso de uso especial — Pago a terceras partes

Se divide en 3, donde se paga la tercera parte de una planilla.
Costo de la guía: medidor completo paga total, al costo de la guía abona el 15%.

### Nota

> "Hay facturas que no se mandan a autorizar al SRI porque son facturas de otros ingresos (inspecciones) y no tienen bien los detalles, se desconfigura el total."
