import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrefacturaRepository } from '../domain/repositories/prefactura.repository';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';

const PREFACTURA_ESTADOS = [
  { estadoId: 1, codigo: 'GENERADA', nombre: 'Generada', orden: 1 },
  { estadoId: 2, codigo: 'EN_REVISION', nombre: 'En Revisión', orden: 2 },
  { estadoId: 3, codigo: 'APROBADA', nombre: 'Aprobada', orden: 3 },
  { estadoId: 4, codigo: 'RECHAZADA', nombre: 'Rechazada', orden: 4 },
  { estadoId: 5, codigo: 'ANULADA', nombre: 'Anulada', orden: 5 },
  { estadoId: 6, codigo: 'PAGADA', nombre: 'Pagada', orden: 6 },
];

/**
 * Transiciones permitidas de estado.
 * clave = estadoActual, valor = estados a los que puede ir
 */
const TRANSICIONES: Record<string, string[]> = {
  GENERADA: ['EN_REVISION', 'ANULADA'],
  EN_REVISION: ['APROBADA', 'RECHAZADA', 'GENERADA'],
  APROBADA: ['PAGADA', 'ANULADA'],
  RECHAZADA: ['EN_REVISION', 'GENERADA'],
  ANULADA: [],
  PAGADA: [],
};

@Injectable()
export class PrefacturaService {
  private readonly logger = new Logger(PrefacturaService.name);

  constructor(private readonly prefacturaRepository: PrefacturaRepository) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
    filters?: {
      loteId?: number;
      periodoId?: number;
      estado?: string;
      contratoId?: string;
      identificacion?: string;
    },
  ): Promise<PaginatedResult<any>> {
    const { skip, take } = getPagination(page, limit);

    const where: Record<string, any> = {};

    if (filters?.loteId != null) {
      where.loteId = BigInt(filters.loteId);
    }
    if (filters?.periodoId != null) {
      where.periodoId = filters.periodoId;
    }
    if (filters?.estado != null) {
      where.estado = filters.estado;
    }
    if (filters?.contratoId != null) {
      if (!/^\d+$/.test(filters.contratoId)) {
        throw new BadRequestException('contratoId debe ser un valor numérico');
      }
      where.contratoId = BigInt(filters.contratoId);
    }
    if (filters?.identificacion) {
      where.clienteIdentificacion = { contains: filters.identificacion };
    }

    const [data, total] = await Promise.all([
      this.prefacturaRepository.findMany({
        where,
        include: {
          contrato: {
            select: {
              contratoId: true,
              numeroGuia: true,
              cliente: {
                select: {
                  clienteId: true,
                  nombres: true,
                  apellidos: true,
                  identificacion: true,
                },
              },
            },
          },
          lote: {
            select: {
              loteId: true,
              comunidad: { select: { nombre: true } },
            },
          },
          periodoRel: {
            select: { nombre: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prefacturaRepository.count(where),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      data,
      meta: {
        total,
        page,
        limit: take,
        ultimaPagina: totalPages,
        paginaActual: page,
        porPagina: take,
        anterior: page > 1 ? page - 1 : null,
        siguiente: page < totalPages ? page + 1 : null,
      },
    };
  }

  async findOne(id: number) {
    const prefactura = await this.prefacturaRepository.findById(id, {
      include: {
        prefacturaDetalle: {
          include: { rubro: { select: { nombre: true } } },
        },
        contrato: {
          select: {
            contratoId: true,
            numeroGuia: true,
            cliente: {
              select: {
                clienteId: true,
                nombres: true,
                apellidos: true,
                identificacion: true,
                direccionDomicilio: true,
                email: true,
              },
            },
          },
        },
        lote: {
          select: {
            loteId: true,
            estado: true,
            comunidad: { select: { nombre: true } },
          },
        },
        periodoRel: {
          select: { nombre: true, fechaInicio: true, fechaFin: true },
        },
      },
    });

    if (!prefactura) {
      throw new NotFoundException(`Prefactura ${id} no encontrada`);
    }

    return prefactura;
  }

  async updateEstado(
    id: number,
    accion: string,
    userId?: string,
    motivoRechazo?: string,
  ) {
    const prefactura = await this.prefacturaRepository.findById(id);
    if (!prefactura) {
      throw new NotFoundException(`Prefactura ${id} no encontrada`);
    }

    const estadoActual = prefactura.estado;
    const transicionesPermitidas = TRANSICIONES[estadoActual];

    if (!transicionesPermitidas || !transicionesPermitidas.includes(accion)) {
      throw new BadRequestException(
        `No se puede cambiar de ${estadoActual} a ${accion}. ` +
          `Transiciones permitidas: ${(transicionesPermitidas ?? []).join(', ') || 'ninguna'}`,
      );
    }

    const motivoRechazoNormalizado = motivoRechazo?.trim() || undefined;

    if (accion === 'RECHAZADA' && !motivoRechazoNormalizado) {
      throw new BadRequestException('Debe proporcionar un motivo de rechazo');
    }

    const data: {
      aprobadaPor?: string;
      motivoRechazo?: string;
      fechaAprobacion?: Date;
    } = {};

    if (accion === 'APROBADA') {
      data.aprobadaPor = userId ?? 'SYSTEM';
      data.fechaAprobacion = new Date();
    }

    if (accion === 'RECHAZADA') {
      data.motivoRechazo = motivoRechazoNormalizado;
    }

    const actualizado = await this.prefacturaRepository.updateEstado(
      id,
      accion,
      estadoActual,
      data,
    );
    if (!actualizado) {
      throw new BadRequestException(
        'La prefactura cambió de estado durante la operación. Reintente.',
      );
    }

    return this.prefacturaRepository.findById(id);
  }

  async findAllEstados() {
    return PREFACTURA_ESTADOS;
  }
}
