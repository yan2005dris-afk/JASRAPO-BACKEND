# TASK-03: Refactorización del Módulo de Rutas (2 Tablas, Indicadores Visuales por Color, Exclusión y Validación por Operario)

## 1. Resumen / Historia de Usuario
**Como** Administrador / Secretaria de Operaciones,  
**Quiero** una pantalla de asignación de rutas simplificada en dos tablas interactivas con tarjetas identificadas por color, bordes amarillos para comunidades completadas/asignadas y validación estricta de no repetición de rutas por operario y por sector en el mismo mes, con un paso de resumen a pantalla completa,  
**Para** planificar el trabajo de lectura mensual de forma visual, ágil, sin solapamientos entre operarios ni asignaciones duplicadas.

---

## 2. Contexto y Requerimientos de UX y Negocio

### A. Estructura Visual (Paso 1 y 2: 2 Table Views)
1. **Tabla 1 (Operadores):**
   * Muestra la lista de operarios activos.
   * Al seleccionar un operario, la interfaz muestra de forma inmediata las **rutas / comunidades que dicho operario ya tiene asignadas en el mes en curso**, evitando que la secretaria intente asignarle rutas redundantes.
2. **Tabla 2 / Checklist de Comunidades y Sectores:**
   * **Identificador de color por Operario:** Cada operador seleccionado tiene asignado un color distintivo (chip / tag / badge) para asociar visualmente qué sectores le corresponden.
   * **Borde Amarillo (Comunidad Completada / Asignada):** Cuando todos los sectores de una comunidad ya han sido asignados (sea en la sesión actual o en rutas previas del mes), la tarjeta/card de la comunidad se resalta con un **borde amarillo visible**, indicando a la secretaria que esa comunidad ya está cubierta al 100%.
   * **Sectores Parciales:** Si una comunidad tiene 4 sectores y 2 ya están asignados, la tarjeta muestra los sectores asignados (bloqueados con el color del operario correspondiente) y los 2 sectores pendientes disponibles para selección.

### B. Validaciones y Reglas de Negocio (Backend y Frontend)
1. **No repetición por Operario:** Un operario no puede tener asignada la misma combinación de comunidad/sector más de una vez en el mismo periodo mensual.
2. **No repetición global por Sector:** Un sector asignado a un operario queda bloqueado y no puede ser asignado a ningún otro operario para el mismo mes.
3. **Exclusión Dinámica en Sesión:** Al marcar sectores para el *Operador A*, quedan automáticamente descontados y deshabilitados al cambiar al *Operador B* en la misma pantalla.

### C. Paso 3: Resumen y Confirmación (Full Width / Pantalla Completa)
* Al finalizar las selecciones, la vista oculta las tablas y expande un panel de resumen ocupando todo el ancho de la pantalla:
  * Desglose por Operario (con su color identificador, total de medidores y lista de sectores).
  * Panel de Cobertura Global: Comunidades cubiertas (amarillo) vs sectores huérfanos pendientes.
  * Botón de confirmación final: `Confirmar y Despachar Rutas`.

---

## 3. Criterios de Aceptación (DoD)
- [ ] La interfaz de rutas opera con 2 vistas de tabla claras (Operarios y Comunidades/Sectores).
- [ ] Al seleccionar un operario se visualizan claramente sus rutas ya creadas/asignadas en el mes.
- [ ] Las tarjetas de comunidades completadas/asignadas se destacan con un **borde amarillo**.
- [ ] Se asigna un identificador de color distintivo por cada operador en las listas de selección.
- [ ] Backend valida y rechaza intentos de crear rutas duplicadas para un mismo operario o sectores ya tomados en el mes.
- [ ] La selección en sesión descuenta automáticamente los sectores tomados entre operadores.
- [ ] El Paso 3 (Resumen) ocupa el ancho completo mostrando la distribución total antes del guardado.
- [ ] Pruebas E2E y unitarias cubriendo la lógica de no repetición y la experiencia de usuario.
