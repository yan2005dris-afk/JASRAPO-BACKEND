import { Injectable } from '@nestjs/common';
import * as forge from 'node-forge';
import { CertificateParserPort } from '../../domain/ports/certificate-parser.port';
import {
  ExtractedCertInfo,
  CertificateValidation,
} from '../../domain/types/certificate.types';
import { InvalidDomainOperationException } from '../../../../shared/domain/exceptions/domain.exception';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class ForgeCertificateParserAdapter extends CertificateParserPort {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  extractCertInfoFromBuffer(
    p12Buffer: Buffer,
    password: string,
  ): ExtractedCertInfo {
    try {
      const p12Der = forge.util.createBuffer(p12Buffer.toString('binary'));
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

      let signingCert: forge.pki.Certificate | null = null;

      p12.safeContents.forEach((safeContent) => {
        safeContent.safeBags.forEach((safeBag) => {
          if (safeBag.type === forge.pki.oids.certBag && safeBag.cert) {
            if (!signingCert) {
              signingCert = safeBag.cert;
            } else {
              const isCA =
                safeBag.cert.extensions &&
                safeBag.cert.extensions.some(
                  (ext: any) =>
                    ext.name === 'basicConstraints' && ext.cA === true,
                );
              if (!isCA) {
                signingCert = safeBag.cert;
              }
            }
          }
        });
      });

      if (!signingCert) {
        throw new InvalidDomainOperationException(
          'No se pudo extraer el certificado del archivo P12',
        );
      }

      const subject = (signingCert as forge.pki.Certificate).subject;
      const issuer = (signingCert as forge.pki.Certificate).issuer;
      const validFrom = (signingCert as forge.pki.Certificate).validity.notBefore;
      const validTo = (signingCert as forge.pki.Certificate).validity.notAfter;

      return {
        subject: {
          commonName: subject.getField('CN')?.value || 'No disponible',
          organization: subject.getField('O')?.value || 'No disponible',
          country: subject.getField('C')?.value || 'No disponible',
        },
        issuer: {
          commonName: issuer.getField('CN')?.value || 'No disponible',
          organization: issuer.getField('O')?.value || 'No disponible',
        },
        validity: {
          notBefore: validFrom,
          notAfter: validTo,
        },
        serialNumber: (signingCert as forge.pki.Certificate).serialNumber,
        isExpired: new Date() > validTo,
        daysUntilExpiry: Math.ceil(
          (validTo.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
        ),
      };
    } catch (err: any) {
      if (err instanceof InvalidDomainOperationException) throw err;
      throw new InvalidDomainOperationException(
        `Error al procesar el archivo P12: ${err.message || 'Contraseña incorrecta o archivo corrupto'}`,
      );
    }
  }

  validateCertificateExpiry(
    certInfo: ExtractedCertInfo,
  ): CertificateValidation {
    const now = new Date();
    const expiryDate = certInfo.validity.notAfter;
    const startDate = certInfo.validity.notBefore;

    const validation: CertificateValidation = {
      isValid: true,
      isExpired: now > expiryDate,
      isNotYetValid: now < startDate,
      expiryDate,
      startDate,
      daysUntilExpiry: Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      ),
      subject: certInfo.subject,
      issuer: certInfo.issuer,
    };

    if (validation.isExpired) {
      validation.isValid = false;
      validation.reason = `Certificado expirado el ${expiryDate.toLocaleDateString()}`;
      this.logger.error(`Certificado EXPIRADO: ${validation.reason}`);
    } else if (validation.isNotYetValid) {
      validation.isValid = false;
      validation.reason = `Certificado no válido hasta ${startDate.toLocaleDateString()}`;
      this.logger.error(`Certificado NO VÁLIDO AÚN: ${validation.reason}`);
    } else if (validation.daysUntilExpiry <= 30) {
      validation.warning = `Certificado expira en ${validation.daysUntilExpiry} días`;
      this.logger.warn(`Certificado próximo a expirar: ${validation.warning}`);
    }

    return validation;
  }
}
