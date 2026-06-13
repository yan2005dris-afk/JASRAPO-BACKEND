export abstract class PrefacturaRepository {
  abstract findMany(params: {
    where?: Record<string, any>;
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<any[]>;

  abstract count(where?: Record<string, any>): Promise<number>;

  abstract findById(
    id: number | bigint,
    options?: { include?: Record<string, any> },
  ): Promise<any>;

  abstract updateEstado(
    id: number | bigint,
    estado: string,
    data?: { aprobadaPor?: string; motivoRechazo?: string; fechaAprobacion?: Date },
  ): Promise<any>;
}
