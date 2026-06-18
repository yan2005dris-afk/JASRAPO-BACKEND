# Reglas de Facturación — Primer Período

## Regla: Cargo Inicial Diferido

Cuando se crea un contrato nuevo, el consumo del **primer período** no se cobra
en ese momento. En lugar de eso, se **acumula** y se cobra junto con el
segundo período.

### Cómo se determina

El módulo de facturación debe inferir si un contrato está en su primer período
sin necesidad de un flag explícito:

```
¿Es el primer período?
  → No existen pre-facturas previas para este contrato
  → Sí → diferir cargo
  → No → cobrar normal
```

### Flujo

```
Período 1 (mes 1)
  ├── Lectura actual - lecturaInicial = consumo_real
  ├── ¿Hay pre-facturas previas para este contrato? → NO
  └── Diferir: no se emite cargo, el consumo se acumula

Período 2 (mes 2)
  ├── Lectura actual - lecturaInicial = consumo_real + acumulado_periodo_1
  ├── ¿Hay pre-facturas previas? → SÍ (período 1 fue diferido)
  └── Cobrar: se emite cargo por el total acumulado
```

### ¿Por qué no un flag?

Se eliminó `cargoInicialDiferido` del modelo `Contratos` porque es información
**deducible**: basta con consultar si el contrato tiene pre-facturas previas.
Esto evita:
- Estado inconsistente (flag `true` pero con 10 pre-facturas)
- Mantenimiento extra al migrar contratos
- Lógica redundante entre el flag y la realidad

### Dato técnico requerido

`lecturaInicial` en `HistorialMedidores` es necesaria para calcular el consumo
acumulado. Sin ese valor no es posible determinar cuánto consumió el medidor
desde su instalación.

```
consumo_total = lectura_actual - lectura_inicial
```
