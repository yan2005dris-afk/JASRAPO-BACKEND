export abstract class XmlSignerPort {
  abstract signXmlForEmisor(xml: string, ruc: string): Promise<string>;
  abstract verifySignature(xmlFirmado: string): Promise<boolean>;
}
