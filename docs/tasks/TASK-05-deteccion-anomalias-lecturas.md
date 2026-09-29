# TASK-05: Detección Automática de Anomalías y Consumos Atípicos en Lecturas

## 1. Resumen / Historia de Usuario
**Como** Operador / Administrador de Facturación,  
**Quiero** que el sistema identifique y marque automáticamente las anomalías de consumo en las lecturas ingresadas sin requerir inspección manual previa,  
**Para** reducir el tiempo de revisión humana, evitar errores de facturación y detectar oportunamente fugas o medidores trabados.

---

## 2. Contexto y Problema Actual
Actualmente, un operador debe analizar manualmente las lecturas para detectar consumos atípicos, medidores detenidos o saltos desproporcionados, lo que genera cuellos de botella antes de emitir el borrador del día 31.

---

## 3. Reglas de Negocio y Criterios de Detección
1. **Consumo Cero Sospechoso:** Si el consumo es 0 m³ en un contrato activo habitado durante 2 meses consecutivos -> Marcar novedad `POSIBLE_MEDIDOR_PARADO`.
2. **Consumo Atípico / Disparado:** Si el consumo supera el 200% del promedio histórico de los últimos 3 a 6 meses -> Marcar `CONSUMO_ALTO_REVISION` y pasar lectura a estado `POR_REVISION`.
3. **Lectura Invertida / Menor a la Anterior:** Si `lecturaActual < lecturaAnterior` -> Marcar error crítico `LECTURA_INVERTIDA` y bloquear planillado hasta verificación.
4. **Visibilidad en Interfaz:** En el listado de lecturas de Angular, las anomalías se resaltan con alertas visuales (badges de color) y filtro rápido "Solo con anomalías".

---

## 4. Criterios de Aceptación (DoD)
- [ ] Backend ejecuta el algoritmo de validación de rangos históricos en `CreateReadingUseCase` e importaciones masivas.
- [ ] Lecturas fuera de rango pasan automáticamente al estado `POR_REVISION`.
- [ ] Frontend muestra indicadores visuales de anomalía y detalle del motivo.
- [ ] Pruebas unitarias del validador de anomalías con casos de borde pasando al 100%.
