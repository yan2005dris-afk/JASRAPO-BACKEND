# Clientes (Legacy)

## Campos del Listado

| Campo | Tipo | Descripción |
|-------|------|-------------|
| activo | boolean | Estado del cliente |
| acg | string | Código ACG |
| fecha_creacion | date | Fecha de registro |
| nombres | string | Nombres |
| apellidos | string | Apellidos |
| nombre_completo | string | Nombre completo (calculado) |
| direccion | string | Dirección |
| telefono | string | Teléfono principal |
| celular | string | Teléfono secundario |
| correo_electronico | string | Email |
| cedula | string | Identificación |

## Estados

- **Activo** — cliente con servicio activo
- **Inactivo** — cliente sin servicio
- **Fallecido** — registro por fallecimiento
- **Suspendido** — servicio suspendido

> Se recomienda manejar `activo/inactivo` + `motivo` en el sistema nuevo.

## Opciones

- Generar PDF
- Generar Excel
- Importar datos (CSV, Excel)
- Gráficos: tabla, líneas, matrices

## Caso de uso — Nuevo Cliente

Al crear un cliente se debe:
1. Registrar datos personales
2. Crear contrato asociado
3. Asignar medidor
4. Crear cuenta

## Prisma (sistema nuevo)

```prisma
model Clientes {
  clienteId          BigInt    @id @default(autoincrement()) @map("cliente_id")
  nombres            String    @map("nombres")
  apellidos          String    @map("apellidos")
  identificacion     String    @unique @map("identificacion")
  email              String?   @map("email")
  telefono           String?   @map("telefono")
  telefonoSecundario String?   @map("telefono_secundario")
  direccionDomicilio String?   @map("direccion_domicilio")
  razonSocial        String?   @map("razon_social")
  activo             Boolean   @default(true) @map("activo")
  // ... timestamps, relations
}
```
