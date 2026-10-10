import type { PKCS12Result, X509Certificate } from 'node:crypto';

/**
 * Parsea un Distinguished Name (DN) formateado con saltos de línea (como el entregado por X509Certificate)
 * en un diccionario clave-valor (ej: CN, O, C, etc.).
 */
export function parseDistinguishedName(dn: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const line of dn.split('\n')) {
    const idx = line.indexOf('=');
    if (idx !== -1) {
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim();
      result[key] = val;
    }
  }
  return result;
}

/**
 * Extrae el certificado de firma principal y la cadena de certificados desde el resultado de parsePKCS12.
 * Si existen múltiples certificados, prioriza el certificado de hoja (end-entity / no-CA).
 */
export function extractSigningCertificate(p12: PKCS12Result): {
  signingCert: X509Certificate | null;
  chainCerts: X509Certificate[];
} {
  let signingCert: X509Certificate | null = null;
  const chainCerts: X509Certificate[] = [];
  const allCerts: X509Certificate[] = [];

  if (p12.certificate) {
    allCerts.push(p12.certificate);
  }
  if (p12.additionalCertificates) {
    allCerts.push(...p12.additionalCertificates);
  }

  for (const cert of allCerts) {
    if (!signingCert) {
      signingCert = cert;
    } else if (!cert.ca && signingCert.ca) {
      chainCerts.push(signingCert);
      signingCert = cert;
    } else {
      chainCerts.push(cert);
    }
  }

  return { signingCert, chainCerts };
}
