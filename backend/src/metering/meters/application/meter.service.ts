import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../domain/repositories/meter.repository';
import { CreateMeterDto } from '../interfaces/dto/create-meter.dto';
import { UpdateMeterDto } from '../interfaces/dto/update-meter.dto';
import { FilterMeterDto } from '../interfaces/dto/filter-meter.dto';
import { buildMeterFilters } from './mappers/meter-filters.mapper';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { CreateMeterUseCase } from './use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './use-cases/find-one-meter.use-case';
import { MeterEntity } from '../domain/entities/meter.entity';
import { MeterResponseDto } from '../interfaces/dto/meter-response.dto';
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
  ) {}

  async create(createDto: CreateMeterDto): Promise<MeterEntity> {
    return this.createUseCase.execute(createDto);
  }

  async findAll(filters?: FilterMeterDto): Promise<PaginatedMeterResponse> {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    const { skip, take, page: safePage } = getPagination(page, limit);
    const meterFilters = filters ? buildMeterFilters(filters) : undefined;

    const [meters, total, estadoGroups] = await Promise.all([
      this.meterRepository.findMany({ where: meterFilters, skip, take }),
      this.meterRepository.count(meterFilters),
      this.meterRepository.groupByEstado(meterFilters),
    ]);

    const kpiByEstado = new Map<string, number>(
      estadoGroups.map((g) => [g.estado, g._count._all]),
    );

    const totalPages = Math.ceil(total / take);

    return {
      data: meters.map((m) => MeterResponseDto.fromEntity(m)),
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
        enBodega: kpiByEstado.get('BODEGA') ?? 0,
        instalados: kpiByEstado.get('INSTALADO') ?? 0,
        danados: kpiByEstado.get('DANADO') ?? 0,
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
