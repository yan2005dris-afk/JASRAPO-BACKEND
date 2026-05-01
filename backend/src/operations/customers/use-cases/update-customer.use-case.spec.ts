import { Test, TestingModule } from '@nestjs/testing';
import { UpdateCustomerUseCase } from './update-customer.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { TipoIdentificacion } from 'src/generated/prisma/enums';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { TipoIdentificacionUtil } from 'src/infrastructure/common/util/tipo-identificacion.util';

describe('UpdateCustomerUseCase', () => {
  let useCase: UpdateCustomerUseCase;

  const mockPrismaService = {
    clientes: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockCliente = {
    clienteId: BigInt(1),
    identificacion: '0926715658',
    tipoIdentificacion: TipoIdentificacion.CEDULA,
    nombres: 'JOHN',
    apellidos: 'DOE',
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerUseCase,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateCustomerUseCase>(UpdateCustomerUseCase);
    jest.spyOn(TipoIdentificacionUtil, 'validar').mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update a customer successfully', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);
      mockPrismaService.clientes.update.mockResolvedValue({ ...mockCliente, nombres: 'CARLOS' });

      const result = await useCase.execute('1', { nombres: 'Carlos' });

      expect(result).toBeDefined();
      expect(mockPrismaService.clientes.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ nombres: 'CARLOS' })
      }));
    });

    it('should throw NotFoundException if customer does not exist', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(null);

      await expect(useCase.execute('1', { nombres: 'Carlos' })).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if new identification is invalid', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);
      jest.spyOn(TipoIdentificacionUtil, 'validar').mockReturnValue(false);

      await expect(useCase.execute('1', { identificacion: '123' })).rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException if new identification already exists for another customer', async () => {
      mockPrismaService.clientes.findFirst.mockResolvedValue(mockCliente);
      mockPrismaService.clientes.findUnique.mockResolvedValue({ clienteId: BigInt(2), identificacion: '0926715641' });

      await expect(useCase.execute('1', { identificacion: '0926715641' })).rejects.toThrow(ConflictException);
    });
  });
});
