export abstract class SecuencialRepository {
  abstract getNextSecuencial(
    puntoEmisionId: number,
    tipoComprobante: string,
    tx?: any,
  ): Promise<string>;
}
