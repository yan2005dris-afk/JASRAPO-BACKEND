import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EmitirGuiaRemisionUseCase } from './emitir-guia-remision.use-case';
import { ClaveAccesoService } from '../../infrastructure/xml/clave-acceso.service';
import { XmlBuilderService } from '../../infrastructure/xml/xml-builder.service';
import { XmlSignerService } from '../../infrastructure/xml/xml-signer.service';
import { SriSoapClient } from '../../infrastructure/soap/sri-soap.client';
import { ComprobanteRepository } from '../../domain/repositories/comprobante.repository';
import { EmisorRepository } from '../../../emisores/domain/repositories/emisor.repository';
import { SecuencialRepository } from '../../domain/repositories/secuencial.repository';
import { XmlStorageService } from '../../infrastructure/storage/xml-storage.service';
import { SriBaseService } from '../../infrastructure/xml/sri-base.service';
import type { CreateGuiaRemisionDto } from '../../interfaces/dto';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('EmitirGuiaRemisionUseCase', () => {
  let useCase: EmitirGuiaRemisionUseCase;
  let comprobanteRepository: jest.Mocked<ComprobanteRepository>;
  let emisorRepository: jest.Mocked<EmisorRepository>;
  let secuencialRepository: jest.Mocked<SecuencialRepository>;
  let xmlSignerService: jest.Mocked<XmlSignerService>;
  let sriSoapClient: jest.Mocked<SriSoapClient>;
  let sriBaseService: jest.Mocked<SriBaseService>;

  const mockEmisor = {
    id: 1,
    ruc: '1792047704001',
    razon_social: 'EMPRESA TRANSPORTE S.A.',
    certificado_nombre: 'cert.p12',
    certificado_password_encrypted: 'encrypted_pass',
  };

  const mockPuntoEmision = {
    punto_emision_id: 10,
    codigo: '001',
    establecimiento: '001',
  };

  const mockDto: CreateGuiaRemisionDto = {
    emisor: {
      ruc: '1792047704001',
      razonSocial: 'EMPRESA TRANSPORTE S.A.',
      dirMatriz: 'Av. Principal 123',
      establecimiento: '001',
      puntoEmision: '001',
      obligadoContabilidad: 'SI',
    },
    dirPartida: 'Av. Principal 123',
    fechaIniTransporte: '23/07/2026',
    fechaFinTransporte: '25/07/2026',
    tipoIdentificacionTransportista: '04',
    rucTransportista: '1792047704001',
    razonSocialTransportista: 'EMPRESA TRANSPORTE S.A.',
    placa: 'PBA-1234',
    destinatarios: [
      {
        tipoIdentificacionDestinatario: '05',
        identificacionDestinatario: '1712345678',
        razonSocialDestinatario: 'Juan Pérez',
        dirDestinatario: 'Calle Secundaria 456',
        motivoTraslado: 'Venta de mercadería',
        detalles: [
          {
            codigoInterno: 'PROD-001',
            descripcion: 'Cajas de producto A',
            cantidad: 10,
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    comprobanteRepository = {
      create: jest.fn().mockResolvedValue({ id: BigInt(100) }),
      update: jest.fn().mockResolvedValue({}),
      createDetalles: jest.fn().mockResolvedValue([{ id: 'det-1' }]),
      createDetallesAdicionales: jest.fn().mockResolvedValue([]),
      createInfoAdicional: jest.fn().mockResolvedValue([]),
      saveXml: jest.fn().mockResolvedValue({}),
      executeTransaction: jest
        .fn()
        .mockImplementation((cb) => cb({} as any)),
    } as any;

    emisorRepository = {
      findByRuc: jest.fn().mockResolvedValue(mockEmisor),
      findPuntoEmision: jest.fn().mockResolvedValue(mockPuntoEmision),
    } as any;

    secuencialRepository = {
      getNextSecuencial: jest.fn().mockResolvedValue('000000001'),
    } as any;

    xmlSignerService = {
      signXmlForEmisor: jest.fn().mockResolvedValue('<signedXml/>'),
      verifySignature: jest.fn().mockResolvedValue(true),
    } as any;

    sriSoapClient = {
      enviarYAutorizar: jest.fn().mockResolvedValue({
        success: true,
        estado: 'AUTORIZADO',
        claveAcceso: '2307202606179204770400110010010000000011234567813',
        fechaAutorizacion: '2026-07-23T10:00:00-05:00',
        numeroAutorizacion: '2307202606179204770400110010010000000011234567813',
        xmlAutorizado: '<xmlAutorizado/>',
      }),
    } as any;

    sriBaseService = {
      validarIdentificacion: jest.fn(),
      validarTipoIdentificacionCatalogo: jest.fn().mockResolvedValue(undefined),
      validarDocumentoSustentoCatalogo: jest.fn().mockResolvedValue(undefined),
      getDefaultAmbiente: jest.fn().mockReturnValue('1'),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmitirGuiaRemisionUseCase,
        ClaveAccesoService,
        XmlBuilderService,
        { provide: XmlSignerService, useValue: xmlSignerService },
        { provide: SriSoapClient, useValue: sriSoapClient },
        { provide: ComprobanteRepository, useValue: comprobanteRepository },
        { provide: EmisorRepository, useValue: emisorRepository },
        { provide: SecuencialRepository, useValue: secuencialRepository },
        {
          provide: XmlStorageService,
          useValue: {
            saveAllXmls: jest.fn().mockResolvedValue({
              generadoKey: 'gen.xml',
              firmadoKey: 'firm.xml',
              autorizadoKey: 'aut.xml',
            }),
          },
        },
        { provide: SriBaseService, useValue: sriBaseService },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
        { provide: LoggerService, useValue: mockLogger },
      ],
    }).compile();

    useCase = module.get(EmitirGuiaRemisionUseCase);
  });

  it('debe emitir y autorizar una Guía de Remisión exitosamente', async () => {
    const result = await useCase.emitirGuiaRemision(mockDto);

    expect(result.success).toBe(true);
    expect(result.estado).toBe('AUTORIZADO');
    expect(sriBaseService.validarIdentificacion).toHaveBeenCalledTimes(2);
    expect(emisorRepository.findByRuc).toHaveBeenCalledWith('1792047704001');
    expect(secuencialRepository.getNextSecuencial).toHaveBeenCalledWith(
      10,
      '06',
    );
    expect(xmlSignerService.signXmlForEmisor).toHaveBeenCalled();
    expect(sriSoapClient.enviarYAutorizar).toHaveBeenCalled();
    expect(comprobanteRepository.update).toHaveBeenCalledWith(
      BigInt(100),
      expect.objectContaining({ estado: 'AUTORIZADO' }),
    );
  });

  it('debe fallar si el transportista no tiene identificación válida', async () => {
    sriBaseService.validarIdentificacion.mockImplementationOnce(() => {
      throw new Error('Identificación inválida');
    });

    await expect(useCase.emitirGuiaRemision(mockDto)).rejects.toThrow(
      'Identificación inválida',
    );
  });
});
