import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma.service';

/**
 * Tarifa de impuesto del catálogo
 */
export interface TarifaImpuesto {
  codigo_porcentaje: string;
  descripcion: string;
  porcentaje: number;
  impuesto_codigo: string;
  impuesto_nombre: string;
}

/**
 * Código de retención del catálogo
 */
export interface CodigoRetencion {
  tipo: string;
  codigo: string;
  descripcion: string;
  porcentaje: number;
}

/**
 * Forma de pago del catálogo
 */
export interface FormaPago {
  codigo: string;
  descripcion: string;
}

/**
 * Tipo de identificación del catálogo
 */
export interface TipoIdentificacion {
  codigo: string;
  descripcion: string;
  longitud: number | null;
  regex_validacion: string | null;
}

/**
 * Documento sustento del catálogo
 */
export interface DocumentoSustento {
  codigo: string;
  descripcion: string;
}

/**
 * Servicio para validar códigos contra los catálogos almacenados en base de datos
 */
@Injectable()
export class CatalogoValidatorService {
  private readonly logger = new Logger(CatalogoValidatorService.name);

  // Caches para evitar consultas repetitivas
  private tarifasCache: Map<string, TarifaImpuesto> = new Map();
  private retencionesCache: Map<string, CodigoRetencion> = new Map();
  private formasPagoCache: Map<string, FormaPago> = new Map();
  private tiposIdentificacionCache: Map<string, TipoIdentificacion> = new Map();
  private documentosSustentoCache: Map<string, DocumentoSustento> = new Map();
  private cacheExpiry: number = 0;
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
  private loadingPromise: Promise<void> | null = null; // FIX P7: Semáforo anti-carga paralela

  constructor(private readonly prisma: PrismaService) {}

  // =====================================================
  // VALIDACIONES DE IMPUESTOS
  // =====================================================

  async validateImpuesto(
    codigoImpuesto: string,
    codigoPorcentaje: string,
  ): Promise<{ valid: boolean; tarifa?: TarifaImpuesto; error?: string }> {
    await this.refreshCacheIfNeeded();

    const key = `${codigoImpuesto}-${codigoPorcentaje}`;
    const tarifa = this.tarifasCache.get(key);

    if (!tarifa) {
      return {
        valid: false,
        error: `Código de impuesto ${codigoImpuesto} con tarifa ${codigoPorcentaje} no encontrado en catálogo`,
      };
    }

    return { valid: true, tarifa };
  }

  async validateImpuestos(
    impuestos: Array<{ codigo: string; codigoPorcentaje: string }>,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const imp of impuestos) {
      const result = await this.validateImpuesto(
        imp.codigo,
        imp.codigoPorcentaje,
      );
      if (!result.valid && result.error) {
        errors.push(result.error);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // =====================================================
  // VALIDACIONES DE RETENCIONES
  // =====================================================

  async validateRetencion(
    tipo: string,
    codigo: string,
  ): Promise<{ valid: boolean; retencion?: CodigoRetencion; error?: string }> {
    await this.refreshCacheIfNeeded();

    const key = `${tipo}-${codigo}`;
    const retencion = this.retencionesCache.get(key);

    if (!retencion) {
      return {
        valid: false,
        error: `Código de retención ${codigo} de tipo ${tipo} no encontrado en catálogo`,
      };
    }

    return { valid: true, retencion };
  }

  async validateRetenciones(
    retenciones: Array<{ codigo: string; codigoRetencion: string }>,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const ret of retenciones) {
      let tipo = 'RENTA';
      if (ret.codigoRetencion.startsWith('7')) {
        tipo = 'IVA';
      } else if (ret.codigoRetencion.startsWith('45')) {
        tipo = 'ISD';
      }

      const result = await this.validateRetencion(tipo, ret.codigoRetencion);
      if (!result.valid && result.error) {
        errors.push(result.error);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // =====================================================
  // VALIDACIONES DE FORMAS DE PAGO
  // =====================================================

  async validateFormaPago(
    codigo: string,
  ): Promise<{ valid: boolean; formaPago?: FormaPago; error?: string }> {
    await this.refreshCacheIfNeeded();

    const formaPago = this.formasPagoCache.get(codigo);

    if (!formaPago) {
      return {
        valid: false,
        error: `Forma de pago ${codigo} no encontrada en catálogo`,
      };
    }

    return { valid: true, formaPago };
  }

  async validateFormasPago(
    pagos: Array<{ formaPago: string }>,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    for (const pago of pagos) {
      const result = await this.validateFormaPago(pago.formaPago);
      if (!result.valid && result.error) {
        errors.push(result.error);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  // =====================================================
  // VALIDACIONES DE TIPOS DE IDENTIFICACIÓN
  // =====================================================

  async validateTipoIdentificacion(codigo: string): Promise<{
    valid: boolean;
    tipoIdentificacion?: TipoIdentificacion;
    error?: string;
  }> {
    await this.refreshCacheIfNeeded();

    const tipoIdentificacion = this.tiposIdentificacionCache.get(codigo);

    if (!tipoIdentificacion) {
      return {
        valid: false,
        error: `Tipo de identificación ${codigo} no encontrado en catálogo`,
      };
    }

    return { valid: true, tipoIdentificacion };
  }

  // =====================================================
  // VALIDACIONES DE DOCUMENTOS SUSTENTO
  // =====================================================

  async validateDocumentoSustento(codigo: string): Promise<{
    valid: boolean;
    documentoSustento?: DocumentoSustento;
    error?: string;
  }> {
    await this.refreshCacheIfNeeded();

    const documentoSustento = this.documentosSustentoCache.get(codigo);

    if (!documentoSustento) {
      return {
        valid: false,
        error: `Documento sustento ${codigo} no encontrado en catálogo`,
      };
    }

    return { valid: true, documentoSustento };
  }

  // =====================================================
  // MÉTODOS DE CONSULTA
  // =====================================================

  async getTarifasVigentes(codigoImpuesto: string): Promise<TarifaImpuesto[]> {
    await this.refreshCacheIfNeeded();
    const tarifas: TarifaImpuesto[] = [];
    for (const [, tarifa] of this.tarifasCache) {
      if (tarifa.impuesto_codigo === codigoImpuesto) {
        tarifas.push(tarifa);
      }
    }
    return tarifas;
  }

  async getRetencionesPorTipo(tipo: string): Promise<CodigoRetencion[]> {
    await this.refreshCacheIfNeeded();
    const retenciones: CodigoRetencion[] = [];
    for (const [, retencion] of this.retencionesCache) {
      if (retencion.tipo === tipo) {
        retenciones.push(retencion);
      }
    }
    return retenciones;
  }

  async getFormasPago(): Promise<FormaPago[]> {
    await this.refreshCacheIfNeeded();
    return Array.from(this.formasPagoCache.values());
  }

  async getTiposIdentificacion(): Promise<TipoIdentificacion[]> {
    await this.refreshCacheIfNeeded();
    return Array.from(this.tiposIdentificacionCache.values());
  }

  async getDocumentosSustento(): Promise<DocumentoSustento[]> {
    await this.refreshCacheIfNeeded();
    return Array.from(this.documentosSustentoCache.values());
  }

  // =====================================================
  // CARGA DE CACHE
  // =====================================================

  private async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now > this.cacheExpiry) {
      // Si ya hay una carga en curso, esperamos que termine en lugar de lanzar otra
      if (this.loadingPromise) {
        return this.loadingPromise;
      }
      this.loadingPromise = this.loadCache()
        .then(() => {
          this.cacheExpiry = Date.now() + this.CACHE_TTL_MS;
        })
        .finally(() => {
          this.loadingPromise = null;
        });
      return this.loadingPromise;
    }
  }

  private async loadCache(): Promise<void> {
    this.logger.log('Cargando todos los catálogos SRI...');

    try {
      // 1. Cargar tarifas de impuestos
      const tarifas = await this.prisma.catalogoTarifasImpuesto.findMany({
        where: {
          activo: true,
          OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: new Date() } }],
        },
        include: { impuesto: true },
      });
      this.tarifasCache.clear();
      for (const tarifa of tarifas) {
        const key = `${tarifa.impuesto.codigo}-${tarifa.codigoPorcentaje}`;
        this.tarifasCache.set(key, {
          codigo_porcentaje: tarifa.codigoPorcentaje,
          descripcion: tarifa.descripcion,
          porcentaje: Number(tarifa.porcentaje),
          impuesto_codigo: tarifa.impuesto.codigo,
          impuesto_nombre: tarifa.impuesto.nombre,
        });
      }

      // 2. Cargar códigos de retención
      const retenciones = await this.prisma.catalogoRetenciones.findMany({
        where: {
          activo: true,
          OR: [{ vigenteHasta: null }, { vigenteHasta: { gte: new Date() } }],
        },
      });
      this.retencionesCache.clear();
      for (const ret of retenciones) {
        const key = `${ret.tipo}-${ret.codigo}`;
        this.retencionesCache.set(key, {
          tipo: ret.tipo,
          codigo: ret.codigo,
          descripcion: ret.descripcion,
          porcentaje: Number(ret.porcentaje),
        });
      }

      // 3. Cargar formas de pago
      const formasPago = await this.prisma.catalogoFormasPago.findMany({
        where: { activo: true },
      });
      this.formasPagoCache.clear();
      for (const fp of formasPago) {
        this.formasPagoCache.set(fp.codigo, {
          codigo: fp.codigo,
          descripcion: fp.descripcion,
        });
      }

      // 4. Cargar tipos de identificación
      const tiposIdent = await this.prisma.catalogoTiposIdentificacion.findMany(
        {
          where: { activo: true },
        },
      );
      this.tiposIdentificacionCache.clear();
      for (const ti of tiposIdent) {
        this.tiposIdentificacionCache.set(ti.codigo, {
          codigo: ti.codigo,
          descripcion: ti.descripcion,
          longitud: ti.longitud ?? null,
          regex_validacion: ti.regexValidacion ?? null,
        });
      }

      // 5. Cargar documentos sustento
      const docsSustento =
        await this.prisma.catalogoDocumentosSustento.findMany({
          where: { activo: true },
        });
      this.documentosSustentoCache.clear();
      for (const ds of docsSustento) {
        this.documentosSustentoCache.set(ds.codigo, {
          codigo: ds.codigo,
          descripcion: ds.descripcion,
        });
      }

      this.logger.log(
        `Catálogos cargados: ${this.tarifasCache.size} tarifas, ` +
          `${this.retencionesCache.size} retenciones, ${this.formasPagoCache.size} formas pago, ` +
          `${this.tiposIdentificacionCache.size} tipos ident, ${this.documentosSustentoCache.size} docs sustento`,
      );
    } catch (error) {
      this.logger.error(
        `Error cargando catálogos: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  async forceRefreshCache(): Promise<void> {
    this.cacheExpiry = 0;
    await this.refreshCacheIfNeeded();
  }
}
