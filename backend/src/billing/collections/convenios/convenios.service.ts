import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateConvenioDto } from './dto/create-convenio.dto';
import { ConvenioResponseDto } from './dto/convenio-response.dto';
import { CuotaConvenioResponseDto } from './dto/cuota-convenio-response.dto';
import { DebtSummaryResponseDto } from './dto/debt-summary-response.dto';
import { EstadoConvenioResponseDto } from './dto/estado-convenio-response.dto';
import { EstadoCuotaConvenioResponseDto } from './dto/estado-cuota-convenio-response.dto';
import {
  safeCuotaConvenioSelect,
  safeConvenioSelect,
  safeConvenioWithCuotasSelect,
  safeEstadoConvenioSelect,
  safeEstadoCuotaConvenioSelect,
} from './types/IConvenio';
import {
  toConvenioResponse,
  toCuotaConvenioResponse,
  toEstadoConvenioResponse,
  toEstadoCuotaConvenioResponse,
} from './types/conveniosMapper';
import { CreateConvenioUseCase } from './use-cases/create-convenio.use-case';
import { FindOneConvenioUseCase } from './use-cases/find-one-convenio.use-case';
import { GetDebtSummaryUseCase } from './use-cases/get-debt-summary.use-case';

@Injectable()
export class ConveniosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly createUseCase: CreateConvenioUseCase,
    private readonly findOneUseCase: FindOneConvenioUseCase,
    private readonly getDebtSummaryUseCase: GetDebtSummaryUseCase,
  ) {}

  // ── Catálogos de estados ──────────────────────────────────────────────────

  async findAllEstadosConvenio(): Promise<EstadoConvenioResponseDto[]> {
    const estados = await this.prisma.estadoConvenio.findMany({
      where: { activo: true },
      select: safeEstadoConvenioSelect,
      orderBy: { orden: 'asc' },
    });
    return estados.map(toEstadoConvenioResponse);
  }

  async findAllEstadosCuotaConvenio(): Promise<
    EstadoCuotaConvenioResponseDto[]
  > {
    const estados = await this.prisma.estadoCuotaConvenio.findMany({
      where: { activo: true },
      select: safeEstadoCuotaConvenioSelect,
      orderBy: { orden: 'asc' },
    });
    return estados.map(toEstadoCuotaConvenioResponse);
  }

  // ── Deuda ─────────────────────────────────────────────────────────────────

  async getDebtSummary(contratoId: string): Promise<DebtSummaryResponseDto> {
    return this.getDebtSummaryUseCase.execute(BigInt(contratoId));
  }

  // ── CRUD de Convenios ─────────────────────────────────────────────────────

  async create(dto: CreateConvenioDto): Promise<ConvenioResponseDto> {
    const convenio = await this.createUseCase.execute(dto);
    return toConvenioResponse(convenio);
  }

  async findAll(contratoId?: string): Promise<ConvenioResponseDto[]> {
    const convenios = await this.prisma.convenios.findMany({
      where: {
        deletedAt: null,
        ...(contratoId ? { contratoId: BigInt(contratoId) } : {}),
      },
      select: safeConvenioSelect,
      orderBy: { createdAt: 'desc' },
    });
    return convenios.map(toConvenioResponse);
  }

  async findOne(id: string): Promise<ConvenioResponseDto> {
    const convenio = await this.findOneUseCase.execute(BigInt(id));
    return toConvenioResponse(convenio);
  }

  async findCuotas(convenioId: string): Promise<CuotaConvenioResponseDto[]> {
    // Verificar que el convenio existe y no está soft-deleted
    await this.findOneUseCase.execute(BigInt(convenioId));

    const cuotas = await this.prisma.cuotaConvenio.findMany({
      where: { convenioId: BigInt(convenioId), deletedAt: null },
      select: safeCuotaConvenioSelect,
      orderBy: { numeroCuota: 'asc' },
    });

    return cuotas.map(toCuotaConvenioResponse);
  }

  async cancel(id: string): Promise<ConvenioResponseDto> {
    // Verificar que existe
    await this.findOneUseCase.execute(BigInt(id));

    const estadoAnulado = await this.prisma.estadoConvenio.findUnique({
      where: { codigo: 'ANULADO' },
      select: { estadoConvenioId: true },
    });

    if (!estadoAnulado) {
      throw new InternalServerErrorException(
        'El estado de convenio ANULADO no se encuentra configurado en el sistema.',
      );
    }

    const updated = await this.prisma.convenios.update({
      where: { convenioId: BigInt(id) },
      data: {
        estadoConvenioId: estadoAnulado.estadoConvenioId,
        deletedAt: new Date(),
      },
      select: safeConvenioWithCuotasSelect,
    });

    return toConvenioResponse(updated);
  }
}
