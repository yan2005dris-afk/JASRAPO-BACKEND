# PRISMA

## ¿Qué es una Migración?

Una migración es como un sistema de control de versiones (Git) pero para tu base de datos. En lugar de modificar las tablas manualmente con SQL, describes los cambios en el archivo schema.prisma. Al ejecutar una migración, Prisma genera un archivo .sql histórico que transforma la estructura de la base de datos de manera controlada y reversible.

¿Qué es el Seeding (Seed)?

El seeding es el proceso de poblar la base de datos con datos iniciales. Es crucial para que otros desarrolladores (o tú mismo en otro entorno) tengan registros de prueba (usuarios, roles, categorías) nada más clonar el proyecto, sin tener que crearlos manualmente uno a uno.


## Comandos para prisma

Para ejecutar estos comandos, asegúrate de tener configurada tu variable DATABASE_URL en el archivo .env.

* Inicializa Prisma en el proyecto 

```bash
  npx prisma init
```

* Revisa que tu archivo schema.prisma no tenga errores de sintaxis o relaciones mal formadas.

```bash
  npx prisma validate
```

* Compara tu esquema con la DB.

* Crea el archivo SQL de migración.

* Aplica los cambios.

* Genera el Prisma Client para tener autocompletado en tu código.

# Desarrollo y Migraciones
```bash
  npx prisma migrate dev --name nombre_de_la_migracion
```

- Borra todos los datos y tablas, y vuelve a ejecutar todas las migraciones desde cero. Usar con precaución.

```bash
  npx prisma migrate reset
```
Sincroniza el esquema con la DB sin crear archivos de migración. Ideal para prototipado rápido o pruebas locales.

```bash
    npx prisma db push
```

# Gestión de Datos y Cliente

Regenera el Prisma Client. Es indispensable después de cualquier cambio manual en el esquema para que TypeScript reconozca los nuevos modelos.

```bash
    npx prisma generate
```

Ejecuta el script definido en package.json para insertar los datos iniciales.

```bash
    npx prisma db seed
```

Abre una consola visual en el navegador para administrar tus datos de forma intuitiva.

```bash
    npx prisma studio
```
