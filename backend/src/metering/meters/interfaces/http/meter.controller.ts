import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
  Header,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { Public } from 'src/infrastructure/common/decorators/public.decorator';
import { MeterService } from '../../application/meter.service';
import { CreateMeterDto } from '../dto/create-meter.dto';
import { UpdateMeterDto } from '../dto/update-meter.dto';
import { MeterResponseDto } from '../dto/meter-response.dto';
import { FilterMeterDto } from '../dto/filter-meter.dto';
import { PaginatedMeterResponse } from '../types/paginated-meter-response.type';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { ExportMeterDto } from '../dto/export-meter.dto';

@ApiTags('meters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('meters')
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

  /**
   * Obtener catálogo de estados de medidor
   */
  @ApiOperation({
    summary: 'Catálogo de estados de medidor',
    description: 'Retorna lista de estados disponibles para medidores',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados',
    type: [EnumStateDto],
  })
  @RequiredPermission('meters', 'read')
  @Get('status')
  findAllStates(): Promise<EnumStateDto[]> {
    return this.meterService.findAllStates();
  }

  /**
   * Crear un nuevo medidor
   * POST /meters
   */
  @ApiOperation({
    summary: 'Crear medidor',
    description: 'Registra un nuevo medidor en el sistema',
  })
  @ApiBody({ type: CreateMeterDto, description: 'Datos del medidor a crear' })
  @ApiResponse({
    status: 201,
    description: 'Medidor creado exitosamente',
    type: MeterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso: meters:create' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un medidor registrado con ese número de serie',
  })
  @RequiredPermission('meters', 'create')
  @Post()
  async create(@Body() createDto: CreateMeterDto): Promise<MeterResponseDto> {
    const meter = await this.meterService.create(createDto);
    return MeterResponseDto.fromEntity(meter);
  }

  /**
   * Listar todos los medidores
   * GET /meters
   */
  @ApiOperation({
    summary: 'Listar medidores',
    description: 'Retorna lista paginada de medidores con KPIs',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de medidores con KPIs',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('meters', 'read')
  @Get()
  async findAll(
    @Query() filterDto: FilterMeterDto,
  ): Promise<PaginatedMeterResponse> {
    return this.meterService.findAll(filterDto);
  }

  @ApiOperation({ summary: 'Exportar inventario de medidores a CSV' })
  @RequiredPermission('meters', 'read')
  @Get('export/csv')
  async exportCsv(
    @Query() filters: ExportMeterDto,
    @Res() response: Response,
  ): Promise<void> {
    const stream = await this.meterService.exportCsv(filters);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="inventario-medidores.csv"',
    );
    stream.pipe(response);
  }

  @ApiOperation({ summary: 'Exportar inventario de medidores a PDF' })
  @RequiredPermission('meters', 'read')
  @Get('export/pdf')
  async exportPdf(
    @Query() filters: ExportMeterDto,
    @Res() response: Response,
  ): Promise<void> {
    const pdf = await this.meterService.exportPdf(filters);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      'attachment; filename="inventario-medidores.pdf"',
    );
    response.send(Buffer.from(pdf));
  }

  @Public()
  @ApiOperation({ summary: 'Generar PDF temporal de prueba con pdf-lib' })
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="reporte_medidores.pdf"')
  @Get('export/test-pdf')
  async exportTestPdf(
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile> {
    response.status(200);

    const document = await PDFDocument.create();
    const page = document.addPage([595.28, 841.89]);
    const regularFont = await document.embedFont(StandardFonts.Helvetica);
    const boldFont = await document.embedFont(StandardFonts.HelveticaBold);

    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const margin = 42;
    const contentWidth = pageWidth - margin * 2;
    const navy = rgb(0.04, 0.16, 0.29);
    const teal = rgb(0.05, 0.55, 0.56);
    const softBlue = rgb(0.92, 0.96, 0.99);
    const lightLine = rgb(0.78, 0.83, 0.88);
    const mutedText = rgb(0.35, 0.39, 0.43);
    const successGreen = rgb(0.12, 0.55, 0.32);

    page.drawRectangle({
      x: 0,
      y: pageHeight - 132,
      width: pageWidth,
      height: 132,
      color: navy,
    });
    page.drawRectangle({
      x: 0,
      y: pageHeight - 132,
      width: pageWidth,
      height: 8,
      color: teal,
    });

    page.drawText('JASRAPO', {
      x: margin,
      y: pageHeight - 58,
      size: 23,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    page.drawText('Reporte de Medidores', {
      x: margin,
      y: pageHeight - 87,
      size: 16,
      font: regularFont,
      color: rgb(0.84, 0.9, 0.96),
    });

    page.drawText('Generado con pdf-lib para comparativa tecnica', {
      x: margin,
      y: pageHeight - 108,
      size: 9,
      font: regularFont,
      color: rgb(0.73, 0.8, 0.87),
    });

    page.drawText('Documento temporal', {
      x: pageWidth - margin - 112,
      y: pageHeight - 55,
      size: 9,
      font: boldFont,
      color: rgb(0.84, 0.9, 0.96),
    });
    page.drawText(new Date().toLocaleDateString('es-EC'), {
      x: pageWidth - margin - 112,
      y: pageHeight - 73,
      size: 9,
      font: regularFont,
      color: rgb(0.73, 0.8, 0.87),
    });

    const cardTop = 626;
    const cardWidth = (contentWidth - 24) / 3;
    const summaryCards: Array<[string, string, string]> = [
      ['Total medidores', '128', 'Inventario activo'],
      ['Instalados', '116', '90.6% operativo'],
      ['En revision', '12', 'Seguimiento tecnico'],
    ];

    summaryCards.forEach(([label, value, detail], index) => {
      const x = margin + index * (cardWidth + 12);
      page.drawRectangle({
        x,
        y: cardTop,
        width: cardWidth,
        height: 82,
        color: softBlue,
        borderColor: rgb(0.84, 0.89, 0.94),
        borderWidth: 1,
      });
      page.drawText(label, {
        x: x + 14,
        y: cardTop + 54,
        size: 8.5,
        font: regularFont,
        color: mutedText,
      });
      page.drawText(value, {
        x: x + 14,
        y: cardTop + 27,
        size: 22,
        font: boldFont,
        color: index === 1 ? successGreen : navy,
      });
      page.drawText(detail, {
        x: x + 14,
        y: cardTop + 12,
        size: 8,
        font: regularFont,
        color: mutedText,
      });
    });

    page.drawText('Detalle del reporte', {
      x: margin,
      y: 576,
      size: 13,
      font: boldFont,
      color: navy,
    });

    page.drawText(
      'Muestra estatica para evaluar calidad visual usando pdf-lib.',
      {
        x: margin,
        y: 558,
        size: 9,
        font: regularFont,
        color: mutedText,
      },
    );

    const tableTop = 524;
    const rowHeight = 38;
    const tableRows: Array<[string, string, string, string, string]> = [
      ['JRP-0001', 'JASRAPO Metering', 'INSTALADO', 'Centro', '1250 m3'],
      ['JRP-0002', 'AquaTech', 'INSTALADO', 'Norte', '980 m3'],
      ['JRP-0003', 'HydroSense', 'REVISION', 'Sur', '742 m3'],
    ];
    const columns: Array<[string, number, number]> = [
      ['Serie', margin + 14, 82],
      ['Marca', margin + 104, 132],
      ['Estado', margin + 250, 90],
      ['Sector', margin + 352, 72],
      ['Lectura', margin + 436, 70],
    ];
    const tableHeight = rowHeight * (tableRows.length + 1);

    page.drawRectangle({
      x: margin,
      y: tableTop - tableHeight,
      width: contentWidth,
      height: tableHeight,
      borderColor: lightLine,
      borderWidth: 1,
    });
    page.drawRectangle({
      x: margin,
      y: tableTop - rowHeight,
      width: contentWidth,
      height: rowHeight,
      color: navy,
    });

    columns.forEach(([header, x]) => {
      page.drawText(header, {
        x,
        y: tableTop - 24,
        size: 9,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
    });

    tableRows.forEach((row, rowIndex) => {
      const rowTop = tableTop - rowHeight * (rowIndex + 2);
      if (rowIndex % 2 === 0) {
        page.drawRectangle({
          x: margin,
          y: rowTop,
          width: contentWidth,
          height: rowHeight,
          color: rgb(0.98, 0.99, 1),
        });
      }

      row.forEach((value, columnIndex) => {
        const [, x] = columns[columnIndex];
        const isStatus = columnIndex === 2;
        if (isStatus) {
          page.drawRectangle({
            x,
            y: rowTop + 10,
            width: 70,
            height: 17,
            color:
              value === 'INSTALADO'
                ? rgb(0.88, 0.96, 0.91)
                : rgb(1, 0.94, 0.84),
          });
        }
        page.drawText(value, {
          x: isStatus ? x + 7 : x,
          y: rowTop + 14,
          size: 8.8,
          font: isStatus ? boldFont : regularFont,
          color:
            value === 'INSTALADO'
              ? successGreen
              : value === 'REVISION'
                ? rgb(0.62, 0.35, 0.04)
                : rgb(0.13, 0.16, 0.2),
        });
      });
    });

    for (let index = 0; index <= tableRows.length + 1; index += 1) {
      const y = tableTop - rowHeight * index;
      page.drawLine({
        start: { x: margin, y },
        end: { x: margin + contentWidth, y },
        thickness: 1,
        color: lightLine,
      });
    }

    columns.slice(1).forEach(([, x]) => {
      page.drawLine({
        start: { x: x - 12, y: tableTop },
        end: { x: x - 12, y: tableTop - tableHeight },
        thickness: 0.7,
        color: lightLine,
      });
    });

    page.drawLine({
      start: { x: margin, y: 82 },
      end: { x: margin + contentWidth, y: 82 },
      thickness: 1,
      color: lightLine,
    });
    page.drawText('JASRAPO Backend | Demo pdf-lib', {
      x: margin,
      y: 58,
      size: 8,
      font: regularFont,
      color: mutedText,
    });
    page.drawText('Pagina 1 de 1', {
      x: pageWidth - margin - 58,
      y: 58,
      size: 8,
      font: regularFont,
      color: mutedText,
    });

    const pdfBytes = await document.save();
    const buffer = Buffer.from(pdfBytes);

    return new StreamableFile(buffer);
  }

  /**
   * Obtener un medidor por ID
   * GET /meters/:id
   */
  @ApiOperation({
    summary: 'Obtener medidor por ID',
    description: 'Retorna los datos de un medidor específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del medidor',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Medidor encontrado',
    type: MeterResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<MeterResponseDto> {
    const meter = await this.meterService.findOne(id);
    return MeterResponseDto.fromEntity(meter);
  }

  /**
   * Actualizar un medidor
   * PATCH /meters/:id
   */
  @ApiOperation({
    summary: 'Actualizar medidor',
    description: 'Actualiza los datos de un medidor',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del medidor',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateMeterDto, description: 'Datos a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Medidor actualizado',
    type: MeterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso: meters:update' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateDto: UpdateMeterDto,
  ): Promise<MeterResponseDto> {
    const meter = await this.meterService.update(id, updateDto);
    return MeterResponseDto.fromEntity(meter);
  }

  /**
   * Eliminar un medidor (soft delete)
   * DELETE /meters/:id
   */
  @ApiOperation({
    summary: 'Eliminar medidor',
    description: 'Marca un medidor como eliminado (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del medidor',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Medidor eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso: meters:delete' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'delete')
  @Delete(':id')
  async delete(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<{ message: string }> {
    return this.meterService.remove(id);
  }
}
