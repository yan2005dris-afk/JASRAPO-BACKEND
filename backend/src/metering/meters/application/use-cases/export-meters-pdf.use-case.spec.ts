import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GeneratePdfUseCase } from 'src/infrastructure/pdf/use-cases/generate-pdf.use-case';
import { ExportMetersPdfUseCase } from './export-meters-pdf.use-case';
import { ExportMetersUseCase } from './export-meters.use-case';

describe('ExportMetersPdfUseCase', () => {
  let useCase: ExportMetersPdfUseCase;
  let exportMeters: { execute: jest.Mock };
  let generatePdf: { execute: jest.Mock };

  const mockMeter = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    marca: 'Itron',
    modelo: 'CX1000',
    estado: 'BODEGA',
  };

  beforeEach(async () => {
    exportMeters = { execute: jest.fn().mockResolvedValue([mockMeter]) };
    generatePdf = {
      execute: jest.fn().mockResolvedValue(Buffer.from('%PDF-1.4')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportMetersPdfUseCase,
        { provide: ExportMetersUseCase, useValue: exportMeters },
        { provide: GeneratePdfUseCase, useValue: generatePdf },
      ],
    }).compile();

    useCase = module.get<ExportMetersPdfUseCase>(ExportMetersPdfUseCase);
  });

  it('should render the inventory template with the meters and the active filters', async () => {
    const filters = { estado: 'BODEGA', search: 'MED' } as any;

    const pdf = await useCase.execute(filters);

    expect(exportMeters.execute).toHaveBeenCalledWith(filters);
    expect(generatePdf.execute).toHaveBeenCalledWith('meters-inventory', {
      medidores: [mockMeter],
      filtros: filters,
    });
    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
  });

  it('should send empty filters when the export is not filtered', async () => {
    await useCase.execute();

    expect(exportMeters.execute).toHaveBeenCalledWith(undefined);
    expect(generatePdf.execute).toHaveBeenCalledWith('meters-inventory', {
      medidores: [mockMeter],
      filtros: {},
    });
  });
});
