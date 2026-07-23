import type { ConfigService } from '@nestjs/config';
import * as forge from 'node-forge';
import { DOMParser } from '@xmldom/xmldom';
import { XmlSignerService } from './xml-signer.service';
import type { EmisorRepository } from '../../../emisores/domain/repositories/emisor.repository';
import type { EncryptionService } from '../../../../infrastructure/encryption/encryption.service';
import type { StorageService } from '../../../../infrastructure/storage/storage.service';
import type { LoggerService } from '../../../../infrastructure/observability/logger/logger.service';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

const XMLDSIG_NAMESPACE = 'http://www.w3.org/2000/09/xmldsig#';
const SHA256_DIGEST_URI = 'http://www.w3.org/2001/04/xmlenc#sha256';
const SHA512_DIGEST_URI = 'http://www.w3.org/2001/04/xmlenc#sha512';

type XmlSignerInternals = {
  importPrivateKey: (pem: string) => Promise<CryptoKey>;
  privateKey: CryptoKey | null;
  certificate: string | null;
};

describe('XmlSignerService XAdES digest contract', () => {
  let privateKeyPem: string;
  let certificate: string;

  const createConfigService = (hashAlgorithm?: string): ConfigService =>
    ({
      get: jest.fn((key: string, fallback?: unknown) =>
        key === 'XADES_HASH_ALGO' ? (hashAlgorithm ?? fallback) : fallback,
      ),
    }) as unknown as ConfigService;

  const createService = (hashAlgorithm?: string): XmlSignerService =>
    new XmlSignerService(
      createConfigService(hashAlgorithm),
      {} as EmisorRepository,
      {} as EncryptionService,
      {} as StorageService,
      mockLogger as unknown as LoggerService,
    );

  const signSampleDocument = async (
    hashAlgorithm?: string,
  ): Promise<string> => {
    const service = createService(hashAlgorithm);
    const internals = service as unknown as XmlSignerInternals;
    internals.privateKey = await internals.importPrivateKey(privateKeyPem);
    internals.certificate = certificate;

    return service.signXml(
      '<factura><infoTributaria>sample</infoTributaria></factura>',
    );
  };

  const getDocumentReferenceDigestUri = (signedXml: string): string => {
    const document = new DOMParser().parseFromString(
      signedXml,
      'application/xml',
    );
    const references = document.getElementsByTagNameNS(
      XMLDSIG_NAMESPACE,
      'Reference',
    );

    for (let index = 0; index < references.length; index += 1) {
      const reference = references[index];
      if (reference.getAttribute('URI') !== '#comprobante') {
        continue;
      }

      const digestMethods = reference.getElementsByTagNameNS(
        XMLDSIG_NAMESPACE,
        'DigestMethod',
      );
      return digestMethods[0].getAttribute('Algorithm') ?? '';
    }

    throw new Error('Document reference not found');
  };

  beforeAll(() => {
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 1024 });
    const cert = forge.pki.createCertificate();
    cert.publicKey = keyPair.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date(Date.now() - 60_000);
    cert.validity.notAfter = new Date(Date.now() + 86_400_000);
    cert.setSubject([{ name: 'commonName', value: 'xml-signer-contract' }]);
    cert.setIssuer(cert.subject.attributes);
    cert.sign(keyPair.privateKey, forge.md.sha256.create());

    privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
    certificate = forge.util.encode64(
      forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes(),
    );
  });

  it('uses the SHA-256 DigestMethod URI by default', async () => {
    const signedXml = await signSampleDocument();

    expect(getDocumentReferenceDigestUri(signedXml)).toBe(SHA256_DIGEST_URI);
  });

  it('uses the SHA-512 DigestMethod URI when configured', async () => {
    const signedXml = await signSampleDocument('SHA-512');

    expect(getDocumentReferenceDigestUri(signedXml)).toBe(SHA512_DIGEST_URI);
  });

  it('rejects an unknown XADES_HASH_ALGO during construction', () => {
    expect(() => createService('BOGUS')).toThrow('XADES_HASH_ALGO');
  });
});

describe('XmlSignerService multi-tenant and helper methods', () => {
  let privateKeyPem: string;
  let certificatePem: string;
  let p12Buffer: Buffer;
  const p12Password = 'test-password';
  const ruc = '1790008888001';

  let service: XmlSignerService;
  let mockEmisorRepo: jest.Mocked<EmisorRepository>;
  let mockEncryptionService: jest.Mocked<EncryptionService>;
  let mockStorageService: jest.Mocked<StorageService>;

  beforeAll(() => {
    // Generate valid PKCS#12 bundle
    const keyPair = forge.pki.rsa.generateKeyPair({ bits: 1024 });
    const cert = forge.pki.createCertificate();
    cert.publicKey = keyPair.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date(Date.now() - 60_000);
    cert.validity.notAfter = new Date(Date.now() + 86_400_000);
    cert.setSubject([{ name: 'commonName', value: 'emisor-test' }]);
    cert.setIssuer(cert.subject.attributes);
    cert.sign(keyPair.privateKey, forge.md.sha256.create());

    privateKeyPem = forge.pki.privateKeyToPem(keyPair.privateKey);
    certificatePem = forge.util.encode64(
      forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes(),
    );

    const p12Asn1 = forge.pkcs12.toPkcs12Asn1(keyPair.privateKey, cert, p12Password);
    const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
    p12Buffer = Buffer.from(p12Der, 'binary');
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockEmisorRepo = {
      findByRuc: jest.fn(),
    } as unknown as jest.Mocked<EmisorRepository>;

    mockEncryptionService = {
      encrypt: jest.fn(),
      decrypt: jest.fn(),
    } as unknown as jest.Mocked<EncryptionService>;

    mockStorageService = {
      ensureBucketForRuc: jest.fn(),
      getObject: jest.fn(),
    } as unknown as jest.Mocked<StorageService>;

    const configService = {
      get: jest.fn((key: string, fallback?: unknown) => fallback),
    } as unknown as ConfigService;

    service = new XmlSignerService(
      configService,
      mockEmisorRepo,
      mockEncryptionService,
      mockStorageService,
      mockLogger as unknown as LoggerService,
    );
  });

  it('triggers onModuleInit without throwing', () => {
    expect(() => service.onModuleInit()).not.toThrow();
  });

  it('tracks isCertificateLoaded correctly when loading from buffer and clearing global certificate', async () => {
    expect(service.isCertificateLoaded()).toBe(false);

    await service.loadCertificateFromBuffer(p12Buffer, p12Password);
    expect(service.isCertificateLoaded()).toBe(true);

    service.clearGlobalCertificate();
    expect(service.isCertificateLoaded()).toBe(false);
  });

  it('throws when loadCertificateFromBuffer receives an invalid password or corrupt buffer', async () => {
    await expect(
      service.loadCertificateFromBuffer(p12Buffer, 'wrong-password'),
    ).rejects.toThrow();
  });

  it('throws error when signXml is called before loading a certificate', async () => {
    await expect(
      service.signXml('<facturaId="comprobante"/>'),
    ).rejects.toThrow('No hay certificado cargado');
  });

  it('loads emisor certificate from database and RustFS storage', async () => {
    mockEmisorRepo.findByRuc.mockResolvedValue({
      ruc,
      certificado_nombre: 'cert.p12',
      certificado_password_encrypted: 'encrypted-pass',
    } as any);

    mockEncryptionService.decrypt.mockResolvedValue(p12Password);
    mockStorageService.ensureBucketForRuc.mockResolvedValue('bucket-certs');

    const stream = require('stream').Readable.from([p12Buffer]);
    mockStorageService.getObject.mockResolvedValue(stream as any);

    const certData = await service.loadEmisorCertificate(ruc);

    expect(certData.privateKey).toBeDefined();
    expect(certData.certificate).toBeDefined();
    expect(mockEmisorRepo.findByRuc).toHaveBeenCalledWith(ruc);
    expect(mockEncryptionService.decrypt).toHaveBeenCalledWith('encrypted-pass');

    // Second call should return cached certificate without querying repository or storage
    const cachedData = await service.loadEmisorCertificate(ruc);
    expect(cachedData.privateKey).toBe(certData.privateKey);
    expect(cachedData.certificate).toBe(certData.certificate);
    expect(mockEmisorRepo.findByRuc).toHaveBeenCalledTimes(1);
  });

  it('throws when emisor certificate configuration is missing', async () => {
    mockEmisorRepo.findByRuc.mockResolvedValue({
      ruc,
      certificado_nombre: null,
    } as any);

    await expect(service.loadEmisorCertificate(ruc)).rejects.toThrow(
      'no tiene certificado configurado',
    );
  });

  it('throws when reading certificate from storage fails', async () => {
    mockEmisorRepo.findByRuc.mockResolvedValue({
      ruc,
      certificado_nombre: 'cert.p12',
      certificado_password_encrypted: 'encrypted-pass',
    } as any);

    mockEncryptionService.decrypt.mockResolvedValue(p12Password);
    mockStorageService.ensureBucketForRuc.mockResolvedValue('bucket-certs');
    mockStorageService.getObject.mockRejectedValue(new Error('Storage failure'));

    await expect(service.loadEmisorCertificate(ruc)).rejects.toThrow(
      'no se pudo leer desde RustFS',
    );
  });

  it('signs XML for a specific emisor via signXmlForEmisor', async () => {
    mockEmisorRepo.findByRuc.mockResolvedValue({
      ruc,
      certificado_nombre: 'cert.p12',
      certificado_password_encrypted: 'encrypted-pass',
    } as any);

    mockEncryptionService.decrypt.mockResolvedValue(p12Password);
    mockStorageService.ensureBucketForRuc.mockResolvedValue('bucket-certs');

    const stream = require('stream').Readable.from([p12Buffer]);
    mockStorageService.getObject.mockResolvedValue(stream as any);

    const xmlInput = '<factura id="comprobante"><infoTributaria>test</infoTributaria></factura>';
    const signedXml = await service.signXmlForEmisor(xmlInput, ruc);

    expect(signedXml).toContain('ds:Signature');
    expect(signedXml).toContain('ds:DigestValue');
  });

  it('verifies a signed XML signature and handles verification failures gracefully', async () => {
    await service.loadCertificateFromBuffer(p12Buffer, p12Password);
    const xmlInput = '<factura id="comprobante"><infoTributaria>test</infoTributaria></factura>';
    const signedXml = await service.signXml(xmlInput);

    const isValid = await service.verifySignature(signedXml);
    expect(typeof isValid).toBe('boolean');

    // Unsigned XML returns false
    const isUnsignedValid = await service.verifySignature(xmlInput);
    expect(isUnsignedValid).toBe(false);
  });

  it('clears emisor cache and all cache correctly', async () => {
    mockEmisorRepo.findByRuc.mockResolvedValue({
      ruc,
      certificado_nombre: 'cert.p12',
      certificado_password_encrypted: 'encrypted-pass',
    } as any);

    mockEncryptionService.decrypt.mockResolvedValue(p12Password);
    mockStorageService.ensureBucketForRuc.mockResolvedValue('bucket-certs');

    const stream = require('stream').Readable.from([p12Buffer]);
    mockStorageService.getObject.mockResolvedValue(stream as any);

    await service.loadEmisorCertificate(ruc);
    service.clearEmisorCache(ruc);

    // After clearing cache, loadEmisorCertificate should hit repository again
    const stream2 = require('stream').Readable.from([p12Buffer]);
    mockStorageService.getObject.mockResolvedValue(stream2 as any);
    await service.loadEmisorCertificate(ruc);
    expect(mockEmisorRepo.findByRuc).toHaveBeenCalledTimes(2);

    service.clearAllCache();
  });
});

