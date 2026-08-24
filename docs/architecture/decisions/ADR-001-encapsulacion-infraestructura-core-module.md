# ADR-001: Centralización y Encapsulación de Infraestructura en CoreModule

- **Estado:** Aceptado
- **Fecha:** 2026-08-23
- **Autores / Decisores:** Equipo Arquitectura JASRAPO
- **Referencia:** PR #235 / Tarea SC-234

---

## Contexto y Problema
`AppModule` concentraba configuraciones dispersas de infraestructura (`StorageModule`, `MailModule`, `PdfModule`, `AuditModule`, `ObservabilityModule`, `CryptoModule`, `TasksModule`, `ThrottlerModule`, etc.), rompiendo el principio de responsabilidad única y acoplando la orquestación de alto nivel con detalles técnicos de bajo nivel.

## Opciones Consideradas
1. **Mantener todo en `AppModule`:** Alta carga cognitiva y riesgo de dependencias circulares / registros duplicados.
2. **Crear un `CoreModule` Global:** Centralizar toda la infraestructura transversal y exportarla limpiamente hacia los módulos de negocio.

## Decisión Tomada
Se creó un `CoreModule` global en `backend/src/core/core.module.ts` que encapsula todos los módulos de soporte transversal. `AppModule` queda reservado exclusivamente para la orquestación de módulos de dominio y guardas globales de seguridad.

## Consecuencias
- **Positivas:** Reducción de boilerplate, desacoplamiento claro entre dominio e infraestructura, y arquitectura limpia y modular.
- **Trade-offs:** Los nuevos servicios de infraestructura transversal deben registrarse en `CoreModule` y no directamente en `AppModule`.
