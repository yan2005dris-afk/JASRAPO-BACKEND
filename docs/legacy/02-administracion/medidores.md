# Medidores (Legacy)

## Campos del Listado

| Campo | Tipo | Descripción |
|-------|------|-------------|
| numero_medidor | string | Número de serie del medidor |
| propietario | string | Nombre completo del propietario |
| sector | string | Comunidad/Sector (en Olón = sector, resto = comunidad) |
| categoria | string | Categoría 1, 2 o 3 |

## Categorías

- **Categoría 1** — uso residencial básico
- **Categoría 2** — uso comercial
- **Categoría 3** — uso industrial/especial

## Opciones

- Generar PDF
- Generar Excel
- Importar datos
- Más informes

## Caso de uso — Nuevo Medidor

1. Registrar número de serie
2. Asociar a propietario (cliente)
3. Asignar sector/comunidad
4. Asignar categoría de tarifa
5. Asociar a contrato y cuenta

## Relaciones en el sistema

```
Medidor → Contrato → Cliente
Medidor → Cuenta → Contrato
Medidor → HistorialMedidores (cambios de propietario)
```
