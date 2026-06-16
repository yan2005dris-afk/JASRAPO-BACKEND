# Proceso de Lecturas (Legacy)

## Flujo

```
Preparar lecturas → Toma de lecturas → Registro → Validación → Generación de prefacturas
```

> **Nota importante del legacy**: "Antes de la toma de lecturas se tiene que generar las facturas/prefacturas del mes. Esto debería ser automático. Las lecturas deberían estar tomadas y validadas para luego generar las prefacturas."

**Decisión**: En el sistema nuevo, el flujo correcto es:
1. Tomar lecturas
2. Validar lecturas
3. Generar prefacturas (automático)

## 1. Preparar Lecturas

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| año_lectura | int | Periodo |
| año_consumo | int | Año de consumo |
| mes_lectura | int | Mes |
| mes_consumo | int | Mes de consumo |
| año_toma_lectura | int | Año en que se toma |
| lecturas_faltantes | string | Para regenerar solo las faltantes |
| lector | string | Operador asignado |

### Áreas generadas (lote)

| Campo | Descripción |
|-------|-------------|
| código_area | Código del área de lectura |
| area_lectura | Nombre del área |
| sector | Sector |
| clientes | Cantidad de clientes |

### Caso de uso — Lecturas Faltantes

Si un cliente se activa después de preparar el lote, se usa el campo "lecturas faltantes" para regenerar SOLO las que faltan, sin afectar las ya generadas.

En Olón usan 3 operadores (cada uno con su sector asignado).

## 2. Toma de Lecturas

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| año_lectura | int | Periodo |
| mes_lectura | int | Mes |
| area_lectura | string | Área |
| sector | string | Sector (redundante con área) |
| lector | string | Nombre del operador |
| fecha_lectura | date | Fecha |

## 3. Registro de Lecturas

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| año_lectura | int | Periodo |
| mes_lectura | int | Mes |
| lector_operador | string | Operador |
| fecha_lecturas | date | Fecha |
| cuenta.numero | string | Número de cuenta |
| cuenta.nombre | string | Nombre del cliente |
| medidor.numero | string | Número de medidor |
| medidor.propietario | string | Propietario |
| lectura_actual | decimal | Lectura actual |
| lectura_anterior | decimal | Lectura anterior (NO editable aquí) |
| novedad_lectura | string | Novedad operativa |

### Notas

- La lectura anterior NO es editable desde este módulo
- La novedad se selecciona del catálogo de novedades (Administración → Novedades)

## 4. Validación de Lecturas

- Verificar consumos anormales
- Validar consistencia entre lectura anterior y actual
- Marcar lecturas con problemas
