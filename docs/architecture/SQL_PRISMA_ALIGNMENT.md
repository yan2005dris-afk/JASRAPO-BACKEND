# Alineación de Prisma Schema con Constraints, Índices y Funciones SQL (PostgreSQL)

Este documento registra el inventario formal de constraints, índices parciales y funciones SQL gestionadas fuera de la sintaxis nativa de Prisma para mantener la sincronización y blindaje de la base de datos.

---

## 1. Índices Parciales y Reglas de Unicidad en PostgreSQL

Prisma no soporta nativamente cláusulas `WHERE` en índices (`@@unique` parciales). Estas reglas críticas se gestionan mediante migraciones SQL declarativas:

| Tabla | Índice / Constraint | Condición SQL | Propósito de Negocio |
| :--- | :--- | :--- | :--- |
| `historial_medidores` | `idx_historial_contrato_abierto` | `WHERE fecha_hasta IS NULL AND borrado_en IS NULL` | Garantiza que un contrato solo pueda tener **un único medidor activo simultáneamente**. |
| `historial_medidores` | `idx_historial_medidor_abierto` | `WHERE fecha_hasta IS NULL AND borrado_en IS NULL` | Garantiza que un medidor físico solo pueda estar asignado a **un único contrato activo a la vez**. |
| `prefacturas` | `uk_prefacturas_consumo_mensual` | `WHERE borrado_en IS NULL AND tipo = 'CONSUMO_MENSUAL'` | Impide la doble facturación de consumo mensual para el mismo contrato y periodo. |
| `rubros` | `uk_rubros_sistema_categoria` | `WHERE codigo_sistema_rubro IS NOT NULL AND borrado_en IS NULL` | Evita rubros del sistema duplicados dentro de la misma categoría tarifaria. |

### Constraints CHECK

Prisma no modela ni diferencia constraints `CHECK`; se gestionan mediante migraciones SQL declarativas y se documentan aquí para evitar drift silencioso:

| Tabla | Constraint | Condición SQL | Propósito de Negocio |
| :--- | :--- | :--- | :--- |
| `contratos` | `contratos_coordenadas_chk` | `(latitud IS NULL AND longitud IS NULL) OR (latitud IS NOT NULL AND longitud IS NOT NULL AND latitud BETWEEN -90 AND 90 AND longitud BETWEEN -180 AND 180)` | Garantiza que las coordenadas del predio sean un par completo y válido, o estén ambas ausentes; ningún escritor (API, seeds, scripts SQL) puede dejar un par parcial o fuera de rango. |

---

## 2. Stored Procedures y Funciones SQL Críticas

Las siguientes funciones de base de datos fueron auditadas y alineadas con los estados actuales (`estado_servicio` y `estado_cobranza`), habiéndose purgado todas las referencias a la columna legacy `contratos.estado` / `EstadoContrato`:

1. **`public.inicializar_lecturas_ruta(...)`:**
   * Itera contratos activos (`c.estado_servicio = 'ACTIVO'`) con medidores vigentes en la comunidad/sector de la ruta.
   * Inicializa registros en `lecturas` y genera la Orden de Trabajo de lectura correspondiente.
2. **`public.generar_prefacturas_lote(...)`:**
   * Procesa lecturas aprobadas (`l.estado = 'APROBADA'`) de contratos activos (`c.estado_servicio = 'ACTIVO'`).
   * Calcula consumo escalonado, cargos fijos y variables, e inserta prefacturas y lotes de emisión.
3. **`public.generar_prefactura_instalacion(...)`:**
   * Valida que el contrato esté en `c.estado_servicio = 'PENDIENTE_PAGO'` tras la aprobación de la inspección.
   * Genera la prefactura de instalación con el rubro de derecho de conexión.
4. **`public.operator_sync_capture_change()` (Triggers de sincronización offline):**
   * Captura eventos de mutación (`INSERT`, `UPDATE`, `DELETE`) sobre `rutas`, `ordenes_trabajo`, `lecturas`, `medidores` y `lectura_anomalia` para alimentar el registro de cambios hacia la PWA de operarios.
   * `contratos` no tiene trigger de captura: las ediciones de `latitud`/`longitud` (o `direccionSuministro`, mismo precedente) no generan un registro de sincronización delta hacia la PWA de operarios (seguimiento pendiente). Desde la migración `20260925000000_move_coordinates_to_contratos`, los payloads de cambios de `medidores` ya no incluyen claves de coordenadas (columnas eliminadas de esa tabla).

---

## 3. Matriz de Verificación y Buenas Prácticas

- [x] **No referencias a `contratos.estado`:** Todas las funciones SQL operan sobre `estado_servicio` y `estado_cobranza`.
- [x] **Invariantes de Historial:** Unicidad parcial garantizada para un único medidor abierto por contrato y viceversa.
- [x] **Pruebas de Regresión:** Las suites de tests unitarios e integración validan que las funciones SQL y Prisma operen bajo el mismo contrato de persistencia.
