import type { KeyObject, X509Certificate } from 'node:crypto';

declare module 'node:crypto' {
  export interface PKCS12Options {
    passphrase?: string | Buffer | undefined;
  }

  export interface PKCS12Result {
    key?: KeyObject | null;
    privateKey?: KeyObject | null;
    cert?: X509Certificate | null;
    certificate?: X509Certificate | null;
    ca?: X509Certificate[];
    additionalCertificates?: X509Certificate[];
  }

  export function parsePKCS12(
    buffer: Buffer | ArrayBufferView,
    options?: PKCS12Options,
  ): PKCS12Result;
}
