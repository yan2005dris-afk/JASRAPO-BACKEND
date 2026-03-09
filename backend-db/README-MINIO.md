# MinIO (backend-db/minio-data)

## Acceso local
- MinIO expone la API en el puerto 9000 y la consola web en el 9001.
- Acceso web: http://localhost:9001
- Usuario y contraseña por defecto: admin / password123
- El almacenamiento persistente está en esta carpeta.

## Seguridad en producción
- Cambia las variables de entorno `MINIO_ROOT_USER` y `MINIO_ROOT_PASSWORD` por valores fuertes.
- Usa HTTPS si expones MinIO fuera de la red local.
- No expongas los puertos a internet sin firewall o autenticación fuerte.
- Haz backups regulares de esta carpeta para no perder archivos importantes.
