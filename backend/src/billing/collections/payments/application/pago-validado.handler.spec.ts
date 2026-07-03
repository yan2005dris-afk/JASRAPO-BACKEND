import { PagoValidadoHandler } from './pago-validado.handler';
import { ComprobanteEstado } from 'src/sri/emision/domain/constants/comprobante-estado.enum';

describe('PagoValidadoHandler (T-006)', () => {
  let handler: PagoValidadoHandler;
  let paymentRepository: any;
  let comprobanteRepository: any;
  let jobsService: any;

  beforeEach(() => {
    paymentRepository = {
      findManyDetallePago: jest.fn(),
      findUniqueComprobante: jest.fn(),
      updateManyPagos: jest.fn(),
      findUniquePago: jest.fn(),
      findManyPagos: jest.fn(),
      createPago: jest.fn(),
      updatePago: jest.fn(),
      createManyDetallePago: jest.fn(),
      createDetallePago: jest.fn(),
      updateManyDetallePago: jest.fn(),
      findManySaldoFavor: jest.fn(),
      findUniqueSaldoFavor: jest.fn(),
      createSaldoFavor: jest.fn(),
      updateSaldoFavor: jest.fn(),
      updateManySaldoFavor: jest.fn(),
      findFirstCajaSesion: jest.fn(),
      findUniqueCliente: jest.fn(),
      findUniqueCuotaConvenio: jest.fn(),
      updateCuotaConvenio: jest.fn(),
      executeTransaction: jest.fn().mockImplementation((cb: any) => cb({})),
    };

    comprobanteRepository = {
      create: jest.fn(),
      update: jest.fn(),
      updateEstadoWithLock: jest.fn(),
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
      deleteTotalesByComprobanteId: jest.fn(),
      deleteInfoAdicionalByComprobanteId: jest.fn(),
      executeTransaction: jest.fn().mockImplementation((cb: any) => cb({})),
    };

    jobsService = {
      send: jest.fn().mockResolvedValue('job-123'),
      insert: jest.fn(),
      work: jest.fn(),
      getBossInstance: jest.fn(),
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
    } as any;

    handler = new PagoValidadoHandler(
      paymentRepository as any,
      comprobanteRepository as any,
      jobsService as any,
    );
  });

  function createDetallePago(overrides = {}) {
    return {
      detallePagoId: BigInt(1),
      pagoId: BigInt(1),
      comprobanteId: BigInt(42),
      tipoPago: 'COMPROBANTE',
      montoAbonado: 100,
      ...overrides,
    };
  }

  it('should enqueue sri-emision job when pago completes the total (single comprobante)', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 60 }),
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 40 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
      estado: ComprobanteEstado.BORRADOR,
    });
    comprobanteRepository.updateEstadoWithLock.mockResolvedValue(true);

    await handler.procesarPagoValidado(BigInt(1));

    expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledWith(
      BigInt(42),
      ComprobanteEstado.BORRADOR,
      ComprobanteEstado.ENVIANDO,
    );
    expect(jobsService.send).toHaveBeenCalledWith(
      'sri-emision',
      { tipo: 'FACTURA_DESDE_PREFACTURA', comprobanteId: BigInt(42) },
    );
  });

  it('should NOT enqueue when pago does NOT complete the total', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 30 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
      estado: ComprobanteEstado.BORRADOR,
    });

    await handler.procesarPagoValidado(BigInt(1));

    expect(comprobanteRepository.updateEstadoWithLock).not.toHaveBeenCalled();
    expect(jobsService.send).not.toHaveBeenCalled();
  });

  it('should NOT enqueue when comprobante is not in BORRADOR state', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
      estado: ComprobanteEstado.AUTORIZADO,
    });

    await handler.procesarPagoValidado(BigInt(1));

    expect(comprobanteRepository.updateEstadoWithLock).not.toHaveBeenCalled();
    expect(jobsService.send).not.toHaveBeenCalled();
  });

  it('should NOT enqueue when optimistic lock fails (another process won)', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 100 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
      estado: ComprobanteEstado.BORRADOR,
    });
    comprobanteRepository.updateEstadoWithLock.mockResolvedValue(false);

    await handler.procesarPagoValidado(BigInt(1));

    expect(jobsService.send).not.toHaveBeenCalled();
  });

  it('should handle multiple comprobantes across detalle_pago (W-6)', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 60 }),
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 40 }),
      createDetallePago({ comprobanteId: BigInt(99), montoAbonado: 200 }),
    ]);
    paymentRepository.findUniqueComprobante
      .mockResolvedValueOnce({
        id: BigInt(42),
        importeTotal: 100,
        estado: ComprobanteEstado.BORRADOR,
      })
      .mockResolvedValueOnce({
        id: BigInt(99),
        importeTotal: 200,
        estado: ComprobanteEstado.BORRADOR,
      });
    comprobanteRepository.updateEstadoWithLock.mockResolvedValue(true);

    await handler.procesarPagoValidado(BigInt(1));

    // Both comprobantes should get the lock update
    expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledTimes(2);
    expect(jobsService.send).toHaveBeenCalledTimes(2);
  });

  it('should handle empty detalle_pago gracefully', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([]);

    await handler.procesarPagoValidado(BigInt(1));

    expect(comprobanteRepository.updateEstadoWithLock).not.toHaveBeenCalled();
    expect(jobsService.send).not.toHaveBeenCalled();
  });

  it('should not include detalle_pago without comprobanteId', async () => {
    paymentRepository.findManyDetallePago.mockResolvedValue([
      createDetallePago({ comprobanteId: null, montoAbonado: 100 }),
      createDetallePago({ comprobanteId: BigInt(42), montoAbonado: 50 }),
    ]);
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 50,
      estado: ComprobanteEstado.BORRADOR,
    });
    comprobanteRepository.updateEstadoWithLock.mockResolvedValue(true);

    await handler.procesarPagoValidado(BigInt(1));

    expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledTimes(1);
    expect(jobsService.send).toHaveBeenCalledTimes(1);
  });

  // RF-003 — C1 fix: handler must sum ALL active detalle_pago for the comprobante,
  // not only those of the current pago. Scenario: pago1=$60 then pago2=$40 → emit.
  it('RF-003 — should sum ALL active detalle_pago for the comprobanteId (multi-pago)', async () => {
    // pago2 only has its own detalle_pago ($40). Repository returns ALL active detalle_pago
    // for comprobante 42 (pago1's $60 + pago2's $40 = $100).
    paymentRepository.findManyDetallePago.mockImplementation(
      async (params: any) => {
        if (params?.where?.pagoId === BigInt(2)) {
          return [createDetallePago({ pagoId: BigInt(2), comprobanteId: BigInt(42), montoAbonado: 40 })];
        }
        // Current pago lookup by pagoId — repo returns current pago's detalle only
        if (params?.where?.pagoId === BigInt(1)) {
          return [createDetallePago({ pagoId: BigInt(1), comprobanteId: BigInt(42), montoAbonado: 60 })];
        }
        // Query by comprobanteId — returns all active detalles for the comprobante
        if (params?.where?.comprobanteId === BigInt(42)) {
          return [
            createDetallePago({ pagoId: BigInt(1), comprobanteId: BigInt(42), montoAbonado: 60 }),
            createDetallePago({ pagoId: BigInt(2), comprobanteId: BigInt(42), montoAbonado: 40 }),
          ];
        }
        return [];
      },
    );
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
      estado: ComprobanteEstado.BORRADOR,
    });
    comprobanteRepository.updateEstadoWithLock.mockResolvedValue(true);

    // Trigger handler as if pago2 ($40) just got validated.
    // Even though pago2's own detalle only sums $40, the repository returns
    // the FULL sum of ALL active detalle_pago for comprobante 42 ($60+$40=$100).
    await handler.procesarPagoValidado(BigInt(2));

    // The handler must query by comprobanteId (not just pagoId) to retrieve
    // the total $100 and decide emission.
    expect(paymentRepository.findManyDetallePago).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ comprobanteId: BigInt(42) }),
      }),
    );
    expect(comprobanteRepository.updateEstadoWithLock).toHaveBeenCalledWith(
      BigInt(42),
      ComprobanteEstado.BORRADOR,
      ComprobanteEstado.ENVIANDO,
    );
    expect(jobsService.send).toHaveBeenCalledWith(
      'sri-emision',
      { tipo: 'FACTURA_DESDE_PREFACTURA', comprobanteId: BigInt(42) },
    );
  });

  // RF-003 — multi-pago where cumulative sum is still under total → no emit
  it('RF-003 — should NOT emit when cumulative sum across pagos is below total', async () => {
    paymentRepository.findManyDetallePago.mockImplementation(
      async (params: any) => {
        if (params?.where?.comprobanteId === BigInt(42)) {
          // pago1=$30 + pago2=$40 = $70 < $100 → still pending
          return [
            createDetallePago({ pagoId: BigInt(1), comprobanteId: BigInt(42), montoAbonado: 30 }),
            createDetallePago({ pagoId: BigInt(2), comprobanteId: BigInt(42), montoAbonado: 40 }),
          ];
        }
        return [];
      },
    );
    paymentRepository.findUniqueComprobante.mockResolvedValue({
      id: BigInt(42),
      importeTotal: 100,
      estado: ComprobanteEstado.BORRADOR,
    });

    await handler.procesarPagoValidado(BigInt(2));

    expect(comprobanteRepository.updateEstadoWithLock).not.toHaveBeenCalled();
    expect(jobsService.send).not.toHaveBeenCalled();
  });
});
