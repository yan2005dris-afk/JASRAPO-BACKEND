# Perfil institucional de documentos

Los documentos oficiales resuelven una sola versión de `perfiles_institucionales` antes de adaptar o renderizar la plantilla. La vigencia usa el intervalo semiabierto `[vigente_desde, vigente_hasta)`: el inicio está incluido y el final pertenece a la siguiente versión.

La base de datos impide superposiciones mediante una restricción de exclusión. La aplicación también falla de forma explícita si no encuentra una versión o si recibe más de una. Cada modelo preparado incluye `metadatosDocumento.perfilInstitucional` con el identificador, versión y vigencia usados; el trabajo asíncrono de correo conserva ese mismo modelo y no vuelve a resolver el perfil.

El logo y la marca de agua se guardan como referencias versionadas al almacenamiento de objetos. Se convierten a `data:` URL al construir el modelo para que Puppeteer no dependa de una URL temporal durante el renderizado.

La migración inicial crea `v1` y el arranque publica su activo empaquetado en la clave declarada si todavía no existe. Este paso solo inicializa esa referencia conocida: cualquier versión posterior debe aportar activos existentes y falla explícitamente si una referencia es inválida.

## Cambio de datos oficiales

1. Cerrar la versión vigente asignando `vigente_hasta` al instante de cambio.
2. Crear una nueva fila con otro `version` y el mismo instante en `vigente_desde`.
3. Cargar los nuevos activos y guardar sus referencias en esa versión.
4. Mantener las versiones anteriores: son parte de la trazabilidad y no se sobrescriben.

No se deben agregar datos institucionales, representantes, identificaciones, RUC ni cláusulas legales dentro de archivos `.hbs`.

## Perfil inicial

El seed toma como referencia el convenio de pago canónico aprobado durante PDF-03. Esto elimina las representaciones contradictorias que existían entre plantillas heredadas. Los valores deben validarse por el responsable institucional antes de promover el perfil a un entorno productivo; una corrección se publica como una nueva versión y no modificando la plantilla.
