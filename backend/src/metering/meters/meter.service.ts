import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { MeterResponseDto } from './dto/meter-response.dto';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateMeterUseCase } from './use-cases/create-meter.use-case';
import { ReportDefectUseCase } from './use-cases/report-defect.use-case';
import { FindOneMeterUseCase } from './use-cases/find-one-meter.use-case';
import { InstallMeterUseCase } from './use-cases/install-meter.use-case';
import { DecommissionMeterUseCase } from './use-cases/decommission-meter.use-case';

/**
 * Safe select: filtra campos a nivel SQL
 * - Excluye: deletedAt, createdAt, updatedAt (internal)
 * - Incluye: campos públicos del medidor
 */
const safeMeterSelect = {
  medidorId: true,
  contratoId: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: true,
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
  latitud: true,
  longitud: true,
} satisfies Prisma.MedidoresSelect;

/**
 * Mapea resultado de Prisma a DTO de response
 * Convierte Decimal a number para JSON
 */
function toMeterResponse(meter: any): MeterResponseDto {
  return {
    medidorId: meter.medidorId,
    contratoId: meter.contratoId,
    marca: meter.marca,
    modelo: meter.modelo,
    serie: meter.serie,
    estado: meter.estado,
    fechaInstalacion: meter.fechaInstalacion,
    fechaBaja: meter.fechaBaja,
    motivo: meter.motivo,
    latitud: meter.latitud ? Number(meter.latitud) : null,
    longitud: meter.longitud ? Number(meter.longitud) : null,
  };
}

@Injectable()
export class MeterService {
  constructor(
    private readonly prisma: PrismaService,
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
    const meters = await this.prisma.medidores.findMany({
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
    const updated = await this.prisma.medidores.update({
      where: { medidorId: id },
      data: updateDto as any,
    });
    return toMeterResponse(updated);
  }

  async remove(id: bigint): Promise<{ message: string }> {
    await this.findOneUseCase.execute(id);
    await this.prisma.medidores.update({
      where: { medidorId: id },
      data: { deletedAt: new Date() },
    });
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
}
