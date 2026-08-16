import {
  ExtractedCertInfo,
  CertificateValidation,
} from '../types/certificate.types';

export abstract class CertificateParserPort {
  abstract extractCertInfoFromBuffer(
    p12Buffer: Buffer,
    password: string,
  ): ExtractedCertInfo;
  abstract validateCertificateExpiry(
    certInfo: ExtractedCertInfo,
  ): CertificateValidation;
}
