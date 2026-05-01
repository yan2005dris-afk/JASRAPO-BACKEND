import { Test, TestingModule } from '@nestjs/testing';
import { ClientService } from './client.service';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateCustomerUseCase } from './use-cases/create-customer.use-case';
import { UpdateCustomerUseCase } from './use-cases/update-customer.use-case';
import { FindOneCustomerUseCase } from './use-cases/find-one-customer.use-case';
import { SearchCustomersUseCase } from './use-cases/search-customers.use-case';
import { RemoveCustomerUseCase } from './use-cases/remove-customer.use-case';
import { TipoIdentificacion } from 'src/generated/prisma/enums';

describe('ClientService', () => {
  let service: ClientService;
  let createUseCase: CreateCustomerUseCase;
  let updateUseCase: UpdateCustomerUseCase;
  let findOneUseCase: FindOneCustomerUseCase;
  let searchUseCase: SearchCustomersUseCase;
  let removeUseCase: RemoveCustomerUseCase;
  let prisma: PrismaService;

  const mockUseCase = { execute: jest.fn() };

  const mockPrismaService = {
    clientes: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClientService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CreateCustomerUseCase, useValue: { execute: jest.fn() } },
        { provide: UpdateCustomerUseCase, useValue: { execute: jest.fn() } },
        { provide: FindOneCustomerUseCase, useValue: { execute: jest.fn() } },
        { provide: SearchCustomersUseCase, useValue: { execute: jest.fn() } },
        { provide: RemoveCustomerUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<ClientService>(ClientService);
    createUseCase = module.get<CreateCustomerUseCase>(CreateCustomerUseCase);
    updateUseCase = module.get<UpdateCustomerUseCase>(UpdateCustomerUseCase);
    findOneUseCase = module.get<FindOneCustomerUseCase>(FindOneCustomerUseCase);
    searchUseCase = module.get<SearchCustomersUseCase>(SearchCustomersUseCase);
    removeUseCase = module.get<RemoveCustomerUseCase>(RemoveCustomerUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create should delegate to CreateCustomerUseCase', async () => {
    const dto = { tipoIdentificacion: TipoIdentificacion.CEDULA, identificacion: '123' } as any;
    await service.create(dto);
    expect(createUseCase.execute).toHaveBeenCalledWith(dto);
  });

  it('findAll should call prisma directly', async () => {
    mockPrismaService.clientes.findMany.mockResolvedValue([]);
    await service.findAll();
    expect(mockPrismaService.clientes.findMany).toHaveBeenCalled();
  });

  it('findOne should delegate to FindOneCustomerUseCase', async () => {
    await service.findOne('1');
    expect(findOneUseCase.execute).toHaveBeenCalledWith('1');
  });

  it('update should delegate to UpdateCustomerUseCase', async () => {
    const dto = { nombres: 'Test' } as any;
    await service.update('1', dto);
    expect(updateUseCase.execute).toHaveBeenCalledWith('1', dto);
  });

  it('remove should delegate to RemoveCustomerUseCase', async () => {
    await service.remove('1');
    expect(removeUseCase.execute).toHaveBeenCalledWith('1');
  });

  it('search should delegate to SearchCustomersUseCase', async () => {
    await service.search('identificacion', '123', 1, 10);
    expect(searchUseCase.execute).toHaveBeenCalledWith('identificacion', '123', 1, 10);
  });
});
