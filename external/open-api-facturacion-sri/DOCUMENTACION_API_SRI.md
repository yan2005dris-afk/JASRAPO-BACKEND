# Guía de la API de Facturación Electrónica SRI (Ecuador)

Esta API es una solución Enterprise desarrollada en **NestJS** para la gestión de facturación electrónica con el SRI (Servicio de Rentas Internas) de Ecuador. Soporta el estándar **XAdES-BES**, multi-tenancy y comunicación vía **SOAP** con los servidores del SRI.

## 🚀 Funcionalidades Principales

### 1. Gestión de Comprobantes Electrónicos
Soporta el ciclo de vida completo (Firma, Envío, Autorización) para:
- **Facturas**
- **Notas de Crédito**
- **Notas de Débito**
- **Comprobantes de Retención**
- **Guías de Remisión**

### 2. Multi-Tenancy (Multi-Empresa)
Diseñada para manejar múltiples empresas (tenants) de forma aislada, permitiendo que cada una tenga sus propios certificados P12, puntos de emisión y secuenciales.

### 3. Firma Digital XAdES-BES
Módulo especializado para la firma de archivos XML utilizando certificados digitales (.p12) legalmente reconocidos en Ecuador.

### 4. Generación de PDF y Ride
Utiliza **Carbone.io** para la generación de PDFs altamente personalizables a partir de plantillas DOCX/HTML, incluyendo la generación de códigos QR y barras requeridos por el SRI.

### 5. Webhooks e Integración
Notifica automáticamente a otros sistemas sobre eventos de autorización o errores mediante webhooks con firma criptográfica (HMAC-SHA256) para garantizar la integridad de los datos.

---

## 🛠️ Arquitectura Técnica

- **Framework:** NestJS (Node.js)
- **Base de Datos:** PostgreSQL
- **Caché y Colas:** Redis (BullMQ para procesamiento asíncrono de comprobantes y webhooks)
- **Seguridad:** JWT (Auth), Helmet, Throttler (Rate Limiting), y Auditoría automática de transacciones.
- **Protocolo SRI:** Implementación de clientes SOAP para ambientes de Pruebas y Producción.

---

## 🔌 Cómo Adaptarla al Proyecto JASRAPO-BACKEND

Para integrar esta API al proyecto general, se recomiendan los siguientes pasos:

### Opción A: Microservicio Independiente (Recomendado)
Mantener la API como un servicio separado para no sobrecargar el backend principal y escalar de forma independiente.
1. **Docker:** Levantar el servicio usando el `docker-compose.yml` incluido en la carpeta.
2. **Comunicación:** El `jasrapo-backend` se comunica con esta API mediante peticiones HTTP (Axios/Fetch).
3. **Webhooks:** Configurar un endpoint en `jasrapo-backend` para recibir las notificaciones de autorización del SRI.

### Opción B: Integración como Módulo (Librería)
Si prefieres tener todo en un solo repositorio de código:
1. **Copiar Módulos:** Migrar los módulos de `src/modules/sri`, `src/modules/signature`, y `src/modules/certificate` al directorio `src/` del backend principal.
2. **Dependencias:** Instalar las librerías necesarias (`xadesjs`, `soap`, `node-forge`, `@signpdf/signpdf`) en el `package.json` principal.
3. **Configuración:** Fusionar los parámetros de `.env.example` en el archivo `.env` principal del proyecto.

---

## 📝 Pasos para el Despliegue Local

1. **Requisitos:** Node.js v20+, Docker y PostgreSQL.
2. **Instalación:**
   ```bash
   cd open-api-facturacion-sri-main
   npm install
   ```
3. **Configuración:** Copiar `.env.example` a `.env` y configurar las credenciales de base de datos y Redis.
4. **Base de Datos:** Ejecutar el script `database/init.sql` en tu instancia de Postgres.
5. **Ejecución:**
   ```bash
   npm run start:dev
   ```

## 🔒 Seguridad Confirmada
Se realizó una auditoría de seguridad sobre el código fuente, confirmando:
- ✅ **Sin Backdoors:** No hay scripts ocultos ni conexiones a servidores no autorizados.
- ✅ **Saneamiento:** Las URLs de webhooks y generación de PDFs están protegidas contra ataques SSRF.
- ✅ **Auditoría:** Todas las operaciones críticas quedan registradas en una tabla de logs.
- ✅ **Protección P12:** Los certificados digitales se manejan mediante encriptación y no se exponen vía API.
