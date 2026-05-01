import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MedidorService } from './medidor.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateDeviceUseCase } from './use-cases/create-device.use-case';
import { FindOneDeviceUseCase } from './use-cases/find-one-device.use-case';
import { InstallDeviceUseCase } from './use-cases/install-device.use-case';
import { ReportDeviceDamageUseCase } from './use-cases/report-device-damage.use-case';
import { DecommissionDeviceUseCase } from './use-cases/decommission-device.use-case';
import { EstadoMedidor } from 'src/generated/prisma/enums';

describe('MedidorService', () => {
  let service: MedidorService;
  let prisma: PrismaService;
  let createUseCase: CreateDeviceUseCase;
  let findOneUseCase: FindOneDeviceUseCase;
  let installUseCase: InstallDeviceUseCase;
  let reportDamageUseCase: ReportDeviceDamageUseCase;
  let decommissionUseCase: DecommissionDeviceUseCase;

  const mockMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    estado: EstadoMedidor.BODEGA,
    deletedAt: null,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedidorService,
        {
          provide: PrismaService,
          useValue: {
            medidores: {
              findMany: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        { provide: CreateDeviceUseCase, useValue: { execute: jest.fn() } },
        { provide: FindOneDeviceUseCase, useValue: { execute: jest.fn() } },
        { provide: InstallDeviceUseCase, useValue: { execute: jest.fn() } },
        { provide: ReportDeviceDamageUseCase, useValue: { execute: jest.fn() } },
        { provide: DecommissionDeviceUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<MedidorService>(MedidorService);
    prisma = module.get<PrismaService>(PrismaService);
    createUseCase = module.get<CreateDeviceUseCase>(CreateDeviceUseCase);
    findOneUseCase = module.get<FindOneDeviceUseCase>(FindOneDeviceUseCase);
    installUseCase = module.get<InstallDeviceUseCase>(InstallDeviceUseCase);
    reportDamageUseCase = module.get<ReportDeviceDamageUseCase>(ReportDeviceDamageUseCase);
    decommissionUseCase = module.get<DecommissionDeviceUseCase>(DecommissionDeviceUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('crearMedidor should delegate to CreateDeviceUseCase', async () => {
    const dto = { serie: 'MED-001' } as any;
    jest.spyOn(createUseCase, 'execute').mockResolvedValue(mockMedidor);
    const result = await service.crearMedidor(dto);
    expect(result).toBe(mockMedidor);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('buscarMedidor should delegate to FindOneDeviceUseCase', async () => {
    const id = BigInt(1);
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockMedidor);
    const result = await service.buscarMedidor(id);
    expect(result).toBe(mockMedidor);
    expect(findOneUseCase.execute).toHaveBeenCalledWith(id);
  });

  it('instalarMedidor should delegate to InstallDeviceUseCase', async () => {
    const medidorId = BigInt(1);
    const contratoId = BigInt(1);
    jest.spyOn(installUseCase, 'execute').mockResolvedValue(mockMedidor);
    const result = await service.instalarMedidor(medidorId, contratoId);
    expect(result).toBe(mockMedidor);
    expect(installUseCase.execute).toHaveBeenCalledWith(medidorId, contratoId);
  });

  it('reportarDano should delegate to ReportDeviceDamageUseCase', async () => {
    const medidorId = BigInt(1);
    jest.spyOn(reportDamageUseCase, 'execute').mockResolvedValue(mockMedidor);
    const result = await service.reportarDano(medidorId);
    expect(result).toBe(mockMedidor);
    expect(reportDamageUseCase.execute).toHaveBeenCalledWith(medidorId);
  });

  it('darDeBaja should delegate to DecommissionDeviceUseCase', async () => {
    const medidorId = BigInt(1);
    const motivo = 'Broken';
    jest.spyOn(decommissionUseCase, 'execute').mockResolvedValue(mockMedidor);
    const result = await service.darDeBaja(medidorId, motivo);
    expect(result).toBe(mockMedidor);
    expect(decommissionUseCase.execute).toHaveBeenCalledWith(medidorId, motivo);
  });

  it('buscarMedidores should use prisma directly', async () => {
    const params = { skip: 0 };
    jest.spyOn(prisma.medidores, 'findMany').mockResolvedValue([mockMedidor]);
    const result = await service.buscarMedidores(params);
    expect(result).toEqual([mockMedidor]);
    expect(prisma.medidores.findMany).toHaveBeenCalled();
  });
});
