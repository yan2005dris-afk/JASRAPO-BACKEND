# 🚀 Guía de Configuración para Desarrollo JASRAPO

## Estructura del Proyecto

Este es un monorepo que contiene:
- **Backend** (NestJS) - ubicado en `./backend`
- **Frontend** (Angular) - ubicado en `./JASRAPO-FRONTEND`

## Configuración de Vinculación Frontend-Backend

### Backend (NestJS)
- **Puerto**: 3000
- **Ruta API**: `/api/v1`
- **CORS**: Habilitado para `http://localhost:4200` (configurable vía `CORS_ORIGIN`)

### Frontend (Angular)
- **Puerto**: 4200 (default)
- **URL API**: `/api/v1` (relativa, redirigida por proxy)
- **Proxy**: Configurado en `JASRAPO-FRONTEND/proxy.conf.json`

## Instalación de Dependencias

### 1. Backend
```bash
cd backend
pnpm install
```

### 2. Frontend
```bash
cd JASRAPO-FRONTEND
pnpm install
```

## Ejecución en Desarrollo

### Opción 1: Ejecutar Backend y Frontend (Recomendado)

**Terminal 1 - Backend:**
```bash
cd backend
pnpm start
```
El backend estará disponible en `http://localhost:3000`
Documentación Swagger: `http://localhost:3000/docs`

**Terminal 2 - Frontend:**
```bash
cd JASRAPO-FRONTEND
pnpm start
```
El frontend estará disponible en `http://localhost:4200`

⚠️ **Importante**: El script `start` del frontend ya incluye el proxy (`--proxy-config proxy.conf.json`), 
por lo que las requests a `/api/v1` se redirigirán automáticamente a `http://localhost:3000/api/v1`.

### Opción 2: Ejecutar solo Frontend (si el Backend está en otra máquina)

Si el backend está en otro servidor:
1. Edita `JASRAPO-FRONTEND/proxy.conf.json`
2. Cambia `target` a la URL correcta del backend

## Verificación de Vinculación

1. **Abre el navegador**: `http://localhost:4200`
2. **Abre las Developer Tools** (F12)
3. **Ve a Network**
4. **Intenta hacer login o cualquier acción que requiera API**
5. **Verifica que las requests aparecen como `/api/v1/...`**
6. **Comprueba en Backend** que está procesando los requests

## Configuración de CORS

Si encuentras errores de CORS, verifica:

### Backend - Variables de Entorno
```bash
# En backend/.env
CORS_ORIGIN=http://localhost:4200
# O múltiples orígenes (separados por comas):
CORS_ORIGIN=http://localhost:4200,http://localhost:3000,http://localhost:5173
```

### Frontend - Proxy Config
```json
// JASRAPO-FRONTEND/proxy.conf.json
{
  "/api": {
    "target": "http://127.0.0.1:3000",
    "secure": false,
    "changeOrigin": true
  }
}
```

## Scripts Disponibles

### Backend
- `pnpm start` - Inicia el servidor
- `pnpm build` - Compila TypeScript
- `pnpm test` - Ejecuta tests

### Frontend
- `pnpm start` - Inicia el dev server con proxy
- `pnpm build` - Compila para producción
- `pnpm lint` - Ejecuta ESLint
- `pnpm lint:fix` - Corrige errores de formato
- `pnpm format:check` - Verifica formato de código
- `pnpm format:fix` - Formatea el código
- `pnpm test` - Ejecuta tests
- `pnpm e2e` - Ejecuta tests end-to-end

## Problemas Comunes

### "Cannot GET /api/v1/..."
**Causa**: El proxy no está configurado o no se está usando
**Solución**: Verifica que ejecutas `pnpm start` en el frontend (no `ng serve`)

### CORS Error
**Causa**: Backend no permite el origen del frontend
**Solución**: Configura `CORS_ORIGIN` en variables de entorno del backend

### "Cannot connect to localhost:3000"
**Causa**: Backend no está corriendo
**Solución**: Asegúrate de ejecutar `pnpm start` en la carpeta `backend`

### Frontend carga pero las APIs no funcionan
**Causa**: Proxy redirige pero backend no procesa request
**Solución**: Verifica logs del backend y que el endpoint existe

## Recursos Útiles

- **Documentación Backend (Swagger)**: `http://localhost:3000/docs`
- **Frontend**: `http://localhost:4200`
- **Proxy Config**: `JASRAPO-FRONTEND/proxy.conf.json`
- **CORS Config**: `backend/src/infrastructure/config/cors.options.ts`
