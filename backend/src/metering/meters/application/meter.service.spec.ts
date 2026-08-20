import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MeterService } from './meter.service';
import { CreateMeterUseCase } from './use-cases/create-meter.use-case';
import { FindOneMeterUseCase } from './use-cases/find-one-meter.use-case';
import { FindAllMetersUseCase } from './use-cases/find-all-meters.use-case';
import { UpdateMeterUseCase } from './use-cases/update-meter.use-case';
import { RemoveMeterUseCase } from './use-cases/remove-meter.use-case';
import { ExportMetersUseCase } from './use-cases/export-meters.use-case';
import { ExportMetersPdfUseCase } from './use-cases/export-meters-pdf.use-case';

describe('MeterService', () => {
  let service: MeterService;
  let createUseCase: CreateMeterUseCase;
  let findOneUseCase: FindOneMeterUseCase;
  let findAllUseCase: FindAllMetersUseCase;
  let updateUseCase: UpdateMeterUseCase;
  let removeUseCase: RemoveMeterUseCase;
  let exportMetersUseCase: ExportMetersUseCase;
  let exportMetersPdfUseCase: ExportMetersPdfUseCase;

  const mockMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    modelo: 'CX1000',
    marca: 'Itron',
    estado: 'BODEGA',
    fechaInstalacion: null,
    fechaBaja: null,
    motivo: null,
    latitud: null,
    longitud: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPaginatedResponse = {
    data: [mockMedidor],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      ultimaPagina: 1,
      paginaActual: 1,
      porPagina: 10,
      anterior: null,
      siguiente: null,
    },
    kpis: { enBodega: 1, instalados: 0, danados: 0, total: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeterService,
        { provide: CreateMeterUseCase, useValue: { execute: jest.fn() } },
        { provide: FindOneMeterUseCase, useValue: { execute: jest.fn() } },
        { provide: FindAllMetersUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateMeterUseCase, useValue: { execute: jest.fn() } },
        { provide: RemoveMeterUseCase, useValue: { execute: jest.fn() } },
        { provide: ExportMetersUseCase, useValue: { execute: jest.fn() } },
        { provide: ExportMetersPdfUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<MeterService>(MeterService);
    createUseCase = module.get<CreateMeterUseCase>(CreateMeterUseCase);
    findOneUseCase = module.get<FindOneMeterUseCase>(FindOneMeterUseCase);
    findAllUseCase = module.get<FindAllMetersUseCase>(FindAllMetersUseCase);
    updateUseCase = module.get<UpdateMeterUseCase>(UpdateMeterUseCase);
    removeUseCase = module.get<RemoveMeterUseCase>(RemoveMeterUseCase);
    exportMetersUseCase = module.get<ExportMetersUseCase>(ExportMetersUseCase);
    exportMetersPdfUseCase = module.get<ExportMetersPdfUseCase>(
      ExportMetersPdfUseCase,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should delegate to CreateMeterUseCase', async () => {
    const dto = { serie: 'MED-001' } as any;
    jest.spyOn(createUseCase, 'execute').mockResolvedValue(mockMedidor);
    const result = await service.create(dto);
    expect(result).toBe(mockMedidor);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('findAll should delegate to FindAllMetersUseCase', async () => {
    const filters = { page: 1, limit: 10 } as any;
    jest
      .spyOn(findAllUseCase, 'execute')
      .mockResolvedValue(mockPaginatedResponse as any);
    const result = await service.findAll(filters);
    expect(result).toBe(mockPaginatedResponse);
    expect(findAllUseCase.execute).toHaveBeenCalledWith(filters);
  });

  it('findAll should delegate even without filters', async () => {
    jest
      .spyOn(findAllUseCase, 'execute')
      .mockResolvedValue(mockPaginatedResponse as any);
    const result = await service.findAll();
    expect(result).toBe(mockPaginatedResponse);
    expect(findAllUseCase.execute).toHaveBeenCalledWith(undefined);
  });

  it('findOne should delegate to FindOneMeterUseCase', async () => {
    const id = BigInt(1);
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockMedidor);
    const result = await service.findOne(id);
    expect(result).toBe(mockMedidor);
    expect(findOneUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('update should delegate to UpdateMeterUseCase', async () => {
    const id = BigInt(1);
    const dto = { estado: 'INSTALADO' } as any;
    jest.spyOn(updateUseCase, 'execute').mockResolvedValue(mockMedidor);
    const result = await service.update(id, dto);
    expect(result).toBe(mockMedidor);
    expect(updateUseCase.execute).toHaveBeenCalledWith(id, dto);
  });

  it('remove should delegate to RemoveMeterUseCase', async () => {
    const id = BigInt(1);
    const message = { message: `Medidor con ID ${id} eliminado` };
    jest.spyOn(removeUseCase, 'execute').mockResolvedValue(message);
    const result = await service.remove(id);
    expect(result).toBe(message);
    expect(removeUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('exportCsv should apply filters and include inventory columns', async () => {
    jest
      .spyOn(exportMetersUseCase, 'execute')
      .mockResolvedValue([mockMedidor] as any);

    const stream = await service.exportCsv({ search: 'MED-001' });
    const chunks: string[] = [];
    for await (const chunk of stream) chunks.push(String(chunk));

    expect(exportMetersUseCase.execute).toHaveBeenCalledWith({
      search: 'MED-001',
    });
    expect(chunks.join('')).toContain(
      'Serie,Marca,Modelo,Estado,Contrato,Cliente',
    );
    expect(chunks.join('')).toContain('MED-001,Itron,CX1000,BODEGA');
  });

  it('exportCsv should prepend a UTF-8 BOM so Excel keeps the accents', async () => {
    jest.spyOn(exportMetersUseCase, 'execute').mockResolvedValue([]);

    const stream = await service.exportCsv();
    const chunks: string[] = [];
    for await (const chunk of stream) chunks.push(String(chunk));

    expect(chunks.join('').startsWith('\uFEFF')).toBe(true);
  });

  it('exportPdf should delegate to ExportMetersPdfUseCase with the active filters', async () => {
    const buffer = Buffer.from('%PDF-1.4');
    jest.spyOn(exportMetersPdfUseCase, 'execute').mockResolvedValue(buffer);

    const result = await service.exportPdf({ estado: 'BODEGA' } as any);

    expect(exportMetersPdfUseCase.execute).toHaveBeenCalledWith({
      estado: 'BODEGA',
    });
    expect(result).toBe(buffer);
  });
});
