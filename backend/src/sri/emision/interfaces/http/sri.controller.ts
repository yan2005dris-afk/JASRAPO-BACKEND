import {
  BadRequestException,
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiConsumes,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { SriService } from '../../application/services/sri.service';
import { EmisoresService } from '../../../emisores/application/emisores.service';
import { EmitirComprobanteManualUseCase } from '../../application/use-cases/emitir-comprobante-manual.use-case';
import type { EmissionOutcome } from '../../application/services/sri-emission-dispatcher.service';
import { CurrentUser } from '../../../../identity/auth/interfaces/http/decorators/current-user.decorator';
import type { JwtPayload } from '../../../../identity/auth/application/types/jwt.types';
import { UserRole } from '../../../../identity/auth/interfaces/dto/auth.dto';
import { RequiredPermission } from '../../../../infrastructure/common/decorators/require-permission.decorator';
import { ConfigService } from '@nestjs/config';
import { extractRucFromClaveAcceso } from '../../infrastructure/xml/clave-acceso.utils';
import { MAX_UPLOAD_SIZE_BYTES } from '../../../../infrastructure/config/app.constants';
import { CreateFacturaDto, FacturaResponseDto } from '../dto/factura.dto';
import {
  CreateNotaCreditoDto,
  NotaCreditoResponseDto,
} from '../dto/nota-credito.dto';
import {
  CreateNotaDebitoDto,
  NotaDebitoResponseDto,
} from '../dto/nota-debito.dto';
import { CreateRetencionDto, RetencionResponseDto } from '../dto/retencion.dto';
import { EmisionEncoladaResponseDto } from '../dto/emision-encolada.dto';
import {
  QueryComprobantesDto,
  PaginatedComprobantesDto,
  ComprobanteDetalladoDto,
} from '../dto/query-comprobantes.dto';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@ApiTags('[SRI] Facturación Electrónica')
@ApiBearerAuth('JWT')
@RequiredPermission('facturacion_electronica', 'read')
@Controller('sri')
export class SriController {
  constructor(
    private readonly sriService: SriService,
    private readonly emisoresService: EmisoresService,
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
    private readonly emitirComprobanteManual: EmitirComprobanteManualUseCase,
  ) {}

  /**
   * Extrae el RUC del emisor desde una clave de acceso (posiciones 10-23)
   * y valida que el emisor exista.
   */
  private async validateClaveAccesoAccess(claveAcceso: string): Promise<void> {
    const rucEmisor = extractRucFromClaveAcceso(claveAcceso);
    await this.emisoresService.validateRucAccess(rucEmisor);
  }

  @Post('emitir/factura')
  @RequiredPermission('facturacion_electronica', 'create')
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
  ): Promise<EmisionEncoladaResponseDto | FacturaResponseDto> {
    this.logger.log(`POST /sri/emitir/factura`);
    await this.emisoresService.validateRucAccess(dto.emisor.ruc);
    return this.sriService.emitirFactura(dto);
  }

  @Post('emitir/nota-credito')
  @RequiredPermission('facturacion_electronica', 'create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Emitir nota de crédito electrónica',
  })
  @ApiBody({ type: CreateNotaCreditoDto })
  async emitirNotaCredito(
    @Body() dto: CreateNotaCreditoDto,
  ): Promise<EmisionEncoladaResponseDto | NotaCreditoResponseDto> {
    this.logger.log(`POST /sri/emitir/nota-credito`);
    await this.emisoresService.validateRucAccess(dto.emisor.ruc);
    return this.sriService.emitirNotaCredito(dto);
  }

  @Post('emitir/nota-debito')
  @RequiredPermission('facturacion_electronica', 'create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Emitir nota de débito electrónica',
  })
  @ApiBody({ type: CreateNotaDebitoDto })
  async emitirNotaDebito(
    @Body() dto: CreateNotaDebitoDto,
  ): Promise<EmisionEncoladaResponseDto | NotaDebitoResponseDto> {
    this.logger.log(`POST /sri/emitir/nota-debito`);
    await this.emisoresService.validateRucAccess(dto.emisor.ruc);
    return this.sriService.emitirNotaDebito(dto);
  }

  @Post('emitir/retencion')
  @RequiredPermission('facturacion_electronica', 'create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Emitir comprobante de retención electrónico',
  })
  @ApiBody({ type: CreateRetencionDto })
  async emitirRetencion(
    @Body() dto: CreateRetencionDto,
  ): Promise<EmisionEncoladaResponseDto | RetencionResponseDto> {
    this.logger.log(`POST /sri/emitir/retencion`);
    await this.emisoresService.validateRucAccess(dto.emisor.ruc);
    return this.sriService.emitirRetencion(dto);
  }

  @Get('autorizar/:claveAcceso')
  @ApiOperation({
    summary: 'Consultar autorización',
  })
  async consultarAutorizacion(
    @Param('claveAcceso') claveAcceso: string,
  ): Promise<FacturaResponseDto> {
    this.logger.log(`GET /sri/autorizar/${claveAcceso}`);
    await this.validateClaveAccesoAccess(claveAcceso);
    return this.sriService.consultarAutorizacion(claveAcceso);
  }

  @Post('preview/factura')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Vista previa de factura XML',
  })
  async previewFactura(
    @Body() dto: CreateFacturaDto,
  ): Promise<{ xml: string }> {
    this.logger.log('POST /sri/preview/factura');
    await this.emisoresService.validateRucAccess(dto.emisor.ruc);
    const xml = this.sriService.generarXmlPreview(dto);
    return { xml };
  }

  @Post('validar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validar XML firmado (Upload Archivo)',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_UPLOAD_SIZE_BYTES },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/^(application|text)\/xml$|^text\/plain$/i)) {
          return callback(
            new BadRequestException('Solo se permiten archivos XML'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
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
  @ApiOperation({
    summary: 'Listar comprobantes',
  })
  async listarComprobantes(
    @Query() query: QueryComprobantesDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<PaginatedComprobantesDto> {
    if (user.rol !== UserRole.SUPERADMIN && query.rucEmisor) {
      await this.emisoresService.validateRucAccess(query.rucEmisor);
    }
    return this.sriService.listarComprobantes(query);
  }

  @Get('comprobantes/:claveAcceso')
  @ApiOperation({
    summary: 'Obtener comprobante por clave de acceso',
  })
  async obtenerComprobante(
    @Param('claveAcceso') claveAcceso: string,
  ): Promise<ComprobanteDetalladoDto> {
    await this.validateClaveAccesoAccess(claveAcceso);
    const result = await this.sriService.obtenerComprobante(claveAcceso);
    if (!result)
      throw new NotFoundException(`Comprobante ${claveAcceso} no encontrado`);
    return result;
  }

  @Get('comprobantes/:claveAcceso/xml')
  @ApiOperation({
    summary: 'Descargar XML autorizado',
  })
  async descargarXml(
    @Param('claveAcceso') claveAcceso: string,
    @Res() res: Response,
  ): Promise<void> {
    await this.validateClaveAccesoAccess(claveAcceso);
    const xml = await this.sriService.obtenerXmlAutorizado(claveAcceso);
    if (!xml)
      throw new NotFoundException(`XML para ${claveAcceso} no disponible`);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${claveAcceso}.xml"`,
    );
    res.send(xml);
  }

  @Patch('comprobantes/:claveAcceso/anular')
  @RequiredPermission('facturacion_electronica', 'delete')
  @ApiOperation({
    summary: 'Anular comprobante',
  })
  async anularComprobante(
    @Param('claveAcceso') claveAcceso: string,
  ): Promise<{ message: string; claveAcceso: string; estadoAnterior: string }> {
    await this.validateClaveAccesoAccess(claveAcceso);
    return this.sriService.anularComprobante(claveAcceso);
  }

  @Post('comprobantes/:claveAcceso/reintentar')
  @RequiredPermission('facturacion_electronica', 'update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reintentar comprobante fallido',
  })
  async reintentarComprobante(
    @Param('claveAcceso') claveAcceso: string,
  ): Promise<{
    claveAcceso: string;
    estado: string;
    fechaAutorizacion?: string;
    mensaje: string;
    errores?: string[];
  }> {
    await this.validateClaveAccesoAccess(claveAcceso);
    return this.sriService.reintentarComprobante(claveAcceso);
  }

  /**
   * Operator-triggered emission for comprobantes parked in `POR_EMITIR` when
   * `sri.emision.modo = 'manual'`. Also accepts comprobantes in `BORRADOR` so
   * an admin can force-emit before the dispatcher picks them up.
   *
   * Guarded by `@RequiredPermission('sri', 'admin')` at the class level.
   *
   * Outcomes:
   *   - `EMITTED` → 200 with the outcome
   *   - `INVALID_STATE` → 409 (use case raises ConflictException)
   *   - `NOT_FOUND` → 404 (use case raises NotFoundException)
   *
   * @see sdd/sri-emision-modo-manual-automatico for context.
   */
  @Post('comprobantes/:claveAcceso/emitir-manual')
  @RequiredPermission('facturacion_electronica', 'update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Emitir manualmente un comprobante (modo manual)',
    description:
      'Dispara la emisión de un comprobante previamente parqueado (POR_EMITIR) o en BORRADOR, cuando el modo de emisión SRI es `manual`. Registra la acción en `auditoria`.',
  })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la emisión (EMITTED, QUEUED_FOR_MANUAL, etc.)',
  })
  @ApiResponse({ status: 404, description: 'Comprobante no encontrado' })
  @ApiResponse({
    status: 409,
    description: 'Comprobante en estado no elegible para emisión manual',
  })
  async emitirManual(
    @Param('claveAcceso') claveAcceso: string,
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ): Promise<EmissionOutcome> {
    this.logger.log(
      `POST /sri/comprobantes/${claveAcceso}/emitir-manual (usuario=${user.sub})`,
    );
    await this.validateClaveAccesoAccess(claveAcceso);
    return this.emitirComprobanteManual.execute(claveAcceso, {
      id: Number(user.sub),
      email: user.email,
      ip: req.ip ?? req.socket?.remoteAddress,
      userAgent: req.headers['user-agent'],
    });
  }

  @Get('verificar/:claveAcceso')
  @ApiOperation({
    summary: 'Verificar estado en SRI',
  })
  async verificarEnSri(
    @Param('claveAcceso') claveAcceso: string,
  ): Promise<any> {
    await this.validateClaveAccesoAccess(claveAcceso);
    return this.sriService.verificarEnSri(claveAcceso);
  }

  @Post('sincronizar')
  @RequiredPermission('facturacion_electronica', 'update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sincronizar comprobantes con SRI',
  })
  async sincronizar(
    @Body() body: any,
    @CurrentUser() user: JwtPayload,
  ): Promise<any> {
    if (user.rol !== UserRole.SUPERADMIN) {
      if (!body.rucEmisor)
        throw new NotFoundException('Debe especificar rucEmisor');
      await this.emisoresService.validateRucAccess(body.rucEmisor);
    }
    return this.sriService.sincronizarConSri(body);
  }
}
