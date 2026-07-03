import { Test, TestingModule } from '@nestjs/testing';
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
import { SriOperationResult } from '../../domain/interfaces';
import { CreateFacturaDto } from '../../interfaces/dto';
import { ComprobanteEstado } from '../../domain/constants/comprobante-estado.enum';

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
      tipoIdentificacion: '05',
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
          { codigo: '2', codigoPorcentaje: '2', tarifa: 12, baseImponible: 100, valor: 12 },
        ],
      },
    ],
    pagos: [{ formaPago: '01', total: 112 }],
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
      deleteImpuestosByComprobanteId: jest.fn().mockResolvedValue(undefined),
      deleteTotalesByComprobanteId: jest.fn().mockResolvedValue(undefined),
      deleteInfoAdicionalByComprobanteId: jest.fn().mockResolvedValue(undefined),
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
      } as SriOperationResult),
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
        EmitirFacturaUseCase,
        { provide: ClaveAccesoService, useValue: { generate: jest.fn().mockReturnValue('1234567890123456789012345678901234567890123456789') } },
        { provide: XmlBuilderService, useValue: { buildFactura: jest.fn().mockReturnValue('<xml>') } },
        { provide: XmlSignerService, useValue: { signXmlForEmisor: jest.fn().mockResolvedValue('<signed>'), verifySignature: jest.fn().mockResolvedValue(true) } },
        { provide: SriSoapClient, useValue: sriSoapClient },
        { provide: ComprobanteRepository, useValue: comprobanteRepository },
        { provide: EmisorRepository, useValue: mockEmisorRepository },
        { provide: SecuencialRepository, useValue: mockSecuencialRepository },
        { provide: XmlStorageService, useValue: { saveAllXmls: jest.fn().mockResolvedValue({ firmadoKey: 'firmado.xml', autorizadoKey: 'autorizado.xml' }) } },
        { provide: SriBaseService, useValue: {
          validarIdentificacion: jest.fn(),
          validarTipoIdentificacionCatalogo: jest.fn().mockResolvedValue(true),
          validarImpuestosDetalles: jest.fn().mockResolvedValue(true),
          validarFormasPagoCatalogo: jest.fn().mockResolvedValue(true),
          getDefaultAmbiente: jest.fn().mockReturnValue('1'),
        } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    useCase = module.get(EmitirFacturaUseCase);
  });

  describe('with comprobanteExistente', () => {
    it('should update the existing comprobante instead of creating a new one', async () => {
      const result = await useCase.emitirFactura(mockDto, {
        comprobanteExistente: { ...mockComprobanteRecord, id: BigInt(42) } as any,
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
        comprobanteExistente: { ...mockComprobanteRecord, id: BigInt(42) } as any,
      });

      // Verify delete methods called with the existing comprobante ID
      expect(comprobanteRepository.deleteDetallesByComprobanteId).toHaveBeenCalledWith(
        BigInt(42),
        expect.anything(),
      );
      expect(comprobanteRepository.deletePagosByComprobanteId).toHaveBeenCalledWith(
        BigInt(42),
        expect.anything(),
      );
      expect(comprobanteRepository.deleteTotalesByComprobanteId).toHaveBeenCalledWith(
        BigInt(42),
        expect.anything(),
      );
      expect(comprobanteRepository.deleteInfoAdicionalByComprobanteId).toHaveBeenCalledWith(
        BigInt(42),
        expect.anything(),
      );

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
