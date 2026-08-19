import { Injectable } from '@nestjs/common';
import { CreateMeterDto } from '../interfaces/dto/create-meter.dto';
import { UpdateMeterDto } from '../interfaces/dto/update-meter.dto';
import { FilterMeterDto } from '../interfaces/dto/filter-meter.dto';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import { CreateMeterUseCase } from './use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './use-cases/find-one-meter.use-case';
import { FindAllMetersUseCase } from './use-cases/find-all-meters.use-case';
import { UpdateMeterUseCase } from './use-cases/update-meter.use-case';
import { RemoveMeterUseCase } from './use-cases/remove-meter.use-case';
import { ReplaceMeterUseCase } from './use-cases/replace-meter.use-case';
import { MeterEntity } from '../domain/entities/meter.entity';
import { METER_STATUS_LIST } from 'src/infrastructure/config/app.constants';
import { PaginatedMeterResponse } from '../interfaces/types/paginated-meter-response.type';
import { ReplaceMeterDto } from '../interfaces/dto/replace-meter.dto';
import type { ReplaceMeterResult } from '../domain/types/meter.types';

@Injectable()
export class MeterService {
  constructor(
    private readonly createUseCase: CreateMeterUseCase,
    private readonly findOneUseCase: FindOneMeterUseCase,
    private readonly findAllUseCase: FindAllMetersUseCase,
    private readonly updateUseCase: UpdateMeterUseCase,
    private readonly removeUseCase: RemoveMeterUseCase,
    private readonly replaceMeterUseCase: ReplaceMeterUseCase,
  ) {}

  async create(createDto: CreateMeterDto): Promise<MeterEntity> {
    return this.createUseCase.execute(createDto);
  }

  async findAll(filters?: FilterMeterDto): Promise<PaginatedMeterResponse> {
    return this.findAllUseCase.execute(filters);
  }

  async findOne(id: bigint): Promise<MeterEntity> {
    return this.findOneUseCase.execute(id);
  }

  async update(id: bigint, updateDto: UpdateMeterDto): Promise<MeterEntity> {
    return this.updateUseCase.execute(id, updateDto);
  }

  async remove(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }

  async replaceMeter(
    dto: ReplaceMeterDto,
    userId?: string,
  ): Promise<ReplaceMeterResult> {
    return this.replaceMeterUseCase.execute({
      contratoId: BigInt(dto.contratoId),
      nuevoMedidorId: BigInt(dto.nuevoMedidorId),
      lecturaFinalSaliente: dto.lecturaFinalSaliente,
      lecturaInicialEntrante: dto.lecturaInicialEntrante,
      motivo: dto.motivo,
      responsabilidadDano: dto.responsabilidadDano,
      detalleMotivo: dto.detalleMotivo,
      tratamientoSaliente: dto.tratamientoSaliente,
      tratamientoEntrante: dto.tratamientoEntrante,
      porcentajeCobro: dto.porcentajeCobro,
      ventanaPromedio: dto.ventanaPromedio,
      periodoOrigenId: dto.periodoOrigenId,
      periodoDestinoId: dto.periodoDestinoId,
      ordenTrabajoId: dto.ordenTrabajoId
        ? BigInt(dto.ordenTrabajoId)
        : undefined,
      solicitadoPorUsuarioId: userId,
      autorizadoPorUsuarioId: userId,
      fechaReemplazo: dto.fechaReemplazo
        ? new Date(dto.fechaReemplazo)
        : undefined,
    });
  }

  async findAllStates(): Promise<EnumStateDto[]> {
    return METER_STATUS_LIST;
  }
}
