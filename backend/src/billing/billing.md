# 💰 Billing Context (Facturación)

Este contexto se encarga de transformar la medición (`metering`) y las reglas de negocio en documentos financieros y fiscales.

## 🏛️ Consideraciones Arquitectónicas (Decisiones de Diseño)

### 1. Desnormalización por Performance (Redundancia Controlada)
En los modelos `Facturas` y `Prefacturas` mantenemos campos redundantes como `abono`, `saldo_pendiente` y `total_pagar` a pesar de que estos podrían calcularse sumando los `DetallePago`.
- **Razón**: Optimización masiva de lectura para reportes de cartera y procesos de corte. Evitamos `JOINs` y agregaciones pesadas en tablas de millones de registros.
- **Contrato**: Los `Use Cases` de pago (Interactors) son los únicos responsables de mantener la atomicidad y actualizar estos saldos en la misma transacción.

### 2. Inmutabilidad vía Snapshots
Las prefacturas y facturas almacenan una copia (snapshot) de los datos del cliente, tarifas e intereses al momento de la creación.
- **Razón**: Los documentos financieros deben ser históricos. Si un cliente cambia su RUC o una tarifa sube, los documentos emitidos anteriormente NO deben cambiar.
- **Auditoría**: Permite reconstruir exactamente qué se le cobró al usuario y bajo qué reglas de ese momento.

### 3. Prefactura como "Fuente de Verdad" Operativa
La `Prefactura` es el paso previo a la `Factura` fiscal. 
- Contiene el cálculo de `deuda_anterior`, `interes_mora` y consumos.
- Permite correcciones antes de la emisión al SRI, evitando anulaciones masivas de facturas electrónicas.

## 🗂️ Estructura del Contexto
- **`tariffs/`**: Definición de categorías tarifarias y reglas de cálculo.
- **`facturas/`**: (En desarrollo) Emisión y gestión de comprobantes fiscales.
- **`pagos/`**: (En desarrollo) Recaudación y gestión de saldos.

## ⚙️ Screaming Architecture
Define el modelo económico del negocio. Se comunica con `metering` para obtener los consumos pero mantiene su propia lógica de precios y regulaciones.
