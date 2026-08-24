# Mapa de Documentación y Registro de Decisiones Arquitectónicas (ADRs)

Este documento estructura el estado actual de la carpeta `docs/`, detalla el propósito de cada directorio, define qué elementos son candidatos para depuración/archivo y establece la estructura estándar para el registro de **Decisiones Arquitectónicas (ADRs)** en el proyecto.

---

## 1. Inventario de Carpetas en `docs/`

| Directorio / Archivo | Propósito Actual | Estado / Recomendación |
| :--- | :--- | :--- |
| `architecture/` | Diagramas, especificaciones de arquitectura y despachadores globales. | **Mantener y expandir**. Aquí reside la nueva carpeta `architecture/decisions/`. |
| `architecture/decisions/` | **Nuevo directorio** para Architecture Decision Records (ADRs). | **Activo**. Registra el contexto, alternativas y decisiones técnicas clave. |
| `audits/` | Reportes históricos de seguridad, SRI y convenciones (ej. `4r-security-review.md`). | **Mantener** como referencia de auditorías ejecutadas. |
| `conventions/` | Reglas de estilo y desarrollo para agentes y desarrolladores. | **Mantener** (Reglas vivas). |
| `flujos/` | Diagramas y especificaciones de flujos de negocio. | **Mantener**. |
| `guides/` | Guías de onboarding, setup y despliegue. | **Mantener**. |
| `observability/` | Configuración de métricas Prometheus, Grafana, Loki y Tempo. | **Mantener**. |
| `requisitos/` | Historias de usuario, requerimientos funcionales y técnicos. | **Mantener**. |
| `resources/` | Esquemas de base de datos, diagramas ER y assets de apoyo. | **Mantener**. |
| `sri/` | Especificaciones de facturación electrónica, firmas XAdES-BES y esquemas XML del SRI. | **Mantener** (Crítico). |
| `standards/` | Estándares de capas, nomenclatura, manejo de excepciones y APIs REST. | **Mantener** (Vivos). |
| `task/` | Checklists de tareas individuales y planes de sprint específicos. | **Candidato a archivo**: Tareas ya completadas pueden consolidarse o limpiarse periódicamente. |
| `legacy/` | Documentación funcional del sistema PHP anterior (levantamiento inicial). | **Archivar / Mantener como Read-Only**: Útil solo para consultar reglas históricas. |
| `Files JASRAP-Olon/` | Exportaciones pesadas de imágenes (diagramas de estado, casos de uso) y PDFs de ejemplo. | **Candidato a reorganizar**: Las imágenes pesadas y duplicados podrían migrar a `resources/assets/`. |
| `frontend/` | Archivo `CONFIGURACION_FRONTEND.md` huérfano dentro del backend. | **Candidato a eliminar o mover**: Debería estar en el repo `JASRAPO-FRONTEND`. |
| `HISTORIAS-DE-USUARIO.docx` | Archivo binario `.docx` en la raíz de `docs/` duplicado de `HISTORIAS-DE-USUARIO.md`. | **Candidato a eliminar**: Mantener únicamente el archivo `.md`. |

---

## 2. Propuesta de Depuración / Limpieza

1. **Eliminar binarios duplicados:**
   - Eliminar `docs/HISTORIAS-DE-USUARIO.docx` (la versión markdown `docs/HISTORIAS-DE-USUARIO.md` es la fuente de verdad).
2. **Reubicar documentación cruzada:**
   - Mover o eliminar `docs/frontend/CONFIGURACION_FRONTEND.md` para mantener cohesión de repositorios.
3. **Organizar assets:**
   - Renombrar `Files JASRAP-Olon` a una estructura más limpia bajo `docs/resources/diagrams/` y `docs/resources/samples/`.

---

## 3. Estructura de Decisiones Arquitectónicas (`docs/architecture/decisions/`)

Cada decisión arquitectónica sigue el formato estándar **MADR** (*Markdown Architecture Decision Record*):

```text
docs/architecture/decisions/
├── README.md                           <- Índice consolidado de decisiones
├── ADR-001-encapsulacion-core-module.md
├── ADR-002-inmutabilidad-lecturas-fisicas.md
└── ...
```

### Plantilla de ADR (`template.md`):

```markdown
# ADR-[NUM]: [Título Corto y Claro de la Decisión]

- **Estado:** [Propuesto | Aceptado | Reemplazado por ADR-XXX | Obsoleto]
- **Fecha:** YYYY-MM-DD
- **Autores / Decisores:** [Nombre / Equipo]

## Contexto y Problema
[Describe el problema de diseño, requerimiento o cuello de botella que motiva esta decisión.]

## Opciones Consideradas
1. **Opción A:** [Descripción y pros/contras]
2. **Opción B:** [Descripción y pros/contras]

## Decisión Tomada
[Opción elegida y justificación técnica.]

## Consecuencias
- **Positivas:** [Beneficios inmediatos o a largo plazo]
- **Negativas / Compromisos (Trade-offs):** [Costos, complejidad añadida o restricciones]
```
