import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as forge from 'node-forge';
import { Crypto } from '@peculiar/webcrypto';
import * as xadesjs from 'xadesjs';
import * as xmlCore from 'xml-core';
import { DOMParser, XMLSerializer } from '@xmldom/xmldom';
import { EncryptionService } from '../../../../infrastructure/encryption/encryption.service';
import { EmisorRepository } from '../../../emisores/domain/repositories/emisor.repository';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from '../../../../infrastructure/storage/storage.service';
import { Readable } from 'stream';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

const DEFAULT_XADES_HASH_ALGORITHM = 'SHA-256' as const;
const XADES_HASH_ALGORITHMS = [
  'SHA-256',
  'SHA-384',
  'SHA-512',
  'SHA-1',
] as const;
type XadesHashAlgorithm = (typeof XADES_HASH_ALGORITHMS)[number];

const XADES_DIGEST_METHOD_URIS: Record<XadesHashAlgorithm, string> = {
  'SHA-256': 'http://www.w3.org/2001/04/xmlenc#sha256',
  'SHA-384': 'http://www.w3.org/2001/04/xmldsig-more#sha384',
  'SHA-512': 'http://www.w3.org/2001/04/xmlenc#sha512',
  'SHA-1': 'http://www.w3.org/2000/09/xmldsig#sha1',
};

function parseXadesHashAlgorithm(
  value: string | undefined,
): XadesHashAlgorithm {
  const hashAlgorithm = value ?? DEFAULT_XADES_HASH_ALGORITHM;

  if (
    !XADES_HASH_ALGORITHMS.includes(
      hashAlgorithm as (typeof XADES_HASH_ALGORITHMS)[number],
    )
  ) {
    throw new Error(
      `Invalid XADES_HASH_ALGO: ${hashAlgorithm}. Allowed values: ${XADES_HASH_ALGORITHMS.join(', ')}`,
    );
  }

  return hashAlgorithm as XadesHashAlgorithm;
}

function getXadesDigestMethodUri(hashAlgorithm: XadesHashAlgorithm): string {
  return XADES_DIGEST_METHOD_URIS[hashAlgorithm];
}

/**
 * Servicio para firmar documentos XML con firma digital XAdES-BES
 * compatible con los requerimientos del SRI Ecuador.
 */
import { XmlSignerPort } from '../../domain/ports/xml-signer.port';

@LogContext()
@Injectable()
export class XmlSignerService extends XmlSignerPort implements OnModuleInit {
  private privateKey: CryptoKey | null = null;
  private certificate: string | null = null;
  private certificateChain: string[] = [];
  private crypto: Crypto;

  // Cache de certificados por RUC con TTL. Insertion order in a Map is
  // preserved, so the oldest entry is always the first key — used below
  // to evict when the cache grows past CERT_CACHE_MAX_ENTRIES (bounds
  // memory exposure from decrypted private keys, issue #198).
  private emisorCertificateCache: Map<
    string,
    { privateKey: CryptoKey; certificate: string; loadedAt: number }
  > = new Map();
  private static readonly CERT_CACHE_MAX_ENTRIES = 100;
  private readonly CERT_CACHE_TTL_MS: number;
  private readonly hashAlgorithm: XadesHashAlgorithm;

  constructor(
    private readonly configService: ConfigService,
    private readonly repository: EmisorRepository,
    private readonly encryptionService: EncryptionService,
    private readonly storageService: StorageService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.crypto = new Crypto();
    this.hashAlgorithm = parseXadesHashAlgorithm(
      this.configService.get<string>(
        'XADES_HASH_ALGO',
        DEFAULT_XADES_HASH_ALGORITHM,
      ),
    );
    this.CERT_CACHE_TTL_MS = this.configService.get<number>(
      'CACHE_CERT_TTL_MS',
      3600000,
    );
    xmlCore.setNodeDependencies({
      DOMParser,
      XMLSerializer,
    });

    xadesjs.Application.setEngine('NodeJS', this.crypto);
  }

  onModuleInit() {
    this.logger.log(
      'XmlSignerService inicializado. Certificados se cargan desde RustFS y BD.',
    );
  }

  /**
   * Carga un certificado desde un buffer (útil para tests o carga manual)
   */
  async loadCertificateFromBuffer(
    p12Buffer: Buffer,
    password: string,
  ): Promise<void> {
    this.logger.log('Procesando certificado P12 desde Buffer');
    // ... (logic remains same for processing P12)

    const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    let forgePrivateKey: forge.pki.PrivateKey | null = null;
    let signingCert: forge.pki.Certificate | null = null;
    const chainCerts: forge.pki.Certificate[] = [];

    p12.safeContents.forEach((safeContent) => {
      safeContent.safeBags.forEach((safeBag) => {
        if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
          forgePrivateKey = safeBag.key as forge.pki.PrivateKey;
        } else if (safeBag.type === forge.pki.oids.certBag && safeBag.cert) {
          const cert = safeBag.cert;
          const isCA =
            cert.extensions &&
            cert.extensions.some(
              (ext: { name: string; cA?: boolean }) =>
                ext.name === 'basicConstraints' && ext.cA === true,
            );

          if (!isCA) {
            signingCert = cert;
          } else {
            chainCerts.push(cert);
          }
        }
      });
    });

    if (!forgePrivateKey || !signingCert) {
      throw new Error(
        'No se encontró clave privada o certificado en el archivo P12',
      );
    }

    const privateKeyPem = forge.pki.privateKeyToPem(forgePrivateKey);
    this.privateKey = await this.importPrivateKey(privateKeyPem);

    this.certificate = forge.util.encode64(
      forge.asn1.toDer(forge.pki.certificateToAsn1(signingCert)).getBytes(),
    );

    this.certificateChain = chainCerts.map((cert) =>
      forge.util.encode64(
        forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes(),
      ),
    );

    this.logger.log('Certificado P12 cargado y procesado exitosamente');
  }

  async signXml(xmlString: string): Promise<string> {
    if (!this.privateKey || !this.certificate) {
      throw new Error(
        'No hay certificado cargado. Use loadCertificate() primero.',
      );
    }

    this.logger.log('Iniciando firma XAdES-BES del documento XML');

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    const rootElement = xmlDoc.documentElement;
    if (!rootElement) {
      throw new Error('El documento XML no tiene un elemento raíz');
    }

    if (!rootElement.hasAttribute('id') && !rootElement.hasAttribute('Id')) {
      rootElement.setAttribute('Id', 'comprobante');
    }

    const referenceId =
      rootElement.getAttribute('id') ||
      rootElement.getAttribute('Id') ||
      'comprobante';

    const signedXml = new xadesjs.SignedXml();

    const reference = await signedXml.Sign(
      {
        // RSA-SHA1 is mandated by Ecuador's SRI XAdES-BES spec (Ficha
        // Técnica de Comprobantes Electrónicos) — do not change to a
        // stronger algorithm, the SRI will reject the signature.
        name: 'RSA-SHA1',
      },
      this.privateKey,
      xmlDoc as unknown as Document,
      {
        x509: [this.certificate],
        references: [
          {
            id: 'Reference-' + referenceId,
            uri: '#' + referenceId,
            hash: this.hashAlgorithm,
            transforms: ['enveloped', 'c14n'],
          },
        ],
        signerRole: {
          claimed: ['Emisor'],
        },
        signingTime: {
          value: new Date(),
        },
      },
    );

    const signedXmlDoc = reference.GetXml();
    if (!signedXmlDoc) {
      throw new Error('Error al generar el XML firmado');
    }

    this.setDigestMethodUri(signedXmlDoc);

    const serializer = new XMLSerializer();
    // signedXmlDoc is a runtime xmldom node (xadesjs uses xmldom via setNodeDependencies)
    const signedXmlStr = serializer.serializeToString(signedXmlDoc as any);
    const parsedDoc = new DOMParser().parseFromString(
      signedXmlStr,
      'application/xml',
    );
    if (!parsedDoc.documentElement) {
      throw new Error('Error al re-parsear el nodo firmado');
    }
    rootElement.appendChild(parsedDoc.documentElement);

    const signedXmlString = serializer.serializeToString(xmlDoc);

    this.logger.log('Documento XML firmado exitosamente con XAdES-BES');
    return signedXmlString;
  }

  private setDigestMethodUri(signedXmlDoc: Element): void {
    const digestMethods = signedXmlDoc.getElementsByTagNameNS(
      'http://www.w3.org/2000/09/xmldsig#',
      'DigestMethod',
    );
    const digestMethodUri = getXadesDigestMethodUri(this.hashAlgorithm);

    for (let index = 0; index < digestMethods.length; index += 1) {
      digestMethods[index].setAttribute('Algorithm', digestMethodUri);
    }
  }

  isCertificateLoaded(): boolean {
    return this.privateKey !== null && this.certificate !== null;
  }

  private async importPrivateKey(pem: string): Promise<CryptoKey> {
    const pemContents = pem
      .replace(/-----BEGIN RSA PRIVATE KEY-----/, '')
      .replace(/-----END RSA PRIVATE KEY-----/, '')
      .replace(/-----BEGIN PRIVATE KEY-----/, '')
      .replace(/-----END PRIVATE KEY-----/, '')
      .replace(/\s/g, '');

    const binaryDer = Buffer.from(pemContents, 'base64');

    try {
      return await this.crypto.subtle.importKey(
        'pkcs8',
        binaryDer,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: this.hashAlgorithm,
        },
        true,
        ['sign'],
      );
    } catch {
      this.logger.log('Intentando conversión de PKCS#1 a PKCS#8');

      const privateKey = forge.pki.privateKeyFromPem(pem);
      const pkcs8Pem = forge.pki.privateKeyInfoToPem(
        forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(privateKey)),
      );

      const pkcs8Contents = pkcs8Pem
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '');

      const pkcs8Binary = Buffer.from(pkcs8Contents, 'base64');

      return await this.crypto.subtle.importKey(
        'pkcs8',
        pkcs8Binary,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: this.hashAlgorithm,
        },
        true,
        ['sign'],
      );
    }
  }

  /**
   * Get certs directory from configuration
   */
  private getCertsDir(): string {
    return this.configService.get<string>('CERTS_DIR', '');
  }

  /**
   * Decrypt password using EncryptionService
   */
  private async decryptPassword(encryptedPassword: string): Promise<string> {
    return this.encryptionService.decrypt(encryptedPassword);
  }

  /**
   * Load certificate for a specific emisor from database
   * Returns cached version if available
   */
  async loadEmisorCertificate(
    ruc: string,
  ): Promise<{ privateKey: CryptoKey; certificate: string }> {
    // Check cache first (with TTL)
    const cached = this.emisorCertificateCache.get(ruc);
    const now = Date.now();
    if (cached && now - cached.loadedAt < this.CERT_CACHE_TTL_MS) {
      this.logger.debug(`Usando certificado cacheado para emisor RUC: ${ruc}`);
      return { privateKey: cached.privateKey, certificate: cached.certificate };
    }

    if (cached) {
      this.logger.log(
        `Cache de certificado expirado para RUC: ${ruc}, recargando...`,
      );
      this.emisorCertificateCache.delete(ruc);
    }

    this.logger.log(
      `Cargando certificado desde RustFS para emisor RUC: ${ruc}`,
    );

    // Get emisor info from repository
    const emisor = await this.repository.findByRuc(ruc);

    if (
      !emisor ||
      !emisor.certificado_nombre ||
      !emisor.certificado_password_encrypted
    ) {
      throw new Error(
        `El emisor con RUC ${ruc} no tiene certificado configurado o activo. Por favor suba un certificado P12.`,
      );
    }

    // Decrypt password
    const password = await this.encryptionService.decrypt(
      emisor.certificado_password_encrypted,
    );

    // 1. Obtener el archivo desde RustFS (S3)
    let p12Buffer: Buffer;
    try {
      const bucket = await this.storageService.ensureBucketForRuc(
        ruc,
        SRI_STORAGE_TYPES.CERTS,
      );
      const stream = await this.storageService.getObject(
        bucket,
        emisor.certificado_nombre,
      );
      p12Buffer = await this.streamToBuffer(stream);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(
        `El archivo de certificado ${emisor.certificado_nombre} no se pudo leer desde RustFS: ${message}`,
      );
    }

    // Process P12 certificate
    const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    let forgePrivateKey: forge.pki.PrivateKey | null = null;
    let signingCert: forge.pki.Certificate | null = null;

    p12.safeContents.forEach((safeContent) => {
      safeContent.safeBags.forEach((safeBag) => {
        if (safeBag.type === forge.pki.oids.pkcs8ShroudedKeyBag) {
          forgePrivateKey = safeBag.key as forge.pki.PrivateKey;
        } else if (safeBag.type === forge.pki.oids.certBag && safeBag.cert) {
          const cert = safeBag.cert;
          const isCA =
            cert.extensions &&
            cert.extensions.some(
              (ext: { name: string; cA?: boolean }) =>
                ext.name === 'basicConstraints' && ext.cA === true,
            );

          if (!isCA) {
            signingCert = cert;
          }
        }
      });
    });

    if (!forgePrivateKey || !signingCert) {
      throw new Error(
        'No se encontró clave privada o certificado en el archivo P12',
      );
    }

    const privateKeyPem = forge.pki.privateKeyToPem(forgePrivateKey);
    const privateKey = await this.importPrivateKey(privateKeyPem);

    const certificate = forge.util.encode64(
      forge.asn1.toDer(forge.pki.certificateToAsn1(signingCert)).getBytes(),
    );

    // Cache the result with timestamp (evicting oldest entry if at max capacity)
    if (
      this.emisorCertificateCache.size >=
      XmlSignerService.CERT_CACHE_MAX_ENTRIES
    ) {
      const oldestKey = this.emisorCertificateCache.keys().next().value;
      if (oldestKey) {
        this.emisorCertificateCache.delete(oldestKey);
      }
    }
    const result = { privateKey, certificate, loadedAt: Date.now() };
    this.emisorCertificateCache.set(ruc, result);
    this.logger.log(
      `Certificado para emisor RUC ${ruc} cargado desde RustFS y cacheado exitosamente`,
    );

    return result;
  }

  /**
   * Helper to convert stream to buffer
   */
  private async streamToBuffer(stream: Readable): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  /**
   * Sign XML using emisor's certificate from database
   * This is the recommended method for multi-tenant scenarios
   */
  async signXmlForEmisor(xmlString: string, ruc: string): Promise<string> {
    this.logger.log(`Firmando XML para emisor RUC: ${ruc}`);

    const { privateKey, certificate } = await this.loadEmisorCertificate(ruc);

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

    const rootElement = xmlDoc.documentElement;
    if (!rootElement) {
      throw new Error('El documento XML no tiene un elemento raíz');
    }

    if (!rootElement.hasAttribute('id') && !rootElement.hasAttribute('Id')) {
      rootElement.setAttribute('Id', 'comprobante');
    }

    const referenceId =
      rootElement.getAttribute('id') ||
      rootElement.getAttribute('Id') ||
      'comprobante';

    const signedXml = new xadesjs.SignedXml();

    const reference = await signedXml.Sign(
      {
        // RSA-SHA1 is mandated by Ecuador's SRI XAdES-BES spec (Ficha
        // Técnica de Comprobantes Electrónicos) — do not change to a
        // stronger algorithm, the SRI will reject the signature.
        name: 'RSA-SHA1',
      },
      privateKey,
      xmlDoc as unknown as Document,
      {
        x509: [certificate],
        references: [
          {
            id: 'Reference-' + referenceId,
            uri: '#' + referenceId,
            hash: this.hashAlgorithm,
            transforms: ['enveloped', 'c14n'],
          },
        ],
        signerRole: {
          claimed: ['Emisor'],
        },
        signingTime: {
          value: new Date(),
        },
      },
    );

    const signedXmlDoc = reference.GetXml();
    if (!signedXmlDoc) {
      throw new Error('Error al generar el XML firmado');
    }

    this.setDigestMethodUri(signedXmlDoc);

    const serializer = new XMLSerializer();
    // signedXmlDoc is a runtime xmldom node (xadesjs uses xmldom via setNodeDependencies)
    const signedXmlStr = serializer.serializeToString(signedXmlDoc as any);
    const parsedDoc = new DOMParser().parseFromString(
      signedXmlStr,
      'application/xml',
    );
    if (!parsedDoc.documentElement) {
      throw new Error('Error al re-parsear el nodo firmado');
    }
    rootElement.appendChild(parsedDoc.documentElement);

    const signedXmlString = serializer.serializeToString(xmlDoc);

    this.logger.log(
      'Documento XML firmado exitosamente con XAdES-BES para emisor: ' + ruc,
    );
    return signedXmlString;
  }

  /**
   * Verifica criptográficamente una firma XAdES en un documento XML
   */
  async verifySignature(xmlString: string): Promise<boolean> {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

      // Buscar el nodo Signature
      const signature = xmlDoc.getElementsByTagNameNS(
        'http://www.w3.org/2000/09/xmldsig#',
        'Signature',
      )[0];

      if (!signature) {
        throw new Error('No se encontró firma en el documento XML');
      }

      const signedXml = new xadesjs.SignedXml(xmlDoc as unknown as Document);
      signedXml.LoadXml(signature as any);

      const result = await signedXml.Verify();

      if (!result) {
        this.logger.error('La verificación de la firma XAdES falló');
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Error durante la verificación de la firma: ${message}`,
      );
      return false;
    }
  }

  /**
   * Clear certificate cache for a specific emisor (useful when certificate is updated)
   */
  clearEmisorCache(ruc: string): void {
    this.emisorCertificateCache.delete(ruc);
    this.logger.log(`Cache de certificado limpiado para emisor RUC: ${ruc}`);
  }

  /**
   * Clear all cached certificates
   */
  clearAllCache(): void {
    this.emisorCertificateCache.clear();
    this.logger.log('Cache de todos los certificados limpiado');
  }

  /**
   * @deprecated - Usar signXmlForEmisor() para multi-tenant.
   * Permite limpiar el certificado legacy cargado de memoria.
   */
  clearGlobalCertificate(): void {
    this.privateKey = null;
    this.certificate = null;
    this.certificateChain = [];
    this.logger.warn('Certificado global limpiado de memoria');
  }
}
