# Redis (backend-db/redis-data)

## Acceso local
- Redis escucha en el puerto 6379 por defecto.
- Puedes conectarte con:
  ```bash
  redis-cli -h localhost -p 6379
  ```
- El almacenamiento persistente está en esta carpeta.

## Seguridad en producción
- Configura una contraseña usando la variable de entorno `REDIS_PASSWORD` y el parámetro `requirepass` en el docker-compose.
- No expongas el puerto 6379 a internet.
- Limita el acceso solo a la red interna de Docker o a IPs seguras.
- Haz backups regulares de esta carpeta para no perder sesiones ni caché importante.
