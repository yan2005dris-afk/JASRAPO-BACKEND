import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ActualizarContratoMedidorDto } from '../../interfaces/dto/update-contrato-medidor.dto';

@Injectable()
export class UpdateContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(
    id: bigint,
    updateDto: ActualizarContratoMedidorDto,
  ): Promise<any> {
    const registro = await this.contractRepository.findUnique({
      contratoId: id,
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }

    if (updateDto.medidorId) {
      const medidorId = BigInt(updateDto.medidorId);
      const lecturaInicial = updateDto.lecturaInicial ?? 0;

      await this.contractRepository.executeTransaction(async (tx) => {
        // Validate new medidor exists
        const medidor = await tx.medidores.findUnique({
          where: { medidorId },
        });
        if (!medidor) {
          throw new NotFoundException(
            `Medidor con ID ${updateDto.medidorId} no encontrado`,
          );
        }

        // Close current active link
        await tx.historialMedidores.updateMany({
          where: { contratoId: id, fechaHasta: null },
          data: { fechaHasta: new Date() },
        });

        // Create new meter link
        await tx.historialMedidores.create({
          data: {
            medidorId,
            contratoId: id,
            lecturaInicial: new Prisma.Decimal(lecturaInicial),
            motivo: 'REEMPLAZO',
          },
        });

        // Update contract fields
        const updateData: Record<string, any> = {};
        if (updateDto.estado !== undefined)
          updateData.estado = updateDto.estado;
        if (updateDto.direccionSuministro !== undefined)
          updateData.direccionSuministro = updateDto.direccionSuministro;
        if (updateDto.sectorId !== undefined)
          updateData.sectorId = Number(updateDto.sectorId);

        if (Object.keys(updateData).length > 0) {
          await tx.contratos.update({
            where: { contratoId: id },
            data: updateData,
          });
        }
      });
    } else {
      // Only update contract fields (no meter replacement)
      const updateData: Record<string, any> = {};
      if (updateDto.estado !== undefined) updateData.estado = updateDto.estado;
      if (updateDto.direccionSuministro !== undefined)
        updateData.direccionSuministro = updateDto.direccionSuministro;
      if (updateDto.sectorId !== undefined)
        updateData.sectorId = Number(updateDto.sectorId);

      if (Object.keys(updateData).length === 0) {
        throw new BadRequestException(
          'No se proporcionaron campos para actualizar',
        );
      }

      await this.contractRepository.update({ contratoId: id }, updateData);
    }

    return this.contractRepository.findUnique({ contratoId: id });
  }
}
