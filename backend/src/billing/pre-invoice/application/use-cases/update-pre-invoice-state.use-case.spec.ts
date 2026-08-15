import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdatePreInvoiceStateUseCase } from './update-pre-invoice-state.use-case';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { ComprobanteRepository } from '../../../../sri/emision/domain/repositories/comprobante.repository';
import { ComprobanteEstado } from '../../../../sri/emision/domain/constants/comprobante-estado.enum';
import { PreInvoiceEntity } from '../../domain/entities/pre-invoice.entity';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('UpdatePreInvoiceStateUseCase — comprobante BORRADOR (T-004)', () => {
  let useCase: UpdatePreInvoiceStateUseCase;
  let preInvoiceRepository: jest.Mocked<PreInvoiceRepository>;
  let comprobanteRepository: jest.Mocked<ComprobanteRepository>;

  const mockPreInvoice = new PreInvoiceEntity({
    prefacturaId: BigInt(1),
    uuid: 'uuid-1',
    estado: 'GENERADA',
    contrato: {
      numeroGuia: 'GUIA-1',
      cliente: {
        identificacion: '1234567890',
        nombres: 'Test',
        apellidos: 'Client',
        clienteId: BigInt(1),
      },
      contratoId: BigInt(1),
    },
    contratoId: BigInt(1),
    periodoId: 1,
    puntoEmisionId: 1,
    subtotal: 100,
    iva: 12,
    descuentoTotal: 0,
    totalPagar: 112,
    deudaAnterior: 0,
    saldoVencido: 0,
    abono: 0,
    saldoActual: 112,
    mesesAtrasado: 0,
    clienteDireccion: 'Test Address',
    clienteEmail: 'test@test.com',
    clienteIdentificacion: '1234567890',
    clienteNombre: 'Test Client',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    puntoEmision: {
      id: 1,
      codigo: '001',
      establecimiento: {
        id: 1,
        codigo: '001',
        emisor: { id: 1, ruc: '0999999999001', razonSocial: 'Empresa' },
      },
    },
  });

  beforeEach(async () => {
    preInvoiceRepository = {
      findById: jest.fn().mockResolvedValue(mockPreInvoice),
      updateState: jest.fn().mockResolvedValue(true),
      paginate: jest.fn(),
      findIdsByLoteId: jest.fn(),
    };

    comprobanteRepository = {
      create: jest.fn().mockResolvedValue({ id: BigInt(42) } as any),
      executeTransaction: jest.fn().mockImplementation((cb: any) => cb({})),
      update: jest.fn(),
      findByClaveAcceso: jest.fn(),
      findById: jest.fn(),
      findConDetalles: jest.fn(),
      findMany: jest.fn(),
      createDetalles: jest.fn(),
      createImpuestos: jest.fn(),
      createTotales: jest.fn(),
      createPagos: jest.fn(),
      createRetenciones: jest.fn(),
      createImpuestosDocSustento: jest.fn(),
      saveXml: jest.fn(),
      createInfoAdicional: jest.fn(),
      createDetallesAdicionales: jest.fn(),
      createMotivosNotaDebito: jest.fn(),
      findDetallesByComprobanteId: jest.fn(),
      findInfoAdicionalByComprobanteId: jest.fn(),
      findXmlAutorizado: jest.fn(),
      findXmlFirmado: jest.fn(),
      findXmlByComprobanteId: jest.fn(),
      deleteDetallesByComprobanteId: jest.fn(),
      deletePagosByComprobanteId: jest.fn(),
      deleteTotalesByComprobanteId: jest.fn(),
      deleteInfoAdicionalByComprobanteId: jest.fn(),
      updateEstadoWithLock: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePreInvoiceStateUseCase,
        { provide: PreInvoiceRepository, useValue: preInvoiceRepository },
        { provide: ComprobanteRepository, useValue: comprobanteRepository },
      ],
    }).compile();

    useCase = module.get(UpdatePreInvoiceStateUseCase);
  });

  it('should create a BORRADOR comprobante when prefactura is approved', async () => {
    preInvoiceRepository.findById.mockResolvedValue(
      new PreInvoiceEntity({
        ...mockPreInvoice,
        estado: 'EN_REVISION',
      }),
    );

    await useCase.execute({
      id: 1,
      accion: 'APROBADA',
      userId: 'test-user',
    });

    expect(comprobanteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: ComprobanteEstado.BORRADOR,
      }),
    );
  });

  it('should update the prefactura with the new comprobanteId', async () => {
    comprobanteRepository.create.mockResolvedValue({
      id: BigInt(99),
    } as any);

    preInvoiceRepository.findById
      .mockResolvedValueOnce(
        new PreInvoiceEntity({
          ...mockPreInvoice,
          estado: 'EN_REVISION',
        }),
      )
      .mockResolvedValueOnce(
        new PreInvoiceEntity({
          ...mockPreInvoice,
          estado: 'APROBADA',
          comprobanteId: BigInt(99),
        }),
      );

    preInvoiceRepository.updateState.mockResolvedValue(true);

    const result = await useCase.execute({
      id: 1,
      accion: 'APROBADA',
      userId: 'test-user',
    });

    expect(result.estado).toBe('APROBADA');
  });

  it('should throw EntityNotFoundException if prefactura does not exist', async () => {
    preInvoiceRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ id: 999, accion: 'APROBADA' }),
    ).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw InvalidDomainOperationException on invalid transition', async () => {
    preInvoiceRepository.findById.mockResolvedValue(
      new PreInvoiceEntity({
        ...mockPreInvoice,
        estado: 'GENERADA',
      }),
    );

    await expect(
      useCase.execute({ id: 1, accion: 'PAGADA' }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });

  it('should throw InvalidDomainOperationException if rejection reason is missing on RECHAZADA', async () => {
    preInvoiceRepository.findById.mockResolvedValue(
      new PreInvoiceEntity({
        ...mockPreInvoice,
        estado: 'EN_REVISION',
      }),
    );

    await expect(
      useCase.execute({ id: 1, accion: 'RECHAZADA', motivoRechazo: '' }),
    ).rejects.toThrow(InvalidDomainOperationException);
  });
});
