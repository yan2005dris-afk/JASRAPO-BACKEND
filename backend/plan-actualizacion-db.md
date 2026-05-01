# Plan de Actualización de Base de Datos - JASRAP-Olon

Este documento detalla los cambios estructurales acordados para optimizar la trazabilidad, consistencia fiscal y flexibilidad comercial del sistema.

## 1. Trazabilidad Física: Lecturas y Medidores
**Decisión:** Vincular las lecturas directamente al dispositivo físico (Medidor) en lugar de solo al ente administrativo (Contrato).

- **Cambio en `Lecturas`**: 
    - Agregar `medidor_id` (BigInt) como relación obligatoria.
    - Mantener `contrato_id` para facilitar consultas rápidas de historial sin JOINS complejos.
- **Razón**: Permite manejar cambios de medidores sin perder la correlación de qué aparato generó qué consumo.

## 2. Motor de Precios: Desacoplamiento de Rubros y Tarifas
**Decisión:** Quitar precios fijos de los rubros generales y centralizarlos en la lógica de categorías.

- **Cambio en `Rubros`**: Se establecerá el `precio_unitario` en 0 para rubros variables (como Consumo de Agua). El precio real se obtendrá dinámicamente de `CategoriaTarifa` al momento de generar la prefactura.
- **Cambio en `CategoriaTarifa`**: Se mantiene como la fuente de verdad para los precios de consumo (base y excedente).

## 3. Terminología de Facturación: ¿Prefacturas o Planillas?
**Análisis**:
- **Planilla**: Es el término exacto para el consumo mensual de agua. Es muy claro para el usuario.
- **Prefactura**: Es un término técnico/contable que abarca cualquier documento previo a la factura legal.

**Sugerencia**: Mantener el nombre **`Prefacturas`** a nivel de base de datos pero tratarlo como **Planilla** en la interfaz de usuario. 
- **¿Por qué?**: Si mañana vendés un medidor (Bien) o hacés una reparación (Servicio), podés generar una "Prefactura" que no es necesariamente una "Planilla de Agua". El modelo actual de `PrefacturaDetalle` ya es lo suficientemente flexible para esto.

## 4. Gestión de Abonos (Saldo a favor)
**Decisión**: Automatizar el uso de excedentes de pago.

- **Lógica**: Al generar una nueva Prefactura, el sistema debe buscar en `AbonoCliente` registros con `disponible_para_aplicar = true`.
- **Cambio en `Prefacturas`**: Asegurar que el campo `abono` refleje el monto descontado del total.

## 5. Integridad Fiscal (SRI)
**Decisión**: Garantizar secuenciales únicos sin colisiones.

- **Implementación**: En el código de emisión de facturas, se implementará un bloqueo a nivel de fila (`SELECT FOR UPDATE`) sobre la tabla `PuntosEmision` al momento de obtener el siguiente secuencial.

## 6. Simplificación Temporal
**Decisión**: Desacoplar módulos fiscales secundarios para concentrar el esfuerzo en el flujo principal (Prefactura -> Factura -> Pago -> Convenio).

- **Acción**: Se eliminaron las relaciones activas hacia `NotasCredito`, `NotasDebito` y `Retenciones` en los modelos core.
- **Razón**: Reducir el ruido arquitectónico durante la fase de desarrollo del núcleo del sistema. Se podrán re-conectar fácilmente cuando el ciclo de ingresos esté estable.

---
**Próximos Pasos**:
1. Actualizar `schema.prisma` con las nuevas relaciones.
2. Generar migración de base de datos.
3. Actualizar la lógica de carga de lecturas para incluir el `medidor_id`.
