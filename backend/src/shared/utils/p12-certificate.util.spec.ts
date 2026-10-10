import {
  parseDistinguishedName,
  extractSigningCertificate,
} from './p12-certificate.util';
import type { PKCS12Result, X509Certificate } from 'node:crypto';

describe('p12-certificate.util', () => {
  describe('parseDistinguishedName', () => {
    it('parses multi-line distinguished names into a key-value dictionary', () => {
      const dn = 'CN=Test Common Name\nO=Test Organization\nC=EC';
      const result = parseDistinguishedName(dn);

      expect(result).toEqual({
        CN: 'Test Common Name',
        O: 'Test Organization',
        C: 'EC',
      });
    });

    it('handles empty strings and entries without equals gracefully', () => {
      const dn = 'CN=Valid\nIncomplete';
      const result = parseDistinguishedName(dn);

      expect(result).toEqual({
        CN: 'Valid',
      });
    });
  });

  describe('extractSigningCertificate', () => {
    it('returns null when no certificates exist in p12 result', () => {
      const p12: PKCS12Result = {
        certificate: null,
        additionalCertificates: [],
      };

      const { signingCert, chainCerts } = extractSigningCertificate(p12);

      expect(signingCert).toBeNull();
      expect(chainCerts).toEqual([]);
    });

    it('selects the main certificate when only one certificate is provided', () => {
      const mockCert = {
        ca: false,
        subject: 'CN=User',
      } as unknown as X509Certificate;

      const p12: PKCS12Result = {
        certificate: mockCert,
        additionalCertificates: [],
      };

      const { signingCert, chainCerts } = extractSigningCertificate(p12);

      expect(signingCert).toBe(mockCert);
      expect(chainCerts).toEqual([]);
    });

    it('prioritizes non-CA (leaf/end-entity) certificate over CA in bundle', () => {
      const caCert = {
        ca: true,
        subject: 'CN=Root CA',
      } as unknown as X509Certificate;
      const leafCert = {
        ca: false,
        subject: 'CN=End User',
      } as unknown as X509Certificate;

      const p12: PKCS12Result = {
        certificate: caCert,
        additionalCertificates: [leafCert],
      };

      const { signingCert, chainCerts } = extractSigningCertificate(p12);

      expect(signingCert).toBe(leafCert);
      expect(chainCerts).toContain(caCert);
    });
  });
});
