# Contrato Instalación de Medidores (Legacy)

## Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| numero_contrato | string | Número |
| fecha | date | Fecha |
| referencia | string | Referencia |
| numero_medidor | string | Medidor del propietario |
| valor_instalacion | decimal | Costo total |
| valor_cuota_inicial | decimal | Cuota inicial |
| valor_cuota_mes | decimal | Cuota mensual |
| numero_cuenta | string | Cuenta asociada |

## Caso de uso

> "Cuando se hace un contrato de instalación se debería generar una factura/prefactura por pagar de esa instalación con los parámetros de que si se paga al contado o es con convenio."

## Decisión pendiente

¿Generar automáticamente una prefactura al crear el contrato de instalación?

## En el sistema nuevo

Se maneja como parte del módulo de **contratos**:

```prisma
model Contratos {
  contratoId          BigInt    @id
  clienteId           BigInt
  comunidadId         Int
  categoriaTarifaId   Int
  numeroGuia          String    @unique
  fechaInicio         DateTime  @default(now())
  direccionSuministro String
  estado              EstadoGenerico
}
```
