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
import { MeterEntity } from '../domain/entities/meter.entity';
import { METER_STATUS_LIST } from 'src/infrastructure/config/app.constants';
import { PaginatedMeterResponse } from '../interfaces/types/paginated-meter-response.type';
import { ExportMeterDto } from '../interfaces/dto/export-meter.dto';
import { Readable } from 'node:stream';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

@Injectable()
export class MeterService {
  constructor(
    private readonly createUseCase: CreateMeterUseCase,
    private readonly findOneUseCase: FindOneMeterUseCase,
    private readonly findAllUseCase: FindAllMetersUseCase,
    private readonly updateUseCase: UpdateMeterUseCase,
    private readonly removeUseCase: RemoveMeterUseCase,
    private readonly exportMetersUseCase: ExportMetersUseCase,
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
    return Readable.from(
      rows.map((row) => `${row.map(csvEscape).join(',')}\r\n`),
    );
  }

  async exportPdf(filters?: ExportMeterDto): Promise<Uint8Array> {
    const meters = await this.exportMetersUseCase.execute(filters);
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
    let page = document.addPage();
    let y = page.getHeight() - 48;

    const addPageIfNeeded = (): void => {
      if (y < 48) {
        page = document.addPage();
        y = page.getHeight() - 48;
      }
    };

    page.drawText('JASRAPO - Inventario de medidores', {
      x: 40,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0.05, 0.2, 0.35),
    });
    y -= 28;
    const statusTotals = meters.reduce<Record<string, number>>(
      (totals, meter) => {
        totals[meter.estado] = (totals[meter.estado] ?? 0) + 1;
        return totals;
      },
      {},
    );
    const kpis = Object.entries(statusTotals)
      .map(([status, count]) => `${status}: ${count}`)
      .join(' | ');
    page.drawText(`Total: ${meters.length}${kpis ? ` | ${kpis}` : ''}`, {
      x: 40,
      y,
      size: 10,
      font,
    });
    y -= 24;
    const headers = [
      'Serie',
      'Marca',
      'Modelo',
      'Estado',
      'Contrato / Cliente',
    ];
    const columns = [40, 140, 240, 350, 445];
    headers.forEach((header, index) => {
      page.drawText(header, { x: columns[index], y, size: 9, font: boldFont });
    });
    y -= 16;

    for (const meter of meters) {
      addPageIfNeeded();
      const contract = meter.contratoId?.toString() ?? '-';
      const client = meter.clienteNombre ?? '-';
      const values = [
        meter.serie,
        meter.marca,
        meter.modelo,
        meter.estado,
        `${contract} / ${client}`,
      ];
      values.forEach((value, index) => {
        page.drawText(value.slice(0, index === 4 ? 35 : 15), {
          x: columns[index],
          y,
          size: 8,
          font,
        });
      });
      y -= 14;
    }

    return document.save();
  }
}

function csvEscape(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}
