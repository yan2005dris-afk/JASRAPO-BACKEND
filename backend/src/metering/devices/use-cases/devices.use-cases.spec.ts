import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateDeviceUseCase } from './create-device.use-case';
import { FindOneDeviceUseCase } from './find-one-device.use-case';
import { InstallDeviceUseCase } from './install-device.use-case';
import { ReportDeviceDamageUseCase } from './report-device-damage.use-case';
import { DecommissionDeviceUseCase } from './decommission-device.use-case';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoMedidor } from 'src/generated/prisma/enums';

describe('Devices Use Cases', () => {
  let createUseCase: CreateDeviceUseCase;
  let findOneUseCase: FindOneDeviceUseCase;
  let installUseCase: InstallDeviceUseCase;
  let reportDamageUseCase: ReportDeviceDamageUseCase;
  let decommissionUseCase: DecommissionDeviceUseCase;
  let prisma: PrismaService;

  const mockMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    estado: EstadoMedidor.BODEGA,
    deletedAt: null,
  };

  const mockPrismaService = {
    medidores: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDeviceUseCase,
        FindOneDeviceUseCase,
        InstallDeviceUseCase,
        ReportDeviceDamageUseCase,
        DecommissionDeviceUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    createUseCase = module.get<CreateDeviceUseCase>(CreateDeviceUseCase);
    findOneUseCase = module.get<FindOneDeviceUseCase>(FindOneDeviceUseCase);
    installUseCase = module.get<InstallDeviceUseCase>(InstallDeviceUseCase);
    reportDamageUseCase = module.get<ReportDeviceDamageUseCase>(ReportDeviceDamageUseCase);
    decommissionUseCase = module.get<DecommissionDeviceUseCase>(DecommissionDeviceUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('CreateDeviceUseCase', () => {
    it('should create a device', async () => {
      mockPrismaService.medidores.create.mockResolvedValue(mockMedidor);
      const result = await createUseCase.execute({ serie: 'MED-001' } as any);
      expect(result).toEqual(mockMedidor);
      expect(mockPrismaService.medidores.create).toHaveBeenCalled();
    });
  });

  describe('FindOneDeviceUseCase', () => {
    it('should return a device', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);
      const result = await findOneUseCase.execute(BigInt(1));
      expect(result).toEqual(mockMedidor);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(null);
      await expect(findOneUseCase.execute(BigInt(1))).rejects.toThrow(NotFoundException);
    });
  });

  describe('InstallDeviceUseCase', () => {
    it('should install a device', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);
      mockPrismaService.medidores.update.mockResolvedValue({ ...mockMedidor, estado: EstadoMedidor.INSTALADO });
      const result = await installUseCase.execute(BigInt(1), BigInt(1));
      expect(result.estado).toBe(EstadoMedidor.INSTALADO);
    });

    it('should throw BadRequestException if not in BODEGA or ESTIMADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({ ...mockMedidor, estado: EstadoMedidor.INSTALADO });
      await expect(installUseCase.execute(BigInt(1), BigInt(1))).rejects.toThrow(BadRequestException);
    });
  });

  describe('ReportDeviceDamageUseCase', () => {
    it('should report damage', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({ ...mockMedidor, estado: EstadoMedidor.INSTALADO });
      mockPrismaService.medidores.update.mockResolvedValue({ ...mockMedidor, estado: EstadoMedidor.DANADO });
      const result = await reportDamageUseCase.execute(BigInt(1));
      expect(result.estado).toBe(EstadoMedidor.DANADO);
    });

    it('should throw BadRequestException if not INSTALADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({ ...mockMedidor, estado: EstadoMedidor.BODEGA });
      await expect(reportDamageUseCase.execute(BigInt(1))).rejects.toThrow(BadRequestException);
    });
  });

  describe('DecommissionDeviceUseCase', () => {
    it('should decommission a device', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({ ...mockMedidor, estado: EstadoMedidor.DANADO });
      mockPrismaService.medidores.update.mockResolvedValue({ ...mockMedidor, estado: EstadoMedidor.BAJA });
      const result = await decommissionUseCase.execute(BigInt(1), 'Broken');
      expect(result.estado).toBe(EstadoMedidor.BAJA);
    });

    it('should throw BadRequestException if not DANADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({ ...mockMedidor, estado: EstadoMedidor.INSTALADO });
      await expect(decommissionUseCase.execute(BigInt(1), 'Broken')).rejects.toThrow(BadRequestException);
    });
  });
});
