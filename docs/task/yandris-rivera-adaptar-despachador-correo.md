# Adaptación del Despachador de Correo (Inspirado en Publimes)

Este documento detalla el análisis del funcionamiento del envío de correos en **Publimes-Omnicanal** y la propuesta técnica para adaptar e implementar estas mejoras en **JASRAPO-BACKEND**, resolviendo limitaciones actuales de rendimiento, escalabilidad y tolerancia a fallos.

---

## 1. Estado Actual en JASRAPO-BACKEND

Actualmente, el sistema de mensajería y correos en JASRAPO funciona de la siguiente manera:
* **Cola de Trabajo (Queue)**: Se utiliza `pg-boss` integrado en PostgreSQL para encolar el envío de correos (`mail-queue.service.ts`).
* **Proveedor Único**: El `MailProviderFactory` instancia el proveedor de correo en base a las variables de entorno (`.env`), usando Brevo (SMTP Relay) como canal principal y un fallback simple a Gmail SMTP si el principal falla del todo en tiempo de ejecución.
* **Adjuntos en Base de Datos**: Cuando se genera una planilla o prefactura en PDF, se pasa el **Buffer binario completo** del PDF a través del payload del job en pg-boss.
* **Problema**:
  1. La tabla de jobs en PostgreSQL se infla rápidamente con datos binarios pesados (los PDFs de cada cliente).
  2. Si el SMTP principal falla (por ejemplo, límites de envío o problemas de TLS con el Host), el sistema no tiene un balanceo activo ni rotación inteligente, recurriendo a un fallback de reintento simple.

---

## 2. Cómo lo Hace Publimes-Omnicanal

Al analizar el módulo despachador de Publimes en su arquitectura de microservicios (`EmailSmtpService.java`, `EmailDispatcher.java`), encontramos tres patrones clave:

### A. Balanceo de Gateways (Round Robin)
* El archivo de configuración define múltiples **gateways** de SMTP (ej. diferentes servidores, cuentas y credenciales).
* `LoadBalancerService` se encarga de retornar el siguiente gateway disponible usando un algoritmo **Round Robin** para cada correo despachado.
* Esto distribuye los envíos de manera equitativa, evitando golpear los límites de envío diarios (ej. las 500 alertas diarias de Gmail) y minimizando el riesgo de ser marcado como spam.

### B. Instanciación Dinámica de Transportes
* En lugar de tener un transporte único global, instancian un `JavaMailSenderImpl` en caliente para cada correo específico, cargando las credenciales dinámicamente según el gateway seleccionado.

### C. Adjuntos Livianos por URL/Recurso
* El payload en la cola de mensajería nunca lleva el archivo físico (buffer/base64). Solo contiene metadatos y la **URL pública o privada** del adjunto (`attachment.getUrl()`).
* Durante el envío de correo, el despachador descarga el adjunto como un stream de red (`new UrlResource(fileUrl)`) directamente hacia el cliente de correo, reduciendo a cero el impacto de almacenamiento en la base de datos de la cola de mensajería.

---

## 3. Propuesta de Adaptación para JASRAPO-BACKEND

Queremos implementar una versión adaptada de estos principios en la arquitectura NestJS de JASRAPO.

### Fase 1: Adjuntos por URL o Rutas de Archivos Temporales
Para no saturar la base de datos PostgreSQL (`jobs.job`):
1. **Generación del PDF**: Guardar el PDF generado por `PdfService` en un storage (local en disco `/tmp/comprobantes` o en un Bucket S3 de AWS / Supabase Storage).
2. **Payload Liviano**: Enviar únicamente la ruta del archivo o la URL firmada en el payload de `pg-boss`:
   ```json
   {
     "to": "cliente@email.com",
     "subject": "Planilla de Agua",
     "attachmentUrl": "/app/storage/pdf/planilla-123.pdf"
   }
   ```
3. **Lectura por Stream**: En el `MailProviderFactory`, leer el archivo desde el storage o hacer fetch de la URL en caliente y pasarlo a Nodemailer utilizando un stream de lectura (`fs.createReadStream(path)`).

### Fase 2: Configuración Dinámica de Transporters y Rotación (SMTP Pool)
1. **Múltiples Configs en `.env` o Base de Datos**:
   Soportar múltiples configuraciones de SMTP en un array o cargadas desde la base de datos.
2. **Rotación Automática**:
   Crear un `SmtpBalancerService` en NestJS que lleve el índice del transporte actual. Si un envío por el transporte A falla (por ejemplo, error `421 Too many messages`), marcar el transporte como "temporalmente inactivo", rotar al transporte B (ej. Gmail SMTP fallback), y reintentar inmediatamente el envío del job sin marcarlo como fallido global.

---

## 4. Tareas de Implementación

- [ ] **Diseño del Storage Local/Nube**: Definir dónde se guardarán físicamente los PDFs temporales antes de ser enviados.
- [ ] **Refactor de `PdfService`**: Retornar la ruta del archivo guardado en lugar del buffer binario.
- [ ] **Modificar Payload del Job**: Cambiar la estructura en `mail-queue.service.ts` para aceptar `attachmentPath` en lugar de `attachment.content` (Buffer).
- [ ] **Implementar Stream en `MailProviderFactory`**: Usar `fs.createReadStream` para adjuntar archivos a Nodemailer sin cargarlos completos en memoria.
- [ ] **Agregar Soporte de Rotación SMTP**: Implementar un pool dinámico de trans transporters en NestJS con fallback automático de reintento.
