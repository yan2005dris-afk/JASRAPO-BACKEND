import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { FindOneMeterUseCase } from './find-one-meter.use-case';
import { UpdateMeterDto } from '../../interfaces/dto/update-meter.dto';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { DateUtil } from 'src/shared/utils/date.util';

@Injectable()
export class UpdateMeterUseCase {
  constructor(
    private readonly meterRepository: MeterRepository,
    private readonly findOneUseCase: FindOneMeterUseCase,
  ) {}

  async execute(id: bigint, updateDto: UpdateMeterDto): Promise<MeterEntity> {
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
}
