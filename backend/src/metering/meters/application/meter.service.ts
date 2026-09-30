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
import { ExportMetersUseCase } from './use-cases/export-meters.use-case';
import { ExportMetersPdfUseCase } from './use-cases/export-meters-pdf.use-case';
import { ReplaceMeterUseCase } from './use-cases/replace-meter.use-case';
import { FindMeterHistoryUseCase } from './use-cases/find-meter-history.use-case';
import { FindReplacementUseCase } from './use-cases/find-replacement.use-case';
import { MeterEntity } from '../domain/entities/meter.entity';
import { MeterHistoryEntity } from '../domain/entities/meter-history.entity';
import { ReemplazoMedidorEntity } from '../domain/entities/reemplazo-medidor.entity';
import { METER_STATUS_LIST } from 'src/infrastructure/config/app.constants';
import { PaginatedMeterResponse } from '../interfaces/types/paginated-meter-response.type';
import { ExportMeterDto } from '../interfaces/dto/export-meter.dto';
import { ReplaceMeterDto } from '../interfaces/dto/replace-meter.dto';
import type { ReplaceMeterResult } from '../domain/types/meter.types';
import { Readable } from 'node:stream';

const UTF8_BOM = '\uFEFF';

@Injectable()
export class MeterService {
  constructor(
    private readonly createUseCase: CreateMeterUseCase,
    private readonly findOneUseCase: FindOneMeterUseCase,
    private readonly findAllUseCase: FindAllMetersUseCase,
    private readonly updateUseCase: UpdateMeterUseCase,
    private readonly removeUseCase: RemoveMeterUseCase,
    private readonly exportMetersUseCase: ExportMetersUseCase,
    private readonly exportMetersPdfUseCase: ExportMetersPdfUseCase,
    private readonly replaceMeterUseCase: ReplaceMeterUseCase,
    private readonly findMeterHistoryUseCase: FindMeterHistoryUseCase,
    private readonly findReplacementUseCase: FindReplacementUseCase,
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
    userId: number,
    userRole?: string,
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
      mesOrigen: dto.mesOrigen,
      mesDestino: dto.mesDestino,
      ordenTrabajoId: dto.ordenTrabajoId
        ? BigInt(dto.ordenTrabajoId)
        : undefined,
      solicitadoPorUsuarioId: userId,
      autorizadoPorUsuarioId: userId,
      claveIdempotencia: dto.claveIdempotencia,
      fechaReemplazo: dto.fechaReemplazo
        ? new Date(dto.fechaReemplazo)
        : undefined,
      userRole,
    });
  }

  async approveReplacement(
    reemplazoId: bigint,
    userId: number,
  ): Promise<ReplaceMeterResult> {
    return this.replaceMeterUseCase.approve(reemplazoId, userId);
  }

  async getHistory(medidorId: bigint): Promise<MeterHistoryEntity[]> {
    return this.findMeterHistoryUseCase.execute(medidorId);
  }

  async findReplacement(reemplazoId: bigint): Promise<ReemplazoMedidorEntity> {
    return this.findReplacementUseCase.execute(reemplazoId);
  }

  async findAllStates(): Promise<EnumStateDto[]> {
    return METER_STATUS_LIST;
  }

  async exportCsv(filters?: ExportMeterDto): Promise<Readable> {
    const meters = await this.exportMetersUseCase.execute(filters);
    const rows = [
      ['Serie', 'Marca', 'Modelo', 'Estado', 'Contrato', 'Cliente'],
      ...meters.map((meter) => [
        meter.serie,
        meter.marca,
        meter.modelo,
        meter.estado,
        meter.contratoId?.toString() ?? '',
        meter.clienteNombre ?? '',
      ]),
    ];
    // Sin el BOM, Excel abre el CSV en ANSI y rompe las tildes y la ñ.
    return Readable.from(
      rows.map(
        (row, index) =>
          `${index === 0 ? UTF8_BOM : ''}${row.map(csvEscape).join(',')}\r\n`,
      ),
    );
  }

  async exportPdf(filters?: ExportMeterDto): Promise<Buffer> {
    return this.exportMetersPdfUseCase.execute(filters);
  }
}

function csvEscape(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
