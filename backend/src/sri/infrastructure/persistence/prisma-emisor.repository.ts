import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { EmisorRepository } from '../../domain/repositories/emisor.repository';
import { EmisorRecord } from '../../domain/interfaces/repository.interface';

@Injectable()
export class PrismaEmisorRepository extends EmisorRepository {
  private emisorCache: Map<string, { data: EmisorRecord; expiry: number }> =
    new Map();
  private puntoEmisionCache: Map<string, { data: any; expiry: number }> =
    new Map();
  private readonly CACHE_TTL_MS: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    super();
    this.CACHE_TTL_MS = this.configService.get<number>(
      'CACHE_EMISOR_TTL_MS',
      300000,
    );
  }

  async findByRuc(ruc: string): Promise<EmisorRecord | null> {
    const cached = this.emisorCache.get(ruc);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const empresa = await this.prisma.empresa.findFirst({
      where: { ruc, estado: 'ACTIVO' },
    });

    if (!empresa) return null;

    const emisor: EmisorRecord = {
      id: empresa.id,
      ruc: empresa.ruc,
      razon_social: empresa.razonSocial,
      nombre_comercial: empresa.nombreComercial ?? undefined,
      direccion_matriz: empresa.direccionMatriz,
      obligado_contabilidad: empresa.obligadoContabilidad,
      contribuyente_especial: empresa.contribuyenteEspecial ?? undefined,
      agente_retencion: empresa.agenteRetencion ?? undefined,
      contribuyente_rimpe: empresa.contribuyenteRimpe,
      certificado_nombre: empresa.certificadoNombre ?? undefined,
      certificado_password_encrypted: empresa.certificadoPassword ?? undefined,
      certificado_valido_hasta: empresa.certificadoValidoHasta ?? undefined,
      certificado_sujeto: empresa.certificadoSujeto ?? undefined,
      ambiente: empresa.ambiente,
      estado: empresa.estado,
    };

    this.emisorCache.set(ruc, {
      data: emisor,
      expiry: Date.now() + this.CACHE_TTL_MS,
    });

    return emisor;
  }

  async findPuntoEmision(
    emisorId: number,
    establecimiento: string,
    puntoEmision: string,
  ): Promise<{ punto_emision_id: number; establecimiento_id: number } | null> {
    const cacheKey = `${emisorId}-${establecimiento}-${puntoEmision}`;
    const cached = this.puntoEmisionCache.get(cacheKey);
    if (cached && Date.now() < cached.expiry) {
      return cached.data;
    }

    const pe = await this.prisma.puntosEmision.findFirst({
      where: {
        codigo: puntoEmision,
        estado: 'ACTIVO',
        establecimiento: {
          codigo: establecimiento,
          estado: 'ACTIVO',
          emisorId,
        },
      },
      include: { establecimiento: true },
    });

    if (!pe) return null;

    const result = {
      punto_emision_id: pe.id,
      establecimiento_id: pe.establecimientoId,
    };

    this.puntoEmisionCache.set(cacheKey, {
      data: result,
      expiry: Date.now() + this.CACHE_TTL_MS,
    });

    return result;
  }

  clearCache(): void {
    this.emisorCache.clear();
    this.puntoEmisionCache.clear();
  }
}
