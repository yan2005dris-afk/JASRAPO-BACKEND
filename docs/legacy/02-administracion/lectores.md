# Lectores / Operadores (Legacy)

## Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| activo | boolean | Estado |
| acg | string | Código ACG |
| fecha_creacion | date | Fecha de registro |
| nombres | string | Nombres |
| apellidos | string | Apellidos |
| nombre_completo | string | Nombre completo |
| direccion | string | Dirección |
| telefono | string | Teléfono |
| celular | string | Celular |
| correo_electronico | string | Email |
| codigo | string | Código del operador |

## Notas

- Los operadores son quienes toman las lecturas en campo
- En **Olón** se usan 3 operadores (cada uno con su sector asignado)
- Antes usaban tablets para sincronizar lecturas
- Ahora usan tableros con hojas físicas (dejaron el sistema por falta de conocimiento)
- El sistema nuevo debería facilitar la toma de lecturas con app móvil

## Relación con lecturas

```
Operador → Lote de Lecturas → Lecturas individuales
Cada operador tiene sectores asignados
```
