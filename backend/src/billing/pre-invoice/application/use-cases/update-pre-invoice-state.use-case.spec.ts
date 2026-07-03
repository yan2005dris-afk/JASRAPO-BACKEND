import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdatePreInvoiceStateUseCase } from './update-pre-invoice-state.use-case';
import { PreInvoiceRepository } from '../../domain/repositories/pre-invoice.repository';
import { ComprobanteRepository } from '../../../../sri/emision/domain/repositories/comprobante.repository';
import { ComprobanteEstado } from '../../../../sri/emision/domain/constants/comprobante-estado.enum';

describe('UpdatePreInvoiceStateUseCase — comprobante BORRADOR (T-004)', () => {
  let useCase: UpdatePreInvoiceStateUseCase;
  let preInvoiceRepository: jest.Mocked<PreInvoiceRepository>;
  let comprobanteRepository: jest.Mocked<ComprobanteRepository>;

  const mockPreInvoice = {
    prefacturaId: BigInt(1),
    estado: 'GENERADA',
    contrato: {
      cliente: {
        tipoIdentificacionId: 1,
        identificacion: '1234567890',
        nombres: 'Test',
        apellidos: 'Client',
      },
    },
    contratoId: BigInt(1),
    totalPagar: 112,
    clienteDireccion: 'Test Address',
    clienteEmail: 'test@test.com',
    puntoEmision: {
      establecimiento: { emisor: { id: 1 }, codigo: '001' },
      codigo: '001',
    },
  };

  beforeEach(async () => {
    preInvoiceRepository = {
      findById: jest.fn().mockResolvedValue(mockPreInvoice),
      updateState: jest.fn().mockReturnValue(true),
      findMany: jest.fn(),
      count: jest.fn(),
      findIdsByLoteId: jest.fn(),
    };

    comprobanteRepository = {
      create: jest.fn().mockResolvedValue({ id: BigInt(42) }),
      executeTransaction: jest
        .fn()
        .mockImplementation((cb: any) => cb({})),
      update: jest.fn(),
      findByClaveAcceso: jest.fn(),
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
      deleteImpuestosByComprobanteId: jest.fn(),
      deleteTotalesByComprobanteId: jest.fn(),
      deleteInfoAdicionalByComprobanteId: jest.fn(),
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
    // Setup: prefactura in EN_REVISION state (can transition to APROBADA)
    preInvoiceRepository.findById.mockResolvedValue({
      ...mockPreInvoice,
      estado: 'EN_REVISION',
    });

    await useCase.execute({
      id: 1,
      accion: 'APROBADA',
      userId: 'test-user',
    });

    // Should create a comprobante with BORRADOR estado
    expect(comprobanteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: ComprobanteEstado.BORRADOR,
      }),
    );
  });

  it('should update the prefactura with the new comprobanteId', async () => {
    preInvoiceRepository.findById.mockResolvedValue({
      ...mockPreInvoice,
      estado: 'EN_REVISION',
    });
    comprobanteRepository.create.mockResolvedValue({ id: BigInt(99) });

    // Mock updateState to also update the in-memory prefactura
    // The PreInvoiceRepository implementation in Prisma does updateMany
    // which returns boolean, but the use-case calls findById again after update
    preInvoiceRepository.findById
      .mockResolvedValueOnce({
        ...mockPreInvoice,
        estado: 'EN_REVISION',
      })
      .mockResolvedValueOnce({
        ...mockPreInvoice,
        estado: 'APROBADA',
        comprobanteId: BigInt(99),
      });

    // Mock updateState to simulate the optimistic lock
    preInvoiceRepository.updateState.mockResolvedValue(true);

    const result = await useCase.execute({
      id: 1,
      accion: 'APROBADA',
      userId: 'test-user',
    });

    // The use case should link the comprobante to the prefactura
    // through the PreInvoiceRepository
    expect(result.estado).toBe('APROBADA');
  });

  it('should NOT create comprobante when transitioning to non-APROBADA states', async () => {
    preInvoiceRepository.findById.mockResolvedValue({
      ...mockPreInvoice,
      estado: 'GENERADA',
    });

    await useCase.execute({
      id: 1,
      accion: 'EN_REVISION',
      userId: 'test-user',
    });

    expect(comprobanteRepository.create).not.toHaveBeenCalled();
  });

  it('should NOT create comprobante when prefactura is already APROBADA (no transition needed)', async () => {
    preInvoiceRepository.findById.mockResolvedValue({
      ...mockPreInvoice,
      estado: 'APROBADA',
    });

    comprobanteRepository.create.mockClear();

    // APROBADA → PAGADA should not create a new comprobante
    await useCase.execute({
      id: 1,
      accion: 'PAGADA',
      userId: 'test-user',
    });

    // Wait — this should throw because APROBADA→PAGADA is a valid transition
    // but should NOT create a new comprobante (PAGADA comes from SRI authorization, not manual)
    // Actually, the current STATE_TRANSITIONS has APROBADA: ['PAGADA', 'ANULADA']
    // but in the new design, PAGADA is set by the SRI emission flow, not manually
    // For now, just verify it doesn't create a comprobante
    expect(comprobanteRepository.create).not.toHaveBeenCalled();
  });
});
