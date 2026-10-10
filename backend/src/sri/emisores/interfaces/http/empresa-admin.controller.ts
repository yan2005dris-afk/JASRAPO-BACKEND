import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EmisoresService } from '../../application/emisores.service';
import {
  CreateEstablecimientoDto,
  CreatePuntoEmisionDto,
  UpdateEmisorDto,
  UploadCertificadoDto,
} from '../dto/emisor.dto';

@ApiTags('Administración / Empresa, Establecimientos y Cajas')
@ApiBearerAuth('JWT')
@Controller('admin/empresa')
export class EmpresaAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emisoresService: EmisoresService,
  ) {}

  @Get()
  @RequiredPermission('emisores', 'read')
  @ApiOperation({
    summary: 'Obtener información de la empresa con establecimientos y cajas',
  })
  async getEmpresaCompleta() {
    const emisor = await this.prisma.empresa.findFirst({
      orderBy: { id: 'asc' },
      include: {
        establecimientos: {
          orderBy: { codigo: 'asc' },
          include: {
            puntosEmision: {
              orderBy: { codigo: 'asc' },
            },
          },
        },
      },
    });

    if (!emisor) {
      return null;
    }

    return {
      id: emisor.id,
      ruc: emisor.ruc,
      razonSocial: emisor.razonSocial,
      nombreComercial: emisor.nombreComercial,
      direccionMatriz: emisor.direccionMatriz,
      obligadoContabilidad: emisor.obligadoContabilidad,
      contribuyenteEspecial: emisor.contribuyenteEspecial,
      agenteRetencion: emisor.agenteRetencion,
      contribuyenteRimpe: emisor.contribuyenteRimpe,
      ambiente: emisor.ambiente,
      estado: emisor.estado,
      tieneCertificado: !!emisor.certificadoNombre,
      certificadoValidoHasta: emisor.certificadoValidoHasta,
      certificadoSujeto: emisor.certificadoSujeto,
      establecimientos: emisor.establecimientos.map((est) => ({
        id: est.id,
        codigo: est.codigo,
        direccion: est.direccion,
        estado: est.estado,
        puntosEmision: est.puntosEmision.map((pe) => ({
          id: pe.id,
          codigo: pe.codigo,
          descripcion: pe.descripcion,
          estado: pe.estado,
        })),
      })),
    };
  }

  @Put(':id')
  @RequiredPermission('emisores', 'update')
  @ApiOperation({ summary: 'Actualizar datos de la empresa matriz' })
  async updateEmpresa(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateEmisorDto,
  ) {
    const updated = await this.prisma.empresa.update({
      where: { id },
      data: {
        razonSocial: dto.razonSocial,
        nombreComercial: dto.nombreComercial,
        direccionMatriz: dto.direccionMatriz,
        obligadoContabilidad: dto.obligadoContabilidad,
        contribuyenteEspecial: dto.contribuyenteEspecial,
        agenteRetencion: dto.agenteRetencion,
        contribuyenteRimpe: dto.contribuyenteRimpe,
        ambiente: dto.ambiente,
        estado: dto.estado,
      },
    });
    return updated;
  }

  @Post(':id/establecimientos')
  @RequiredPermission('emisores', 'create')
  @ApiOperation({ summary: 'Crear una nueva sucursal / establecimiento' })
  async createEstablecimiento(
    @Param('id', ParseIntPipe) emisorId: number,
    @Body() dto: CreateEstablecimientoDto,
  ) {
    return this.prisma.establecimientos.create({
      data: {
        emisorId,
        codigo: dto.codigo,
        direccion: dto.direccion,
        estado: 'ACTIVO',
      },
    });
  }

  @Post('establecimientos/:id/puntos-emision')
  @RequiredPermission('emisores', 'create')
  @ApiOperation({
    summary: 'Crear una nueva caja / punto de emisión en un establecimiento',
  })
  async createPuntoEmision(
    @Param('id', ParseIntPipe) establecimientoId: number,
    @Body() dto: CreatePuntoEmisionDto,
  ) {
    return this.prisma.puntosEmision.create({
      data: {
        establecimientoId,
        codigo: dto.codigo,
        descripcion: dto.descripcion,
        estado: 'ACTIVO',
      },
    });
  }

  @Get('puntos-emision/active')
  @RequiredPermission('payments', 'read')
  @ApiOperation({
    summary:
      'Listar puntos de emisión activos para selector de apertura de caja',
  })
  async getActivePuntosEmision() {
    const puntos = await this.prisma.puntosEmision.findMany({
      where: { estado: 'ACTIVO' },
      include: {
        establecimiento: {
          select: {
            id: true,
            codigo: true,
            direccion: true,
            emisor: {
              select: {
                razonSocial: true,
                nombreComercial: true,
              },
            },
          },
        },
      },
      orderBy: [{ establecimiento: { codigo: 'asc' } }, { codigo: 'asc' }],
    });

    return puntos.map((p) => ({
      id: p.id,
      codigo: p.codigo,
      descripcion: p.descripcion,
      establecimientoId: p.establecimientoId,
      establecimientoCodigo: p.establecimiento.codigo,
      establecimientoDireccion: p.establecimiento.direccion,
      label: `${p.establecimiento.codigo}-${p.codigo} · ${p.descripcion || 'Ventanilla'} (${p.establecimiento.direccion})`,
    }));
  }

  @Post(':id/certificado')
  @RequiredPermission('emisores', 'update')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir certificado digital .p12 / .pfx' })
  @ApiConsumes('multipart/form-data')
  async uploadCertificado(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadCertificadoDto,
  ) {
    return this.emisoresService.uploadCertificado(
      id,
      file.buffer,
      dto.password,
    );
  }

  @Delete(':id/certificado')
  @RequiredPermission('emisores', 'update')
  @ApiOperation({ summary: 'Eliminar certificado digital actual' })
  async deleteCertificado(@Param('id', ParseIntPipe) id: number) {
    return this.emisoresService.deleteCertificado(id);
  }
}
