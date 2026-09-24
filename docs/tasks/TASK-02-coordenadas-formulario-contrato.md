# TASK-02: Migrar Coordenadas (Latitud/Longitud) a Contratos e Integrar Selector en Formulario

## 1. Resumen / Historia de Usuario
**Como** Administrador / Operador de Contrataciones,  
**Quiero** ingresar o seleccionar en mapa la latitud y longitud del predio directamente en el formulario de creación de contratos, persistiendo estos datos en la tabla `Contratos`,  
**Para** georreferenciar el punto de servicio desde la solicitud inicial, desacoplar la ubicación geográfica del ciclo de vida del medidor y facilitar la visita de inspección técnica en campo.

---

## 2. Contexto y Decisión Arquitectónica
* **Problema anterior:** Las columnas `latitud` y `longitud` se encontraban en el modelo `Medidores`. Esto generaba problemas de dominio:
  1. La coordenada representa el **predio/inmueble** (`direccionSuministro`), no el artefacto medidor.
  2. Al crear un contrato (en etapa de inspección previa o sin medidor definitivo), el contrato quedaba sin coordenadas directas.
  3. En un reemplazo de medidor, el medidor retirado conservaba las coordenadas y el nuevo debía recibirlas por copia.
* **Decisión técnica:** **Migrar `latitud` y `longitud` al modelo `Contratos`** y eliminarlas/deprecarlas de `Medidores`.

---

## 3. Alcance de Implementación

### A. Base de Datos y Prisma Schema
1. **Modelo `Contratos` (`backend/prisma/schema/models/logica-de-negocio/Contratos.prisma`):**
   * Agregar campos opcionales:
     ```prisma
     latitud   Decimal? @map("latitud") @db.Decimal(10, 8)
     longitud  Decimal? @map("longitud") @db.Decimal(11, 8)
     ```
2. **Modelo `Medidores` (`backend/prisma/schema/models/logica-de-negocio/Medidores.prisma`):**
   * Eliminar las columnas `latitud` y `longitud`.
3. **Migración Prisma (`prisma migrate dev`):**
   * Script SQL que añade `latitud`/`longitud` a `contratos`, migra datos existentes desde `medidores` (a través de `historial_medidores` o contratos activos) y elimina las columnas en `medidores`.

### B. Backend (NestJS)
1. **`CreateContractDto` & `UpdateContractDto`:**
   * Agregar decoradores de validación:
     ```typescript
     @ApiPropertyOptional({ example: -1.8021, description: 'Latitud del predio' })
     @IsOptional()
     @IsNumber()
     @Type(() => Number)
     latitud?: number;

     @ApiPropertyOptional({ example: -80.7554, description: 'Longitud del predio' })
     @IsOptional()
     @IsNumber()
     @Type(() => Number)
     longitud?: number;
     ```
2. **`ContractEntity` & `ContractResponseDto`:**
   * Mapear `latitud` y `longitud` desde/hacia la base de datos (con conversión `Decimal` a `number` o `string` según DTO).
3. **Casos de Uso (`CreateContractUseCase`, `FindOneContractUseCase`, etc.):**
   * Persistir y retornar las coordenadas en las consultas de contratos.

### C. Frontend (Angular 21)
1. **Formulario de Contratos (`CreateContractComponent`):**
   * Incluir componente visual de mapa interactivo con **Leaflet**:
     * Marcador/pin arrastrable sobre el mapa de Olón.
     * Inputs numéricos decimales bidireccionales (`latitud`, `longitud`).
     * Botón de geolocalización actual del navegador (opcional para uso en campo).
2. **Vista de Detalle / Consulta de Contrato:**
   * Mostrar el mapa con el pin fijo en las coordenadas registradas del predio.

---

## 4. Criterios de Aceptación (DoD)
- [ ] Migración de Prisma ejecutada: `contratos` cuenta con `latitud` y `longitud` (`Decimal(10,8)` y `Decimal(11,8)`).
- [ ] Columnas `latitud` y `longitud` retiradas de la tabla `medidores`.
- [ ] `POST /api/v1/contracts` y `PATCH /api/v1/contracts/:id` aceptan, validan y guardan coordenadas opcionales.
- [ ] `GET /api/v1/contracts/:id` y listados devuelven `latitud` y `longitud` del contrato.
- [ ] El formulario en Angular permite seleccionar coordenadas interactivamente en mapa Leaflet o escribirlas manualmente.
- [ ] Pruebas unitarias de DTOs, Use Cases y repositorios actualizadas y pasando.
