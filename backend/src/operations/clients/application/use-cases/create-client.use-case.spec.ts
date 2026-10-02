import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateClientUseCase } from './create-client.use-case';
import { ClientRepository } from '../../domain/repositories/client.repository';
import { TerceraEdadService } from '../services/tercera-edad.service';
import { TerceraEdadUtil } from '../../domain/tercera-edad.util';
import {
  EntityAlreadyExistsException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { TipoIdentificacionUtil } from 'src/shared/utils/tipo-identificacion.util';

jest.mock('src/shared/utils/tipo-identificacion.util');

describe('CreateClientUseCase', () => {
  let useCase: CreateClientUseCase;

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

  // Delega en la util real (umbral default 65) para conservar las aserciones
  // basadas en la edad sin acoplarse a la lectura de sistema_config.
  const mockTerceraEdadService = {
    aplica: jest.fn((fecha?: Date | string | null) =>
      Promise.resolve(TerceraEdadUtil.aplica(fecha)),
    ),
  };

  const baseDto = {
    tipoIdentificacionId: 1,
    identificacion: '0926715658',
    nombres: 'John',
    apellidos: 'Doe',
    direccionDomicilio: 'Av. Siempre Viva 123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClientUseCase,
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

    useCase = module.get<CreateClientUseCase>(CreateClientUseCase);

    (TipoIdentificacionUtil.validar as jest.Mock).mockReturnValue(true);
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

  describe('execute - regular clients', () => {
    it('should create a regular client successfully', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue(null);
      mockClientRepository.create.mockResolvedValue({
        ...baseDto,
        clienteId: BigInt(1),
      });

      const result = await useCase.execute(baseDto);

      expect(result).toBeDefined();
      expect(mockClientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          identificacion: '0926715658',
          nombres: 'JOHN',
          apellidos: 'DOE',
        }),
      );
    });

    it('should throw EntityAlreadyExistsException if identification already exists (active)', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue({
        clienteId: BigInt(1),
        deletedAt: null,
      });

      await expect(useCase.execute(baseDto)).rejects.toThrow(
        EntityAlreadyExistsException,
      );
    });

    it('should reactivate a soft-deleted client with the same identification', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue({
        clienteId: BigInt(1),
        identificacion: '0926715658',
        deletedAt: new Date(),
      });
      mockClientRepository.updateClient.mockResolvedValue({
        ...baseDto,
        clienteId: BigInt(1),
        deletedAt: null,
      });

      const result = await useCase.execute(baseDto);

      expect(mockClientRepository.updateClient).toHaveBeenCalledWith(
        BigInt(1),
        expect.objectContaining({ deletedAt: null }),
      );
      expect(result).toBeDefined();
    });

    it('should throw InvalidDomainOperationException if identification is invalid', async () => {
      (TipoIdentificacionUtil.validar as jest.Mock).mockReturnValue(false);
      const dto = { ...baseDto, identificacion: '123' };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidDomainOperationException,
      );
    });

    it('should throw InvalidDomainOperationException if tipoIdentificacionId is invalid', async () => {
      mockClientRepository.findTipoIdentificacionById.mockResolvedValue(null);
      const dto = { ...baseDto, tipoIdentificacionId: 999 };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidDomainOperationException,
      );
    });

    it('should throw InvalidDomainOperationException if identification is missing', async () => {
      const dto = { ...baseDto, identificacion: undefined };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidDomainOperationException,
      );
    });

    it('should throw InvalidDomainOperationException if nombres and apellidos are missing', async () => {
      const dto = { ...baseDto, nombres: undefined, apellidos: undefined };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidDomainOperationException,
      );
    });

    it('should throw InvalidDomainOperationException if razonSocial is missing for RUC (codigo 04)', async () => {
      mockClientRepository.findTipoIdentificacionById.mockResolvedValue({
        id: 1,
        codigo: '04', // RUC
      });
      const dto = {
        tipoIdentificacionId: 1,
        identificacion: '0999999999001',
        nombres: 'Empresa',
        apellidos: 'S.A.',
        direccionDomicilio: 'Av. Siempre Viva 123',
        razonSocial: undefined,
      };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidDomainOperationException,
      );
    });

    it('should throw InvalidDomainOperationException if direccionDomicilio is missing', async () => {
      const dto = { ...baseDto, direccionDomicilio: undefined };

      await expect(useCase.execute(dto)).rejects.toThrow(
        InvalidDomainOperationException,
      );
    });

    it('should compute aplicaTerceraEdad = true when fechaNacimiento is 65+', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue(null);
      mockClientRepository.create.mockResolvedValue({
        ...baseDto,
        clienteId: BigInt(1),
      });
      const anio = new Date().getFullYear() - 70;

      await useCase.execute({ ...baseDto, fechaNacimiento: `${anio}-01-01` });

      expect(mockClientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ aplicaTerceraEdad: true }),
      );
    });

    it('should compute aplicaTerceraEdad = false when younger than 65', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue(null);
      mockClientRepository.create.mockResolvedValue({
        ...baseDto,
        clienteId: BigInt(1),
      });
      const anio = new Date().getFullYear() - 40;

      await useCase.execute({ ...baseDto, fechaNacimiento: `${anio}-01-01` });

      expect(mockClientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ aplicaTerceraEdad: false }),
      );
    });

    it('should default aplicaTerceraEdad = false when no fechaNacimiento', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue(null);
      mockClientRepository.create.mockResolvedValue({
        ...baseDto,
        clienteId: BigInt(1),
      });

      await useCase.execute(baseDto);

      expect(mockClientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ aplicaTerceraEdad: false }),
      );
    });

    it('should pass contact data trimmed for email', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue(null);
      mockClientRepository.create.mockResolvedValue({
        ...baseDto,
        clienteId: BigInt(1),
      });

      await useCase.execute({ ...baseDto, email: '  JUAN@EXAMPLE.COM ' });

      expect(mockClientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'juan@example.com' }),
      );
    });

    it('guarda el porcentaje del carné cuando aplica discapacidad', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue(null);
      mockClientRepository.create.mockResolvedValue({
        ...baseDto,
        clienteId: BigInt(1),
      });

      await useCase.execute({
        ...baseDto,
        aplicaDiscapacidad: true,
        porcentajeDiscapacidad: 70,
      });

      expect(mockClientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          aplicaDiscapacidad: true,
          porcentajeDiscapacidad: 70,
        }),
      );
    });

    it('rechaza discapacidad sin porcentaje del carné', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue(null);

      await expect(
        useCase.execute({ ...baseDto, aplicaDiscapacidad: true }),
      ).rejects.toThrow(InvalidDomainOperationException);
      expect(mockClientRepository.create).not.toHaveBeenCalled();
    });

    it('no guarda porcentaje cuando no aplica discapacidad', async () => {
      mockClientRepository.findByIdentificacion.mockResolvedValue(null);
      mockClientRepository.create.mockResolvedValue({
        ...baseDto,
        clienteId: BigInt(1),
      });

      await useCase.execute({ ...baseDto, porcentajeDiscapacidad: 50 });

      expect(mockClientRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          aplicaDiscapacidad: false,
          porcentajeDiscapacidad: null,
        }),
      );
    });
  });

  describe('execute - CONSUMIDOR_FINAL (tipoIdentificacionId 4)', () => {
    const consumidorDto = {
      tipoIdentificacionId: 4,
      email: 'consumidor@example.com',
      telefono: '0999999999',
      direccionDomicilio: 'Av. Principal',
    };

    it('should delegate to reactivateOrCreateConsumidorFinal when no singleton exists', async () => {
      mockClientRepository.reactivateOrCreateConsumidorFinal.mockResolvedValue({
        clienteId: BigInt(9),
        identificacion: '9999999999999',
      });

      const result = await useCase.execute(consumidorDto);

      expect(
        mockClientRepository.reactivateOrCreateConsumidorFinal,
      ).toHaveBeenCalledWith({
        email: 'consumidor@example.com',
        telefono: '0999999999',
        telefonoSecundario: undefined,
        direccionDomicilio: 'Av. Principal',
      });
      expect(result.clienteId).toEqual(BigInt(9));
    });

    it('should trim and lowercase the email before delegation', async () => {
      mockClientRepository.reactivateOrCreateConsumidorFinal.mockResolvedValue({
        clienteId: BigInt(9),
      });

      await useCase.execute({
        tipoIdentificacionId: 4,
        email: '  X@Y.COM ',
      });

      expect(
        mockClientRepository.reactivateOrCreateConsumidorFinal,
      ).toHaveBeenCalledWith(expect.objectContaining({ email: 'x@y.com' }));
    });

    it('should return the entity (not a {message, data} wrapper)', async () => {
      const entity = { clienteId: BigInt(9), nombres: 'CONSUMIDOR' };
      mockClientRepository.reactivateOrCreateConsumidorFinal.mockResolvedValue(
        entity as any,
      );

      const result = await useCase.execute(consumidorDto);

      expect(result).toEqual(entity);
    });
  });
});
