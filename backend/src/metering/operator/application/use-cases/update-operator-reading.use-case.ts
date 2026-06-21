import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoLectura, EstadoPeriodo, EstadoRuta } from 'src/shared/enums';
import { ActualizarLecturaDto } from 'src/metering/readings/interfaces/dto/update-lectura.dto';
import type { IResponseReading } from 'src/metering/readings/types/IResponseReading';

const OPERATOR_EDITABLE_ESTADOS = new Set<string>([
  EstadoLectura.PENDIENTE,
  EstadoLectura.RECHAZADA_VERIFICACION,
]);

@Injectable()
export class UpdateOperatorReadingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: bigint,
    operarioId: number,
    updateDto: ActualizarLecturaDto,
  ): Promise<IResponseReading> {
    // 1. Find the lectura with its medidor → historial → contrato relation
    const existing = await this.prisma.lecturas.findUnique({
      where: { lecturaId: id, deletedAt: null },
      select: {
        lecturaId: true,
        estado: true,
        medidor: {
          select: {
            historial: {
              where: { fechaHasta: null },
              select: {
                contrato: {
                  select: {
                    contratoId: true,
                    comunidadId: true,
                    sectorId: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    // 2. Validate that the reading is in an editable state
    if (!OPERATOR_EDITABLE_ESTADOS.has(existing.estado)) {
      throw new BadRequestException(
        `No se puede modificar una lectura en estado ${existing.estado}`,
      );
    }

    // 3. Find the active billing period
    const activePeriod = await this.prisma.periodos.findFirst({
      where: { estado: EstadoPeriodo.ABIERTO },
      select: { periodoId: true },
    });

    if (!activePeriod) {
      throw new NotFoundException(
        'No hay un período de facturación ABIERTO en el sistema',
      );
    }

    // 4. Find operator's active rutas for this period
    const rutas = await this.prisma.rutas.findMany({
      where: {
        operarioId,
        periodoId: activePeriod.periodoId,
        estado: {
          notIn: [EstadoRuta.CANCELADA, EstadoRuta.COMPLETADA],
        },
        deletedAt: null,
      },
      select: {
        comunidadId: true,
        sectorId: true,
      },
    });

    if (rutas.length === 0) {
      throw new ForbiddenException(
        'No tenés rutas asignadas en el período activo',
      );
    }

    // 5. Validate the lectura's contrato belongs to one of the operator's rutas
    const activeHistorial = existing.medidor?.historial?.[0];
    const contrato = activeHistorial?.contrato ?? null;

    if (!contrato) {
      throw new NotFoundException(
        'No se encontró un contrato activo para esta lectura',
      );
    }

    const lecturaPertenece = rutas.some((ruta) => {
      const comunidadMatch = ruta.comunidadId === contrato.comunidadId;
      const sectorMatch =
        ruta.sectorId === null || ruta.sectorId === undefined
          ? true
          : ruta.sectorId === contrato.sectorId;
      return comunidadMatch && sectorMatch;
    });

    if (!lecturaPertenece) {
      throw new ForbiddenException(
        'Esta lectura no pertenece a tu ruta asignada',
      );
    }

    // 6. Build update payload — set estado to POR_REVISION and merge fields from DTO
    const dataToUpdate: Record<string, unknown> = {
      estado: EstadoLectura.POR_REVISION,
    };

    if (updateDto.lecturaActual !== undefined) {
      dataToUpdate.lecturaActual = updateDto.lecturaActual;
    }
    if (updateDto.lecturaAnterior !== undefined) {
      dataToUpdate.lecturaAnterior = updateDto.lecturaAnterior;
    }
    if (updateDto.consumoCalculado !== undefined) {
      dataToUpdate.consumoCalculado = updateDto.consumoCalculado;
    }
    if (updateDto.descripcionAnomalia !== undefined) {
      dataToUpdate.descripcionAnomalia = updateDto.descripcionAnomalia;
    }
    if (updateDto.lecturaInicial !== undefined) {
      dataToUpdate.lecturaInicial = updateDto.lecturaInicial;
    }
    if (updateDto.fotoUrl !== undefined) {
      dataToUpdate.fotoUrl = updateDto.fotoUrl;
    }
    if (updateDto.fecha !== undefined) {
      dataToUpdate.fecha = new Date(updateDto.fecha);
    }

    // 7. Perform the update and return the updated lectura
    const updated = await this.prisma.lecturas.update({
      where: { lecturaId: id },
      data: dataToUpdate,
      select: {
        lecturaId: true,
        fecha: true,
        lecturaAnterior: true,
        lecturaActual: true,
        consumoCalculado: true,
        descripcionAnomalia: true,
        fechaValidacion: true,
        fotoUrl: true,
        lecturaInicial: true,
        periodoId: true,
        estado: true,
        medidor: {
          select: {
            medidorId: true,
            serie: true,
            marca: true,
            modelo: true,
            historial: {
              where: { fechaHasta: null },
              select: {
                contrato: {
                  select: {
                    contratoId: true,
                    numeroGuia: true,
                    direccionSuministro: true,
                    estado: true,
                  },
                },
              },
            },
          },
        },
        periodoRel: {
          select: {
            periodoId: true,
            nombre: true,
            fechaInicio: true,
            fechaFin: true,
          },
        },
      },
    });

    const updatedHistorial = updated.medidor?.historial?.[0];
    const updatedContrato = updatedHistorial?.contrato ?? null;

    return {
      lecturaId: updated.lecturaId.toString(),
      fecha: updated.fecha,
      lecturaAnterior: Number(updated.lecturaAnterior),
      lecturaActual: Number(updated.lecturaActual),
      consumoCalculado: Number(updated.consumoCalculado),
      contratoId: updatedContrato ? updatedContrato.contratoId.toString() : '',
      descripcionAnomalia: updated.descripcionAnomalia,
      fechaValidacion: updated.fechaValidacion,
      fotoUrl: updated.fotoUrl,
      // Computed fields — not stored in DB
      isValidada: updated.estado !== 'PENDIENTE',
      tieneAnomalia: !!updated.descripcionAnomalia,
      lecturaInicial: updated.lecturaInicial,
      periodoId: updated.periodoId,
      estado: updated.estado,
      contrato: updatedContrato
        ? {
            contratoId: updatedContrato.contratoId.toString(),
            numeroGuia: updatedContrato.numeroGuia,
            direccionSuministro: updatedContrato.direccionSuministro,
            estado: updatedContrato.estado,
          }
        : null,
      medidor: updated.medidor
        ? {
            medidorId: updated.medidor.medidorId.toString(),
            serie: updated.medidor.serie,
            marca: updated.medidor.marca,
            modelo: updated.medidor.modelo,
          }
        : null,
      periodoRel: updated.periodoRel
        ? {
            periodoId: updated.periodoRel.periodoId,
            nombre: updated.periodoRel.nombre,
            fechaInicio: updated.periodoRel.fechaInicio,
            fechaFin: updated.periodoRel.fechaFin,
          }
        : null,
    };
  }
}
