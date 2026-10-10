import { Injectable } from '@nestjs/common';
import type { Prisma } from 'src/generated/prisma/client';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import {
  ContractWorkOrderPort,
  EnsureContractWorkOrderTarget,
} from '../ports/contract-work-order.port';

@Injectable()
export class EnsureContractWorkOrderUseCase implements ContractWorkOrderPort {
  async ensureWorkOrder(
    tx: unknown,
    contract: EnsureContractWorkOrderTarget,
    medidorId: bigint,
    activity: 'INSPECCION' | 'INSTALACION',
  ): Promise<{ ordenTrabajoId: bigint; rutaId: bigint; estado: string }> {
    const client = tx as Prisma.TransactionClient;
    const existing = await client.ordenesTrabajo.findFirst({
      where: {
        contratoId: contract.contratoId,
        deletedAt: null,
        estado: { notIn: ['CANCELADA', 'FALLIDA'] },
        ruta: { deletedAt: null, tipoActividad: { codigo: activity } },
      },
    });
    if (existing) return existing;

    const type = await client.tipoActividad.findUnique({
      where: { codigo: activity },
    });
    if (!type?.activo) {
      throw new InvalidDomainOperationException(
        `La actividad ${activity} no está habilitada`,
      );
    }
    const period = await client.periodos.findFirst({
      where: { estado: 'ABIERTO', deletedAt: null },
      orderBy: { fechaInicio: 'desc' },
      select: { periodoId: true },
    });
    const route = await client.rutas.create({
      data: {
        nombre: `${activity === 'INSPECCION' ? 'Inspección' : 'Instalación'} ${contract.numeroGuia}`,
        tipoActividadId: type.tipoActividadId,
        comunidadId: contract.comunidadId,
        sectorId: contract.sectorId,
        periodoId: period?.periodoId ?? null,
        estado: 'PENDIENTE',
      },
    });
    return client.ordenesTrabajo.create({
      data: {
        rutaId: route.rutaId,
        contratoId: contract.contratoId,
        medidorId,
        estado: 'PENDIENTE',
      },
    });
  }
}
