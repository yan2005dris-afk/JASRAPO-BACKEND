// Auto-generado por scripts/generate-enums.ts
// NO EDITAR MANUALMENTE - Ejecutar: npx tsx scripts/generate-enums.ts
// Fuente: schemas Prisma en prisma/schema/

/**
 * Enums compatibles con Prisma 7.x
 * Proporciona objetos runtime + tipos que Prisma ya no genera automáticamente
 */

export const Banco = {
  PICHINCHA: 'PICHINCHA',
  GUAYAQUIL: 'GUAYAQUIL',
  PRODUBANC: 'PRODUBANC',
  PACIFICIO: 'PACIFICIO',
  BOLIVARIANO: 'BOLIVARIANO',
  LOJA: 'LOJA',
  AUSTRO: 'AUSTRO',
  RUMIÑAHUI: 'RUMIÑAHUI',
  CNT: 'CNT',
  OTRO: 'OTRO',
} as const;

export type Banco = (typeof Banco)[keyof typeof Banco];

// Fuente: models/logica-de-negocio/Pagos.prisma

export const CodigoSistemaRubro = {
  INSTALACION: 'INSTALACION',
  RECONEXION: 'RECONEXION',
  INSPECCION: 'INSPECCION',
} as const;

export type CodigoSistemaRubro =
  (typeof CodigoSistemaRubro)[keyof typeof CodigoSistemaRubro];

// Fuente: models/logica-de-negocio/Rubros.prisma

export const EstadoAnomalia = {
  PENDIENTE: 'PENDIENTE',
  EN_REVISION: 'EN_REVISION',
  RESUELTA: 'RESUELTA',
  DESCARTADA: 'DESCARTADA',
} as const;

export type EstadoAnomalia =
  (typeof EstadoAnomalia)[keyof typeof EstadoAnomalia];

// Fuente: models/logica-de-negocio/LecturaAnomalia.prisma

export const EstadoAprobacionReemplazo = {
  PENDIENTE: 'PENDIENTE',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
} as const;

export type EstadoAprobacionReemplazo =
  (typeof EstadoAprobacionReemplazo)[keyof typeof EstadoAprobacionReemplazo];

// Fuente: models/logica-de-negocio/ReemplazoMedidor.prisma

export const EstadoAsignacion = {
  NO_ASIGNADA: 'NO_ASIGNADA',
  ASIGNADA: 'ASIGNADA',
  TOMADA: 'TOMADA',
  COMPLETADA: 'COMPLETADA',
} as const;

export type EstadoAsignacion =
  (typeof EstadoAsignacion)[keyof typeof EstadoAsignacion];

// Fuente: models/logica-de-negocio/Rutas.prisma

export const EstadoCaja = {
  ABIERTA: 'ABIERTA',
  CERRADA: 'CERRADA',
  DESCUADRADA: 'DESCUADRADA',
} as const;

export type EstadoCaja = (typeof EstadoCaja)[keyof typeof EstadoCaja];

// Fuente: models/logica-de-negocio/CajaSesion.prisma

export const EstadoContrato = {
  SOLICITUD: 'SOLICITUD',
  PENDIENTE_PAGO: 'PENDIENTE_PAGO',
  PENDIENTE_INSTALACION: 'PENDIENTE_INSTALACION',
  ACTIVO: 'ACTIVO',
  EN_MORA: 'EN_MORA',
  ORDEN_CORTE: 'ORDEN_CORTE',
  SUSPENDIDO: 'SUSPENDIDO',
  EN_CONVENIO: 'EN_CONVENIO',
  RETIRADO: 'RETIRADO',
  RECONEXION: 'RECONEXION',
} as const;

export type EstadoContrato =
  (typeof EstadoContrato)[keyof typeof EstadoContrato];

// Fuente: models/logica-de-negocio/Contratos.prisma

export const EstadoConvenio = {
  ACTIVO: 'ACTIVO',
  PENDIENTE_ABONO: 'PENDIENTE_ABONO',
  PREPARADO: 'PREPARADO',
  ANULADO: 'ANULADO',
  PAGADO: 'PAGADO',
} as const;

export type EstadoConvenio =
  (typeof EstadoConvenio)[keyof typeof EstadoConvenio];

// Fuente: models/logica-de-negocio/Convenios.prisma

export const EstadoCuotaConvenio = {
  PENDIENTE: 'PENDIENTE',
  PAGADA: 'PAGADA',
} as const;

export type EstadoCuotaConvenio =
  (typeof EstadoCuotaConvenio)[keyof typeof EstadoCuotaConvenio];

// Fuente: models/logica-de-negocio/CuotaConvenio.prisma

export const EstadoDeuda = {
  GENERADA: 'GENERADA',
  EN_REVISION: 'EN_REVISION',
  APROBADA: 'APROBADA',
} as const;

export type EstadoDeuda = (typeof EstadoDeuda)[keyof typeof EstadoDeuda];

// Fuente: models/logica-de-negocio/Contratos.prisma

export const EstadoEvento = {
  PENDIENTE: 'PENDIENTE',
  PROCESADO: 'PROCESADO',
  FALLIDO: 'FALLIDO',
} as const;

export type EstadoEvento = (typeof EstadoEvento)[keyof typeof EstadoEvento];

// Fuente: models/infrastructure/EventosPendientes.prisma

export const EstadoLectura = {
  PENDIENTE: 'PENDIENTE',
  POR_REVISION: 'POR_REVISION',
  APROBADA: 'APROBADA',
  RECHAZADA_VERIFICACION: 'RECHAZADA_VERIFICACION',
  ESTIMADA: 'ESTIMADA',
  PLANILLADA: 'PLANILLADA',
  CON_NOVEDAD: 'CON_NOVEDAD',
} as const;

export type EstadoLectura = (typeof EstadoLectura)[keyof typeof EstadoLectura];

// Fuente: models/logica-de-negocio/Lecturas.prisma

export const EstadoLote = {
  BORRADOR: 'BORRADOR',
  DEFINITIVO: 'DEFINITIVO',
  ENVIADO: 'ENVIADO',
} as const;

export type EstadoLote = (typeof EstadoLote)[keyof typeof EstadoLote];

// Fuente: models/facturacion/Lote.prisma

export const EstadoMedidor = {
  BODEGA: 'BODEGA',
  INSTALADO: 'INSTALADO',
  DANADO: 'DANADO',
  PENDIENTE: 'PENDIENTE',
  BAJA: 'BAJA',
} as const;

export type EstadoMedidor = (typeof EstadoMedidor)[keyof typeof EstadoMedidor];

// Fuente: models/logica-de-negocio/Medidores.prisma

export const EstadoOrdenTrabajo = {
  PENDIENTE: 'PENDIENTE',
  EN_PROGRESO: 'EN_PROGRESO',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
  FALLIDA: 'FALLIDA',
} as const;

export type EstadoOrdenTrabajo =
  (typeof EstadoOrdenTrabajo)[keyof typeof EstadoOrdenTrabajo];

// Fuente: models/logica-de-negocio/OrdenTrabajo.prisma

export const EstadoPago = {
  PENDIENTE: 'PENDIENTE',
  REGISTRADO: 'REGISTRADO',
  ANULADO: 'ANULADO',
} as const;

export type EstadoPago = (typeof EstadoPago)[keyof typeof EstadoPago];

// Fuente: models/logica-de-negocio/Pagos.prisma

export const EstadoPeriodo = {
  ABIERTO: 'ABIERTO',
  CERRADO: 'CERRADO',
  PROCESANDO: 'PROCESANDO',
} as const;

export type EstadoPeriodo = (typeof EstadoPeriodo)[keyof typeof EstadoPeriodo];

// Fuente: models/facturacion/Periodos.prisma

export const EstadoPrefactura = {
  GENERADA: 'GENERADA',
  EN_REVISION: 'EN_REVISION',
  APROBADA: 'APROBADA',
  RECHAZADA: 'RECHAZADA',
  ANULADA: 'ANULADA',
  PAGADA: 'PAGADA',
} as const;

export type EstadoPrefactura =
  (typeof EstadoPrefactura)[keyof typeof EstadoPrefactura];

// Fuente: models/facturacion/Prefacturas.prisma

export const EstadoResolucionConsumo = {
  PENDIENTE: 'PENDIENTE',
  APLICADA: 'APLICADA',
  ANULADA: 'ANULADA',
} as const;

export type EstadoResolucionConsumo =
  (typeof EstadoResolucionConsumo)[keyof typeof EstadoResolucionConsumo];

// Fuente: models/logica-de-negocio/ReemplazoMedidor.prisma

export const EstadoRuta = {
  PENDIENTE: 'PENDIENTE',
  EN_PROGRESO: 'EN_PROGRESO',
  COMPLETADA: 'COMPLETADA',
  PARCIAL: 'PARCIAL',
  CANCELADA: 'CANCELADA',
} as const;

export type EstadoRuta = (typeof EstadoRuta)[keyof typeof EstadoRuta];

// Fuente: models/logica-de-negocio/Rutas.prisma

export const EstadoValidacionPago = {
  REPORTADO: 'REPORTADO',
  VALIDANDO: 'VALIDANDO',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  CONCILIADO: 'CONCILIADO',
} as const;

export type EstadoValidacionPago =
  (typeof EstadoValidacionPago)[keyof typeof EstadoValidacionPago];

// Fuente: models/logica-de-negocio/Pagos.prisma

export const MotivoReemplazoMedidor = {
  DANO: 'DANO',
  MANTENIMIENTO_PREVENTIVO: 'MANTENIMIENTO_PREVENTIVO',
  CALIBRACION: 'CALIBRACION',
  REUBICACION: 'REUBICACION',
  FIN_VIDA_UTIL: 'FIN_VIDA_UTIL',
  OTRO: 'OTRO',
} as const;

export type MotivoReemplazoMedidor =
  (typeof MotivoReemplazoMedidor)[keyof typeof MotivoReemplazoMedidor];

// Fuente: models/logica-de-negocio/ReemplazoMedidor.prisma

export const ResponsabilidadDano = {
  USUARIO: 'USUARIO',
  JUNTA: 'JUNTA',
  TERCERO: 'TERCERO',
  NO_DETERMINADA: 'NO_DETERMINADA',
  NO_APLICA: 'NO_APLICA',
} as const;

export type ResponsabilidadDano =
  (typeof ResponsabilidadDano)[keyof typeof ResponsabilidadDano];

// Fuente: models/logica-de-negocio/ReemplazoMedidor.prisma

export const TarjetaCredito = {
  DINERS: 'DINERS',
  MASTERCARD: 'MASTERCARD',
  VISA: 'VISA',
  AMEX: 'AMEX',
} as const;

export type TarjetaCredito =
  (typeof TarjetaCredito)[keyof typeof TarjetaCredito];

// Fuente: models/logica-de-negocio/Pagos.prisma

export const TipoActividadOrden = {
  INSTALACION: 'INSTALACION',
  LECTURA: 'LECTURA',
  RECONEXION: 'RECONEXION',
  INSPECCION: 'INSPECCION',
} as const;

export type TipoActividadOrden =
  (typeof TipoActividadOrden)[keyof typeof TipoActividadOrden];

// Fuente: models/logica-de-negocio/OrdenTrabajo.prisma

export const TipoAnomalia = {
  FUGA: 'FUGA',
  MEDIDOR_DAÑADO: 'MEDIDOR_DAÑADO',
  LECTURA_ERRONEA: 'LECTURA_ERRONEA',
  OTRO: 'OTRO',
} as const;

export type TipoAnomalia = (typeof TipoAnomalia)[keyof typeof TipoAnomalia];

// Fuente: models/logica-de-negocio/LecturaAnomalia.prisma

export const TipoDescuento = {
  TERCERA_EDAD: 'TERCERA_EDAD',
  DISCAPACIDAD: 'DISCAPACIDAD',
  INTERES_MORA: 'INTERES_MORA',
  EXENCION_TASA: 'EXENCION_TASA',
  CONVENIO: 'CONVENIO',
  OTROS: 'OTROS',
} as const;

export type TipoDescuento = (typeof TipoDescuento)[keyof typeof TipoDescuento];

// Fuente: models/facturacion/DescuentoDetalle.prisma

export const TipoDetallePago = {
  COMPROBANTE: 'COMPROBANTE',
  CUOTA_CONVENIO: 'CUOTA_CONVENIO',
  PAGO_LIBRE: 'PAGO_LIBRE',
  SALDO_FAVOR: 'SALDO_FAVOR',
} as const;

export type TipoDetallePago =
  (typeof TipoDetallePago)[keyof typeof TipoDetallePago];

// Fuente: models/logica-de-negocio/DetallePago.prisma

export const TipoMovCaja = {
  EGRESO: 'EGRESO',
  INGRESO_EXTRA: 'INGRESO_EXTRA',
} as const;

export type TipoMovCaja = (typeof TipoMovCaja)[keyof typeof TipoMovCaja];

// Fuente: models/logica-de-negocio/CajaMovimiento.prisma

export const TipoOrigenAbono = {
  PAGO_EXCESO: 'PAGO_EXCESO',
  AJUSTE_RECLAMO: 'AJUSTE_RECLAMO',
  OTROS: 'OTROS',
} as const;

export type TipoOrigenAbono =
  (typeof TipoOrigenAbono)[keyof typeof TipoOrigenAbono];

// Fuente: models/logica-de-negocio/SaldoFavorCliente.prisma

export const TipoRubro = {
  FIJO: 'FIJO',
  VARIABLE: 'VARIABLE',
  MULTA: 'MULTA',
  OTRO: 'OTRO',
  BIEN: 'BIEN',
  SERVICIO: 'SERVICIO',
} as const;

export type TipoRubro = (typeof TipoRubro)[keyof typeof TipoRubro];

// Fuente: models/logica-de-negocio/Rubros.prisma

export const TipoRuta = {
  TOMA_LECTURA: 'TOMA_LECTURA',
  RECONEXION: 'RECONEXION',
  INSTALACION: 'INSTALACION',
  INSPECCION: 'INSPECCION',
} as const;

export type TipoRuta = (typeof TipoRuta)[keyof typeof TipoRuta];

// Fuente: models/logica-de-negocio/Rutas.prisma

export const TratamientoEntrante = {
  FACTURAR_PERIODO_ACTUAL: 'FACTURAR_PERIODO_ACTUAL',
  DIFERIR_SIGUIENTE_PERIODO: 'DIFERIR_SIGUIENTE_PERIODO',
} as const;

export type TratamientoEntrante =
  (typeof TratamientoEntrante)[keyof typeof TratamientoEntrante];

// Fuente: models/logica-de-negocio/ReemplazoMedidor.prisma

export const TratamientoSaliente = {
  COBRO_REAL: 'COBRO_REAL',
  PROMEDIO_HISTORICO: 'PROMEDIO_HISTORICO',
  EXONERADO: 'EXONERADO',
  COBRO_PARCIAL: 'COBRO_PARCIAL',
} as const;

export type TratamientoSaliente =
  (typeof TratamientoSaliente)[keyof typeof TratamientoSaliente];

// Fuente: models/logica-de-negocio/ReemplazoMedidor.prisma
