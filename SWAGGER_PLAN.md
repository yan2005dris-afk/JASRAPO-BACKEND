# Plan de Documentación con Swagger en Nest.js

## 📚 Explicación: Decoradores de Swagger

### 1. Decoradores de Nivel Controlador
| Decorador | Descripción |
|-----------|-------------|
| `@ApiTags('nombre')` | Agrupa endpoints en categorías en Swagger UI |
| `@ApiBearerAuth()` | Indica que el endpoint requiere token JWT |
| `@ApiOAuth2([' scopes '])` | Para autenticación OAuth2 |

### 2. Decoradores de Nivel Endpoint
| Decorador | Descripción |
|-----------|-------------|
| `@ApiOperation({ summary, description })` | Descripción de la operación |
| `@ApiResponse({ status, description, type })` | Documenta respuestas posibles |
| `@ApiParam({ name, description, type })` | Documenta parámetros de ruta |
| `@ApiQuery({ name, description, type, required })` | Documenta query parameters |
| `@ApiBody({ type })` | Documenta el cuerpo de la petición |

### 3. Decoradores de Nivel DTO/Entidad
| Decorador | Descripción |
|-----------|-------------|
| `@ApiProperty({ description, example, required, type, nullable })` | Documenta propiedades |
| `@ApiPropertyOptional()` | Para propiedades opcionales |
| `@ApiHideProperty()` | Oculta propiedades en Swagger |
| `@ApiEnumValue()` | Para enums |

### 4. Configuración Global en main.ts
- `DocumentBuilder` para configurar título, descripción, versión
- `addBearerAuth()` para JWT
- `addTag()` para tags personalizadas
- `addServer()` para múltiples entornos

---

## ✅ Plan de Implementación

### Paso 1: Mejorar configuración global en main.ts
- [x] Agregar descripción más completa
- [x] Agregar información de contacto
- [x] Configurar términos de servicio y licencia

### Paso 2: Documentar Auth Module
- [x] auth.controller.ts - Agregar @ApiOperation y @ApiResponse
- [x] login-user.dto.ts - Agregar @ApiProperty con ejemplos
- [x] register.dto.ts - Agregar @ApiProperty con ejemplos

### Paso 3: Documentar Users Module
- [x] user.controller.ts - Completar documentación de endpoints
- [x] create-user.dto.ts - Agregar @ApiProperty
- [x] update-user.dto.ts - Agregar @ApiProperty
- [x] update-user-role.dto.ts - Agregar documentación

### Paso 4: Documentar Profile Module
- [x] profile.controller.ts - Mejorar documentación existente
- [x] create-profile.dto.ts - Agregar @ApiProperty
- [x] update-profile.dto.ts - Agregar @ApiProperty

### Paso 5: Documentar Menus Module
- [x] menus.controller.ts - Agregar documentación
- [x] DTOs de menus - Agregar @ApiProperty

---

## 🎯 Objetivo Final
Tener toda la API documentada con:
- Descripciones claras de cada endpoint
- Ejemplos de request/response
- Códigos de estado HTTP documentados
- Autenticación JWT configurada
- DTOs completamente documentados

