# TASK-08: Aplicación del Beneficio Tarifario de Tercera Edad y Capacidades Especiales sobre 10 m³

## 1. Resumen / Historia de Usuario
**Como** Administrador / Sistema de Facturación,  
**Quiero** calcular automáticamente el descuento de ley para clientes registrados con beneficio de Tercera Edad o Capacidades Especiales cuando su consumo supere los 10 m³,  
**Para** cumplir con la normativa legal ecuatoriana de subsidios en servicios básicos sin intervención manual.

---

## 2. Reglas de Negocio
1. **Acreditación del Beneficio:** El cliente debe tener marcado el flag `aplicaTerceraEdad` o `aplicaDiscapacidad` y su porcentaje de carné/descuento en su ficha de cliente.
2. **Condición de Consumo:** El beneficio aplica a los consumos que cumplen la condición establecida (a partir de los 10 m³ según ordenanza/normativa aplicable).
3. **Desglose en Factura:** La prefactura y la factura electrónica SRI deben desglosar claramente el rubro "Subsidio Ley Tercera Edad / Discapacidad" restando del total a pagar.

---

## 3. Criterios de Aceptación (DoD)
- [ ] Motor de cálculo tarifario evalúa flags de beneficio y umbral de 10 m³.
- [ ] Se genera el detalle del descuento con su respectivo código de subsidio en el XML del SRI.
- [ ] Los avisos y facturas impresas reflejan claramente el descuento aplicado.
- [ ] Pruebas unitarias de cálculo tarifario con clientes con y sin beneficio pasando al 100%.
