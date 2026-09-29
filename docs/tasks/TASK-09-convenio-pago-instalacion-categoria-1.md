# TASK-09: Convenio de Pago para Prefactura de Instalación/Guía en Contratos de Categoría 1

## 1. Resumen / Historia de Usuario
**Como** Solicitante / Cliente de Categoría 1 (Residencial Básica),  
**Quiero** diferir el costo de la prefactura de instalación (derecho de conexión/guía de $120.00) pagando un 50% inicial ($60.00) y el saldo restante mediante un convenio de pago en cuotas,  
**Para** acceder al servicio de agua potable con facilidades de pago sin desembolsar el valor total de contado.

---

## 2. Contexto y Reglas de Negocio
1. **Restricción Exclusiva por Categoría Tarifaria:**
   * **Categoría 1 (Residencial / Básica):** **SÍ** puede solicitar convenio de pago sobre la prefactura de instalación.
   * **Resto de Categorías (Comercial, Industrial, Especial, etc.):** **NO** aplica; deben cancelar el 100% de la prefactura de contado para proceder con la instalación.
2. **Condiciones Financieras del Convenio de Instalación (Categoría 1):**
   * **Valor Referencial de Instalación:** $120.00 (según rubro configurado).
   * **Abono Inicial Mínimo Obligatorio:** 50% ($60.00).
   * **Saldo Financiado:** El 50% restante ($60.00) se difiere en cuotas mensuales (definidas en el convenio, ej. 2 a 6 meses).
3. **Impacto en el Ciclo de Vida del Contrato:**
   * Al pagar el abono inicial del 50% ($60.00) y firmar el convenio:
     * El contrato pasa de `PENDIENTE_PAGO` a `PENDIENTE_INSTALACION`.
     * Se genera la Orden de Trabajo de tipo `INSTALACION`.
     * Las cuotas mensuales del convenio se cargarán a las prefacturas de consumo mensuales subsiguientes.

---

## 3. Alcance Técnico de Implementación

### A. Backend (NestJS)
1. **Validación en `CreateAgreementUseCase`:**
   * Si el convenio se solicita contra una prefactura de instalación (código `INSTALACION`):
     * Validar que el contrato pertenezca a `categoriaTarifaId == 1` (o código de categoría residencial).
     * Si pertenece a otra categoría -> Lanzar `BadRequestException('El convenio de pago para instalación solo está permitido para contratos de Categoría 1 (Residencial).')`.
     * Validar que `abonoInicial >= 50%` del valor total de la prefactura de instalación.
2. **Transición en `PagoValidadoHandler` / `AgreementService`:**
   * Al registrarse el pago del abono inicial del 50%, considerar habilitada la transición contractual a `PENDIENTE_INSTALACION`.

### B. Frontend (Angular 21)
1. **Módulo de Cobranza / Contratos:**
   * Al consultar una prefactura de instalación de un contrato Categoría 1, habilitar el botón "Diferir / Convenio de Instalación (50% inicial)".
   * Para otras categorías, el botón se oculta o se deshabilita con tooltip explicativo.
   * Formulario de convenio precargado con el 50% mínimo ($60.00) y selector de número de cuotas para el saldo.

---

## 4. Criterios de Aceptación (DoD)
- [ ] Backend rechaza solicitudes de convenio de instalación para contratos que no sean de Categoría 1 (HTTP 400).
- [ ] Backend exige abono inicial >= 50% para prefacturas de instalación de Categoría 1.
- [ ] Al pagar el 50% inicial y formalizar el convenio, el contrato pasa a `PENDIENTE_INSTALACION` y se genera la OT de instalación.
- [ ] Frontend muestra la opción de convenio de instalación exclusivamente para contratos Categoría 1.
- [ ] Pruebas unitarias de `CreateAgreementUseCase` y validaciones de categorías pasando al 100%.
