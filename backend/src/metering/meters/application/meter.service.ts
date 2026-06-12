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
import { getPagination } from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedMeterResponse, MeterKpis } from '../interfaces/types/paginated-meter-response.type';

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

  async findAll(page = 1, limit = 10, where?: MeterFilters): Promise<PaginatedMeterResponse> {
    const { skip, take, page: safePage } = getPagination(page, limit);

    const [
      meters,
      total,
      enBodegaCount,
      instaladosCount,
      danadosCount,
    ] = await Promise.all([
      this.meterRepository.findMany({ where, skip, take }),
      this.meterRepository.count(where),
      this.meterRepository.count({ ...where, estado: 'BODEGA' }),
      this.meterRepository.count({ ...where, estado: 'INSTALADO' }),
      this.meterRepository.count({ ...where, estado: 'DANADO' }),
    ]);

    return {
      data: meters as unknown as any[],
      meta: {
        total,
        page: safePage,
        limit: take,
        ultimaPagina: Math.ceil(total / take),
        paginaActual: safePage,
        porPagina: take,
        anterior: safePage > 1 ? safePage - 1 : null,
        siguiente: safePage < Math.ceil(total / take) ? safePage + 1 : null,
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
