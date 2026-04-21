# Configuración de Despliegue Frontend - JASRAPO

Este documento resume los cambios realizados para que el frontend de Angular (v21) funcione correctamente en el servidor con persistencia y sin errores de CORS o Host Check.

## 1. Configuración de Angular (`angular.json`)

Para permitir que el servidor de desarrollo acepte conexiones desde dominios externos (como Cloudflare o túneles de Tailscale), se modificó la sección `serve` en el archivo `angular.json`:

```json
"serve": {
  "builder": "@angular/build:dev-server",
  "options": {
    "allowedHosts": ["*"]
  },
  "configurations": {
    "development": {
      "buildTarget": "frontend:build:development",
      "proxyConfig": "proxy.conf.json"
    }
    // ... otras configuraciones
  }
}
```

## 2. Gestión de Procesos con PM2

Se configuró **PM2** para mantener el proceso vivo y reiniciarlo automáticamente si el servidor se apaga.

### Comando de inicio:
```bash
pm2 start "ng serve frontend --host 0.0.0.0 --port 4200" --name "jasrapo-frontend"
```

### Persistencia tras reinicio del sistema:
1. Generar script de inicio: `pm2 startup`
2. Ejecutar el comando `sudo` que te devuelve el paso anterior.
3. Guardar la lista de procesos actual: `pm2 save`

## 3. Comandos Útiles

| Acción | Comando |
| :--- | :--- |
| Ver estado del frontend | `pm2 status` |
| Ver logs en tiempo real | `pm2 logs jasrapo-frontend` |
| Reiniciar el frontend | `pm2 restart jasrapo-frontend` |
| Detener el frontend | `pm2 stop jasrapo-frontend` |

## 4. Solución de Problemas (Troubleshooting)

- **Error de CORS**: Asegurarse de que el backend tenga configurado el `CORS_ORIGIN` en el archivo `.env` incluyendo el dominio público del frontend.
- **Blocked Request (Host Check)**: Si aparece un error de "Host not allowed", verificar que `"allowedHosts": ["*"]` esté presente en `angular.json` bajo el target `serve`.
- **Puerto Ocupado**: Si el puerto 4200 está ocupado, usar `lsof -i :4200` para encontrar el proceso y matarlo, o cambiar el puerto con `--port 4201`.
