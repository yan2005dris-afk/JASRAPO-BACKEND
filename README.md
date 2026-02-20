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
