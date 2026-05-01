# 💰 Billing Context

## Responsabilidad
Gestión financiera: tarifas, cargos, facturación y eventualmente pagos. Transforma las mediciones en transacciones económicas.

## Contenido
- **`tariffs/`**: Definición de categorías tarifarias y reglas de cálculo.
- *(Próximamente)*: Invoices, Payments, SRI integration.

## Screaming Architecture
Define el modelo económico del negocio. Se comunica con `metering` para obtener los consumos pero mantiene su propia lógica de precios y regulaciones.
