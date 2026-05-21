import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma.service';
import { GenerarLoteDto } from './dto/generar-lote.dto';
import { BATCH_STATUS_LIST } from 'src/infrastructure/config/app.constants';

@Injectable()
export class LoteService {
  private readonly logger = new Logger(LoteService.name);

  constructor(private readonly prisma: PrismaService) {}

  async generarLote(dto: GenerarLoteDto) {
    this.logger.log(
      `Iniciando generación de lote para periodo ${dto.periodoId}`,
    );

    // Ejecutar el Stored Procedure
    // Nota: BigInt se devuelve como string en el resultado de queryRaw
    const result = await this.prisma.$queryRawUnsafe<any[]>(
      `SELECT generar_prefacturas_lote($1, $2, $3) as "loteId"`,
      dto.periodoId,
      dto.comunidadId ?? null,
      dto.creadoPor ?? 'SYSTEM',
    );

    const loteId = result[0]?.loteId;

    return {
      message: 'Lote generado exitosamente',
      loteId: loteId ? Number(loteId) : null,
    };
  }

  async findAll() {
    return await this.prisma.lote.findMany({
      include: {
        comunidad: true,
        periodoRel: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return await this.prisma.lote.findUnique({
      where: { loteId: BigInt(id) },
      include: {
        prefacturas: {
          take: 10, // Solo una muestra
        },
        comunidad: true,
        periodoRel: true,
      },
    });
  }

  /**
   * Catálogo de estados de lote
   */
  async findAllEstados() {
    return BATCH_STATUS_LIST.map((s) => ({
      estadoId: s.estadoId,
      codigo: s.codigo,
      nombre: s.nombre,
      orden: s.orden,
    }));
  }
}
