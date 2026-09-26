import type { Prisma } from 'src/generated/prisma/client';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';

/** El contrato debe estar bloqueado por el caller durante toda la transacción. */
export async function ensureContractWorkOrder(
  tx: Prisma.TransactionClient,
  contract: {
    contratoId: bigint;
    numeroGuia: string;
    comunidadId: number;
    sectorId: number | null;
  },
  medidorId: bigint,
  activity: 'INSPECCION' | 'INSTALACION',
) {
  const existing = await tx.ordenesTrabajo.findFirst({
    where: {
      contratoId: contract.contratoId,
      deletedAt: null,
      estado: { notIn: ['CANCELADA', 'FALLIDA'] },
      ruta: { deletedAt: null, tipoActividad: { codigo: activity } },
    },
  });
  if (existing) return existing;

  const type = await tx.tipoActividad.findUnique({
    where: { codigo: activity },
  });
  if (!type?.activo) {
    throw new InvalidDomainOperationException(
      `La actividad ${activity} no está habilitada`,
    );
  }
  const period = await tx.periodos.findFirst({
    where: { estado: 'ABIERTO', deletedAt: null },
    orderBy: { fechaInicio: 'desc' },
    select: { periodoId: true },
  });
  const route = await tx.rutas.create({
    data: {
      nombre: `${activity === 'INSPECCION' ? 'Inspección' : 'Instalación'} ${contract.numeroGuia}`,
      tipoActividadId: type.tipoActividadId,
      comunidadId: contract.comunidadId,
      sectorId: contract.sectorId,
      periodoId: period?.periodoId ?? null,
      estado: 'PENDIENTE',
    },
  });
  return tx.ordenesTrabajo.create({
    data: {
      rutaId: route.rutaId,
      contratoId: contract.contratoId,
      medidorId,
      estado: 'PENDIENTE',
    },
  });
}
