# Intereses y Problemas del Sistema Legacy

## Pago parcial

> "Se puede pagar a partir de $20 un convenio. Está establecido así en el sistema pero eso está mal."

- Si alguien quiere abonar $5 puede hacerlo, pero el sistema no lo permite
- **Decisión**: En el sistema nuevo, habilitar pagos parciales de cualquier monto

## Interés mora

- Se calcula por meses
- El gobierno da la tasa y es un cambio mensual
- Se necesita hacer **snapshot mensual** de la tasa
- Se puede rebajar en casos especiales (via autorización de descuentos)
- No saben exactamente cómo se calcula (investigación propia indica que es por meses)

## Tasa de seguridad

- Solo **Olón** tiene tasa de seguridad
- Existe en administración → cuentas como descuento
- No se utiliza porque "quieren dejarla para cancelar después"

## Botón de pago

- Se intentó hacer con bancos, no se concretó
- Enlace de pago existió pero dejó de funcionar
- Solo funcionaba desde red externa (datos móviles, no WiFi de la junta)
- **Ideal**: app/web donde el cliente pueda pagar

## Transferencias

- Los clientes depositan a cuenta bancaria de la junta
- Envían comprobante por WhatsApp
- **Problema**: cuando no envían comprobante, no se sabe quién pagó
- **Solución ideal**: registro de pagos desde app del cliente

## Facturación y SRI

- Las facturas se envían al SRI para autorización
- El envío de correo con la factura autorizada **no funciona**
- Facturas de "otros ingresos" (inspecciones) a veces no se envían al SRI porque los detalles no cuadran

## Contabilidad

- Sección nueva que genera **trabajo duplicado**
- El tesorero registra info, y en contabilidad se vuelve a registrar
- La base de datos no muestra la info de contabilidad

## Acceso al código

- **Sin acceso al código fuente**
- **Sin acceso a la base de datos**
- **Sin contratos** — administradores anteriores se encargaron
- Desrollador remoto por AnyDesk, no da soluciones
