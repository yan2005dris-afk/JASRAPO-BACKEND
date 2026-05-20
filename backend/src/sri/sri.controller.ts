import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SriService } from './sri.service';
import { EmisoresService } from './integration/emisores/emisores.service';
import { CurrentUser } from '../identity/auth/decorators/current-user.decorator';
import { JwtPayload, UserRole } from '../identity/auth/dto/auth.dto';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';
import { extractRucFromClaveAcceso } from './utils/clave-acceso.utils';
import {
  CreateFacturaDto,
  FacturaResponseDto,
  CreateNotaCreditoDto,
  NotaCreditoResponseDto,
  CreateNotaDebitoDto,
  NotaDebitoResponseDto,
  CreateRetencionDto,
  RetencionResponseDto,
  CreateGuiaRemisionDto,
  GuiaRemisionResponseDto,
  EmisionEncoladaResponseDto,
} from './issuance/dto';
import {
  QueryComprobantesDto,
  PaginatedComprobantesDto,
  ComprobanteDetalladoDto,
} from './issuance/dto/query-comprobantes.dto';

@ApiTags('SRI - Facturación Electrónica')
@ApiBearerAuth('JWT')
@Controller('sri')
export class SriController {
  private readonly logger = new Logger(SriController.name);

  constructor(
    private readonly sriService: SriService,
    private readonly emisoresService: EmisoresService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Extrae el RUC del emisor desde una clave de acceso (posiciones 10-23)
   * y valida que el usuario actual tenga acceso a ese emisor.
   */
  private async validateClaveAccesoAccess(
    claveAcceso: string,
    user: JwtPayload,
  ): Promise<void> {
    const rucEmisor = extractRucFromClaveAcceso(claveAcceso);
    await this.emisoresService.validateRucAccess(rucEmisor, user);
  }

  @Post('emitir/factura')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({
    summary: 'Emitir factura electrónica',
    description: 'Genera, firma y envía factura al SRI',
  })
  @ApiBody({ type: CreateFacturaDto })
  @ApiResponse({
    status: 201,
    description: 'Factura encolada para procesamiento asíncrono',
    type: EmisionEncoladaResponseDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Factura procesada sincronamente',
    type: FacturaResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async emitirFactura(
    @Body() dto: CreateFacturaDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<EmisionEncoladaResponseDto | FacturaResponseDto> {
    this.logger.log(`POST /sri/emitir/factura`);
    await this.emisoresService.validateRucAccess(dto.emisor.ruc, user);
    return this.sriService.emitirFactura(dto);
  }

  @Post('emitir/nota-credito')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Emitir nota de crédito electrónica',
  })
  @ApiBody({ type: CreateNotaCreditoDto })
  async emitirNotaCredito(
    @Body() dto: CreateNotaCreditoDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<EmisionEncoladaResponseDto | NotaCreditoResponseDto> {
    this.logger.log(`POST /sri/emitir/nota-credito`);
    await this.emisoresService.validateRucAccess(dto.emisor.ruc, user);
    return this.sriService.emitirNotaCredito(dto);
  }

  @Post('emitir/nota-debito')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Emitir nota de débito electrónica',
  })
  @ApiBody({ type: CreateNotaDebitoDto })
  async emitirNotaDebito(
    @Body() dto: CreateNotaDebitoDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<EmisionEncoladaResponseDto | NotaDebitoResponseDto> {
    this.logger.log(`POST /sri/emitir/nota-debito`);
    await this.emisoresService.validateRucAccess(dto.emisor.ruc, user);
    return this.sriService.emitirNotaDebito(dto);
  }

  @Post('emitir/retencion')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Emitir comprobante de retención electrónico',
  })
  @ApiBody({ type: CreateRetencionDto })
  async emitirRetencion(
    @Body() dto: CreateRetencionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<EmisionEncoladaResponseDto | RetencionResponseDto> {
    this.logger.log(`POST /sri/emitir/retencion`);
    await this.emisoresService.validateRucAccess(dto.emisor.ruc, user);
    return this.sriService.emitirRetencion(dto);
  }

  @Post('emitir/guia-remision')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Emitir guía de remisión electrónica',
  })
  @ApiBody({ type: CreateGuiaRemisionDto })
  async emitirGuiaRemision(
    @Body() dto: CreateGuiaRemisionDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<EmisionEncoladaResponseDto | GuiaRemisionResponseDto> {
    this.logger.log(`POST /sri/emitir/guia-remision`);
    await this.emisoresService.validateRucAccess(dto.emisor.ruc, user);
    return this.sriService.emitirGuiaRemision(dto);
  }

  @Get('autorizar/:claveAcceso')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Consultar autorización',
  })
  async consultarAutorizacion(
    @Param('claveAcceso') claveAcceso: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<FacturaResponseDto> {
    this.logger.log(`GET /sri/autorizar/${claveAcceso}`);
    await this.validateClaveAccesoAccess(claveAcceso, user);
    return this.sriService.consultarAutorizacion(claveAcceso);
  }

  @Post('preview/factura')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vista previa de factura XML',
  })
  async previewFactura(
    @Body() dto: CreateFacturaDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ xml: string }> {
    this.logger.log('POST /sri/preview/factura');
    await this.emisoresService.validateRucAccess(dto.emisor.ruc, user);
    const xml = this.sriService.generarXmlPreview(dto);
    return { xml };
  }

  @Post('validar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar XML firmado (Upload Archivo)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async validarXml(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ valido: boolean; errores: string[] }> {
    if (!file) {
      return {
        valido: false,
        errores: ['No se ha adjuntado ningún archivo XML.'],
      };
    }
    const xml = file.buffer.toString('utf-8');
    return this.sriService.validarXml(xml);
  }

  @Get('comprobantes')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Listar comprobantes',
  })
  async listarComprobantes(
    @Query() query: QueryComprobantesDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedComprobantesDto> {
    if (user.rol !== UserRole.SUPERADMIN) {
      if (query.rucEmisor) {
        await this.emisoresService.validateRucAccess(query.rucEmisor, user);
      } else if (user.tenantId) {
        const emisores = await this.emisoresService.findByTenantId(user.tenantId);
        if (!emisores || emisores.length === 0) {
          return { data: [], meta: { total: 0, page: 1, limit: query.limit || 20, totalPages: 0 } };
        }
        return this.sriService.listarComprobantes({ ...query, emisorIds: emisores.map((e) => e.id) });
      }
    }
    return this.sriService.listarComprobantes(query);
  }

  @Get('comprobantes/:claveAcceso')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Obtener comprobante por clave de acceso',
  })
  async obtenerComprobante(
    @Param('claveAcceso') claveAcceso: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<ComprobanteDetalladoDto> {
    await this.validateClaveAccesoAccess(claveAcceso, user);
    const result = await this.sriService.obtenerComprobante(claveAcceso);
    if (!result) throw new NotFoundException(`Comprobante ${claveAcceso} no encontrado`);
    return result;
  }

  @Get('comprobantes/:claveAcceso/xml')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Descargar XML autorizado',
  })
  async descargarXml(
    @Param('claveAcceso') claveAcceso: string,
    @Res() res: Response,
    @CurrentUser() user: JwtPayload,
  ): Promise<void> {
    await this.validateClaveAccesoAccess(claveAcceso, user);
    const xml = await this.sriService.obtenerXmlAutorizado(claveAcceso);
    if (!xml) throw new NotFoundException(`XML para ${claveAcceso} no disponible`);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename="${claveAcceso}.xml"`);
    res.send(xml);
  }

  @Patch('comprobantes/:claveAcceso/anular')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Anular comprobante',
  })
  async anularComprobante(
    @Param('claveAcceso') claveAcceso: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string; claveAcceso: string; estadoAnterior: string }> {
    await this.validateClaveAccesoAccess(claveAcceso, user);
    return this.sriService.anularComprobante(claveAcceso);
  }

  @Post('comprobantes/:claveAcceso/reintentar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reintentar comprobante fallido',
  })
  async reintentarComprobante(
    @Param('claveAcceso') claveAcceso: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{
    claveAcceso: string;
    estado: string;
    fechaAutorizacion?: string;
    mensaje: string;
    errores?: string[];
  }> {
    await this.validateClaveAccesoAccess(claveAcceso, user);
    return this.sriService.reintentarComprobante(claveAcceso);
  }

  @Get('verificar/:claveAcceso')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verificar estado en SRI',
  })
  async verificarEnSri(
    @Param('claveAcceso') claveAcceso: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<any> {
    await this.validateClaveAccesoAccess(claveAcceso, user);
    return this.sriService.verificarEnSri(claveAcceso);
  }

  @Post('sincronizar')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincronizar comprobantes con SRI',
  })
  async sincronizar(
    @Body() body: any,
    @CurrentUser() user: JwtPayload,
  ): Promise<any> {
    if (user.rol !== UserRole.SUPERADMIN) {
      if (!body.rucEmisor) throw new ForbiddenException('Debe especificar rucEmisor');
      await this.emisoresService.validateRucAccess(body.rucEmisor, user);
    }
    return this.sriService.sincronizarConSri(body);
  }
}
