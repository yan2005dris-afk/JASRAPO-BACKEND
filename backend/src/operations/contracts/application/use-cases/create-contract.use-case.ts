import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { CrearContratoMedidorDto } from '../../interfaces/dto/create-contrato-medidor.dto';

interface ParsedIds {
  clienteId: bigint;
  categoriaTarifaId: number;
  medidorId: bigint;
  comunidadId: number;
  sectorId: number | null;
}

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(dto: CrearContratoMedidorDto): Promise<any> {
    const ids = this.parseIds(dto);
    const lecturaInicial = dto.lecturaInicial ?? 0;
    const estado = dto.estado || 'SOLICITUD';

    const contratoId = await this.contractRepository.executeTransaction<bigint>(
      async (tx) => {
        await this.validateEntities(tx, ids, dto);

        const contrato = await tx.contratos.create({
          data: {
            clienteId: ids.clienteId,
            categoriaTarifaId: ids.categoriaTarifaId,
            numeroGuia: dto.numeroGuia,
            direccionSuministro: dto.direccionSuministro,
            comunidadId: ids.comunidadId,
            estado,
            ...(ids.sectorId !== null
              ? { sectorId: ids.sectorId }
              : {}),
            ...(dto.creadoPor ? { creadoPor: dto.creadoPor } : {}),
          },
        });

        await tx.historialMedidores.create({
          data: {
            medidorId: ids.medidorId,
            contratoId: contrato.contratoId,
            lecturaInicial: new Prisma.Decimal(lecturaInicial),
            motivo: 'VINCULACION MANUAL',
          },
        });

        return contrato.contratoId;
      },
    );

    return this.contractRepository.findUnique({ contratoId });
  }

  private parseIds(dto: CrearContratoMedidorDto): ParsedIds {
    return {
      clienteId: BigInt(dto.clienteId),
      categoriaTarifaId: Number(dto.categoriaTarifaId),
      medidorId: BigInt(dto.medidorId),
      comunidadId: Number(dto.comunidadId),
      sectorId: dto.sectorId ? Number(dto.sectorId) : null,
    };
  }

  private async validateEntities(
    tx: any,
    ids: ParsedIds,
    dto: CrearContratoMedidorDto,
  ): Promise<void> {
    const cliente = await tx.clientes.findUnique({
      where: { clienteId: ids.clienteId },
    });
    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${dto.clienteId} no encontrado`,
      );
    }

    const medidor = await tx.medidores.findUnique({
      where: { medidorId: ids.medidorId },
    });
    if (!medidor) {
      throw new NotFoundException(
        `Medidor con ID ${dto.medidorId} no encontrado`,
      );
    }

    const tarifa = await tx.categoriaTarifa.findUnique({
      where: { categoriaTarifaId: ids.categoriaTarifaId },
    });
    if (!tarifa) {
      throw new NotFoundException(
        `Categoría de tarifa con ID ${dto.categoriaTarifaId} no encontrada`,
      );
    }

    const comunidad = await tx.comunidades.findUnique({
      where: { comunidadId: ids.comunidadId },
    });
    if (!comunidad) {
      throw new NotFoundException(
        `Comunidad con ID ${dto.comunidadId} no encontrada`,
      );
    }

    if (ids.sectorId !== null) {
      const sector = await tx.sectores.findUnique({
        where: { sectorId: ids.sectorId },
      });
      if (!sector) {
        throw new NotFoundException(
          `Sector con ID ${dto.sectorId} no encontrado`,
        );
      }
    }
  }
}
