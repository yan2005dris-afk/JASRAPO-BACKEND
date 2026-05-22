# DTO - Data Transfer Objects

## Descripción

Objetos de transferencia de datos para comunicar el controlador con el cliente.

## Propósito

- **Input**: Validar datos de entrada en requests POST/PATCH
- **Output**: Formatear respuestas al cliente

## Convenciones de Nomenclatura

```
Create XXXXXX.dto.ts      → Para crear nuevos recursos
Update XXXXXX.dto.ts     → Para actualizar recursos (todos los campos opcionales)
ResponseXXXXXX.dto.ts    → Para respuestas al cliente
FilterXXXXXX.dto.ts      → Para filtros y queries
```

## Referencias

- Paquete: `class-validator`
- Patrón: DTO (Data Transfer Object)
