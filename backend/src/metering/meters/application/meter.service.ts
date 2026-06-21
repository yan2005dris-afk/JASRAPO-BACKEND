import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../domain/repositories/meter.repository';
import { CreateMeterDto } from '../interfaces/dto/create-meter.dto';
import { UpdateMeterDto } from '../interfaces/dto/update-meter.dto';
import { FilterMeterDto } from '../interfaces/dto/filter-meter.dto';
import { buildMeterFilters } from './mappers/meter-filters.mapper';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { EstadoMedidor } from 'src/shared/enums';
import { CreateMeterUseCase } from './use-cases/create-meter.use-case';
import { ReportDefectUseCase } from './use-cases/report-defect.use-case';
import { FindOneMeterUseCase } from './use-cases/find-one-meter.use-case';
import { InstallMeterUseCase } from './use-cases/install-meter.use-case';
import { DecommissionMeterUseCase } from './use-cases/decommission-meter.use-case';
import { MeterEntity } from '../domain/entities/meter.entity';
import { toMeterResponse } from '../domain/types/metersMapper';
import { DateUtil } from 'src/shared/utils/date.util';
import { METER_STATUS_LIST } from 'src/infrastructure/config/app.constants';
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedMeterResponse } from '../interfaces/types/paginated-meter-response.type';

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

  async findAll(filters?: FilterMeterDto): Promise<PaginatedMeterResponse> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const { skip, take, page: safePage } = getPagination(page, limit);
    const meterFilters = filters ? buildMeterFilters(filters) : undefined;

    const [meters, total, enBodegaCount, instaladosCount, danadosCount] =
      await Promise.all([
        this.meterRepository.findMany({ where: meterFilters, skip, take }),
        this.meterRepository.count(meterFilters),
        this.meterRepository.count({ ...meterFilters, estado: 'BODEGA' }),
        this.meterRepository.count({ ...meterFilters, estado: 'INSTALADO' }),
        this.meterRepository.count({ ...meterFilters, estado: 'DANADO' }),
      ]);

    const totalPages = Math.ceil(total / take);

    return {
      data: meters.map((m) => toMeterResponse(m)),
      meta: {
        total,
        page: safePage,
        limit: take,
        ultimaPagina: totalPages,
        paginaActual: safePage,
        porPagina: take,
        anterior: safePage > 1 ? safePage - 1 : null,
        siguiente: safePage < totalPages ? safePage + 1 : null,
      },
      kpis: {
        enBodega: enBodegaCount,
        instalados: instaladosCount,
        danados: danadosCount,
        total,
      },
    };
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

  async findAllStates(): Promise<EnumStateDto[]> {
    return METER_STATUS_LIST;
  }
}
