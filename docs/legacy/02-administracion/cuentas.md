# Cuentas (Legacy)

## Campos del Listado

| Campo | Tipo | Descripción |
|-------|------|-------------|
| numero_cuenta | string | Número de cuenta |
| nombre_cliente | string | Nombre del cliente |
| numero_medidor | string | Número de medidor |
| sector | string | Sector/Comunidad |
| direccion | string | Dirección |
| codigo_ubicaciones | string | Código de ubicación |
| estado_corte | string | Estado de corte |
| nota_aviso | string | Notas (medidor retirado, medidor marcando, etc.) |

## Estados

- **Activo** — solo se muestran cuentas activas

## Notas

- La cuenta es la entidad que genera las facturas/planillas
- Cada cuenta tiene un medidor asociado
- Las notas de aviso son novedades operativas

## Relaciones

```
Cuenta → Contrato → Cliente
Cuenta → Medidor
Cuenta → Prefacturas (generación mensual)
Cuenta → Pagos (recaudación)
```

## Caso de uso — Pago de planilla

Cuando un contrato tiene valor pendiente de "otros ingresos", se muestra aviso:
> "Tiene valores pendientes por pagar en otros ingresos"

El sistema no deja pagar planillas si hay saldo pendiente en otros ingresos.
**Decisión pendiente**: ¿mantener esta restricción en el sistema nuevo?
