# Cajas (Legacy)

## Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| código | string | Código de la caja |
| descripción | string | Nombre de la caja |
| agencia | string | Agencia a la que pertenece |
| cajero | string | Cajero asignado |
| supervisor | string | Supervisor |

## Tipos de caja

- **Caja principal** — sede principal
- **Caja externa** — puntos satélite

## Notas

> "Este item no se está sirviendo mucho porque no tenían la digital y se manejaban con la física, ahora ya no"

La caja física era una caja registradora. Con la digitalización perdió relevancia.

## En el sistema nuevo

Se maneja con **CajaSesion** (sesiones de apertura/cierre):

```prisma
model CajaSesion {
  cajaId              BigInt    @id @default(autoincrement())
  creadoPor           String
  fechaApertura       DateTime  @default(now())
  montoApertura       Decimal
  estado              EstadoCaja  // ABIERTA, CERRADA, DESCUADRADA
  totalChequesDeclarados        Decimal?
  totalTransferenciasDeclaradas Decimal?
}
```
