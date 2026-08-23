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
import { ReplaceMeterUseCase } from './use-cases/replace-meter.use-case';
import { FindMeterHistoryUseCase } from './use-cases/find-meter-history.use-case';
import { FindReplacementUseCase } from './use-cases/find-replacement.use-case';

describe('MeterService', () => {
  let service: MeterService;
  let createUseCase: CreateMeterUseCase;
  let findOneUseCase: FindOneMeterUseCase;
  let findAllUseCase: FindAllMetersUseCase;
  let updateUseCase: UpdateMeterUseCase;
  let removeUseCase: RemoveMeterUseCase;
  let exportMetersUseCase: ExportMetersUseCase;
  let exportMetersPdfUseCase: ExportMetersPdfUseCase;
  let replaceUseCase: ReplaceMeterUseCase;
  let findMeterHistoryUseCase: FindMeterHistoryUseCase;
  let findReplacementUseCase: FindReplacementUseCase;

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
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPaginatedResponse = {
    datos: [mockMedidor],
    paginacion: {
      total: 1,
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
        { provide: ReplaceMeterUseCase, useValue: { execute: jest.fn() } },
        { provide: FindMeterHistoryUseCase, useValue: { execute: jest.fn() } },
        { provide: FindReplacementUseCase, useValue: { execute: jest.fn() } },
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
    replaceUseCase = module.get<ReplaceMeterUseCase>(ReplaceMeterUseCase);
    findMeterHistoryUseCase = module.get<FindMeterHistoryUseCase>(
      FindMeterHistoryUseCase,
    );
    findReplacementUseCase = module.get<FindReplacementUseCase>(
      FindReplacementUseCase,
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

  it('getHistory should delegate to FindMeterHistoryUseCase', async () => {
    const id = BigInt(1);
    const history = [{ historialId: BigInt(10) }] as any;
    jest.spyOn(findMeterHistoryUseCase, 'execute').mockResolvedValue(history);
    const result = await service.getHistory(id);
    expect(result).toBe(history);
    expect(findMeterHistoryUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('findReplacement should delegate to FindReplacementUseCase', async () => {
    const id = BigInt(5);
    const reemplazo = { reemplazoId: BigInt(5) } as any;
    jest.spyOn(findReplacementUseCase, 'execute').mockResolvedValue(reemplazo);
    const result = await service.findReplacement(id);
    expect(result).toBe(reemplazo);
    expect(findReplacementUseCase.execute).toHaveBeenCalledWith(id);
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

  it('replaceMeter should delegate to ReplaceMeterUseCase', async () => {
    const dto = {
      claveIdempotencia: '123e4567-e89b-42d3-a456-426614174000',
      contratoId: '1',
      nuevoMedidorId: '2',
      lecturaFinalSaliente: 530,
      motivo: 'DANO' as any,
      tratamientoSaliente: 'COBRO_REAL' as any,
      tratamientoEntrante: 'FACTURAR_PERIODO_ACTUAL' as any,
      periodoOrigenId: 1,
      mesOrigen: 8,
      mesDestino: 9,
    };
    const expected = { reemplazo: {} } as any;
    jest.spyOn(replaceUseCase, 'execute').mockResolvedValue(expected);
    const result = await service.replaceMeter(dto, 1);
    expect(result).toBe(expected);
    expect(replaceUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        contratoId: BigInt(1),
        nuevoMedidorId: BigInt(2),
        lecturaFinalSaliente: 530,
        mesOrigen: 8,
        mesDestino: 9,
        solicitadoPorUsuarioId: 1,
      }),
    );
  });
});
