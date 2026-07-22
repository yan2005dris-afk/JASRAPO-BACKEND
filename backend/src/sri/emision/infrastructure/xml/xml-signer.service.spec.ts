import type { ConfigService } from '@nestjs/config';
import * as forge from 'node-forge';
import { DOMParser } from '@xmldom/xmldom';
import { XmlSignerService } from './xml-signer.service';
import type { EmisorRepository } from '../../../emisores/domain/repositories/emisor.repository';
import type { EncryptionService } from '../../../../infrastructure/encryption/encryption.service';
import type { StorageService } from '../../../../infrastructure/storage/storage.service';

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
