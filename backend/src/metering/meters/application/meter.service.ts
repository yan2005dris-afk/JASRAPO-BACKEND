import { Injectable } from '@nestjs/common';
import {
  MeterFilters,
  MeterRepository,
} from '../domain/repositories/meter.repository';
import { CreateMeterDto } from '../interfaces/dto/create-meter.dto';
import { UpdateMeterDto } from '../interfaces/dto/update-meter.dto';
import { EstadoMedidorResponseDto } from '../interfaces/dto/estado-medidor-response.dto';
import { CreateMeterUseCase } from './use-cases/create-meter.use-case';
import { ReportDefectUseCase } from './use-cases/report-defect.use-case';
import { FindOneMeterUseCase } from './use-cases/find-one-meter.use-case';
import { InstallMeterUseCase } from './use-cases/install-meter.use-case';
import { DecommissionMeterUseCase } from './use-cases/decommission-meter.use-case';
import { MeterEntity } from '../domain/entities/meter.entity';
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

  async create(createDto: CreateMeterDto): Promise<MeterEntity> {
    return this.createUseCase.execute(createDto);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    where?: MeterFilters;
  }): Promise<MeterEntity[]> {
    return this.meterRepository.findMany({
      skip: params.skip,
      take: params.take,
      where: params.where,
    });
  }

  async findOne(id: bigint): Promise<MeterEntity> {
    return this.findOneUseCase.execute(id);
  }

  async update(id: bigint, updateDto: UpdateMeterDto): Promise<MeterEntity> {
    await this.findOneUseCase.execute(id);

    const dataToUpdate = {
      ...updateDto,
      fechaInstalacion: updateDto.fechaInstalacion
        ? DateUtil.parseFrontendDateStrict(updateDto.fechaInstalacion)
        : undefined,
      fechaBaja: updateDto.fechaBaja
        ? DateUtil.parseFrontendDateStrict(updateDto.fechaBaja)
        : undefined,
    };

    return this.meterRepository.update({ medidorId: id }, dataToUpdate);
  }

  async remove(id: bigint): Promise<{ message: string }> {
    await this.findOneUseCase.execute(id);
    await this.meterRepository.update(
      { medidorId: id },
      { deletedAt: new Date() },
    );
    return { message: `Medidor con ID ${id} eliminado` };
  }

  async install(medidorId: bigint, contratoId: bigint): Promise<MeterEntity> {
    return this.installUseCase.execute(medidorId, contratoId);
  }

  async reportDefect(medidorId: bigint): Promise<MeterEntity> {
    return this.reportDamageUseCase.execute(medidorId);
  }

  async decommission(
    medidorId: bigint,
    motivoBaja: string,
  ): Promise<MeterEntity> {
    return this.decommissionUseCase.execute(medidorId, motivoBaja);
  }

  async findAllEstados(): Promise<EstadoMedidorResponseDto[]> {
    return METER_STATUS_LIST.map((s) => ({
      estadoId: s.estadoId,
      codigo: s.codigo,
      nombre: s.nombre,
      orden: s.orden,
    }));
  }
}
