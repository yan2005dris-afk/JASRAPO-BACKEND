# JASRAPO-BACKEND

> [!IMPORTANT]
> Es importante este apartado sino no se podra desplegar el proyecto o mantener un versionado correcto.

## Prerequisitos

- Necesitamos tener docker desktop instalado y tenerlo ejecutando en segundo plano.
- Se usara docker para el control de versiones y no tener problemas que en una computadora pueda desplegar y en otra no.

> [!NOTE]
> Las siguientes instrucciones tienen que posicionarse sobre backend/

## Para levantar el documento en desarrollo necesitamos usar el siguiente comando:

```bash
$ docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
```

Esto permitira que el docker levante el proyecto para desarollo.

> [!WARMING]
> Si intenta usar el comando usual para desplegar docker no funcionara, esto levantara para producción y esto deben tener otras configuraciones: el comando es: docker compose up -d --build

Una vez hecho todo esto se desplegara la base de datos en postgres y se iniciara el node en version 22, para el desarollo.

## Acceso a Redis y MinIO

- **Redis** corre por defecto en `localhost:6379`.
  - Puedes conectarte con:
    ```bash
    redis-cli -h localhost -p 6379
    ```
  - En desarrollo, no tiene contraseña y acepta conexiones locales.
  - **En producción:**
    - Configura una contraseña en el archivo docker-compose (agrega `requirepass TU_PASSWORD` en la sección de Redis o usa la variable REDIS_PASSWORD).
    - Limita el acceso solo a la red interna de Docker o a IPs seguras.
    - No expongas el puerto 6379 a internet.

- **MinIO** corre en `localhost:9000` (API) y `localhost:9001` (consola web).
  - Acceso web: http://localhost:9001
  - Usuario y contraseña por defecto: admin / password123 (cámbialos en producción).
  - **En producción:**
    - Cambia las variables de entorno `MINIO_ROOT_USER` y `MINIO_ROOT_PASSWORD`.
    - Usa HTTPS si expones MinIO fuera de la red local.
    - No expongas los puertos a internet sin firewall o autenticación fuerte.

## Seguridad recomendada en producción

- Usa contraseñas fuertes y diferentes para cada servicio.
- No expongas puertos de bases de datos, Redis ni MinIO directamente a internet.
- Usa redes privadas de Docker para la comunicación entre servicios.
- Considera usar un firewall o reglas de red para restringir el acceso.
- Haz backups regulares de los volúmenes de backend-db.
