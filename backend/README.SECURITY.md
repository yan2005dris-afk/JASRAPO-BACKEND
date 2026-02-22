# Seguridad en el Backend: JWT y Roles

Este documento explica cómo funciona la seguridad en el backend, detallando cada componente, su propósito, ubicación, métodos y variables clave. Ideal para aprender y documentar.

---

## 1. JWT (JSON Web Token)

### ¿Qué es?

JWT es un estándar para transmitir información segura entre partes como un objeto JSON firmado. Se usa para autenticar usuarios y autorizar accesos.

### Archivos involucrados

- `auth.service.ts`
- `jwt.strategy.ts`
- `.env` (variables: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`)
- `auth.controller.ts`
- `jwt-auth.guard.ts`
- `refresh.strategy.ts`
- `jwt-refresh.guard.ts`

### ¿Dónde se crea?

- En `auth.service.ts`, método `generateJwtToken`:
  - Crea el access token y refresh token usando el payload `{ sub: userId, sid: sessionId }`.
  - Usa las variables de entorno para firmar los tokens.

### ¿Dónde se utiliza?

- En `jwt.strategy.ts` y `refresh.strategy.ts` para validar tokens.
- En los guards para proteger endpoints.
- En el controlador para login y refresh.

---

## 2. jwt.strategy.ts

### ¿Qué es?

Una estrategia Passport para validar el access token JWT.

### ¿Qué necesita?

- El JWT generado en el login.
- La variable de entorno `JWT_ACCESS_SECRET`.

### Métodos

- **constructor**
  - Obtiene el secreto JWT.
  - Configura la estrategia para extraer el token del header Authorization.
- **validate(payload: any)**
  - Extrae `sub` (userId) y `sid` (sessionId) del payload.
  - Verifica la sesión en la base de datos.
  - Verifica que el usuario exista y no esté eliminado.
  - Retorna datos del usuario para el request.

### Variables

- `sub`: userId del usuario autenticado.
- `sid`: sessionId de la sesión actual.
- `JWT_ACCESS_SECRET`: clave para validar el token.

---

## 3. refresh.strategy.ts

### ¿Qué es?

Una estrategia Passport para validar el refresh token JWT.

### ¿Qué necesita?

- El JWT generado como refresh token.
- La variable de entorno `JWT_REFRESH_SECRET`.

### Métodos

- **constructor**
  - Obtiene el secreto JWT de refresh.
  - Configura la estrategia para extraer el token del header Authorization.
- **validate(payload: any)**
  - Extrae `sub` y `sid` del payload.
  - Verifica la sesión en la base de datos.
  - Verifica que la sesión no esté revocada ni expirada.
  - Retorna datos mínimos para el request.

### Variables

- `sub`: userId.
- `sid`: sessionId.
- `JWT_REFRESH_SECRET`: clave para validar el token de refresh.

---

## 4. Guards

### jwt-auth.guard.ts

- Protege endpoints usando el access token JWT.
- Usa la estrategia `jwt`.

### jwt-refresh.guard.ts

- Protege el endpoint de refresh usando el refresh token JWT.
- Usa la estrategia `jwt-refresh`.

### permissions.guard.ts

- Protege endpoints según permisos y roles.
- Verifica si el usuario tiene el permiso requerido para la acción y recurso.

---

## 5. Roles y Permisos

### ¿Qué es?

Sistema para controlar qué acciones puede realizar cada usuario según su rol y los permisos asociados.

### Archivos involucrados

- Prisma models:
  - `Roles.prisma`
  - `UserRoles.prisma`
  - `Permisos.prisma`
  - `RolPermisos.prisma`
- `permissions.guard.ts`
- `require-permission.decorator.ts`
- `user.controller.ts`
- `user.service.ts`

### ¿Dónde se crea?

- En la base de datos, a través de los modelos Prisma.
- Los permisos se asignan a roles y los roles a usuarios.

### ¿Dónde se utiliza?

- En el guard `permissions.guard.ts`.
- En los controladores, usando el decorador `@RequiredPermission('recurso', 'acción')`.

---

## 6. Decoradores

### require-permission.decorator.ts

- Define el decorador `@RequiredPermission`.
- Permite especificar el recurso y la acción requerida para acceder a un endpoint.

---

## 7. Controladores

### auth.controller.ts

- Login, registro y refresh de tokens.
- Usa los guards para proteger endpoints.

### user.controller.ts

- Endpoints de usuario protegidos por JWT y permisos.
- Usa el decorador de permisos.

---

## 8. Variables de entorno

- `JWT_ACCESS_SECRET`: clave para firmar y validar el access token.
- `JWT_REFRESH_SECRET`: clave para firmar y validar el refresh token.

---

## 9. Resumen de flujo

1. Usuario inicia sesión → se genera access y refresh token.
2. Access token se usa para acceder a endpoints protegidos.
3. Refresh token se usa para renovar el access token cuando expira.
4. Guards y estrategias validan los tokens y permisos.
5. Roles y permisos determinan qué acciones puede realizar cada usuario.

---

> Documenta cada archivo siguiendo este esquema para tener claro el propósito, métodos y variables clave.
