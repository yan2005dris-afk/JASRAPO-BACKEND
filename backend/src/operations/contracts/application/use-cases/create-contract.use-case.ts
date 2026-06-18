import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { CrearContratoMedidorDto } from '../../interfaces/dto/create-contrato-medidor.dto';

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(dto: CrearContratoMedidorDto): Promise<any> {
    const clienteId = BigInt(dto.clienteId);
    const categoriaTarifaId = Number(dto.categoriaTarifaId);
    const medidorId = BigInt(dto.medidorId);
    const comunidadId = Number(dto.comunidadId);
    const sectorId = dto.sectorId ? Number(dto.sectorId) : null;
    const lecturaInicial = dto.lecturaInicial ?? 0;
    const estado = dto.estado || 'SOLICITUD';

    const contratoId = await this.contractRepository.executeTransaction<bigint>(
      async (tx) => {
        // Validate clienteId
        const cliente = await tx.clientes.findUnique({
          where: { clienteId },
        });
        if (!cliente) {
          throw new NotFoundException(
            `Cliente con ID ${dto.clienteId} no encontrado`,
          );
        }

        // Validate medidorId
        const medidor = await tx.medidores.findUnique({
          where: { medidorId },
        });
        if (!medidor) {
          throw new NotFoundException(
            `Medidor con ID ${dto.medidorId} no encontrado`,
          );
        }

        // Validate categoriaTarifaId
        const tarifa = await tx.categoriaTarifa.findUnique({
          where: { categoriaTarifaId },
        });
        if (!tarifa) {
          throw new NotFoundException(
            `Categoría de tarifa con ID ${dto.categoriaTarifaId} no encontrada`,
          );
        }

        // Create the contract
        const contrato = await tx.contratos.create({
          data: {
            clienteId,
            categoriaTarifaId,
            numeroGuia: dto.numeroGuia,
            direccionSuministro: dto.direccionSuministro,
            comunidadId,
            estado,
            ...(sectorId !== null ? { sectorId } : {}),
            ...(dto.creadoPor ? { creadoPor: dto.creadoPor } : {}),
          },
        });

        // Create the initial meter link
        await tx.historialMedidores.create({
          data: {
            medidorId,
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
}
