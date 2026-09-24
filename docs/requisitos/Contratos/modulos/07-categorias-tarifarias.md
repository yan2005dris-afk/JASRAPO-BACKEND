# 07 - Categorías Tarifarias

Categorías de tarifa

Clasificación tarifaria, vigencias y rubros aplicables al contrato.

Alcance y entradas HTTP

Controlador: CategoriaTarifaController.

Servicio: CategoriaTarifaService.

Casos:

CreateTariffCategoryUseCase.

FindAllTariffCategoriesUseCase.

FindOneTariffCategoryUseCase.

UpdateTariffCategoryUseCase.

RemoveTariffCategoryUseCase.

Ejemplo JSON

En los JSON de entrada, null representa un campo opcional omitido.

Estados

No existe enum de estado. La disponibilidad se expresa con activo y debe interpretarse junto con las fechas de vigencia. deletedAt es interno.

Efectos y transacciones

Crear escribe la categoría y puede generar rubros por defecto. Actualizar crea una nueva versión tarifaria, con fechas y rubros según el caso. Eliminar aplica soft delete/desactivación. Lecturas, filtros y TariffCategoryResponseDto.fromEntity son transformaciones puras.

Estados y transiciones no encontrados

No existe una máquina de estados confirmable ni un enum de estado para categorías tarifarias. El código confirma los campos activo, fechaVigenciaDesde, fechaVigenciaHasta y deletedAt; también confirma que PATCH crea una nueva versión y que DELETE aplica desactivación/soft delete. No se documentan flechas de estado porque no existe una transición explícita que pueda representarse como máquina.

Casos de uso

Caso: Crear categoría de tarifa

Descripción: registra una categoría y sus rubros por defecto cuando corresponde.

HTTP y ruta: POST /api/v1/tariff-categories.

Permiso: tarifas:create.

Cadena: CategoriaTarifaController.create() → CategoriaTarifaService.createCategoria() → CreateTariffCategoryUseCase.execute() → repositorio.

Errores relevantes: 400; 401; 403; categoría con el mismo nombre activo.

Efectos: alta en CategoriaTarifa + creación automática de 2 Rubros default: codigoSri='001' ("Cargo fijo",tipoRubro=FIJO) y codigoSri='002' ("Consumo de agua potable", tipoRubro=VARIABLE), ambos con esAutomatico=true. Si el DTO no trae tarifaImpuestoId, se toma la primera tarifa de impuesto activa.

Prisma: CategoriaTarifa, Rubros.

Entrada:

Salida: JSON del ejemplo principal.

Caso: Listar categorías

Descripción: devuelve categorías activas con filtros y paginación.

HTTP y ruta: GET /api/v1/tariff-categories.

Permiso: tarifas:read.

Cadena: CategoriaTarifaController.findAll() → CategoriaTarifaService.getCategorias() → FindAllTariffCategoriesUseCase.execute() → repositorio.

Errores relevantes: 400; 401; 403.

Efectos: ninguno; consulta y DTO puros.

Prisma: CategoriaTarifa.

Entrada: sin body; query page, limit, nombre, search.

Salida:

Caso: Obtener categoría

Descripción: consulta una categoría por ID.

HTTP y ruta: GET /api/v1/tariff-categories/:id.

Permiso: tarifas:read.

Cadena: CategoriaTarifaController.findOne() → CategoriaTarifaService.findOneCategoria() → FindOneTariffCategoryUseCase.execute() → repositorio.

Errores relevantes: 400; 401; 403; 404.

Efectos: ninguno; DTO puro.

Prisma: CategoriaTarifa, Rubros, Contratos si se incluyen.

Entrada: sin body; path id=1.

Salida: JSON del ejemplo principal.

Caso: Actualizar categoría

Descripción: crea una nueva versión en vez de mutar silenciosamente la vigencia anterior.

HTTP y ruta: PATCH /api/v1/tariff-categories/:id.

Permiso: tarifas:update.

Cadena: CategoriaTarifaController.update() → CategoriaTarifaService.updateCategoria() → UpdateTariffCategoryUseCase.execute() → repositorio.

Errores relevantes: 400 datos/vigencia; 401; 403; 404; categoría con el mismo nombre activo (solo si se cambia el nombre).

Efectos: persiste nueva versión y fechas; DTO puro.

Prisma: CategoriaTarifa, Rubros, referencias contractuales.

Entrada: path id=1; body:

Salida:

Caso: Eliminar categoría

Descripción: desactiva y elimina lógicamente la categoría.

HTTP y ruta: DELETE /api/v1/tariff-categories/:id.

Permiso: tarifas:delete.

Cadena: CategoriaTarifaController.remove() → CategoriaTarifaService.deleteCategoria() → RemoveTariffCategoryUseCase.execute() → repositorio.

Errores relevantes: 400; 401; 403; 404; uso incompatible.

Efectos: triple efecto simultáneo: activo=false, fechaVigenciaHasta=now, deletedAt=now (no solo soft delete: también cierra la vigencia).

Prisma: CategoriaTarifa.

Entrada: sin body; path id=1.

Salida:

Pendientes funcionales

Bloqueos confirmados como pendientes en el código revisado. Cuando se cierre cada uno, sacar de acá y mover a la sección correspondiente.

Propagación automática de cambios a contratos existentes. createNewVersion no toca la tabla Contratos. La nueva versión queda disponible para futuros contratos, pero los vigentes siguen apuntando a la versión anterior. No hay mecanismo de migración.

Reglas de solapamiento entre versiones. Aunque "solapamiento" figuraba en los errores relevantes del caso Actualizar, el código no lo valida. Si se quiere esa regla, hay que decidir el criterio (¿no se permite que dos versiones activas tengan fechas superpuestas?) y agregar la validación.

Duración mínima o reglas de vigencia. No hay reglas explícitas sobre fechaVigenciaDesde >= hoy, sobre solapamiento con otras versiones, ni sobre la duración mínima de una versión.

Estados legacy distintos de `activo`, `deletedAt` y fechas. Confirmar contra seeds y migraciones si existe alguna columna o enum legacy.

No documentado o pendiente de confirmar

Forma exacta del DTO update-categoria-tarifa y de los campos opcionales que se propagan a la nueva versión. Confirmar contra el código actual.

Comportamiento de negocio verificable

Las tablas relacionadas son CategoriaTarifa, Rubros y Contratos. La categoría aporta el contexto para seleccionar rubros; en instalación la selección vigente es por categoría y codigoSistemaRubro=INSTALACION. createNewVersion cierra la versión actual (fechaVigenciaHasta: now, activo: false) y crea nueva fila activa en la misma transacción; softDelete aplica triple efecto simultáneo (activo=false, fechaVigenciaHasta=now, deletedAt=now). No se encontró una fórmula de consumo mensual completa ni un handler que propague automáticamente una nueva versión a contratos existentes.