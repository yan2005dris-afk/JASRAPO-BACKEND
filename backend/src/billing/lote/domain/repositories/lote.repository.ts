export abstract class LoteRepository {
  abstract findMany(params: {
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<any[]>;

  abstract count(params?: { where?: Record<string, any> }): Promise<number>;

  abstract findById(
    id: number | bigint,
    options?: { include?: Record<string, any> },
  ): Promise<any>;

  abstract generarLote(
    periodoId: number,
    comunidadId: number | null,
    creadoPor: string,
  ): Promise<any>;
}
