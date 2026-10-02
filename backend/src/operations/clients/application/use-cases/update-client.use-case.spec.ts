import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateClientUseCase } from './update-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { TerceraEdadService } from '../services/tercera-edad.service';
import { TerceraEdadUtil } from '../../domain/tercera-edad.util';
import { TipoIdentificacionUtil } from 'src/shared/utils/tipo-identificacion.util';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

jest.mock('src/shared/utils/tipo-identificacion.util');

describe('UpdateClientUseCase', () => {
  let useCase: UpdateClientUseCase;

  const mockClientRepository = {
    findById: jest.fn(),
    findByIdentificacion: jest.fn(),
    create: jest.fn(),
    updateClient: jest.fn(),
    softDelete: jest.fn(),
    findTipoIdentificacionById: jest.fn(),
    findActiveTipoIdentificaciones: jest.fn(),
    reactivateOrCreateConsumidorFinal: jest.fn(),
    paginateClientes: jest.fn(),
  };

  const mockTerceraEdadService = {
    aplica: jest.fn((fecha?: Date | string | null) =>
      Promise.resolve(TerceraEdadUtil.aplica(fecha)),
    ),
  };

  const mockCliente = {
    clienteId: BigInt(1),
    identificacion: '0926715658',
    nombres: 'JOHN',
    apellidos: 'DOE',
    deletedAt: null,
    tipoIdentificacion: {
      id: 1,
      codigo: '05',
      descripcion: 'CÉDULA',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClientUseCase,
        {
          provide: ClientRepository,
          useValue: mockClientRepository,
        },
        {
          provide: TerceraEdadService,
          useValue: mockTerceraEdadService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateClientUseCase>(UpdateClientUseCase);
    (TipoIdentificacionUtil.validar as jest.Mock).mockReturnValue(true);
    mockClientRepository.findById.mockResolvedValue(mockCliente);
    mockClientRepository.findTipoIdentificacionById.mockResolvedValue({
      id: 1,
      codigo: '05', // CÉDULA
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update a client successfully', async () => {
      mockClientRepository.updateClient.mockResolvedValue({
        ...mockCliente,
        nombres: 'CARLOS',
      });

      const result = await useCase.execute(1n, { nombres: 'Carlos' });

      expect(result).toBeDefined();
      expect(mockClientRepository.updateClient).toHaveBeenCalledWith(
        1n,
        expect.objectContaining({ nombres: 'CARLOS' }),
      );
    });

    it('should translate the tipoIdentificacion connect inside the repository data', async () => {
      mockClientRepository.updateClient.mockResolvedValue(mockCliente);

      await useCase.execute(1n, { tipoIdentificacionId: 2 });

      expect(mockClientRepository.updateClient).toHaveBeenCalledWith(
        1n,
        expect.objectContaining({ tipoIdentificacionId: 2 }),
      );
      expect(
        mockClientRepository.findTipoIdentificacionById,
      ).toHaveBeenCalledWith(2);
    });

    it('should throw EntityNotFoundException if client does not exist', async () => {
      mockClientRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(1n, { nombres: 'Carlos' })).rejects.toThrow(
        EntityNotFoundException,
      );
    });

    it('should throw InvalidDomainOperationException if new identification is invalid', async () => {
      (TipoIdentificacionUtil.validar as jest.Mock).mockReturnValue(false);

      await expect(
        useCase.execute(1n, { identificacion: '123' }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });

    it('should throw EntityAlreadyExistsException if new identification already exists for another client', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue({
        clienteId: BigInt(2),
        identificacion: '0926715641',
      });

      await expect(
        useCase.execute(1n, { identificacion: '0926715641' }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });

    it('should throw InvalidDomainOperationException if tipoIdentificacionId is invalid', async () => {
      mockClientRepository.findTipoIdentificacionById.mockResolvedValue(null);

      await expect(
        useCase.execute(1n, { tipoIdentificacionId: 999 }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });

    it('should throw InvalidDomainOperationException if nombres and apellidos are missing', async () => {
      mockClientRepository.updateClient.mockResolvedValue(mockCliente);

      await expect(
        useCase.execute(1n, { nombres: '   ', apellidos: '' }),
      ).rejects.toThrow(InvalidDomainOperationException);
    });

    it('should allow missing nombres/apellidos for CONSUMIDOR_FINAL (codigo 07)', async () => {
      mockClientRepository.findById.mockResolvedValue({
        ...mockCliente,
        tipoIdentificacion: {
          id: 4,
          codigo: '07',
          descripcion: 'CONSUMIDOR FINAL',
        },
      });
      mockClientRepository.findTipoIdentificacionById.mockResolvedValue({
        id: 4,
        codigo: '07',
      });
      mockClientRepository.updateClient.mockResolvedValue(mockCliente);

      const result = await useCase.execute(1n, { nombres: undefined });

      expect(result).toBeDefined();
      expect(mockClientRepository.updateClient).toHaveBeenCalled();
    });

    it('should not treat own identification as duplicate', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue({
        clienteId: BigInt(1),
        identificacion: '0926715658',
      });
      mockClientRepository.updateClient.mockResolvedValue(mockCliente);

      const result = await useCase.execute(1n, {
        identificacion: '0926715658',
      });

      expect(result).toBeDefined();
      expect(mockClientRepository.updateClient).toHaveBeenCalledWith(
        1n,
        expect.objectContaining({ identificacion: '0926715658' }),
      );
    });

    it('conserva aplicaTerceraEdad cuando fechaNacimiento llega vacío', async () => {
      mockClientRepository.findById.mockResolvedValue({
        ...mockCliente,
        aplicaTerceraEdad: true,
      });
      mockClientRepository.updateClient.mockResolvedValue(mockCliente);

      await useCase.execute(1n, { fechaNacimiento: '' });

      expect(mockClientRepository.updateClient).toHaveBeenCalledWith(
        1n,
        expect.objectContaining({ aplicaTerceraEdad: true }),
      );
    });

    it('recalcula aplicaTerceraEdad cuando llega una fecha de nacimiento válida', async () => {
      const anio = new Date().getFullYear() - 70;
      mockClientRepository.findById.mockResolvedValue({
        ...mockCliente,
        aplicaTerceraEdad: false,
      });
      mockClientRepository.updateClient.mockResolvedValue(mockCliente);

      await useCase.execute(1n, { fechaNacimiento: `${anio}-01-01` });

      expect(mockClientRepository.updateClient).toHaveBeenCalledWith(
        1n,
        expect.objectContaining({ aplicaTerceraEdad: true }),
      );
    });

    it('guarda el porcentaje del carné al marcar discapacidad', async () => {
      mockClientRepository.updateClient.mockResolvedValue(mockCliente);

      await useCase.execute(1n, {
        aplicaDiscapacidad: true,
        porcentajeDiscapacidad: 40,
      });

      expect(mockClientRepository.updateClient).toHaveBeenCalledWith(
        1n,
        expect.objectContaining({
          aplicaDiscapacidad: true,
          porcentajeDiscapacidad: 40,
        }),
      );
    });

    it('rechaza marcar discapacidad sin porcentaje del carné', async () => {
      mockClientRepository.findById.mockResolvedValue({
        ...mockCliente,
        aplicaDiscapacidad: false,
        porcentajeDiscapacidad: null,
      });

      await expect(
        useCase.execute(1n, { aplicaDiscapacidad: true }),
      ).rejects.toThrow(InvalidDomainOperationException);
      expect(mockClientRepository.updateClient).not.toHaveBeenCalled();
    });

    it('limpia el porcentaje al desmarcar discapacidad', async () => {
      mockClientRepository.findById.mockResolvedValue({
        ...mockCliente,
        aplicaDiscapacidad: true,
        porcentajeDiscapacidad: 70,
      });
      mockClientRepository.updateClient.mockResolvedValue(mockCliente);

      await useCase.execute(1n, { aplicaDiscapacidad: false });

      expect(mockClientRepository.updateClient).toHaveBeenCalledWith(
        1n,
        expect.objectContaining({
          aplicaDiscapacidad: false,
          porcentajeDiscapacidad: null,
        }),
      );
    });

    it('no exige el porcentaje si la edición no toca discapacidad', async () => {
      mockClientRepository.findById.mockResolvedValue({
        ...mockCliente,
        aplicaDiscapacidad: true,
        porcentajeDiscapacidad: null,
      });
      mockClientRepository.updateClient.mockResolvedValue(mockCliente);

      await useCase.execute(1n, { telefono: '0991234567' });

      expect(mockClientRepository.updateClient).toHaveBeenCalledWith(
        1n,
        expect.objectContaining({
          aplicaDiscapacidad: true,
          porcentajeDiscapacidad: null,
        }),
      );
    });
  });
});
