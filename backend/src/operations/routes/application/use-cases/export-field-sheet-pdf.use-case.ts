import { Injectable } from '@nestjs/common';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { FieldSheetPdfDocumentType } from '../../pdf/field-sheet.pdf-type';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { ReadingForRouteResponseDto } from '../../interfaces/dto/route-response.dto';

@Injectable()
export class ExportFieldSheetPdfUseCase {
  constructor(
    private readonly routeRepository: RouteRepository,
    private readonly prisma: PrismaService,
    private readonly generatePdf: GeneratePdfUseCase,
  ) {}

  async execute(rutaId: bigint): Promise<Buffer> {
    const ruta = await this.prisma.rutas.findUnique({
      where: { rutaId },
      include: {
        tipoActividad: { select: { codigo: true } },
        comunidad: true,
        sector: true,
        operario: true,
        periodo: true,
        ordenesTrabajo: {
          where: { deletedAt: null },
          include: {
            contrato: {
              include: { cliente: true },
            },
            medidor: true,
          },
          orderBy: { ordenVisita: 'asc' },
        },
      },
    });

    if (!ruta) {
      throw new EntityNotFoundException('Ruta', rutaId.toString());
    }

    const isLectura = ruta.tipoActividad.codigo === 'LECTURA';
    let items: Array<{
      ordenVisita?: number;
      guia?: string;
      contrato?: string;
      cliente: string;
      direccion: string;
      medidor: string;
      lecturaAnterior?: string | number;
      tipoActividad?: string;
      estado?: string;
    }> = [];

    let kpis = {
      total: 0,
      pendientes: 0,
      completadas: 0,
      conNovedad: 0,
    };

    if (isLectura) {
      const readingsResult =
        await this.routeRepository.paginateLecturasByRutaId(rutaId, {
          page: 1,
          limit: 2000,
          skip: 0,
          take: 2000,
        });

      const dtos = readingsResult.data.map((r) =>
        ReadingForRouteResponseDto.fromRow(r),
      );

      items = dtos.map((dto, idx) => ({
        ordenVisita: idx + 1,
        guia: dto.guia || '—',
        contrato: dto.guia || '—',
        cliente: dto.clienteNombre || 'Sin cliente',
        direccion: dto.direccion || '—',
        medidor: dto.medidorSerie || '—',
        lecturaAnterior:
          dto.lecturaAnterior != null ? dto.lecturaAnterior : '—',
        tipoActividad: 'LECTURA',
        estado: dto.estadoLectura || 'PENDIENTE',
      }));

      kpis = {
        total: dtos.length,
        pendientes: dtos.filter((d) => d.estadoLectura === 'PENDIENTE').length,
        completadas: dtos.filter((d) => d.estadoLectura === 'APROBADA').length,
        conNovedad: dtos.filter(
          (d) =>
            d.estadoLectura === 'CON_NOVEDAD' ||
            d.estadoLectura === 'RECHAZADA_VERIFICACION',
        ).length,
      };
    } else {
      items = ruta.ordenesTrabajo.map((o, idx) => {
        const clienteNom = o.contrato?.cliente
          ? `${o.contrato.cliente.nombres || ''} ${o.contrato.cliente.apellidos || ''}`.trim()
          : 'Sin cliente';

        return {
          ordenVisita: o.ordenVisita || idx + 1,
          guia: o.contrato?.numeroGuia || '—',
          contrato: o.contrato?.numeroGuia || '—',
          cliente: clienteNom || 'Sin cliente',
          direccion: o.contrato?.direccionSuministro || '—',
          medidor: o.medidor?.serie || '—',
          tipoActividad: ruta.tipoActividad.codigo,
          estado: o.estado || 'PENDIENTE',
        };
      });

      kpis = {
        total: ruta.ordenesTrabajo.length,
        pendientes: ruta.ordenesTrabajo.filter(
          (o) => o.estado === 'PENDIENTE' || o.estado === 'EN_PROGRESO',
        ).length,
        completadas: ruta.ordenesTrabajo.filter(
          (o) => o.estado === 'COMPLETADA',
        ).length,
        conNovedad: ruta.ordenesTrabajo.filter(
          (o) => o.estado === 'FALLIDA' || o.estado === 'CANCELADA',
        ).length,
      };
    }

    const operarioNombre = ruta.operario
      ? `${ruta.operario.nombres || ''} ${ruta.operario.apellidos || ''}`.trim() ||
        ruta.operario.email
      : undefined;

    return this.generatePdf.execute(FieldSheetPdfDocumentType.type, {
      ruta: {
        rutaId: ruta.rutaId,
        nombre: ruta.nombre,
        tipoRuta: ruta.tipoActividad.codigo,
        descripcion: ruta.descripcion,
        estado: ruta.estado,
        comunidadNombre: ruta.comunidad?.nombre,
        sectorNombre: ruta.sector?.nombre,
        operarioNombre,
        periodoNombre: ruta.periodo?.nombre,
      },
      isLectura,
      items,
      kpis,
    });
  }
}
