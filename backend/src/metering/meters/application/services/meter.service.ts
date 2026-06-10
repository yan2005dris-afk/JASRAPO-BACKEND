import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { CreateMeterDto } from '../../interfaces/dto/create-meter.dto';
import { UpdateMeterDto } from '../../interfaces/dto/update-meter.dto';
import { MeterResponseDto } from '../../interfaces/dto/meter-response.dto';
import { EstadoMedidorResponseDto } from '../../interfaces/dto/estado-medidor-response.dto';
import { CreateMeterUseCase } from '../use-cases/create-meter.use-case';
import { ReportDefectUseCase } from '../use-cases/report-defect.use-case';
import { FindOneMeterUseCase } from '../use-cases/find-one-meter.use-case';
import { InstallMeterUseCase } from '../use-cases/install-meter.use-case';
import { DecommissionMeterUseCase } from '../use-cases/decommission-meter.use-case';
import { safeMeterSelect } from '../../domain/types/IResponseMeters';
import { toMeterResponse } from '../../domain/types/metersMapper';
import { DateUtil } from 'src/infrastructure/common/utils/date.util';

import { METER_STATUS_LIST } from 'src/infrastructure/config/app.constants';

@Injectable()
export class MeterService {
  constructor(
    private readonly meterRepository: MeterRepository,
    private readonly createUseCase: CreateMeterUseCase,
    private readonly findOneUseCase: FindOneMeterUseCase,
    private readonly installUseCase: InstallMeterUseCase,
    private readonly reportDamageUseCase: ReportDefectUseCase,
    private readonly decommissionUseCase: DecommissionMeterUseCase,
  ) {}

  async create(createDto: CreateMeterDto): Promise<MeterResponseDto> {
    const meter = await this.createUseCase.execute(createDto);
    return toMeterResponse(meter);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: Prisma.MedidoresWhereInput;
  }): Promise<MeterResponseDto[]> {
    const meters = await this.meterRepository.findMany({
      ...params,
      where: { ...params.where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: safeMeterSelect,
    });

    return meters.map(toMeterResponse);
  }

  async findOne(id: bigint): Promise<MeterResponseDto> {
    const meter = await this.findOneUseCase.execute(id);
    return toMeterResponse(meter);
  }

  async update(
    id: bigint,
    updateDto: UpdateMeterDto,
  ): Promise<MeterResponseDto> {
    await this.findOneUseCase.execute(id);

    // Parsear fechas incoming del frontend
    const dataToUpdate = {
      ...updateDto,
      fechaInstalacion: updateDto.fechaInstalacion
        ? DateUtil.parseFrontendDateStrict(updateDto.fechaInstalacion)
        : undefined,
      fechaBaja: updateDto.fechaBaja
        ? DateUtil.parseFrontendDateStrict(updateDto.fechaBaja)
        : undefined,
    };

    const updated = await this.meterRepository.update(
      { medidorId: id },
      dataToUpdate as any,
    );
    return toMeterResponse(updated);
  }

  async remove(id: bigint): Promise<{ message: string }> {
    await this.findOneUseCase.execute(id);
    await this.meterRepository.update(
      { medidorId: id },
      { deletedAt: new Date() },
    );
    return { message: `Medidor con ID ${id} eliminado` };
  }

  async install(
    medidorId: bigint,
    contratoId: bigint,
  ): Promise<MeterResponseDto> {
    const meter = await this.installUseCase.execute(medidorId, contratoId);
    return toMeterResponse(meter);
  }

  async reportDefect(medidorId: bigint): Promise<MeterResponseDto> {
    const meter = await this.reportDamageUseCase.execute(medidorId);
    return toMeterResponse(meter);
  }

  async decommission(
    medidorId: bigint,
    motivoBaja: string,
  ): Promise<MeterResponseDto> {
    const meter = await this.decommissionUseCase.execute(medidorId, motivoBaja);
    return toMeterResponse(meter);
  }

  /**
   * Obtener catálogo de estados de medidor
   */
  async findAllEstados(): Promise<EstadoMedidorResponseDto[]> {
    return METER_STATUS_LIST.map((s) => ({
      estadoId: s.estadoId,
      codigo: s.codigo,
      nombre: s.nombre,
      orden: s.orden,
    }));
  }
}
