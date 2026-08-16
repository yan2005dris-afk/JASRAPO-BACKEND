import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmitirFacturaUseCase } from './emitir-factura.use-case';
import { ClaveAccesoService } from '../../infrastructure/xml/clave-acceso.service';
import { XmlBuilderService } from '../../infrastructure/xml/xml-builder.service';
import { XmlSignerService } from '../../infrastructure/xml/xml-signer.service';
import { SriSoapClient } from '../../infrastructure/soap/sri-soap.client';
import { ComprobanteRepository } from '../../domain/repositories/comprobante.repository';
import { EmisorRepository } from '../../../emisores/domain/repositories/emisor.repository';
import { SecuencialRepository } from '../../domain/repositories/secuencial.repository';
import { XmlStorageService } from '../../infrastructure/storage/xml-storage.service';
import { SriBaseService } from '../../infrastructure/xml/sri-base.service';
import type { SriOperationResult } from '../../domain/interfaces';
import type { CreateFacturaDto } from '../../interfaces/dto';
import { ComprobanteEstado } from '../../domain/constants/comprobante-estado.enum';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('EmitirFacturaUseCase — persistirFactura with comprobanteExistente (T-003)', () => {
  let useCase: EmitirFacturaUseCase;
  let comprobanteRepository: jest.Mocked<ComprobanteRepository>;
  let sriSoapClient: jest.Mocked<SriSoapClient>;
  let module: TestingModule;

  const mockComprobanteRecord = {
    id: BigInt(1),
    emisor_id: 1,
    punto_emision_id: 1,
    tipo_comprobante: '01',
    ambiente: '1',
    tipo_emision: '1',
    secuencial: '000000001',
    clave_acceso: '1234567890123456789012345678901234567890123456789',
    fecha_emision: '2026-07-03',
    estado: ComprobanteEstado.FIRMADO,
    receptor_tipo_identificacion: '05',
    receptor_identificacion: '1234567890',
    receptor_razon_social: 'Test Client',
  };

  const mockDto: CreateFacturaDto = {
    fechaEmision: '03/07/2026',
    emisor: {
      ruc: '1234567890001',
      razonSocial: 'Test Emisor',
      dirMatriz: 'Av. Test',
      establecimiento: '001',
      puntoEmision: '001',
      obligadoContabilidad: 'SI',
    },
    comprador: {
      tipoIdentificacion: '05' as any,
      identificacion: '1234567890',
      razonSocial: 'Test Client',
      direccion: 'Test Address',
    },
    detalles: [
      {
        codigoPrincipal: '001',
        descripcion: 'Test Item',
        cantidad: 1,
        precioUnitario: 100,
        descuento: 0,
        impuestos: [
          {
            codigo: '2',
            codigoPorcentaje: '2',
            tarifa: 12,
            baseImponible: 100,
            valor: 12,
          },
        ],
      },
    ],
    pagos: [{ formaPago: '01' as any, total: 112 }],
  };

  beforeEach(async () => {
    comprobanteRepository = {
      create: jest.fn().mockResolvedValue(mockComprobanteRecord),
      update: jest.fn().mockResolvedValue(mockComprobanteRecord),
      createDetalles: jest.fn().mockResolvedValue([{ id: 'det-1' }]),
      createImpuestos: jest.fn().mockResolvedValue([{}]),
      createTotales: jest.fn().mockResolvedValue([{}]),
      createPagos: jest.fn().mockResolvedValue([{}]),
      createInfoAdicional: jest.fn().mockResolvedValue([{}]),
      createDetallesAdicionales: jest.fn().mockResolvedValue([{}]),
      saveXml: jest.fn().mockResolvedValue({}),
      deleteDetallesByComprobanteId: jest.fn().mockResolvedValue(undefined),
      deletePagosByComprobanteId: jest.fn().mockResolvedValue(undefined),
      deleteTotalesByComprobanteId: jest.fn().mockResolvedValue(undefined),
      deleteInfoAdicionalByComprobanteId: jest
        .fn()
        .mockResolvedValue(undefined),
      executeTransaction: jest.fn().mockImplementation((cb) => cb({})),
      findByClaveAcceso: jest.fn(),
      findConDetalles: jest.fn(),
      findMany: jest.fn(),
      createRetenciones: jest.fn(),
      createImpuestosDocSustento: jest.fn(),
      createMotivosNotaDebito: jest.fn(),
      findDetallesByComprobanteId: jest.fn(),
      findInfoAdicionalByComprobanteId: jest.fn(),
      findXmlAutorizado: jest.fn(),
      findXmlFirmado: jest.fn(),
      findXmlByComprobanteId: jest.fn(),
    } as any;

    sriSoapClient = {
      enviarYAutorizar: jest.fn().mockResolvedValue({
        success: true,
        estado: ComprobanteEstado.AUTORIZADO,
        claveAcceso: '1234567890123456789012345678901234567890123456789',
        fechaAutorizacion: '2026-07-03T12:00:00Z',
        numeroAutorizacion: '1234567890',
        xmlAutorizado: '<autorized>',
        mensajes: [],
      }),
    } as any;

    const mockEmisorRepository = {
      findByRuc: jest.fn().mockResolvedValue({
        id: 1,
        ruc: '1234567890001',
        certificado_nombre: 'test.p12',
        certificado_password_encrypted: 'encrypted',
      }),
      findPuntoEmision: jest.fn().mockResolvedValue({
        punto_emision_id: 1,
      }),
    } as any;

    const mockSecuencialRepository = {
      getNextSecuencial: jest.fn().mockResolvedValue('000000001'),
    };

    module = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        EmitirFacturaUseCase,
        {
          provide: ClaveAccesoService,
          useValue: {
            generate: jest
              .fn()
              .mockReturnValue(
                '1234567890123456789012345678901234567890123456789',
              ),
          },
        },
        {
          provide: XmlBuilderService,
          useValue: { buildFactura: jest.fn().mockReturnValue('<xml>') },
        },
        {
          provide: XmlSignerService,
          useValue: {
            signXmlForEmisor: jest.fn().mockResolvedValue('<signed>'),
            verifySignature: jest.fn().mockResolvedValue(true),
          },
        },
        { provide: SriSoapClient, useValue: sriSoapClient },
        { provide: ComprobanteRepository, useValue: comprobanteRepository },
        { provide: EmisorRepository, useValue: mockEmisorRepository },
        { provide: SecuencialRepository, useValue: mockSecuencialRepository },
        {
          provide: XmlStorageService,
          useValue: {
            saveAllXmls: jest.fn().mockResolvedValue({
              firmadoKey: 'firmado.xml',
              autorizadoKey: 'autorizado.xml',
            }),
          },
        },
        {
          provide: SriBaseService,
          useValue: {
            validarIdentificacion: jest.fn(),
            validarTipoIdentificacionCatalogo: jest
              .fn()
              .mockResolvedValue(true),
            validarImpuestosDetalles: jest.fn().mockResolvedValue(true),
            validarFormasPagoCatalogo: jest.fn().mockResolvedValue(true),
            getDefaultAmbiente: jest.fn().mockReturnValue('1'),
          },
        },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    useCase = module.get(EmitirFacturaUseCase);
  });

  describe('with comprobanteExistente', () => {
    it('should update the existing comprobante instead of creating a new one', async () => {
      const result = await useCase.emitirFactura(mockDto, {
        comprobanteExistente: {
          ...mockComprobanteRecord,
          id: BigInt(42),
        },
      });

      // Should call update at least once — FASE 2.5 for the existing comprobante (id=42)
      const updateCalls = comprobanteRepository.update.mock.calls.filter(
        ([id]) => id === BigInt(42),
      );
      expect(updateCalls.length).toBeGreaterThanOrEqual(1);
      // Should NOT call create
      expect(comprobanteRepository.create).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should delete and recreate children when comprobanteExistente is provided', async () => {
      await useCase.emitirFactura(mockDto, {
        comprobanteExistente: {
          ...mockComprobanteRecord,
          id: BigInt(42),
        },
      });

      // Verify delete methods called with the existing comprobante ID
      expect(
        comprobanteRepository.deleteDetallesByComprobanteId,
      ).toHaveBeenCalledWith(BigInt(42), expect.anything());
      expect(
        comprobanteRepository.deletePagosByComprobanteId,
      ).toHaveBeenCalledWith(BigInt(42), expect.anything());
      expect(
        comprobanteRepository.deleteTotalesByComprobanteId,
      ).toHaveBeenCalledWith(BigInt(42), expect.anything());
      expect(
        comprobanteRepository.deleteInfoAdicionalByComprobanteId,
      ).toHaveBeenCalledWith(BigInt(42), expect.anything());

      // Verify create methods still called for children
      expect(comprobanteRepository.createDetalles).toHaveBeenCalled();
      expect(comprobanteRepository.createTotales).toHaveBeenCalled();
      expect(comprobanteRepository.createPagos).toHaveBeenCalled();
    });
  });

  describe('without comprobanteExistente (original behavior)', () => {
    it('should create a new comprobante when no comprobanteExistente is provided', async () => {
      await useCase.emitirFactura(mockDto);

      // Should call create (update is also called in FASE 3 for AUTORIZADO state)
      expect(comprobanteRepository.create).toHaveBeenCalled();
    });
  });
});

describe('EmitirFacturaUseCase — SRI rejection path (E-005)', () => {
  let useCase: EmitirFacturaUseCase;
  let comprobanteRepository: jest.Mocked<ComprobanteRepository>;
  let sriSoapClient: jest.Mocked<SriSoapClient>;
  let eventEmitterMock: jest.Mock;
  let module: TestingModule;

  const mockDto: CreateFacturaDto = {
    fechaEmision: '03/07/2026',
    emisor: {
      ruc: '1234567890001',
      razonSocial: 'Test Emisor',
      dirMatriz: 'Av. Test',
      establecimiento: '001',
      puntoEmision: '001',
      obligadoContabilidad: 'SI',
    },
    comprador: {
      tipoIdentificacion: '05' as any,
      identificacion: '1234567890',
      razonSocial: 'Test Client',
      direccion: 'Test Address',
    },
    detalles: [
      {
        codigoPrincipal: '001',
        descripcion: 'Test Item',
        cantidad: 1,
        precioUnitario: 100,
        descuento: 0,
        impuestos: [
          {
            codigo: '2',
            codigoPorcentaje: '2',
            tarifa: 12,
            baseImponible: 100,
            valor: 12,
          },
        ],
      },
    ],
    pagos: [{ formaPago: '01' as any, total: 112 }],
  };

  const emittedAutorizado = () =>
    eventEmitterMock.mock.calls.filter(
      ([event]) => event === 'comprobante.autorizado',
    );

  const emittedRechazado = () =>
    eventEmitterMock.mock.calls.filter(
      ([event]) => event === 'comprobante.rechazado',
    );

  beforeEach(async () => {
    comprobanteRepository = {
      create: jest.fn().mockResolvedValue({ id: BigInt(99) }),
      update: jest.fn().mockResolvedValue({ id: BigInt(99) }),
      createDetalles: jest.fn().mockResolvedValue([{ id: 'det-1' }]),
      createImpuestos: jest.fn().mockResolvedValue([{}]),
      createTotales: jest.fn().mockResolvedValue([{}]),
      createPagos: jest.fn().mockResolvedValue([{}]),
      createInfoAdicional: jest.fn().mockResolvedValue([{}]),
      createDetallesAdicionales: jest.fn().mockResolvedValue([{}]),
      saveXml: jest.fn().mockResolvedValue({}),
      deleteDetallesByComprobanteId: jest.fn().mockResolvedValue(undefined),
      deletePagosByComprobanteId: jest.fn().mockResolvedValue(undefined),
      deleteTotalesByComprobanteId: jest.fn().mockResolvedValue(undefined),
      deleteInfoAdicionalByComprobanteId: jest
        .fn()
        .mockResolvedValue(undefined),
      executeTransaction: jest.fn().mockImplementation((cb) => cb({})),
      findByClaveAcceso: jest.fn(),
      findConDetalles: jest.fn(),
      findMany: jest.fn(),
      createRetenciones: jest.fn(),
      createImpuestosDocSustento: jest.fn(),
      createMotivosNotaDebito: jest.fn(),
      findDetallesByComprobanteId: jest.fn(),
      findInfoAdicionalByComprobanteId: jest.fn(),
      findXmlAutorizado: jest.fn(),
      findXmlFirmado: jest.fn(),
      findXmlByComprobanteId: jest.fn(),
    } as any;

    sriSoapClient = {
      enviarYAutorizar: jest.fn(),
    } as any;

    const mockEmisorRepository = {
      findByRuc: jest.fn().mockResolvedValue({
        id: 1,
        ruc: '1234567890001',
        certificado_nombre: 'test.p12',
        certificado_password_encrypted: 'encrypted',
      }),
      findPuntoEmision: jest.fn().mockResolvedValue({ punto_emision_id: 1 }),
    } as any;

    const eventEmitterProvider = { emit: jest.fn() };

    module = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        EmitirFacturaUseCase,
        {
          provide: ClaveAccesoService,
          useValue: {
            generate: jest
              .fn()
              .mockReturnValue(
                '1234567890123456789012345678901234567890123456789',
              ),
          },
        },
        {
          provide: XmlBuilderService,
          useValue: { buildFactura: jest.fn().mockReturnValue('<xml>') },
        },
        {
          provide: XmlSignerService,
          useValue: {
            signXmlForEmisor: jest.fn().mockResolvedValue('<signed>'),
            verifySignature: jest.fn().mockResolvedValue(true),
          },
        },
        { provide: SriSoapClient, useValue: sriSoapClient },
        { provide: ComprobanteRepository, useValue: comprobanteRepository },
        { provide: EmisorRepository, useValue: mockEmisorRepository },
        {
          provide: SecuencialRepository,
          useValue: {
            getNextSecuencial: jest.fn().mockResolvedValue('000000001'),
          },
        },
        {
          provide: XmlStorageService,
          useValue: {
            saveAllXmls: jest.fn().mockResolvedValue({
              firmadoKey: 'firmado.xml',
              autorizadoKey: 'autorizado.xml',
            }),
          },
        },
        {
          provide: SriBaseService,
          useValue: {
            validarIdentificacion: jest.fn(),
            validarTipoIdentificacionCatalogo: jest
              .fn()
              .mockResolvedValue(true),
            validarImpuestosDetalles: jest.fn().mockResolvedValue(true),
            validarFormasPagoCatalogo: jest.fn().mockResolvedValue(true),
            getDefaultAmbiente: jest.fn().mockReturnValue('1'),
          },
        },
        { provide: EventEmitter2, useValue: eventEmitterProvider },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    useCase = module.get(EmitirFacturaUseCase);
    eventEmitterMock = eventEmitterProvider.emit;
  });

  it('should mark comprobante as RECHAZADO and emit rechazado event when SRI rejects', async () => {
    sriSoapClient.enviarYAutorizar.mockResolvedValueOnce({
      success: false,
      claveAcceso: '1234567890123456789012345678901234567890123456789',
      estado: ComprobanteEstado.RECHAZADO,
      mensajes: [
        {
          identificador: '43',
          mensaje: 'Error en estructura del comprobante',
          tipo: 'ERROR' as const,
        },
      ],
    });

    await useCase.emitirFactura(mockDto);

    // FASE 3 update reflects the SRI rejection state
    const updateCalls = comprobanteRepository.update.mock.calls;
    expect(updateCalls.length).toBeGreaterThanOrEqual(1);
    const lastUpdatePayload = updateCalls[updateCalls.length - 1][1];
    expect(lastUpdatePayload).toMatchObject({
      estado: ComprobanteEstado.RECHAZADO,
      estado_sri: ComprobanteEstado.RECHAZADO,
    });

    // Authorized event MUST NOT fire on rejection
    expect(emittedAutorizado()).toHaveLength(0);

    // Rechazado event fires with the SRI mensajes
    const rechazadoCalls = emittedRechazado();
    expect(rechazadoCalls).toHaveLength(1);
    expect(rechazadoCalls[0][1]).toMatchObject({
      estado: ComprobanteEstado.RECHAZADO,
      mensajes: expect.arrayContaining([
        expect.objectContaining({ tipo: 'ERROR', mensaje: expect.any(String) }),
      ]),
    });
  });

  it('should set estado_sri to DEVUELTA and emit rechazado event when SRI returns the comprobante', async () => {
    sriSoapClient.enviarYAutorizar.mockResolvedValueOnce({
      success: false,
      claveAcceso: '1234567890123456789012345678901234567890123456789',
      estado: ComprobanteEstado.DEVUELTA,
      mensajes: [
        {
          identificador: '35',
          mensaje: 'Factura devuelta por inconsistencia en datos',
          tipo: 'ERROR' as const,
        },
      ],
    });

    await useCase.emitirFactura(mockDto);

    const updateCalls = comprobanteRepository.update.mock.calls;
    const lastUpdatePayload = updateCalls[updateCalls.length - 1][1];
    expect(lastUpdatePayload).toMatchObject({
      estado: ComprobanteEstado.DEVUELTA,
      estado_sri: ComprobanteEstado.DEVUELTA,
    });

    expect(emittedAutorizado()).toHaveLength(0);

    const rechazadoCalls = emittedRechazado();
    expect(rechazadoCalls).toHaveLength(1);
    expect(rechazadoCalls[0][1]).toMatchObject({
      estado: ComprobanteEstado.DEVUELTA,
    });
  });

  it('should mark comprobante as AUTORIZADO and emit autorizado event when SRI authorizes', async () => {
    sriSoapClient.enviarYAutorizar.mockResolvedValueOnce({
      success: true,
      claveAcceso: '1234567890123456789012345678901234567890123456789',
      estado: ComprobanteEstado.AUTORIZADO,
      fechaAutorizacion: '2026-07-03T15:00:00Z',
      numeroAutorizacion: '9876543210',
      xmlAutorizado: '<autorized/>',
      mensajes: [],
    });

    await useCase.emitirFactura(mockDto);

    const updateCalls = comprobanteRepository.update.mock.calls;
    const lastUpdatePayload = updateCalls[updateCalls.length - 1][1];
    expect(lastUpdatePayload).toMatchObject({
      estado: ComprobanteEstado.AUTORIZADO,
      estado_sri: ComprobanteEstado.AUTORIZADO,
    });

    const autorizadoCalls = emittedAutorizado();
    expect(autorizadoCalls).toHaveLength(1);
    expect(autorizadoCalls[0][1]).toMatchObject({
      numeroAutorizacion: '9876543210',
      fechaAutorizacion: '2026-07-03T15:00:00Z',
    });

    expect(emittedRechazado()).toHaveLength(0);
  });
});
