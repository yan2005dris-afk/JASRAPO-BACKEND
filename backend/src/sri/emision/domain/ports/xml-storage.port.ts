export abstract class XmlStoragePort {
  abstract saveXml(
    ruc: string,
    claveAcceso: string,
    fechaEmision: Date,
    subdir: 'sin_firma' | 'firmado' | 'autorizado',
    xmlContent: string,
  ): Promise<string>;

  abstract saveAllXmls(
    ruc: string,
    claveAcceso: string,
    fechaEmision: Date,
    xmlSinFirma?: string,
    xmlFirmado?: string,
    xmlAutorizado?: string,
  ): Promise<{
    sinFirmaKey?: string;
    firmadoKey?: string;
    autorizadoKey?: string;
  }>;

  abstract readXml(relativePath: string): Promise<string | null>;
}
