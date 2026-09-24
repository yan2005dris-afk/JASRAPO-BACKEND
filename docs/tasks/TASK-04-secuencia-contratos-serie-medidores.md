# TASK-04: Migrar Secuencia Incremental a Contratos, Desacoplar Serie Físico y Generación Estructurada del Número de Guía

> **GitHub Issue Vinculada:** [#309](https://github.com/yan2005dris-afk/JASRAPO-BACKEND/issues/309)  
> **Shortcut Story:** [[sc-324]](https://app.shortcut.com/backendjasrapo/story/324)

---

## 1. Resumen / Historia de Usuario
**Como** Administrador / Operador de Contrataciones,  
**Quiero** registrar el número de serie físico de fábrica del medidor y que el sistema genere automáticamente el **número de guía** del contrato combinando el código de la comunidad, el número de serie del medidor y un correlativo secuencial incremental,  
**Para** garantizar una identificación contractual unívoca, escalable a más de 100.000 registros, trazable con el hardware físico y sin colisiones de concurrencia.

---

## 2. Definición del Formato del Número de Guía (`numeroGuia`)

El campo `numeroGuia` del contrato se compone mediante la siguiente estructura algorítmica:

$$\mathbf{NUMERO\_GUIA} = \mathbf{COD\_COMUNIDAD} \mathbf{-} \mathbf{SERIE\_MEDIDOR} \mathbf{-} \mathbf{SECUENCIAL}$$

### Componentes de la Guía:
1. **`COD_COMUNIDAD`:** Código identificador o abreviatura normalizada de la comunidad (ej. `OLO` para Olón, `SNJ` para San José, o ID numérico formateado `01`).
2. **`SERIE_MEDIDOR`:** Número de serie real del fabricante grabado en el hardware del medidor (ej. `ITR-984321` o `SN84920`).
3. **`SECUENCIAL`:** Correlativo incremental atómico gestionado por la base de datos (ej. `00001`, `00002`... con padding de 5 a 6 dígitos), asegurando que si un medidor es reasignado o existen coincidencias, el número de guía nunca se repita ni se agote la combinación.

*Ejemplo de Guía resultante:* `OLO-ITR984321-00001` o `01-SN84920-00124`.

---

## 3. Alcance de Implementación

### A. Base de Datos y Prisma Schema
1. **Tabla de Secuencias (`secuencia_contrato` / `secuencia_guia`):**
   * Almacena el último valor correlativo emitido.
   * Manejo con bloqueo transaccional (`SELECT ... FOR UPDATE`) para evitar colisiones ante creaciones concurrentes de contratos.
2. **Tabla `Medidores`:**
   * La columna `serie` almacena exclusivamente el número de serie físico de fábrica (string único provisto por el usuario en el alta de inventario).
3. **Tabla `Contratos`:**
   * `numeroGuia`: `String @unique @map("numero_guia")`, almacena la cadena concatenada generada automáticamente.

### B. Backend (NestJS)
1. **Servicio Generador de Guías (`ContractGuideGeneratorService`):**
   * Recibe: `comunidadId` y `serieMedidor`.
   * En la misma transacción de creación del contrato:
     1. Obtiene el siguiente secuencial desde `secuencia_contrato` con `SELECT ... FOR UPDATE`.
     2. Obtiene el código/prefijo de la `Comunidades`.
     3. Ensambla el string formateado `${codigoComunidad}-${serieMedidor}-${secuencialPad}`.
2. **`CreateContractUseCase`:**
   * Integra el generador de guías al guardar el contrato en estado `PENDIENTE_INSPECCION`.
3. **`CreateMeterUseCase`:**
   * Registra el medidor con su `serie` de fábrica sin forzar secuencias artificiales.

### C. Frontend (Angular 21)
1. **Formulario de Medidores:** Campo `serie` editable obligatorio.
2. **Formulario / Vista de Contratos:**
   * Al seleccionar la comunidad y el medidor, previsualiza o genera automáticamente la guía única.
   * En la consulta de contratos y prefacturas, se visualiza el número de guía formateado.

---

## 4. Criterios de Aceptación (DoD)
- [ ] La serie del medidor es un dato físico ingresado desde fábrica.
- [ ] El `numeroGuia` se genera combinando: `Código Comunidad` + `Serie Medidor` + `Secuencial Incremental`.
- [ ] La secuencia incremental utiliza bloqueo transaccional en PostgreSQL (`FOR UPDATE`), previniendo duplicados concurrentes.
- [ ] La estructura de numeración soporta más de 100.000 contratos sin agotar combinaciones.
- [ ] Pruebas unitarias del generador de guía y pruebas de integración con creación concurrente de contratos pasando al 100%.
