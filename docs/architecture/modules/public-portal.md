# 🌐 Public Portal Context

## Responsabilidad
Puntos de entrada públicos para usuarios no autenticados o consultas externas rápidas.

## Contenido
- **`search/`**: Búsqueda pública de deudas o estados de cuenta.

## Screaming Architecture
Separa claramente las funcionalidades que no requieren autenticación robusta, permitiendo aplicar políticas de seguridad y rate-limiting diferenciadas.
